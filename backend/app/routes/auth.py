# app/routes/auth.py
import httpx
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.core.security import create_access_token
from app.database import get_session
from app.models import User
from app.models.enums import UserRole
from app.schemas.auth import GoogleAuthRequest, TokenResponse

router = APIRouter(prefix="/auth", tags=["Auth"])

GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"


@router.post("/google", response_model=TokenResponse)
async def google_auth(payload: GoogleAuthRequest, session: Session = Depends(get_session)):
    """
    Reçoit le code d'autorisation Google depuis le frontend.
    Échange ce code contre les infos utilisateur.
    Crée ou retrouve l'utilisateur en DB.
    Retourne un JWT.
    """
    from app.core.config import settings

    # Validate redirect_uri is in whitelist to prevent open redirect attacks
    allowed_uris = [uri.strip() for uri in settings.ALLOWED_REDIRECT_URIS.split(",")]
    if payload.redirect_uri not in allowed_uris:
        raise HTTPException(status_code=400, detail="Invalid redirect URI")

    # Créer un client avec timeout et réutiliser pour les deux requêtes
    timeout = httpx.Timeout(30.0)

    # 1. Échange le code Google contre un access_token Google
    async with httpx.AsyncClient(timeout=timeout) as client:
        token_response = await client.post(GOOGLE_TOKEN_URL, data={
            "code":          payload.code,
            "client_id":     settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "redirect_uri":  payload.redirect_uri,
            "grant_type":    "authorization_code",
        })

    if token_response.status_code != 200:
        raise HTTPException(status_code=400, detail="Code Google invalide")

    google_token = token_response.json().get("access_token")

    # 2. Récupère les infos de l'utilisateur depuis Google
    async with httpx.AsyncClient(timeout=timeout) as client:
        userinfo_response = await client.get(
            GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {google_token}"}
        )

    if userinfo_response.status_code != 200:
        raise HTTPException(status_code=400, detail="Impossible de récupérer les infos Google")

    google_user = userinfo_response.json()
    # google_user contient : id, email, name, picture

    # 3. Crée ou retrouve l'utilisateur en DB
    user = session.exec(
        select(User).where(User.google_id == google_user["id"])
    ).first()

    if not user:
        # Première connexion → création du compte
        user = User(
            email=google_user["email"],
            full_name=google_user["name"],
            avatar_url=google_user.get("picture"),
            google_id=google_user["id"],
            role=UserRole.student
        )
        session.add(user)
        session.commit()
        session.refresh(user)

    # 4. Génère et retourne le JWT MemoHub
    access_token = create_access_token(data={
        "sub":  str(user.id),
        "role": user.role
    })

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user_id=user.id,
        role=user.role,
        full_name=user.full_name,
        avatar_url=user.avatar_url
    )