# app/core/security.py
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from app.core.config import settings


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Génère un JWT signé avec les données fournies.

    data doit contenir au minimum : {"sub": str(user_id), "role": role}
    """
    to_encode = data.copy()

    expire = datetime.utcnow() + (
            expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})

    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> Optional[dict]:
    """
    Décode et vérifie un JWT.
    Retourne le payload si valide, None si invalide ou expiré.
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None