# app/routes/admin.py
from typing import List
from fastapi import APIRouter, Depends
from sqlmodel import Session, select, func

from app.core.dependencies import require_admin, require_moderator, require_ambassador
from app.database import get_session
from app.models import Memoir, University, User
from app.models.enums import UserRole, MemoirStatus, UniversityStatus
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
# GET /admin/memoirs/pending  — ambassadeur/modérateur/admin
# --------------------------------------------------
@router.get("/memoirs/pending", response_model=List[MemoirRead])
def get_pending_memoirs(
    session: Session = Depends(get_session),
    current_user: User = Depends(require_ambassador)
):
    query = select(Memoir)
    
    if current_user.role == UserRole.ambassador:
        # L'ambassadeur ne voit que les siens en pending
        query = query.where(Memoir.university_id == current_user.university_id)
        query = query.where(Memoir.status == MemoirStatus.pending)
    else:
        # Les modérateurs/admins voient tout ce qui n'est pas approuvé/rejeté
        query = query.where(Memoir.status.in_([MemoirStatus.pending, MemoirStatus.pre_validated]))
        
    query = query.order_by(Memoir.created_at)
    memoirs = session.exec(query).all()
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