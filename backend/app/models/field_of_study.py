# app/models/field_of_study.py
"""
FieldOfStudy représente une filière telle qu'elle est nommée
dans une université spécifique.

Relation clé :
  FieldOfStudy → University (appartient à une université)
  FieldOfStudy → Domain     (rattachée à un domaine normalisé)

Exemple concret :
  UAC (Bénin)        → "Génie Informatique"      → Domain: "Informatique & Numérique"
  UCAD (Sénégal)     → "Informatique Fondamentale" → Domain: "Informatique & Numérique"
  Paris-Saclay (FR)  → "Informatique et Réseaux"  → Domain: "Informatique & Numérique"

Résultat :
  Un étudiant en "Génie Informatique" à l'UAC peut trouver
  les mémoires de "Informatique Fondamentale" de Dakar
  en cherchant par Domain, pas seulement par filière exacte.
"""

from datetime import datetime
from typing import List, Optional
from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column, Enum as SAEnum
from .base import TimestampMixin
from .enums import FieldStatus


class FieldOfStudyBase(SQLModel):
    label: str = Field(index=True)                   # "Génie Informatique" (nom exact dans l'université)
    university_id: int = Field(foreign_key="university.id")
    domain_id: int = Field(foreign_key="domain.id")  # Domaine normalisé auquel elle appartient


class FieldOfStudyCreate(FieldOfStudyBase):
    pass


class FieldOfStudyUpdate(SQLModel):
    label: Optional[str] = None
    domain_id: Optional[int] = None  # L'admin peut corriger le rattachement au domaine


class FieldOfStudy(FieldOfStudyBase, TimestampMixin, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

    status: FieldStatus = Field(
        default=FieldStatus.approved,
        sa_column=Column(SAEnum(FieldStatus, name="fieldstatus"))
    )
    submitted_by: Optional[int] = Field(default=None, foreign_key="user.id")
    
    # Traçabilité de modération
    moderated_by: Optional[int] = Field(default=None, foreign_key="user.id")
    moderated_at: Optional[datetime] = Field(default=None)

    # Relations
    university: Optional["University"] = Relationship(back_populates="fields_of_study")
    domain: Optional["Domain"] = Relationship(back_populates="fields_of_study")
    memoirs: List["Memoir"] = Relationship(back_populates="field_of_study")
    
    submitted_by_user: Optional["User"] = Relationship(
        sa_relationship_kwargs={"foreign_keys": "FieldOfStudy.submitted_by"}
    )
    moderator: Optional["User"] = Relationship(
        sa_relationship_kwargs={"foreign_keys": "FieldOfStudy.moderated_by"}
    )
