# app/routes/fields_of_study.py
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select

from app.core.dependencies import get_current_user, require_admin
from app.database import get_session
from app.models import FieldOfStudy, Domain, University
from app.models.enums import UniversityStatus
from app.schemas.field_of_study import (
    FieldOfStudyRead, FieldOfStudyCreate, FieldOfStudyUpdate
)

router = APIRouter(prefix="/fields-of-study", tags=["Fields of Study"])


# --------------------------------------------------
# GET /fields-of-study  — public
# Filtrable par university_id et/ou domain_id
# --------------------------------------------------
@router.get("/", response_model=List[FieldOfStudyRead])
def get_fields_of_study(
    university_id: Optional[int] = Query(default=None, description="Filtrer par université"),
    domain_id: Optional[int] = Query(default=None, description="Filtrer par domaine"),
    session: Session = Depends(get_session)
):
    query = select(FieldOfStudy)

    if university_id:
        query = query.where(FieldOfStudy.university_id == university_id)
    if domain_id:
        query = query.where(FieldOfStudy.domain_id == domain_id)

    return session.exec(query.order_by(FieldOfStudy.label)).all()


# --------------------------------------------------
# GET /fields-of-study/{id}  — public
# --------------------------------------------------
@router.get("/{field_id}", response_model=FieldOfStudyRead)
def get_field_of_study(field_id: int, session: Session = Depends(get_session)):
    field = session.get(FieldOfStudy, field_id)
    if not field:
        raise HTTPException(status_code=404, detail="Filière introuvable")
    return field


# --------------------------------------------------
# POST /fields-of-study  — admin seulement
# --------------------------------------------------
@router.post("/", response_model=FieldOfStudyRead, status_code=201)
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
@router.patch("/{field_id}", response_model=FieldOfStudyRead)
def update_field_of_study(
    field_id: int,
    field_data: FieldOfStudyUpdate,
    session: Session = Depends(get_session),
    _: object = Depends(require_admin)
):
    field = session.get(FieldOfStudy, field_id)
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
# DELETE /fields-of-study/{id}  — admin seulement
# --------------------------------------------------
@router.delete("/{field_id}", status_code=204)
def delete_field_of_study(
    field_id: int,
    session: Session = Depends(get_session),
    _: object = Depends(require_admin)
):
    field = session.get(FieldOfStudy, field_id)
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