# app/core/cloudinary_service.py
import cloudinary
import cloudinary.uploader
from fastapi import UploadFile, HTTPException
from app.core.config import settings
import time

# Configuration Cloudinary
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True  # toujours HTTPS
)

# Contraintes sur les fichiers
MAX_FILE_SIZE_MB = 20
ALLOWED_TYPES = ["application/pdf"]


async def upload_memoir_pdf(file: UploadFile, memoir_title: str) -> str:
    """
    Upload un PDF de mémoire sur Cloudinary.
    Retourne l'URL sécurisée du fichier.

    Pourquoi on valide ici et pas seulement en frontend ?
    → Le frontend peut être contourné. La validation backend est obligatoire.
    """

    # 1. Vérifie le type MIME
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Type de fichier non autorisé. Seuls les PDFs sont acceptés."
        )

    # 2. Lit le contenu et vérifie la taille
    contents = await file.read()
    size_mb = len(contents) / (1024 * 1024)

    if size_mb > MAX_FILE_SIZE_MB:
        raise HTTPException(
            status_code=400,
            detail=f"Fichier trop volumineux. Maximum autorisé : {MAX_FILE_SIZE_MB}MB"
        )

    # 3. Upload vers Cloudinary
    try:
        result = cloudinary.uploader.upload(
            contents,
            resource_type="raw",        # "raw" pour les PDFs (pas image/video)
            folder="memohub/memoirs",   # dossier organisé dans Cloudinary
            use_filename=True,
            unique_filename=True,
            overwrite=False,
        )
        return result["secure_url"]     # URL HTTPS permanente

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de l'upload : {str(e)}"
        )


def delete_memoir_pdf(file_url: str) -> None:
    """
    Supprime un PDF de Cloudinary à partir de son URL.
    Utilisé quand un mémoire est supprimé.
    """
    try:
        # Extrait le public_id depuis l'URL Cloudinary
        # URL format: https://res.cloudinary.com/cloud/raw/upload/v123/memohub/memoirs/file.pdf
        public_id = "/".join(file_url.split("/")[-3:]).split(".")[0]
        cloudinary.uploader.destroy(public_id, resource_type="raw")
    except Exception:
        # On ne bloque pas la suppression DB si Cloudinary échoue
        pass

def generate_signed_url(file_url: str, expires_in_seconds: int = 60) -> str:
        """
        Génère une URL temporaire signée pour accéder au fichier.
        Expire après expires_in_seconds (défaut : 60 secondes).

        Pourquoi 60 secondes ?
        → Assez long pour démarrer le téléchargement,
          trop court pour partager le lien à quelqu'un d'autre.
        """
        # Extrait le public_id depuis l'URL Cloudinary
        # URL format: https://res.cloudinary.com/cloud/raw/upload/v123/memohub/memoirs/file.pdf
        parts = file_url.split("/upload/")
        if len(parts) != 2:
            raise HTTPException(status_code=500, detail="URL fichier invalide")

        # Supprime la version (v123/) si présente
        path = parts[1]
        if path.startswith("v") and "/" in path:
            path = path.split("/", 1)[1]

        public_id = path.rsplit(".", 1)[0]  # supprime l'extension

        # Génère l'URL signée
        expires_at = int(time.time()) + expires_in_seconds

        signed_url = cloudinary.utils.cloudinary_url(
            public_id,
            resource_type="raw",
            sign_url=True,
            expires_at=expires_at,
            secure=True
        )[0]

        return signed_url