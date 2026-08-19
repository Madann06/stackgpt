from typing import Optional, Any, Dict
from pydantic import BaseModel, EmailStr
from app.schemas.user import UserResponse


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class GoogleLoginRequest(BaseModel):
    email: EmailStr
    name: Optional[str] = "Google User"
    avatar: Optional[str] = None
    token: Optional[str] = None


class GoogleTokenRequest(BaseModel):
    id_token: Optional[str] = None
    access_token: Optional[str] = None
    code: Optional[str] = None


class FacebookTokenRequest(BaseModel):
    access_token: Optional[str] = None
    code: Optional[str] = None


class OAuthUrlResponse(BaseModel):
    url: str
    provider: str


class AuthProvidersResponse(BaseModel):
    google: bool
    facebook: bool
    google_client_id: Optional[str] = None


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Optional[UserResponse] = None


class TokenPayload(BaseModel):
    sub: Optional[str] = None


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ForgotPasswordResponse(BaseModel):
    message: str

