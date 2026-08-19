import secrets
import logging
import urllib.parse
from datetime import datetime, timedelta, timezone
from typing import Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import RedirectResponse
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import requests

from app.api.deps import get_db, get_current_user
from app.core.config import settings
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse
from app.schemas.auth import (
    Token,
    LoginRequest,
    GoogleLoginRequest,
    GoogleTokenRequest,
    FacebookTokenRequest,
    OAuthUrlResponse,
    AuthProvidersResponse,
    ForgotPasswordRequest,
    ForgotPasswordResponse
)

logger = logging.getLogger("stackgpt.auth")
router = APIRouter()


@router.get("/health", tags=["Authentication"])
def auth_health():
    """Health check endpoint for authentication subsystem."""
    return {"status": "ok", "service": "auth"}


@router.get("/providers", response_model=AuthProvidersResponse, tags=["Authentication"])
def get_auth_providers() -> Any:
    """Return configured third-party authentication providers and public client IDs."""
    has_google = bool(settings.GOOGLE_CLIENT_ID and settings.GOOGLE_CLIENT_SECRET)
    has_facebook = bool(settings.FACEBOOK_CLIENT_ID and settings.FACEBOOK_CLIENT_SECRET)
    return {
        "google": has_google,
        "facebook": has_facebook,
        "google_client_id": settings.GOOGLE_CLIENT_ID or ""
    }


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED, tags=["Authentication"])
def register_user(
    user_in: UserCreate,
    db: Session = Depends(get_db)
) -> Any:
    """Register a new analyst user account with normalized email duplicate verification."""
    clean_email = user_in.email.strip().lower()
    full_name = user_in.full_name.strip()

    logger.info(f"[Register Attempt] Checking duplicate account for normalized email: '{clean_email}'")

    existing_user = db.query(User).filter(User.email == clean_email).first()
    if existing_user:
        logger.warning(f"[Register Conflict] Account already exists for email: '{clean_email}' (User ID: {existing_user.id})")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists."
        )

    user = User(
        email=clean_email,
        full_name=full_name,
        hashed_password=get_password_hash(user_in.password),
        auth_provider="local",
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    logger.info(f"[Register Success] Successfully registered User ID: {user.id}, Email: '{user.email}'")
    return user


@router.post("/login", response_model=Token, tags=["Authentication"])
def login_user(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
) -> Any:
    """Authenticate analyst user and return JWT access token."""
    clean_email = login_data.email.strip().lower()
    user = db.query(User).filter(User.email == clean_email).first()

    if not user or not verify_password(login_data.password, user.hashed_password):
        logger.warning(f"[Login Failed] Invalid credentials for email: '{clean_email}'")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    if not user.is_active:
        logger.warning(f"[Login Blocked] Inactive user account: '{clean_email}'")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Inactive user account."
        )

    access_token = create_access_token(subject=user.id)
    logger.info(f"[Login Success] Issued token for User ID: {user.id}, Email: '{user.email}'")
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


@router.post("/login/access-token", response_model=Token, tags=["Authentication"])
def login_access_token(
    db: Session = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """OAuth2 compatible token login, used by Swagger UI Authorize button."""
    clean_email = form_data.username.strip().lower()
    user = db.query(User).filter(User.email == clean_email).first()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Inactive user account."
        )

    access_token = create_access_token(subject=user.id)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


@router.get("/me", response_model=UserResponse, tags=["Authentication"])
def read_current_user(
    current_user: User = Depends(get_current_user)
) -> Any:
    """Fetch profile information for the current logged-in analyst user."""
    return current_user


@router.post("/logout", tags=["Authentication"])
def logout_user() -> Any:
    """Clean logout response endpoint."""
    return {"message": "Successfully logged out"}


@router.post("/forgot-password", response_model=ForgotPasswordResponse, tags=["Authentication"])
def forgot_password(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db)
) -> Any:
    """Generate secure password reset token safely without exposing email presence."""
    clean_email = request.email.strip().lower()
    user = db.query(User).filter(User.email == clean_email).first()
    
    if user:
        reset_token = secrets.token_urlsafe(32)
        user.reset_token = reset_token
        user.reset_token_expires = datetime.now(timezone.utc) + timedelta(hours=1)
        db.commit()
        logger.info(f"[Password Reset] Token generated for user ID: {user.id}")

    return {
        "message": "If an account exists for this email, password reset instructions have been generated."
    }


