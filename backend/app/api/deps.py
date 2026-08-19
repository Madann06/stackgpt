from typing import Generator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import decode_access_token
from app.database.session import get_db
from app.models.user import User

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login"
)


def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(reusable_oauth2)
) -> User:
    """Validate access token and return current authenticated User model."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate authentication credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    subject = decode_access_token(token)
    if not subject:
        raise credentials_exception

    user = None
    if str(subject).isdigit():
        user = db.query(User).filter(User.id == int(subject)).first()
    if not user:
        user = db.query(User).filter(User.email == str(subject).strip().lower()).first()

    if not user:
        raise credentials_exception

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Inactive user account.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


def get_current_user_optional(
    db: Session = Depends(get_db),
    token: Optional[str] = Depends(OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login", auto_error=False))
) -> Optional[User]:
    """Validate access token if present, returning None if unauthenticated."""
    if not token:
        return None
    try:
        subject = decode_access_token(token)
        if not subject:
            return None

        user = None
        if str(subject).isdigit():
            user = db.query(User).filter(User.id == int(subject)).first()
        if not user:
            user = db.query(User).filter(User.email == str(subject).strip().lower()).first()
        if user and not user.is_active:
            return None
        return user
    except Exception:
        return None

