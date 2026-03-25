# app/routes/users.py
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from app.core.dependencies import get_current_user, require_admin
from app.database import get_session
from app.models import User
from app.schemas.user import UserRead, UserReadPrivate, UserUpdateMe, UserUpdateRole

router = APIRouter(prefix="/users", tags=["Users"])


# --------------------------------------------------
# GET /users/me
# Mon propre profil — auth requise
# --------------------------------------------------
@router.get("/me", response_model=UserReadPrivate)
def get_my_profile(current_user: User = Depends(get_current_user)):
    """
    Retourne le profil complet de l'utilisateur connecté.
    Pas besoin de session DB — current_user est déjà chargé
    par la dépendance get_current_user.
    """
    return current_user


# --------------------------------------------------
# PATCH /users/me
# Modifier mon profil — auth requise
# --------------------------------------------------
@router.patch("/me", response_model=UserReadPrivate)
def update_my_profile(
    update_data: UserUpdateMe,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    data = update_data.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(current_user, key, value)

    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    return current_user


# --------------------------------------------------
# GET /users/{user_id}
# Profil public d'un utilisateur — admin seulement
# --------------------------------------------------
@router.get("/{user_id}", response_model=UserRead)
def get_user(
    user_id: int,
    session: Session = Depends(get_session),
    _: User = Depends(require_admin)   # _ = on vérifie le rôle mais on n'utilise pas l'objet
):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")
    return user


# --------------------------------------------------
# PATCH /users/{user_id}/role
# Changer le rôle d'un utilisateur — admin seulement
# --------------------------------------------------
@router.patch("/{user_id}/role", response_model=UserRead)
def update_user_role(
    user_id: int,
    role_data: UserUpdateRole,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_admin)
):
    # Un admin ne peut pas modifier son propre rôle
    # (évite de se retrouver sans admin par accident)
    if user_id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="Vous ne pouvez pas modifier votre propre rôle"
        )

    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")

    user.role = role_data.role
    session.add(user)
    session.commit()
    session.refresh(user)
    return user