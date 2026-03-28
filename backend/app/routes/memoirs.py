# app/routes/memoirs.py
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form
from sqlmodel import Session, select
from sqlalchemy import  func

from app.core.dependencies import get_current_user, require_moderator, require_ambassador
from app.core.cloudinary_service import upload_memoir_pdf, delete_memoir_pdf
from app.database import get_session
from app.models import Memoir, User, FieldOfStudy, University
from app.models.enums import UserRole, MemoirStatus, DegreeLevel, UniversityStatus
from app.schemas.memoir import (
    MemoirRead, MemoirReadWithAccess, MemoirCreate, MemoirUpdate, MemoirStatusUpdate
)

from app.core.cloudinary_service import generate_signed_url
from app.schemas.memoir import MemoirDownloadResponse
from app.core.pdf_service import fetch_pdf, add_watermark
from fastapi.responses import Response, StreamingResponse
import io

router = APIRouter(prefix="/memoirs", tags=["Memoirs"])


# --------------------------------------------------
# GET /memoirs  — public, filtres avancés + pagination
# --------------------------------------------------
@router.get("/", response_model=List[MemoirRead])
def get_memoirs(
    domain_id:           Optional[int] = Query(default=None),
    university_id:       Optional[int] = Query(default=None),
    field_of_study_id:   Optional[int] = Query(default=None),
    degree:              Optional[DegreeLevel] = Query(default=None),
    year:                Optional[int] = Query(default=None),
    search:              Optional[str] = Query(default=None, description="Recherche par titre ou auteur"),
    page:                int = Query(default=1, ge=1),
    limit:               int = Query(default=20, ge=1, le=100),
    session:             Session = Depends(get_session)
):
    query = select(Memoir).where(Memoir.status == MemoirStatus.approved)

    if university_id:
        query = query.where(Memoir.university_id == university_id)
    if field_of_study_id:
        query = query.where(Memoir.field_of_study_id == field_of_study_id)
    if degree:
        query = query.where(Memoir.degree == degree)
    if year:
        query = query.where(Memoir.year == year)
    if search:
        query = query.where(
            func.unaccent(Memoir.title).ilike(
                func.concat("%", func.unaccent(search), "%")
            ) |
            func.unaccent(Memoir.author_name).ilike(
                func.concat("%", func.unaccent(search), "%")
            )
        )
    if domain_id:
        query = query.join(FieldOfStudy).where(FieldOfStudy.domain_id == domain_id)

    # Pagination
    offset = (page - 1) * limit
    query = query.offset(offset).limit(limit)

    return session.exec(query).all()


# --------------------------------------------------
# GET /memoirs/{id}  — public
# Incrémente le view_count à chaque consultation
# --------------------------------------------------
@router.get("/{memoir_id}", response_model=MemoirRead)
def get_memoir(
    memoir_id: int,
    session: Session = Depends(get_session)
):
    memoir = session.get(Memoir, memoir_id)
    if not memoir or memoir.status != MemoirStatus.approved:
        raise HTTPException(status_code=404, detail="Mémoire introuvable")

    # Incrémente le compteur de vues
    memoir.view_count += 1
    session.add(memoir)
    session.commit()
    session.refresh(memoir)
    return memoir


