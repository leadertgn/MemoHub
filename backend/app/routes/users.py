# app/routes/users.py
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlmodel import Session, select

from app.core.dependencies import get_current_user, require_admin
from app.database import get_session
from app.models import User, University
from app.models.enums import UserRole, UniversityStatus
from app.schemas.user import UserRead, UserReadPrivate, UserUpdateMe, UserUpdateRole, UserRole
from app.services.email_service import send_email_async, get_role_promotion_html

router = APIRouter(prefix="/users", tags=["Users"])


# --------------------------------------------------
# GET /users
# Lister tous les utilisateurs — admin seulement
# --------------------------------------------------
@router.get("", response_model=list[UserReadPrivate])
def get_all_users(
    session: Session = Depends(get_session),
    _: User = Depends(require_admin)
):
    from sqlmodel import select
    users = session.exec(select(User)).all()
    return users


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
    current_user: User = Depends(require_admin),
    background_tasks: BackgroundTasks = None
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

    # Validation selon le rôle
    details = ""
    if role_data.role == UserRole.ambassador:
        if not role_data.university_id:
            raise HTTPException(status_code=400, detail="Une université est requise pour un ambassadeur")
        # Vérifier que l'université existe et est approuvée
        university = session.get(University, role_data.university_id)
        if not university:
            raise HTTPException(status_code=404, detail="Université introuvable")
        if university.status != UniversityStatus.approved:
            raise HTTPException(
                status_code=400,
                detail="L'université doit être validée pour avoir un ambassadeur"
            )
        user.university_id = role_data.university_id
        user.country_id = None
        details = f" de l'université {university.name}"
    elif role_data.role == UserRole.moderator:
        if not role_data.country_id:
            raise HTTPException(status_code=400, detail="Un pays est requis pour un modérateur")
        user.country_id = role_data.country_id
        user.university_id = None
        # Récupérer le nom du pays
        from app.models import Country
        country = session.get(Country, role_data.country_id)
        if country:
            details = f" pour le pays {country.name}"
    elif role_data.role == UserRole.admin:
        user.university_id = None
        user.country_id = None
    else:
        # student
        user.university_id = None
        user.country_id = None

    user.role = role_data.role
    
    session.add(user)
    session.commit()
    session.refresh(user)
    
    # Envoyer un email de notification de promotion
    if background_tasks and user.email:
        html_content = get_role_promotion_html(user.full_name, role_data.role, details)
        background_tasks.add_task(
            send_email_async, 
            user.email, 
            user.full_name, 
            "Votre rôle MemoHub a été mis à jour", 
            html_content
        )
    
    return user