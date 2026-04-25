# app/routes/memoirs.py
from typing import List, Optional
import uuid
import re
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form, BackgroundTasks, Request
from sqlmodel import Session, select, col
from sqlalchemy import func
from sqlalchemy.orm import selectinload

from app.core.dependencies import get_current_user, require_moderator, require_ambassador, get_current_user_optional
from app.core.cloudinary_service import upload_memoir_pdf, delete_memoir_pdf
from app.database import get_session
from app.models import Memoir, User, FieldOfStudy
from app.models.enums import UserRole, MemoirStatus, DegreeLevel
from app.schemas.memoir import (
    MemoirRead, MemoirReadWithAccess, MemoirUpdate, MemoirStatusUpdate, PaginatedMemoirsResponse
)

from app.core.pdf_service import fetch_pdf, add_watermark
from app.services.email_service import send_email_async, get_approval_email_html, get_rejection_email_html
from app.services.team_notification_service import notify_team_for_action
from fastapi.responses import Response, StreamingResponse
from fastapi.concurrency import run_in_threadpool
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/memoirs", tags=["Memoirs"])


# --------------------------------------------------
# GET /memoirs  — public, filtres avancés + pagination
# --------------------------------------------------
@router.get("", response_model=PaginatedMemoirsResponse)
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
    search_pattern = None
    if search:
        search_pattern = f"%{search}%"
        query = query.where(
            col(Memoir.title).ilike(search_pattern) |
            col(Memoir.author_name).ilike(search_pattern)
        )
    if domain_id:
        query = query.join(FieldOfStudy).where(FieldOfStudy.domain_id == domain_id)

    # Correction bug: PostgreSQL/SQLite buguent avec les COUNT sur subquery sans select explicit.
    # On reconstruit une query propre pour le COUNT :
    count_query = select(func.count(Memoir.id)).where(Memoir.status == MemoirStatus.approved)
    if university_id: count_query = count_query.where(Memoir.university_id == university_id)
    if field_of_study_id: count_query = count_query.where(Memoir.field_of_study_id == field_of_study_id)
    if degree: count_query = count_query.where(Memoir.degree == degree)
    if year: count_query = count_query.where(Memoir.year == year)
    if search and search_pattern:
        count_query = count_query.where(
            col(Memoir.title).ilike(search_pattern) | col(Memoir.author_name).ilike(search_pattern)
        )
    if domain_id: count_query = count_query.join(FieldOfStudy).where(FieldOfStudy.domain_id == domain_id)

    total = session.exec(count_query).one()

    # Pagination
    offset = (page - 1) * limit
    # Ajout du chargement des relations pour avoir les noms en front
    query = query.offset(offset).limit(limit).options(
        selectinload(Memoir.university), 
        selectinload(Memoir.field_of_study)
    )
    items = session.exec(query).all()

    import math
    return PaginatedMemoirsResponse(
        items=items,
        total=total,
        page=page,
        limit=limit,
        total_pages=math.ceil(total / limit) if total > 0 else 0
    )


