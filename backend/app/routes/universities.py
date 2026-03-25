# app/routes/universities.py
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from sqlalchemy import  func

from app.core.dependencies import get_current_user, require_admin
from app.database import get_session
from app.models import University, User
from app.models.enums import UniversityStatus
from app.schemas.university import (
    UniversityRead, UniversityCreate, UniversityUpdate, UniversityStatusUpdate
)

router = APIRouter(prefix="/universities", tags=["Universities"])


# --------------------------------------------------
# GET /universities  — public
# --------------------------------------------------
@router.get("/", response_model=List[UniversityRead])
def get_universities(
    country_id: Optional[int] = Query(default=None),
    search: Optional[str] = Query(default=None),
    session: Session = Depends(get_session)
):
    query = select(University).where(University.status == UniversityStatus.approved)

    if country_id:
        query = query.where(University.country_id == country_id)
    if search:
        query = query.where(
            func.unaccent(University.name).ilike(
                func.concat("%", func.unaccent(search), "%")
            )
        )

    return session.exec(query.order_by(University.name)).all()


# --------------------------------------------------
# GET /universities/{id}  — public
# --------------------------------------------------
@router.get("/{university_id}", response_model=UniversityRead)
def get_university(university_id: int, session: Session = Depends(get_session)):
    university = session.get(University, university_id)
    if not university:
        raise HTTPException(status_code=404, detail="Université introuvable")
    return university


# --------------------------------------------------
# POST /universities  — auth requise
# N'importe quel utilisateur connecté peut soumettre une université
# --------------------------------------------------
@router.post("/", response_model=UniversityRead, status_code=201)
def submit_university(
    university_data: UniversityCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    # Vérifie si une université avec ce nom existe déjà dans ce pays
    existing = session.exec(
        select(University).where(
            University.name == university_data.name,
            University.country_id == university_data.country_id
        )
    ).first()
    if existing:
        raise HTTPException(
            status_code=409,
            detail="Cette université existe déjà ou est en attente de validation"
        )

    university = University(
        **university_data.model_dump(),
        submitted_by=current_user.id,
        status=UniversityStatus.pending
    )
    session.add(university)
    session.commit()
    session.refresh(university)
    return university


# --------------------------------------------------
# PATCH /universities/{id}/status  — admin seulement
# Valider ou rejeter une université soumise
# --------------------------------------------------
@router.patch("/{university_id}/status", response_model=UniversityRead)
def update_university_status(
    university_id: int,
    status_data: UniversityStatusUpdate,
    session: Session = Depends(get_session),
    _: User = Depends(require_admin)
):
    university = session.get(University, university_id)
    if not university:
        raise HTTPException(status_code=404, detail="Université introuvable")

    university.status = status_data.status
    session.add(university)
    session.commit()
    session.refresh(university)
    return university


# --------------------------------------------------
# GET /universities/pending  — admin seulement
# Liste des universités en attente de validation
# --------------------------------------------------
@router.get("/admin/pending", response_model=List[UniversityRead])
def get_pending_universities(
    session: Session = Depends(get_session),
    _: User = Depends(require_admin)
):
    universities = session.exec(
        select(University).where(University.status == UniversityStatus.pending)
    ).all()
    return universities