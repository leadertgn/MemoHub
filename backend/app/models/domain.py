# app/models/domain.py
"""
Domain remplace Category.

Pourquoi Domain et pas Category ?
- Une "catégorie" est trop vague et ambigu
- Un "domaine" représente mieux la réalité académique :
  c'est le domaine de connaissance normalisé auquel appartient une filière
  
Exemples de domaines :
  - Informatique & Numérique
  - Électronique & Énergie
  - Sciences de Gestion
  - Droit & Sciences Politiques
  - Médecine & Santé
  
Chaque filière d'université est rattachée à un domaine,
ce qui permet des recherches cross-université dans le même domaine.
"""

from typing import List, Optional
from sqlmodel import SQLModel, Field, Relationship
from .base import TimestampMixin
from .enums import DomainStatus


class DomainBase(SQLModel):
    label: str = Field(index=True, unique=True)   # "Informatique & Numérique"
    description: Optional[str] = None             # Description courte du domaine


class DomainCreate(DomainBase):
    pass


class DomainUpdate(SQLModel):
    label: Optional[str] = None
    description: Optional[str] = None
    status: Optional[DomainStatus] = None


class Domain(DomainBase, TimestampMixin, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    status: DomainStatus = Field(default=DomainStatus.active)

    # Relations
    fields_of_study: List["FieldOfStudy"] = Relationship(back_populates="domain")
