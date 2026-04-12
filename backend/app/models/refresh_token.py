# backend/app/models/refresh_token.py
from datetime import datetime, timezone
from typing import Optional
from sqlmodel import SQLModel, Field


class RefreshTokenBlacklist(SQLModel, table=True):
    __tablename__ = "refresh_token_blacklist"

    id: Optional[int] = Field(default=None, primary_key=True)
    jti: str = Field(index=True, unique=True, max_length=36)  # JWT ID unique
    user_id: int = Field(foreign_key="user.id")
    expires_at: datetime   # quand le token aurait expiré naturellement
    revoked_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))