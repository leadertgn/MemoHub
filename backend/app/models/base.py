# app/models/base.py

from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field


class TimestampMixin(SQLModel):
    """
    Mixin à hériter par tous les modèles de table.
    Ajoute automatiquement created_at et updated_at.
    
    Pourquoi utile ?
    - created_at : trier par date de soumission, stats, etc.
    - updated_at : savoir quand un mémoire a été mis à jour/modéré
    """
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default=None)
