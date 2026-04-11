# app/routes/domains.py
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.core.dependencies import require_admin
from app.database import get_session
from app.models import Domain
from app.models.enums import DomainStatus
from app.schemas.domain import DomainRead, DomainCreate, DomainUpdate

router = APIRouter(prefix="/domains", tags=["Domains"])


# --------------------------------------------------
# GET /domains  — public
# --------------------------------------------------
@router.get("", response_model=List[DomainRead])
def get_domains(session: Session = Depends(get_session)):
    domains = session.exec(
        select(Domain)
        .where(Domain.status == DomainStatus.active)
        .order_by(Domain.label)
    ).all()
    return domains


# --------------------------------------------------
# GET /domains/{id}  — public
# --------------------------------------------------
@router.get("/{domain_id}", response_model=DomainRead)
def get_domain(domain_id: int, session: Session = Depends(get_session)):
    domain = session.get(Domain, domain_id)
    if not domain:
        raise HTTPException(status_code=404, detail="Domaine introuvable")
    return domain


# --------------------------------------------------
# POST /domains  — admin seulement
# --------------------------------------------------
@router.post("", response_model=DomainRead, status_code=201)
def create_domain(
    domain_data: DomainCreate,
    session: Session = Depends(get_session),
    _: object = Depends(require_admin)
):
    existing = session.exec(
        select(Domain).where(Domain.label == domain_data.label)
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="Ce domaine existe déjà")

    domain = Domain(**domain_data.model_dump())
    session.add(domain)
    session.commit()
    session.refresh(domain)
    return domain


# --------------------------------------------------
# PATCH /domains/{id}  — admin seulement
# --------------------------------------------------
@router.patch("/{domain_id}", response_model=DomainRead)
def update_domain(
    domain_id: int,
    domain_data: DomainUpdate,
    session: Session = Depends(get_session),
    _: object = Depends(require_admin)
):
    domain = session.get(Domain, domain_id)
    if not domain:
        raise HTTPException(status_code=404, detail="Domaine introuvable")

    for key, value in domain_data.model_dump(exclude_unset=True).items():
        setattr(domain, key, value)

    session.add(domain)
    session.commit()
    session.refresh(domain)
    return domain


# --------------------------------------------------
# DELETE /domains/{id}  — admin seulement
# --------------------------------------------------
@router.delete("/{domain_id}", status_code=204)
def delete_domain(
    domain_id: int,
    session: Session = Depends(get_session),
    _: object = Depends(require_admin)
):
    domain = session.get(Domain, domain_id)
    if not domain:
        raise HTTPException(status_code=404, detail="Domaine introuvable")

    # Vérifie qu'aucune filière n'est rattachée à ce domaine
    if domain.fields_of_study:
        raise HTTPException(
            status_code=400,
            detail="Impossible de supprimer un domaine qui a des filières rattachées"
        )

    session.delete(domain)
    session.commit()