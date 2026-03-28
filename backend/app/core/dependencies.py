# app/core/dependencies.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session

from app.core.security import decode_access_token
from app.database import get_session
from app.models import User
from app.models.enums import UserRole

# Lit le token depuis le header : Authorization: Bearer <token>
bearer_scheme = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    session: Session = Depends(get_session)
) -> User:
    """
    Dépendance de base — vérifie que l'utilisateur est connecté.
    Utilisation : user: User = Depends(get_current_user)
    """
    token = credentials.credentials
    payload = decode_access_token(token)

    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalide ou expiré",
            headers={"WWW-Authenticate": "Bearer"}
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Token malformé")

    user = session.get(User, int(user_id))
    if not user:
        raise HTTPException(status_code=401, detail="Utilisateur introuvable")

    return user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """
    Dépendance stricte — réservée aux admins.
    Utilisation : user: User = Depends(require_admin)
    """
    if current_user.role != UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès réservé aux administrateurs"
        )
    return current_user


def require_moderator(current_user: User = Depends(get_current_user)) -> User:
    """
    Dépendance — admin ou modérateur.
    """
    if current_user.role not in [UserRole.admin, UserRole.moderator]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès réservé aux modérateurs"
        )
    return current_user


def require_ambassador(current_user: User = Depends(get_current_user)) -> User:
    """
    Dépendance — admin, modérateur ou ambassadeur.
    """
    if current_user.role not in [UserRole.admin, UserRole.moderator, UserRole.ambassador]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès réservé aux ambassadeurs ou supérieurs"
        )
    return current_user