# --------------------------------------------------
# GET /memoirs/me  — auth requise
# Historique des mémoires soumis par l'utilisateur connecté
# --------------------------------------------------
@router.get("/me", response_model=List[MemoirRead])
def get_my_memoirs(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    # order by id desc pour avoir les plus récents en premier
    query = (
        select(Memoir)
        .where(Memoir.author_id == current_user.id)
        .order_by(col(Memoir.id).desc())
        .options(selectinload(Memoir.university), selectinload(Memoir.field_of_study))
    )
    return session.exec(query).all()

# --------------------------------------------------
# GET /memoirs/{public_id}  — public
# Incrémente le view_count à chaque consultation
# --------------------------------------------------
@router.get("/{public_id}", response_model=MemoirRead)
def get_memoir(
    public_id: uuid.UUID,
    session: Session = Depends(get_session),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    memoir = session.exec(
        select(Memoir)
        .where(Memoir.public_id == public_id)
        .options(selectinload(Memoir.university), selectinload(Memoir.field_of_study))
    ).first()
    if not memoir:
        raise HTTPException(status_code=404, detail="Mémoire introuvable")

    # Access control: si ce n'est pas approuvé, seul l'auteur ou un modérateur/admin/ambassadeur peut le voir
    if memoir.status != MemoirStatus.approved:
        if not current_user:
            raise HTTPException(status_code=404, detail="Mémoire introuvable")
        
        is_author = memoir.author_id == current_user.id
        is_admin_mod = current_user.role in [UserRole.admin, UserRole.moderator]
        is_ambassador_for_this = current_user.role == UserRole.ambassador and current_user.university_id == memoir.university_id
        
        if not (is_author or is_admin_mod or is_ambassador_for_this):
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
):
    # On recharge proprement avec les relations si nécessaire
    query = (
        select(Memoir)
        .where(Memoir.id == memoir_id)
        .options(selectinload(Memoir.university), selectinload(Memoir.field_of_study))
    )
    memoir = session.exec(query).first()
    
    if not memoir or memoir.status != MemoirStatus.approved:
        raise HTTPException(status_code=404, detail="Mémoire introuvable")

    return memoir


# --------------------------------------------------
# POST /memoirs  — auth requise
# Upload avec métadonnées
# --------------------------------------------------
@router.post("", response_model=MemoirRead, status_code=201)
async def submit_memoir(
    # Métadonnées envoyées en Form (multipart)
    title:             str = Form(...),
    abstract:          str = Form(...),
    author_name:       str = Form(...),
    author_email:      str = Form(...),
    author_phone:      str = Form(...),
    year:              int = Form(...),
    degree:            DegreeLevel = Form(...),
    language:          str = Form(default="fr"),
    field_of_study_id: int = Form(...),
    university_id:     int = Form(...),
    accepted_terms:    bool = Form(...),
    allow_download:    bool = Form(default=True),
    # Fichier PDF
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = BackgroundTasks(),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    # Validation du numéro de téléphone (norme ITU-T E.164 : 8–15 chiffres)
    phone_digits = re.sub(r'\D', '', author_phone)
    if len(phone_digits) < 8 or len(phone_digits) > 15:
        raise HTTPException(
            status_code=422,
            detail="Numéro de téléphone invalide. Fournissez un numéro valide (8 à 15 chiffres, ex\u00a0: +229 90 00 00 00)."
        )

    # Validation basique de l'email
    if "@" not in author_email or "." not in author_email.split("@")[-1]:
        raise HTTPException(
            status_code=422,
            detail="Adresse email invalide."
        )

    # Vérifie que la filière appartient bien à l'université
    field = session.get(FieldOfStudy, field_of_study_id)
    if not field or field.university_id != university_id:
        raise HTTPException(
            status_code=400,
            detail="Cette filière n'appartient pas à l'université sélectionnée"
        )

    # Récupérer et limiter le poids du fichier (Sécurité)
    max_file_size = 20 * 1024 * 1024  # 20 MB limit
    file_bytes = await file.read()
    if len(file_bytes) > max_file_size:
        raise HTTPException(status_code=400, detail="Fichier trop volumineux (Maximum 20 MB)")
    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Fichier vide invalide")
    await file.seek(0) # IMPORTANT: Rembobine le fichier pour que Cloudinary puisse le lire

    # Upload le PDF sur Cloudinary
    file_url = await upload_memoir_pdf(file)

    memoir = Memoir(
        title=title,
        abstract=abstract,
        author_name=author_name,
        author_email=author_email,
        author_phone=author_phone,
        year=year,
        degree=degree,
        language=language,
        field_of_study_id=field_of_study_id,
        university_id=university_id,
        file_url=file_url,
        author_id=current_user.id,
        status=MemoirStatus.pending,
        accepted_terms=accepted_terms,
        allow_download=allow_download
    )
    session.add(memoir)
    session.commit()
    session.refresh(memoir)
    
    country_id = field.university.country_id if field.university else None
    notify_team_for_action(
        session, background_tasks, "Mémoire", memoir.title,
        action="Nouveau mémoire en attente de validation",
        country_id=country_id,
        university_id=university_id
    )
    
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
# PATCH /memoirs/{public_id}/pre-validate  — ambassadeur seulement
# --------------------------------------------------
@router.patch("/{public_id}/pre-validate", response_model=MemoirRead)
def pre_validate_memoir(
    public_id: uuid.UUID,
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_ambassador)
):
    memoir = session.exec(select(Memoir).where(Memoir.public_id == public_id)).first()
    if not memoir:
        raise HTTPException(status_code=404, detail="Mémoire introuvable")

    # Sécurité : un ambassadeur ne peut pré-valider que les mémoires de son université
    if current_user.role == UserRole.ambassador:
        if memoir.university_id != current_user.university_id:
            raise HTTPException(status_code=403, detail="Accès refusé : ce mémoire ne provient pas de votre université.")

    if memoir.status != MemoirStatus.pending:
        # Si c'est déjà pré-validé ou approuvé, rien à faire (ou message informatif)
        return memoir

    # Mise à jour du statut
    memoir.status = MemoirStatus.pre_validated
    memoir.moderated_by = current_user.id
    memoir.moderated_at = datetime.now(timezone.utc)

    session.add(memoir)
    session.commit()
    session.refresh(memoir)

    # Notification à l'équipe (modérateurs pays et admins)
    # L'ambassadeur signale que le document est prêt pour la validation finale
    notify_team_for_action(
        session=session,
        background_tasks=background_tasks,
        resource_type="Mémoire (Pré-validé)",
        resource_name=memoir.title,
        action="Nouvelle pré-validation",
        country_id=memoir.university.country_id if memoir.university else None,
        details=f"Pré-validé par l'ambassadeur {current_user.full_name} ({memoir.university.name if memoir.university else 'Univ inconnue'})"
    )

    return memoir


# --------------------------------------------------
# PATCH /memoirs/{public_id}/status  — ambassadeur/modérateur/admin
# --------------------------------------------------
@router.patch("/{public_id}/status", response_model=MemoirRead)
def update_memoir_status(
    public_id: uuid.UUID,
    status_data: MemoirStatusUpdate,
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_ambassador)
):
    memoir = session.exec(select(Memoir).where(Memoir.public_id == public_id)).first()
    if not memoir:
        raise HTTPException(status_code=404, detail="Mémoire introuvable")

    # Si c'est un ambassadeur, vérifier université + statut correct
    if current_user.role == UserRole.ambassador:
        if memoir.university_id != current_user.university_id:
            raise HTTPException(status_code=403, detail="Vous ne modérez pas cette université")
        
        # Le frontend envoie souvent "approved" au clic du bouton "Valider", on le rétrograde silencieusement
        if status_data.status == MemoirStatus.approved:
            status_data.status = MemoirStatus.pre_validated
            
        if status_data.status not in [MemoirStatus.pre_validated, MemoirStatus.rejected]:
            raise HTTPException(status_code=403, detail="L'ambassadeur ne peut que pré-valider ou rejeter")

    # Si rejeté, une raison est obligatoire
    if status_data.status == MemoirStatus.rejected and not status_data.rejection_reason:
        raise HTTPException(
            status_code=400,
            detail="Une raison de rejet est obligatoire"
        )

    old_status = memoir.status

    if old_status != status_data.status:
        memoir.status = status_data.status
        memoir.moderated_by = current_user.id
        memoir.moderated_at = datetime.now(timezone.utc)
        if status_data.rejection_reason:
            memoir.rejection_reason = status_data.rejection_reason
        elif status_data.status == MemoirStatus.approved:
            # Clear rejection reason if approving
            memoir.rejection_reason = None

    session.add(memoir)
    session.commit()
    session.refresh(memoir)
    
    # --- Notification Email Asynchrone ---
    if memoir.author and old_status != status_data.status:
        # Récupérer les détails pour l'email
        university_name = memoir.university.name if memoir.university else None
        field_name = memoir.field_of_study.label if memoir.field_of_study else None
        year = memoir.year
        degree = memoir.degree.value if memoir.degree else None
        
        if status_data.status == MemoirStatus.approved:
            html = get_approval_email_html(
                memoir.author.full_name,
                memoir.title,
                university_name=university_name,
                field_name=field_name,
                year=year,
                degree=degree
            )
            background_tasks.add_task(
                send_email_async, 
                to_email=memoir.author.email,
                to_name=memoir.author.full_name,
                subject="Mémoire approuvé sur MemoHub",
                html_content=html
            )
        elif status_data.status == MemoirStatus.rejected:
            html = get_rejection_email_html(
                memoir.author.full_name,
                memoir.title,
                status_data.rejection_reason or "Non spécifié",
                university_name=university_name,
                field_name=field_name
            )
            background_tasks.add_task(
                send_email_async, 
                to_email=memoir.author.email,
                to_name=memoir.author.full_name,
                subject="Mise à jour de votre soumission MemoHub",
                html_content=html
            )

    return memoir


