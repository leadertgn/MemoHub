# app/models/university.py

from typing import List, Optional
from sqlmodel import SQLModel, Field, Relationship
from .base import TimestampMixin
from .enums import UniversityStatus


class UniversityBase(SQLModel):
    name: str = Field(index=True)
    country_id: int = Field(foreign_key="country.id")
    website: Optional[str] = None          # Site officiel de l'université


class UniversityCreate(UniversityBase):
    pass  # Le frontend envoie le nom, country_id, et optionnellement website


class UniversityUpdate(SQLModel):
    name: Optional[str] = None
    website: Optional[str] = None
    country_id: Optional[int] = None
    status: Optional[UniversityStatus] = None  # Seul l'admin peut modifier


class University(UniversityBase, TimestampMixin, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

    # Workflow de validation
    # pending  → soumise par un utilisateur, en attente de vérification
    # approved → vérifiée par l'admin, visible dans les filtres
    # rejected → refusée (doublon, données incorrectes, etc.)
    status: UniversityStatus = Field(default=UniversityStatus.pending)

    # Qui a soumis cette université ?
    # Utile pour contacter l'utilisateur si besoin de clarification
    submitted_by: Optional[int] = Field(default=None, foreign_key="user.id")

    # Relations
    country: Optional["Country"] = Relationship(back_populates="universities")
    submitted_by_user: Optional["User"] = Relationship(back_populates="submitted_universities")
    fields_of_study: List["FieldOfStudy"] = Relationship(back_populates="university")
    memoirs: List["Memoir"] = Relationship(back_populates="university")
