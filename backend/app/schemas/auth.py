# app/schemas/auth.py
from typing import Optional
from sqlmodel import SQLModel


class GoogleAuthRequest(SQLModel):
    code: str           # Le code retourné par Google au frontend
    redirect_uri: str   # Doit correspondre exactement à celui configuré dans Google Console


class TokenResponse(SQLModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    role: str
    full_name: str
    avatar_url: Optional[str] = None