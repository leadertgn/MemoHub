# app/schemas/memoir.py
from typing import Optional
from sqlmodel import SQLModel
from app.models.enums import MemoirStatus, DegreeLevel


class MemoirRead(SQLModel):
    """Ce que l'API retourne — jamais le file_url direct."""
    id: int
    title: str
    abstract: str
    author_name: str
    year: int
    degree: DegreeLevel
    language: str
    field_of_study_id: int
    university_id: int
    status: MemoirStatus
    rejection_reason: Optional[str] = None  # Raison du rejet si applicable
    is_premium: bool
    view_count: int


class MemoirReadWithAccess(MemoirRead):
    """
    Retourné quand l'utilisateur a le droit d'accéder au fichier.
    On ajoute l'URL seulement dans ce cas précis.
    """
    file_url: str


class MemoirCreate(SQLModel):
    title: str
    abstract: str
    author_name: str
    year: int
    degree: DegreeLevel
    language: str = "fr"
    field_of_study_id: int
    university_id: int


class MemoirUpdate(SQLModel):
    title: Optional[str] = None
    abstract: Optional[str] = None
    author_name: Optional[str] = None
    year: Optional[int] = None
    degree: Optional[DegreeLevel] = None
    language: Optional[str] = None
    field_of_study_id: Optional[int] = None
    university_id: Optional[int] = None


class MemoirStatusUpdate(SQLModel):
    status: MemoirStatus
    rejection_reason: Optional[str] = None  # Obligatoire si status = rejected


class MemoirDownloadResponse(SQLModel):
    """
    Retourné quand un utilisateur premium demande le téléchargement.
    L'URL expire dans 60 secondes.
    """
    signed_url: str
    expires_in: int = 60
    memoir_id: int
    title: str