# =====================================================================
# Google OAuth 2.0 Endpoints
# =====================================================================

@router.get("/google/url", response_model=OAuthUrlResponse, tags=["Google OAuth"])
def get_google_auth_url() -> Any:
    """Build and return the official Google OAuth 2.0 authorization URL."""
    client_id = settings.GOOGLE_CLIENT_ID or ""
    redirect_uri = settings.GOOGLE_REDIRECT_URI or f"{settings.FRONTEND_URL.rstrip('/')}/api/v1/auth/google/callback"
    
    params = {
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "select_account"
    }
    url = f"https://accounts.google.com/o/oauth2/v2/auth?{urllib.parse.urlencode(params)}"
    return {"url": url, "provider": "google"}


@router.get("/google/callback", tags=["Google OAuth"])
def google_oauth_callback(
    code: Optional[str] = Query(None),
    error: Optional[str] = Query(None),
    db: Session = Depends(get_db)
) -> Any:
    """Handle Google OAuth 2.0 code exchange, verify identity, link/create user, issue JWT."""
    frontend_base = settings.FRONTEND_URL.rstrip("/")
    if error or not code:
        err_msg = error or "Authorization code missing"
        logger.warning(f"[Google OAuth] Error received: {err_msg}")
        return RedirectResponse(url=f"{frontend_base}/login?error={urllib.parse.quote(err_msg)}")

    if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
        logger.error("[Google OAuth] Server misconfiguration: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET missing.")
        return RedirectResponse(url=f"{frontend_base}/login?error=Google+OAuth+not+configured+on+backend")

    redirect_uri = settings.GOOGLE_REDIRECT_URI or f"{frontend_base}/api/v1/auth/google/callback"

    # 1. Exchange authorization code with Google token endpoint
    token_url = "https://oauth2.googleapis.com/token"
    payload = {
        "code": code,
        "client_id": settings.GOOGLE_CLIENT_ID,
        "client_secret": settings.GOOGLE_CLIENT_SECRET,
        "redirect_uri": redirect_uri,
        "grant_type": "authorization_code"
    }

    try:
        token_resp = requests.post(token_url, data=payload, timeout=15)
        token_data = token_resp.json()
        
        if "access_token" not in token_data and "id_token" not in token_data:
            logger.error(f"[Google OAuth] Token exchange failed: {token_data}")
            return RedirectResponse(url=f"{frontend_base}/login?error=Google+token+exchange+failed")

        # 2. Fetch verified Google user info
        userinfo_resp = requests.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {token_data.get('access_token')}"},
            timeout=15
        )
        user_info = userinfo_resp.json()
        google_email = (user_info.get("email") or "").strip().lower()
        google_sub = user_info.get("sub")
        google_name = user_info.get("name") or google_email.split("@")[0]
        email_verified = user_info.get("email_verified", False)

        if not google_email or not email_verified:
            logger.warning(f"[Google OAuth] Unverified Google email: {google_email}")
            return RedirectResponse(url=f"{frontend_base}/login?error=Google+email+not+verified")

        # 3. Find or link / create local account
        user = db.query(User).filter(User.email == google_email).first()
        if user:
            # Safely link Google provider info if not set
            if not user.provider_user_id:
                user.provider_user_id = str(google_sub)
                if user.auth_provider == "local":
                    user.auth_provider = "google"
                db.commit()
                logger.info(f"[Google OAuth] Linked Google identity to existing user ID: {user.id}")
        else:
            user = User(
                email=google_email,
                full_name=google_name,
                hashed_password=None,
                auth_provider="google",
                provider_user_id=str(google_sub),
                is_active=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            logger.info(f"[Google OAuth] Created new user ID: {user.id} from Google identity")

        if not user.is_active:
            return RedirectResponse(url=f"{frontend_base}/login?error=User+account+is+inactive")

        # 4. Issue StackGPT JWT access token and redirect
        token = create_access_token(subject=user.id)
        return RedirectResponse(url=f"{frontend_base}/login?token={token}&status=success")

    except Exception as exc:
        logger.exception(f"[Google OAuth] Unexpected error during callback: {exc}")
        return RedirectResponse(url=f"{frontend_base}/login?error=Authentication+processing+error")


@router.post("/google", response_model=Token, tags=["Google OAuth"])
def google_token_login(
    data: GoogleLoginRequest,
    db: Session = Depends(get_db)
) -> Any:
    """Authenticate or auto-register user via Google account payload."""
    clean_email = data.email.strip().lower()
    user = db.query(User).filter(User.email == clean_email).first()
    
    if not user:
        display_name = data.name.strip() if data.name and data.name.strip() else clean_email.split('@')[0].capitalize()
        user = User(
            email=clean_email,
            full_name=display_name,
            hashed_password=None,
            auth_provider="google",
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        logger.info(f"[Google Sign-In] Created user ID: {user.id} for email: '{clean_email}'")
    elif not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Inactive user account."
        )

    access_token = create_access_token(subject=user.id)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


# =====================================================================
# Optional Facebook OAuth Endpoints
# =====================================================================

@router.get("/facebook/url", response_model=OAuthUrlResponse, tags=["Facebook OAuth"])
def get_facebook_auth_url() -> Any:
    """Return Facebook OAuth authorization URL if configured."""
    if not settings.FACEBOOK_CLIENT_ID or not settings.FACEBOOK_CLIENT_SECRET:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Facebook OAuth is not configured on this server."
        )
    
    redirect_uri = settings.FACEBOOK_REDIRECT_URI or f"{settings.FRONTEND_URL.rstrip('/')}/api/v1/auth/facebook/callback"
    params = {
        "client_id": settings.FACEBOOK_CLIENT_ID,
        "redirect_uri": redirect_uri,
        "scope": "email,public_profile",
        "response_type": "code"
    }
    url = f"https://www.facebook.com/v19.0/dialog/oauth?{urllib.parse.urlencode(params)}"
    return {"url": url, "provider": "facebook"}


