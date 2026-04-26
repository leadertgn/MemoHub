# app/routes/applications.py
from fastapi import APIRouter, Depends, HTTPException
from fastapi import BackgroundTasks
from sqlmodel import Session, select, col
from typing import Optional
from app.core.dependencies import get_current_user, require_admin
from app.database import get_session
from app.models import User, Country, University
from app.models.application import TeamApplication
from app.models.enums import UserRole
from app.schemas.application import TeamApplicationCreate, TeamApplicationResponse, TeamApplicationAdminRead
from app.services.team_notification_service import notify_team_for_action
from datetime import datetime
from app.core.rate_limit import rate_limiter

router = APIRouter(prefix="/applications", tags=["applications"])

@router.post("/team", response_model=TeamApplicationResponse, status_code=201, dependencies=[Depends(rate_limiter(2, 3600))])
def create_team_application(
    application: TeamApplicationCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Permet à un utilisateur connecté de postuler pour devenir ambassadeur ou modérateur.
    """
    # Vérifier que l'utilisateur n'a pas déjà une candidature en attente
    existing = session.exec(
        select(TeamApplication)
        .where(TeamApplication.user_id == current_user.id)
        .where(TeamApplication.status == "pending")
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Vous avez déjà une candidature en attente."
        )
    
    # Vérifier que l'utilisateur n'a pas déjà le rôle demandé
    if application.role == "ambassador" and current_user.university_id:
        raise HTTPException(
            status_code=400,
            detail="Vous êtes déjà ambassadeur d'une université."
        )
    if application.role == "moderator" and current_user.role.name == "moderator":
        raise HTTPException(
            status_code=400,
            detail="Vous êtes déjà modérateur."
        )
    
    # Validation : pays obligatoire
    country = session.get(Country, application.country_id)
    if not country:
        raise HTTPException(
            status_code=400,
            detail="Pays invalide."
        )
    
    # Validation : université obligatoire pour ambassadeur
    if application.role == "ambassador":
        if not application.university_id:
            raise HTTPException(
                status_code=400,
                detail="L'université est requise pour postuler comme ambassadeur."
            )
        university = session.get(University, application.university_id)
        if not university:
            raise HTTPException(
                status_code=400,
                detail="Université invalide."
            )
        # Vérifier que l'università appartient au pays sélectionné
        if university.country_id != application.country_id:
            raise HTTPException(
                status_code=400,
                detail="L'université doit appartenir au pays sélectionné."
            )
    
    # Validation : preuve étudiant obligatoire
    if not application.student_proof or len(application.student_proof.strip()) < 3:
        raise HTTPException(
            status_code=400,
            detail="Veuillez fournir votre numéro étudiant ou email universitaire."
        )
    
    # Créer la candidature
    new_application = TeamApplication(
        user_id=current_user.id,
        role=application.role,
        country_id=application.country_id,
        university_id=application.university_id if application.role == "ambassador" else None,
        student_proof=application.student_proof.strip(),
        motivation=application.motivation,
        availability=application.availability,
        status="pending"
    )
    
    session.add(new_application)
    session.commit()
    session.refresh(new_application)
    
    # Notifier l'équipe (admin + modérateurs) de la nouvelle candidature
    background_tasks.add_task(
        notify_team_for_action,
        session=session,
        background_tasks=background_tasks,
        resource_type="Candidature équipe",
        resource_name=f"{current_user.full_name} ({application.role})",
        action=f"Nouvelle candidature {application.role}",
        details=f"Pays: {country.name} | Preuve: {application.student_proof}"
    )
    
    return new_application

@router.get("/me", response_model=list[TeamApplicationResponse])
def get_my_applications(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Récupère les candidatures de l'utilisateur connecté.
    """
    applications = session.exec(
        select(TeamApplication)
        .where(TeamApplication.user_id == current_user.id)
        .order_by(col(TeamApplication.created_at).desc())
    ).all()
    
    return applications

@router.get("/admin/pending", response_model=list[TeamApplicationAdminRead])
def get_pending_applications(
    current_user: User = Depends(require_admin),
    session: Session = Depends(get_session)
):
    """
    Liste toutes les candidatures en attente (réservé aux admins).
    """
    applications = session.exec(
        select(TeamApplication)
        .where(TeamApplication.status == "pending")
        .order_by(col(TeamApplication.created_at).asc())
    ).all()
    
    result = []
    for app in applications:
        app_dict = app.model_dump()
        app_dict["user_full_name"] = app.user.full_name if app.user else "Inconnu"
        app_dict["country_name"] = app.country.name if app.country else "Inconnu"
        app_dict["university_name"] = app.university.name if app.university else None
        result.append(app_dict)
    
    return result

@router.patch("/admin/{app_id}/status", response_model=TeamApplicationResponse)
def update_application_status(
    app_id: int,
    status: str,
    admin_notes: Optional[str] = None,
    current_user: User = Depends(require_admin),
    session: Session = Depends(get_session)
):
    """
    Approuve ou rejette une candidature (réservé aux admins).
    """
    application = session.get(TeamApplication, app_id)
    if not application:
        raise HTTPException(status_code=404, detail="Candidature introuvable")
    
    if status not in ["approved", "rejected"]:
        raise HTTPException(status_code=400, detail="Statut invalide")
    
    application.status = status
    application.admin_notes = admin_notes
    application.reviewed_at = datetime.utcnow()
    application.reviewed_by = current_user.id
    
    # Si approuvée, changer le rôle de l'utilisateur
    if status == "approved":
        user = application.user
        if application.role == "ambassador":
            user.role = UserRole.ambassador
            user.university_id = application.university_id
        elif application.role == "moderator":
            user.role = UserRole.moderator
        
        user.country_id = application.country_id
        session.add(user)
    
    session.add(application)
    session.commit()
    session.refresh(application)
    
    return application