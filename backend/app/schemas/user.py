# app/schemas/user.py
from typing import Optional
from sqlmodel import SQLModel
from app.models.enums import UserRole


class UserRead(SQLModel):
    """Profil public d'un utilisateur."""
    id: int
    full_name: str
    avatar_url: Optional[str] = None
    role: UserRole
    is_premium: bool


class UserReadPrivate(UserRead):
    """
    Profil complet — retourné uniquement à l'utilisateur lui-même.
    Hérite de UserRead et ajoute les champs sensibles.
    """
    email: str


class UserUpdateMe(SQLModel):
    """Ce qu'un utilisateur peut modifier sur son propre profil."""
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None


class UserUpdateRole(SQLModel):
    """Modification de rôle — admin seulement."""
    role: UserRole