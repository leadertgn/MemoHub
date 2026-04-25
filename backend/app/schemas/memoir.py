# app/schemas/memoir.py
from typing import Optional, List
from sqlmodel import SQLModel, Field
from app.models.enums import MemoirStatus, DegreeLevel
from app.schemas.university import UniversityRead
from app.schemas.field_of_study import FieldOfStudyRead


import uuid

class MemoirRead(SQLModel):
    """Ce que l'API retourne — jamais le file_url direct."""
    public_id: uuid.UUID
    title: str
    abstract: str
    author_name: str
    year: int
    degree: DegreeLevel
    language: str
    status: MemoirStatus
    rejection_reason: Optional[str] = None  # Raison du rejet si applicable
    view_count: int
    allow_download: bool
    accepted_terms: bool
    university: Optional[UniversityRead] = None
    field_of_study: Optional[FieldOfStudyRead] = None


class MemoirReadWithAccess(MemoirRead):
    """
    Retourné quand l'utilisateur a le droit d'accéder au fichier.
    On ajoute l'URL seulement dans ce cas précis.
    """
    file_url: str


class MemoirModeratorRead(MemoirRead):
    """
    Retourné aux administrateurs avec les informations de contact critiques.
    """
    author_email: str
    author_phone: str


class MemoirCreate(SQLModel):
    title: str = Field(max_length=255)
    abstract: str = Field(max_length=3000)
    author_name: str = Field(max_length=150)
    year: int
    degree: DegreeLevel
    language: str = "fr"
    field_of_study_id: int
    university_id: int


class MemoirUpdate(SQLModel):
    title: Optional[str] = Field(default=None, max_length=255)
    abstract: Optional[str] = Field(default=None, max_length=3000)
    author_name: Optional[str] = Field(default=None, max_length=150)
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

class PaginatedMemoirsResponse(SQLModel):
    items: List[MemoirRead]
    total: int
    page: int
    limit: int
    total_pages: int