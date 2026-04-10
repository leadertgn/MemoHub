# app/models/university.py

from datetime import datetime
from typing import List, Optional
from sqlmodel import SQLModel, Field, Relationship
from .base import TimestampMixin
from .enums import UniversityStatus


import uuid
from sqlalchemy import text

class UniversityBase(SQLModel):
    public_id: uuid.UUID = Field(
        default_factory=uuid.uuid4, 
        index=True, 
        sa_column_kwargs={
            "unique": True,
            "server_default": text("gen_random_uuid()")
        }
    )
    name: str = Field(index=True)
    country_id: int = Field(foreign_key="country.id")
    acronym: Optional[str] = None          # Acronyme de l'université (ex: UAC, ENEAM)
    website: Optional[str] = None          # Site officiel de l'université


class UniversityCreate(UniversityBase):
    pass  # Le frontend envoie le nom, country_id, et optionnellement website


class UniversityUpdate(SQLModel):
    name: Optional[str] = None
    acronym: Optional[str] = None
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

    # Traçabilité de modération
    moderated_by: Optional[int] = Field(default=None, foreign_key="user.id")
    moderated_at: Optional[datetime] = Field(default=None)

    # Relations
    country: Optional["Country"] = Relationship(back_populates="universities")
    submitted_by_user: Optional["User"] = Relationship(
        back_populates="submitted_universities",
        sa_relationship_kwargs={"foreign_keys": "University.submitted_by"}
    )
    ambassadors: List["User"] = Relationship(
        back_populates="university",
        sa_relationship_kwargs={"foreign_keys": "User.university_id"}
    )
    fields_of_study: List["FieldOfStudy"] = Relationship(back_populates="university")
    memoirs: List["Memoir"] = Relationship(back_populates="university")
    moderator: Optional["User"] = Relationship(
        sa_relationship_kwargs={"foreign_keys": "University.moderated_by"}
    )
