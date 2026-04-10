# app/routes/fields_of_study.py
from typing import List, Optional
from datetime import datetime
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlmodel import Session, select

from app.core.dependencies import get_current_user, require_admin, require_moderator
from app.database import get_session
from app.models import FieldOfStudy, Domain, University, User
from app.models.enums import UniversityStatus, FieldStatus, UserRole
from app.schemas.field_of_study import (
    FieldOfStudyRead,
    FieldOfStudyCreate,
    FieldOfStudyUpdate,
    FieldOfStudyStatusUpdate
)
from app.services.email_service import send_email_async, get_suggestion_approved_html, get_suggestion_rejected_html
from app.services.team_notification_service import notify_team_for_action

router = APIRouter(prefix="/fields-of-study", tags=["Fields of Study"])


# --------------------------------------------------
# GET /fields-of-study  — public
# Filtrable par university_id et/ou domain_id
# --------------------------------------------------
@router.get("", response_model=List[FieldOfStudyRead])
def get_fields_of_study(
    university_id: Optional[int] = Query(default=None, description="Filtrer par université"),
    domain_id: Optional[int] = Query(default=None, description="Filtrer par domaine"),
    session: Session = Depends(get_session)
):
    query = select(FieldOfStudy).where(FieldOfStudy.status == FieldStatus.approved)

    if university_id:
        query = query.where(FieldOfStudy.university_id == university_id)
    if domain_id:
        query = query.where(FieldOfStudy.domain_id == domain_id)

    return session.exec(query.order_by(FieldOfStudy.label)).all()


# --------------------------------------------------
# GET /fields-of-study/{id}  — public
# --------------------------------------------------
@router.get("/{public_id}", response_model=FieldOfStudyRead)
def get_field_of_study(public_id: uuid.UUID, session: Session = Depends(get_session)):
    field = session.exec(select(FieldOfStudy).where(FieldOfStudy.public_id == public_id)).first()
    if not field:
        raise HTTPException(status_code=404, detail="Filière introuvable")
    return field


# --------------------------------------------------
# POST /fields-of-study  — admin seulement
# --------------------------------------------------
@router.post("", response_model=FieldOfStudyRead, status_code=201)
def create_field_of_study(
    field_data: FieldOfStudyCreate,
    session: Session = Depends(get_session),
    _: object = Depends(require_admin)
):
    # Vérifie que l'université existe et est approuvée
    university = session.get(University, field_data.university_id)
    if not university:
        raise HTTPException(status_code=404, detail="Université introuvable")
    if university.status != UniversityStatus.approved:
        raise HTTPException(
            status_code=400,
            detail="Impossible d'ajouter une filière à une université non validée"
        )

    # Vérifie que le domaine existe
    domain = session.get(Domain, field_data.domain_id)
    if not domain:
        raise HTTPException(status_code=404, detail="Domaine introuvable")

    # Normalisation : Majuscule à chaque mot pour le nom de la filière
    field_data.label = field_data.label.strip().title()

    # Vérifie qu'il n'y a pas de doublon dans cette université
    existing = session.exec(
        select(FieldOfStudy).where(
            FieldOfStudy.label == field_data.label,
            FieldOfStudy.university_id == field_data.university_id
        )
    ).first()
    if existing:
        raise HTTPException(
            status_code=409,
            detail="Cette filière existe déjà dans cette université"
        )

    field = FieldOfStudy(**field_data.model_dump())
    session.add(field)
    session.commit()
    session.refresh(field)
    return field


# --------------------------------------------------
# PATCH /fields-of-study/{id}  — admin seulement
# --------------------------------------------------
@router.patch("/{public_id}", response_model=FieldOfStudyRead)
def update_field_of_study(
    public_id: uuid.UUID,
    field_data: FieldOfStudyUpdate,
    session: Session = Depends(get_session),
    _: object = Depends(require_admin)
):
    field = session.exec(select(FieldOfStudy).where(FieldOfStudy.public_id == public_id)).first()
    if not field:
        raise HTTPException(status_code=404, detail="Filière introuvable")

    # Si on change le domaine, vérifie qu'il existe
    if field_data.domain_id:
        domain = session.get(Domain, field_data.domain_id)
        if not domain:
            raise HTTPException(status_code=404, detail="Domaine introuvable")

    for key, value in field_data.model_dump(exclude_unset=True).items():
        setattr(field, key, value)

    session.add(field)
    session.commit()
    session.refresh(field)
    return field