# --------------------------------------------------
# GET /memoirs/{id}/access
# Retourne l'URL du fichier si l'utilisateur y a accès
# --------------------------------------------------
@router.get("/{memoir_id}/access", response_model=MemoirReadWithAccess)
def get_memoir_with_access(
    memoir_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    memoir = session.get(Memoir, memoir_id)
    if not memoir or memoir.status != MemoirStatus.approved:
        raise HTTPException(status_code=404, detail="Mémoire introuvable")

    # Vérifie les droits d'accès - Mémoire gratuit pour tous!

    return memoir


# --------------------------------------------------
# POST /memoirs  — auth requise
# Upload avec métadonnées
# --------------------------------------------------
@router.post("/", response_model=MemoirRead, status_code=201)
async def submit_memoir(
    # Métadonnées envoyées en Form (multipart)
    title:             str = Form(...),
    abstract:          str = Form(...),
    author_name:       str = Form(...),
    year:              int = Form(...),
    degree:            DegreeLevel = Form(...),
    language:          str = Form(default="fr"),
    field_of_study_id: int = Form(...),
    university_id:     int = Form(...),
    # Fichier PDF
    file: UploadFile = File(...),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    # Vérifie que la filière appartient bien à l'université
    field = session.get(FieldOfStudy, field_of_study_id)
    if not field or field.university_id != university_id:
        raise HTTPException(
            status_code=400,
            detail="Cette filière n'appartient pas à l'université sélectionnée"
        )

    # Upload le PDF sur Cloudinary
    file_url = await upload_memoir_pdf(file, title)

    memoir = Memoir(
        title=title,
        abstract=abstract,
        author_name=author_name,
        year=year,
        degree=degree,
        language=language,
        field_of_study_id=field_of_study_id,
        university_id=university_id,
        file_url=file_url,
        author_id=current_user.id,
        status=MemoirStatus.pending
    )
    session.add(memoir)
    session.commit()
    session.refresh(memoir)
    return memoir


# --------------------------------------------------
# PATCH /memoirs/{id}  — auteur seulement (si pending)
# --------------------------------------------------
@router.patch("/{memoir_id}", response_model=MemoirRead)
def update_memoir(
    memoir_id: int,
    memoir_data: MemoirUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    memoir = session.get(Memoir, memoir_id)
    if not memoir:
        raise HTTPException(status_code=404, detail="Mémoire introuvable")

    # Seul l'auteur peut modifier, et seulement si encore en pending
    if memoir.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Accès refusé")
    if memoir.status != MemoirStatus.pending:
        raise HTTPException(
            status_code=400,
            detail="Un mémoire approuvé ou rejeté ne peut plus être modifié"
        )

    for key, value in memoir_data.model_dump(exclude_unset=True).items():
        setattr(memoir, key, value)

    session.add(memoir)
    session.commit()
    session.refresh(memoir)
    return memoir


# --------------------------------------------------
# PATCH /memoirs/{id}/status  — ambassadeur/modérateur/admin
# --------------------------------------------------
@router.patch("/{memoir_id}/status", response_model=MemoirRead)
def update_memoir_status(
    memoir_id: int,
    status_data: MemoirStatusUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_ambassador)
):
    memoir = session.get(Memoir, memoir_id)
    if not memoir:
        raise HTTPException(status_code=404, detail="Mémoire introuvable")

    # Si c'est un ambassadeur, vérifier université + statut correct
    if current_user.role == UserRole.ambassador:
        if memoir.university_id != current_user.university_id:
            raise HTTPException(status_code=403, detail="Vous ne modérez pas cette université")
        if status_data.status not in [MemoirStatus.pre_validated, MemoirStatus.rejected]:
            raise HTTPException(status_code=403, detail="L'ambassadeur ne peut que pré-valider ou rejeter")

    # Si rejeté, une raison est obligatoire
    if status_data.status == MemoirStatus.rejected and not status_data.rejection_reason:
        raise HTTPException(
            status_code=400,
            detail="Une raison de rejet est obligatoire"
        )

    memoir.status = status_data.status
    if status_data.rejection_reason:
        memoir.rejection_reason = status_data.rejection_reason
    elif status_data.status == MemoirStatus.approved:
        # Clear rejection reason if approving
        memoir.rejection_reason = None
    session.add(memoir)
    session.commit()
    session.refresh(memoir)
    return memoir


# --------------------------------------------------
# DELETE /memoirs/{id}  — admin seulement
# --------------------------------------------------
@router.delete("/{memoir_id}", status_code=204)
def delete_memoir(
    memoir_id: int,
    session: Session = Depends(get_session),
    _: User = Depends(require_moderator)
):
    memoir = session.get(Memoir, memoir_id)
    if not memoir:
        raise HTTPException(status_code=404, detail="Mémoire introuvable")

    # Supprime aussi le fichier sur Cloudinary
    delete_memoir_pdf(memoir.file_url)

    session.delete(memoir)
    session.commit()


# --------------------------------------------------
# GET /memoirs/{id}/download  — tout le monde (connecté)
# Téléchargement d'un mémoire AVEC filigrane
# --------------------------------------------------
@router.get("/{memoir_id}/download")
async def download_memoir(
    memoir_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    memoir = session.get(Memoir, memoir_id)
    if not memoir:
        raise HTTPException(status_code=404, detail="Mémoire introuvable")
        
    if memoir.status != MemoirStatus.approved and memoir.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Mémoire non disponible")

    # Si le telechargement est désactivé
    if not memoir.allow_download:
        raise HTTPException(status_code=403, detail="L'auteur n'autorise pas le téléchargement")

    try:
        # Télécharge le PDF en mémoire
        pdf_bytes = await fetch_pdf(memoir.file_url)
        
        # Prépare le filigrane
        univ_name = memoir.university.name if memoir.university else "MemoHub"
        watermark_text = f"Téléchargé depuis MemoHub - {univ_name}"
        
        # Applique le filigrane
        watermarked_pdf = add_watermark(pdf_bytes, watermark_text)
        
        # Nettoyage du titre pour le nom du fichier
        safe_title = "".join([c if c.isalnum() else "_" for c in memoir.title])
        
        return Response(
            content=watermarked_pdf,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=MemoHub_{safe_title}.pdf"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur de traitement du PDF : {str(e)}")


# --------------------------------------------------
# GET /memoirs/{id}/stream  — tout le monde
# Stream le PDF original (protégé) pour la visionneuse React-PDF
# --------------------------------------------------
@router.get("/{memoir_id}/stream")
async def stream_memoir(
    memoir_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    memoir = session.get(Memoir, memoir_id)
    if not memoir or memoir.status != MemoirStatus.approved:
        if memoir and memoir.author_id == current_user.id:
            pass # L'auteur peut voir son mémoire non approuvé
        else:
            raise HTTPException(status_code=404, detail="Mémoire introuvable ou non approuvé")

    try:
        # Télécharge le PDF en mémoire depuis Cloudinary
        pdf_bytes = await fetch_pdf(memoir.file_url)
        
        # Retourne en stream
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={
                "Content-Disposition": "inline"  # Indique au navigateur d'afficher au lieu de télécharger
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail="Impossible de lire le document")