@router.get("/facebook/callback", tags=["Facebook OAuth"])
def facebook_oauth_callback(
    code: Optional[str] = Query(None),
    error: Optional[str] = Query(None),
    db: Session = Depends(get_db)
) -> Any:
    """Handle Facebook OAuth code exchange, verify identity, link/create user, issue JWT."""
    frontend_base = settings.FRONTEND_URL.rstrip("/")
    if error or not code:
        err_msg = error or "Authorization code missing"
        return RedirectResponse(url=f"{frontend_base}/login?error={urllib.parse.quote(err_msg)}")

    if not settings.FACEBOOK_CLIENT_ID or not settings.FACEBOOK_CLIENT_SECRET:
        return RedirectResponse(url=f"{frontend_base}/login?error=Facebook+OAuth+not+configured")

    redirect_uri = settings.FACEBOOK_REDIRECT_URI or f"{frontend_base}/api/v1/auth/facebook/callback"
    token_url = "https://graph.facebook.com/v19.0/oauth/access_token"
    params = {
        "client_id": settings.FACEBOOK_CLIENT_ID,
        "client_secret": settings.FACEBOOK_CLIENT_SECRET,
        "redirect_uri": redirect_uri,
        "code": code
    }

    try:
        resp = requests.get(token_url, params=params, timeout=15)
        data = resp.json()
        fb_token = data.get("access_token")
        if not fb_token:
            return RedirectResponse(url=f"{frontend_base}/login?error=Facebook+token+exchange+failed")

        user_resp = requests.get(
            "https://graph.facebook.com/me",
            params={"fields": "id,name,email", "access_token": fb_token},
            timeout=15
        )
        fb_user = user_resp.json()
        fb_email = (fb_user.get("email") or "").strip().lower()
        fb_id = fb_user.get("id")
        fb_name = fb_user.get("name") or "Facebook User"

        if not fb_email:
            return RedirectResponse(url=f"{frontend_base}/login?error=Facebook+email+not+shared")

        user = db.query(User).filter(User.email == fb_email).first()
        if user:
            if not user.provider_user_id:
                user.provider_user_id = str(fb_id)
                if user.auth_provider == "local":
                    user.auth_provider = "facebook"
                db.commit()
        else:
            user = User(
                email=fb_email,
                full_name=fb_name,
                hashed_password=None,
                auth_provider="facebook",
                provider_user_id=str(fb_id),
                is_active=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        if not user.is_active:
            return RedirectResponse(url=f"{frontend_base}/login?error=Account+inactive")

        token = create_access_token(subject=user.id)
        return RedirectResponse(url=f"{frontend_base}/login?token={token}&status=success")

    except Exception as exc:
        logger.exception(f"[Facebook OAuth] Callback error: {exc}")
        return RedirectResponse(url=f"{frontend_base}/login?error=Facebook+auth+failed")