# --------------------------------------------------
# PATCH /fields-of-study/{id}/status  — admin/moderator
# Valider ou rejeter une filière suggérée
# --------------------------------------------------
@router.patch("/{public_id}/status", response_model=FieldOfStudyRead)
def update_field_of_study_status(
    public_id: uuid.UUID,
    status_data: FieldOfStudyStatusUpdate,
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_moderator)
):
    field = session.exec(select(FieldOfStudy).where(FieldOfStudy.public_id == public_id)).first()
    if not field:
        raise HTTPException(status_code=404, detail="Filière introuvable")

    old_status = field.status
    if old_status != status_data.status:
        field.status = status_data.status
        field.moderated_by = current_user.id
        field.moderated_at = datetime.utcnow()

    session.add(field)
    session.commit()
    session.refresh(field)

    if old_status != status_data.status:
        if status_data.status == FieldStatus.approved:
            if field.submitted_by_user and field.submitted_by_user.email:
                # Récupérer les détails pour l'email
                university_name = field.university.name if field.university else None
                html = get_suggestion_approved_html(
                    field.submitted_by_user.full_name, 
                    "field", 
                    field.label,
                    university_name=university_name
                )
                background_tasks.add_task(
                    send_email_async,
                    to_email=field.submitted_by_user.email,
                    to_name=field.submitted_by_user.full_name,
                    subject="Suggestion MemoHub validée !",
                    html_content=html
                )
        elif status_data.status == FieldStatus.rejected:
            if field.submitted_by_user and field.submitted_by_user.email:
                reason = status_data.rejection_reason or "Ne correspond pas à nos critères de référencement acédemique."
                # Récupérer les détails pour l'email
                university_name = field.university.name if field.university else None
                html = get_suggestion_rejected_html(
                    field.submitted_by_user.full_name, 
                    "field", 
                    field.label, 
                    reason,
                    university_name=university_name
                )
                background_tasks.add_task(
                    send_email_async,
                    to_email=field.submitted_by_user.email,
                    to_name=field.submitted_by_user.full_name,
                    subject="Refus de suggestion sur MemoHub",
                    html_content=html
                )

    return field


# --------------------------------------------------
# POST /fields-of-study/suggest  — auth requise
# Crowdsourcing : Un étudiant suggère sa filière
# --------------------------------------------------
@router.post("/suggest", response_model=FieldOfStudyRead, status_code=201)
def suggest_field_of_study(
    field_data: FieldOfStudyCreate,
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    # Vérifie que l'université existe et est approuvée
    university = session.get(University, field_data.university_id)
    if not university:
        raise HTTPException(status_code=404, detail="Université introuvable")
    
    # Vérifie que le domaine existe
    domain = session.get(Domain, field_data.domain_id)
    if not domain:
        raise HTTPException(status_code=404, detail="Domaine introuvable")

    # Normalisation : Title Case pour la filière
    field_data.label = field_data.label.strip().title()

    # Vérifie les doublons
    existing = session.exec(
        select(FieldOfStudy).where(
            FieldOfStudy.label == field_data.label,
            FieldOfStudy.university_id == field_data.university_id
        )
    ).first()
    if existing:
        raise HTTPException(
            status_code=409,
            detail="Cette filière existe déjà ou est en attente de validation"
        )

    field = FieldOfStudy(
        **field_data.model_dump(),
        submitted_by=current_user.id,
        status=FieldStatus.pending
    )
    session.add(field)
    session.commit()
    session.refresh(field)
    
    notify_team_for_action(
        session, background_tasks, "Filière", field.label, 
        action="Nouvelle suggestion de Filière", 
        country_id=university.country_id,
        university_id=university.id
    )

    return field




# --------------------------------------------------
# DELETE /fields-of-study/{id}  — admin seulement
# --------------------------------------------------
@router.delete("/{public_id}", status_code=204)
def delete_field_of_study(
    public_id: uuid.UUID,
    session: Session = Depends(get_session),
    _: object = Depends(require_admin)
):
    field = session.exec(select(FieldOfStudy).where(FieldOfStudy.public_id == public_id)).first()
    if not field:
        raise HTTPException(status_code=404, detail="Filière introuvable")

    # Vérifie qu'aucun mémoire n'est rattaché à cette filière
    if field.memoirs:
        raise HTTPException(
            status_code=400,
            detail="Impossible de supprimer une filière qui contient des mémoires"
        )

    session.delete(field)
    session.commit()