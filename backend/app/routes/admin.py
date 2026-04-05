# app/routes/admin.py
from typing import List
from fastapi import APIRouter, Depends
from sqlmodel import Session, select, func
from sqlalchemy.orm import joinedload

from app.core.dependencies import require_admin, require_moderator, require_ambassador
from app.database import get_session
from app.models import Memoir, University, User, FieldOfStudy
from app.models.enums import UserRole, MemoirStatus, UniversityStatus, FieldStatus
from app.schemas.memoir import MemoirRead, MemoirModeratorRead
from app.schemas.university import UniversityRead
from app.schemas.field_of_study import FieldOfStudyRead

router = APIRouter(prefix="/admin", tags=["Admin"])


# --------------------------------------------------
# GET /admin/stats  — admin seulement
# --------------------------------------------------
@router.get("/stats")
def get_stats(
    session: Session = Depends(get_session),
    current_user: User = Depends(require_moderator)
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
@router.get("/memoirs/pending", response_model=List[MemoirModeratorRead])
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
    current_user: User = Depends(require_moderator)
):
    query = select(University).where(University.status == UniversityStatus.pending)
    
    if current_user.role == UserRole.moderator and current_user.country_id:
        query = query.where(University.country_id == current_user.country_id)
        
    query = query.options(joinedload(University.submitted_by_user)).order_by(University.created_at)
    universities = session.exec(query).all()
    
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
# GET /admin/fields/pending  — modérateur/admin
# --------------------------------------------------
@router.get("/fields/pending", response_model=List[FieldOfStudyRead])
def get_pending_fields(
    session: Session = Depends(get_session),
    current_user: User = Depends(require_moderator)
):
    query = select(FieldOfStudy).where(FieldOfStudy.status == FieldStatus.pending)
    
    if current_user.role == UserRole.moderator and current_user.country_id:
        query = query.join(University).where(University.country_id == current_user.country_id)
        
    query = query.order_by(FieldOfStudy.created_at)
    return session.exec(query).all()

# --------------------------------------------------
# GET /admin/moderation-history  — admin/moderateur/ambassadeur
# Admin = voit tout
# Modérateur = voit tout l'historique de son pays
# Ambassadeur = voit uniquement ses propres actions
# --------------------------------------------------
@router.get("/moderation-history")
def get_moderation_history(
    limit: int = 50,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_ambassador)
):
    # Construire les requêtes de base
    memoir_query = select(Memoir).where(Memoir.moderated_by != None)
    university_query = select(University).where(University.moderated_by != None)
    field_query = select(FieldOfStudy).where(FieldOfStudy.moderated_by != None)
    
    # Filtrer selon le rôle
    if current_user.role == UserRole.ambassador:
        # Ambassadeur = voit uniquement ses propres actions
        memoir_query = memoir_query.where(Memoir.moderated_by == current_user.id)
        university_query = university_query.where(University.moderated_by == current_user.id)
        field_query = field_query.where(FieldOfStudy.moderated_by == current_user.id)
    elif current_user.role == UserRole.moderator and current_user.country_id:
        # Modérateur = voit tout l'historique de son pays
        memoir_query = memoir_query.join(University).where(University.country_id == current_user.country_id)
        university_query = university_query.where(University.country_id == current_user.country_id)
        field_query = field_query.join(University).where(University.country_id == current_user.country_id)
    # Admin voit tout, pas de filtre supplémentaire
    
    memoir_query = memoir_query.order_by(Memoir.moderated_at.desc()).limit(limit)
    university_query = university_query.order_by(University.moderated_at.desc()).limit(limit)
    field_query = field_query.order_by(FieldOfStudy.moderated_at.desc()).limit(limit)
    
    memoirs = session.exec(memoir_query).all()
    universities = session.exec(university_query).all()
    fields = session.exec(field_query).all()
    
    history = []
    
    for m in memoirs:
        # Ajouter le nom de l'ambassadeur qui a submit si applicable
        submitted_by_name = None
        if m.author:
            submitted_by_name = m.author.full_name
        
        history.append({
            "id": f"m_{m.id}",
            "type": "Mémoire",
            "title": m.title,
            "status": m.status,
            "moderated_at": m.moderated_at,
            "moderator_name": m.moderator.full_name if m.moderator else "Inconnu",
            "submitted_by_name": submitted_by_name,
            "rejection_reason": m.rejection_reason,
            "university_name": m.university.name if m.university else None
        })
        
    for u in universities:
        history.append({
            "id": f"u_{u.id}",
            "type": "Université",
            "title": u.name,
            "status": u.status,
            "moderated_at": u.moderated_at,
            "moderator_name": u.moderator.full_name if u.moderator else "Inconnu",
            "submitted_by_name": u.submitted_by_user.full_name if u.submitted_by_user else None,
            "rejection_reason": None
        })
        
    for f in fields:
        history.append({
            "id": f"f_{f.id}",
            "type": "Filière",
            "title": f.label,
            "status": f.status,
            "moderated_at": f.moderated_at,
            "moderator_name": f.moderator.full_name if f.moderator else "Inconnu",
            "submitted_by_name": f.submitted_by_user.full_name if f.submitted_by_user else None,
            "rejection_reason": None,
            "university_name": f.university.name if f.university else None
        })
        
    history.sort(key=lambda x: x["moderated_at"] if x["moderated_at"] else "", reverse=True)
    return history[:limit]