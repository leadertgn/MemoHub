# app/routes/universities.py
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlmodel import Session, select
from sqlalchemy import  func
from sqlalchemy.orm import joinedload

from app.core.dependencies import get_current_user, require_admin, require_moderator
from app.database import get_session
from app.models import University, User
from app.models.enums import UniversityStatus
from app.schemas.university import (
    UniversityRead, UniversityCreate, UniversityUpdate, UniversityStatusUpdate
)
from app.services.email_service import send_email_async, get_suggestion_approved_html, get_suggestion_rejected_html
from app.services.team_notification_service import notify_team_for_action

router = APIRouter(prefix="/universities", tags=["Universities"])


# --------------------------------------------------
# GET /universities  — public
# --------------------------------------------------
@router.get("", response_model=List[UniversityRead])
def get_universities(
    country_id: Optional[int] = Query(default=None),
    search: Optional[str] = Query(default=None),
    session: Session = Depends(get_session)
):
    query = select(University).where(University.status == UniversityStatus.approved)

    if country_id:
        query = query.where(University.country_id == country_id)
    if search:
        search_pattern = f"%{search}%"
        query = query.where(
            University.name.ilike(search_pattern)
        )

    query = query.options(joinedload(University.submitted_by_user))
    universities = session.exec(query.order_by(University.name)).all()
    
    # Ajouter le nom du submitter pour chaque université
    result = []
    for u in universities:
        u_dict = u.model_dump()
        if u.submitted_by_user:
            u_dict["submitted_by_name"] = u.submitted_by_user.full_name
        else:
            u_dict["submitted_by_name"] = None
        result.append(u_dict)
    
    return result


# --------------------------------------------------
# GET /universities/{id}  — public
# --------------------------------------------------
@router.get("/{university_id}", response_model=UniversityRead)
def get_university(university_id: int, session: Session = Depends(get_session)):
    university = session.exec(
        select(University)
        .where(University.id == university_id)
        .options(joinedload(University.submitted_by_user))
    ).first()
    if not university:
        raise HTTPException(status_code=404, detail="Université introuvable")
    return university


# --------------------------------------------------
# POST /universities  — auth requise
# N'importe quel utilisateur connecté peut soumettre une université
# --------------------------------------------------
@router.post("", response_model=UniversityRead, status_code=201)
def submit_university(
    university_data: UniversityCreate,
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    # Vérifie si une université avec ce nom existe déjà dans ce pays
    # On compare en ignorant la casse au cas où, bien que ce soit normalisé
    existing = session.exec(
        select(University).where(
            func.upper(University.name) == university_data.name.strip().upper(),
            University.country_id == university_data.country_id
        )
    ).first()
    if existing:
        raise HTTPException(
            status_code=409,
            detail="Cette université existe déjà ou est en attente de validation"
        )

    # Normalisation : Nom de l'université en MAJUSCULES
    university_data.name = university_data.name.strip().upper()
    if university_data.acronym:
        university_data.acronym = university_data.acronym.strip().upper()

    university = University(
        **university_data.model_dump(),
        submitted_by=current_user.id,
        status=UniversityStatus.pending
    )
    session.add(university)
    session.commit()
    session.refresh(university)
    
    notify_team_for_action(
        session, background_tasks, "Université", university.name, 
        action="Nouvelle suggestion d'Université", 
        country_id=university.country_id
    )

    return university


# --------------------------------------------------
# PATCH /universities/{id}/status  — admin/moderator
# Valider ou rejeter une université soumise
# --------------------------------------------------
@router.patch("/{university_id}/status", response_model=UniversityRead)
def update_university_status(
    university_id: int,
    status_data: UniversityStatusUpdate,
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_moderator)
):
    university = session.get(University, university_id)
    if not university:
        raise HTTPException(status_code=404, detail="Université introuvable")

    old_status = university.status
    if old_status != status_data.status:
        university.status = status_data.status
        university.moderated_by = current_user.id
        university.moderated_at = datetime.utcnow()
        session.add(university)
    session.commit()
    session.refresh(university)
    
    if old_status != status_data.status:
        if status_data.status == UniversityStatus.approved:
            if university.submitted_by_user and university.submitted_by_user.email:
                # Récupérer les détails pour l'email
                country_name = university.country.name if university.country else None
                html = get_suggestion_approved_html(
                    university.submitted_by_user.full_name, 
                    "university", 
                    university.name,
                    country_name=country_name,
                    acronym=university.acronym,
                    website=university.website
                )
                background_tasks.add_task(
                    send_email_async,
                    to_email=university.submitted_by_user.email,
                    to_name=university.submitted_by_user.full_name,
                    subject="Suggestion MemoHub validée !",
                    html_content=html
                )
        elif status_data.status == UniversityStatus.rejected:
            if university.submitted_by_user and university.submitted_by_user.email:
                reason = status_data.rejection_reason or "Ne correspond pas à nos critères de référencement."
                # Récupérer les détails pour l'email
                country_name = university.country.name if university.country else None
                html = get_suggestion_rejected_html(
                    university.submitted_by_user.full_name, 
                    "university", 
                    university.name, 
                    reason,
                    country_name=country_name,
                    acronym=university.acronym,
                    website=university.website
                )
                background_tasks.add_task(
                    send_email_async,
                    to_email=university.submitted_by_user.email,
                    to_name=university.submitted_by_user.full_name,
                    subject="Refus de suggestion sur MemoHub",
                    html_content=html
                )

    return university