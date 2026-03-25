# app/routes/admin.py
from typing import List
from fastapi import APIRouter, Depends
from sqlmodel import Session, select, func

from app.core.dependencies import require_admin, require_moderator
from app.database import get_session
from app.models import Memoir, University, User
from app.models.enums import MemoirStatus, UniversityStatus
from app.schemas.memoir import MemoirRead
from app.schemas.university import UniversityRead

router = APIRouter(prefix="/admin", tags=["Admin"])


# --------------------------------------------------
# GET /admin/stats  — admin seulement
# --------------------------------------------------
@router.get("/stats")
def get_stats(
    session: Session = Depends(get_session),
    _: User = Depends(require_admin)
):
    total_memoirs = session.exec(
        select(func.count()).select_from(Memoir)
        .where(Memoir.status == MemoirStatus.approved)
    ).one()

    pending_memoirs = session.exec(
        select(func.count()).select_from(Memoir)
        .where(Memoir.status == MemoirStatus.pending)
    ).one()

    total_universities = session.exec(
        select(func.count()).select_from(University)
        .where(University.status == UniversityStatus.approved)
    ).one()

    pending_universities = session.exec(
        select(func.count()).select_from(University)
        .where(University.status == UniversityStatus.pending)
    ).one()

    total_users = session.exec(
        select(func.count()).select_from(User)
    ).one()

    return {
        "memoirs": {
            "total":   total_memoirs,
            "pending": pending_memoirs
        },
        "universities": {
            "total":   total_universities,
            "pending": pending_universities
        },
        "users": {
            "total": total_users
        }
    }


# --------------------------------------------------
# GET /admin/memoirs/pending  — modérateur/admin
# --------------------------------------------------
@router.get("/memoirs/pending", response_model=List[MemoirRead])
def get_pending_memoirs(
    session: Session = Depends(get_session),
    _: User = Depends(require_moderator)
):
    memoirs = session.exec(
        select(Memoir)
        .where(Memoir.status == MemoirStatus.pending)
        .order_by(Memoir.created_at)  # les plus anciens en premier
    ).all()
    return memoirs


# --------------------------------------------------
# GET /admin/universities/pending  — modérateur/admin
# --------------------------------------------------
@router.get("/universities/pending", response_model=List[UniversityRead])
def get_pending_universities(
    session: Session = Depends(get_session),
    _: User = Depends(require_moderator)
):
    universities = session.exec(
        select(University)
        .where(University.status == UniversityStatus.pending)
        .order_by(University.created_at)
    ).all()
    return universities