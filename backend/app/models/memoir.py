# app/models/memoir.py

from typing import Optional
from sqlmodel import SQLModel, Field, Relationship
from .base import TimestampMixin
from .enums import MemoirStatus, DegreeLevel


class MemoirBase(SQLModel):
    # --- Informations sur le document académique ---
    title: str = Field(index=True)
    abstract: str                                        # Résumé du mémoire

    # IMPORTANT : author_name ≠ author_id
    # author_name = le vrai auteur du mémoire (ex: "Jean AGOSSOU")
    # author_id   = l'utilisateur qui l'a soumis sur la plateforme
    # Ces deux personnes peuvent être différentes !
    author_name: str = Field(index=True)                 # Nom de l'auteur réel du mémoire

    year: int = Field(index=True)                        # Année de soutenance
    degree: DegreeLevel                                  # Niveau académique (master, licence, etc.)
    language: str = Field(default="fr", max_length=5)   # Langue du document (fr, en, etc.)

    # --- Liens vers d'autres entités ---
    field_of_study_id: int = Field(foreign_key="fieldofstudy.id")   # Filière exacte
    university_id: int = Field(foreign_key="university.id")          # Université
    # ... champs existants ...
    accepted_terms: bool = Field(default=False)
    allow_download: bool = Field(default=True)

class MemoirCreate(MemoirBase):
    file_url: str   # URL cloud du fichier PDF (Cloudinary, S3, etc.) — obligatoire à la création
    # ... champs existants ...
    accepted_terms: bool  # pas de default → obligatoire à l'envoi

class MemoirUpdate(SQLModel):
    title: Optional[str] = None
    abstract: Optional[str] = None
    author_name: Optional[str] = None
    year: Optional[int] = None
    degree: Optional[DegreeLevel] = None
    language: Optional[str] = None
    status: Optional[MemoirStatus] = None        # Modifiable uniquement par admin/modérateur
    field_of_study_id: Optional[int] = None
    university_id: Optional[int] = None
    is_premium: Optional[bool] = None            # Modifiable par admin pour activer/désactiver le premium


class Memoir(MemoirBase, TimestampMixin, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

    # Fichier
    file_url: str   # URL du PDF stocké sur le cloud (jamais exposée directement en front)

    # Modération
    status: MemoirStatus = Field(default=MemoirStatus.pending)

    # Accès premium
    # False = lecture libre pour tous
    # True  = copie/téléchargement réservé aux utilisateurs premium
    is_premium: bool = Field(default=False)

    # Statistiques
    view_count: int = Field(default=0)   # Nombre de consultations

    # Qui a soumis ce mémoire sur la plateforme ?
    author_id: int = Field(foreign_key="user.id")

    # Relations
    author: Optional["User"] = Relationship(back_populates="memoirs")
    field_of_study: Optional["FieldOfStudy"] = Relationship(back_populates="memoirs")
    university: Optional["University"] = Relationship(back_populates="memoirs")