# --------------------------------------------------
# DELETE /memoirs/{public_id}  — admin seulement
# --------------------------------------------------
@router.delete("/{public_id}", status_code=204)
def delete_memoir(
    public_id: uuid.UUID,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_moderator)
):
    memoir = session.exec(select(Memoir).where(Memoir.public_id == public_id)).first()
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
@router.get("/{public_id}/download")
async def download_memoir(
    public_id: uuid.UUID,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    memoir = session.exec(select(Memoir).where(Memoir.public_id == public_id)).first()
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
        
        # Prépare le filigrane dynamique: MémoHub-ACRONYME-ISO_PAYS-ANNEE
        if memoir.university and memoir.university.acronym:
            acronym = memoir.university.acronym.upper()
        else:
            univ_name = memoir.university.name if memoir.university else "MemoHub"
            import re
            acronym_match = re.search(r'\(([^)]+)\)', univ_name)
            if acronym_match:
                acronym = acronym_match.group(1).upper()
            else:
                acronym = "".join([word[0] for word in univ_name.split() if len(word) > 3]).upper()[:4]
                if not acronym:
                    acronym = "UNIV"
                
        country_iso = memoir.university.country.iso_code if memoir.university and memoir.university.country else "GLB"
        
        watermark_text = f"MémoHub-{acronym}-{country_iso}-{memoir.year}"
        
        # Applique le filigrane (Délégué dans un ThreadPool pour ne pas geler l'Event Loop de FastAPI)
        watermarked_pdf = await run_in_threadpool(add_watermark, pdf_bytes, watermark_text)
        
        # Nettoyage du titre pour le nom du fichier
        safe_title = "".join([c if c.isalnum() else "_" for c in memoir.title])
        
        return Response(
            content=watermarked_pdf,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=MemoHub_{safe_title}.pdf"}
        )
    except Exception as e:
        logger.error(f"Erreur lors du téléchargement du PDF (Filigrane) : {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Erreur interne de traitement du PDF.")


# --------------------------------------------------
# GET /memoirs/{id}/stream  — tout le monde
# Stream le PDF original (protégé) pour la visionneuse React-PDF
# --------------------------------------------------
@router.get("/{public_id}/stream")
async def stream_memoir(
    public_id: uuid.UUID,
    request: Request,
    session: Session = Depends(get_session),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    memoir = session.exec(select(Memoir).where(Memoir.public_id == public_id)).first()
    if not memoir:
        raise HTTPException(status_code=404, detail="Mémoire introuvable")

    if memoir.status != MemoirStatus.approved:
        if not current_user:
            raise HTTPException(status_code=404, detail="Mémoire introuvable ou non approuvé")
            
        is_author = memoir.author_id == current_user.id
        is_admin_mod = current_user.role in [UserRole.admin, UserRole.moderator]
        is_ambassador_for_this = current_user.role == UserRole.ambassador and current_user.university_id == memoir.university_id
        
        if not (is_author or is_admin_mod or is_ambassador_for_this):
            raise HTTPException(status_code=404, detail="Mémoire introuvable ou non approuvé")

    try:
        import httpx
        client_headers = {}
        if "range" in request.headers:
            client_headers["Range"] = request.headers["range"]

        client = httpx.AsyncClient()
        req = client.build_request("GET", memoir.file_url, headers=client_headers)
        r = await client.send(req, stream=True)

        # Passe les headers importants au navigateur
        resp_headers = {
            "Accept-Ranges": "bytes",
            "Content-Disposition": "inline"
        }
        if "Content-Range" in r.headers:
            resp_headers["Content-Range"] = r.headers["Content-Range"]
        if "Content-Length" in r.headers:
            resp_headers["Content-Length"] = r.headers["Content-Length"]

        async def _stream_generator():
            try:
                # Transfère par blocs de 64Ko pour une fluidité d'affichage optimale
                async for chunk in r.aiter_bytes(chunk_size=1024 * 64):
                    yield chunk
            finally:
                await r.aclose()
                await client.aclose()
        
        return StreamingResponse(
            _stream_generator(),
            status_code=r.status_code,
            headers=resp_headers,
            media_type="application/pdf"
        )
    except Exception as e:
        logger.error(f"Erreur lors de la lecture du flux PDF : {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Impossible de lire le document protégé.")