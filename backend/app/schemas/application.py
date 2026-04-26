# app/schemas/application.py
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class TeamApplicationBase(BaseModel):
    role: str = Field(..., description="Type de candidature: 'ambassador' ou 'moderator'")
    country_id: int = Field(..., description="ID du pays du candidat")
    university_id: Optional[int] = Field(None, description="ID de l'université (requis pour ambassadeur)")
    student_proof: str = Field(..., max_length=255, description="Numéro étudiant ou email universitaire")
    motivation: str = Field(..., max_length=2000, description="Motivation du candidat")
    availability: Optional[str] = Field(None, max_length=50, description="Disponibilité en heures/semaine")

class TeamApplicationCreate(TeamApplicationBase):
    """Schema pour créer une nouvelle candidature"""
    pass

class TeamApplicationUpdate(BaseModel):
    status: Optional[str] = None
    admin_notes: Optional[str] = None
    reviewed_at: Optional[datetime] = None

import uuid

class TeamApplicationResponse(TeamApplicationBase):
    """Schema pour la réponse API de base"""
    id: int
    public_id: uuid.UUID
    user_id: int
    status: str
    admin_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    reviewed_at: Optional[datetime] = None
    reviewed_by: Optional[int] = None

    class Config:
        from_attributes = True

class TeamApplicationAdminRead(TeamApplicationResponse):
    """Schema détaillé pour le dashboard admin"""
    user_full_name: Optional[str] = None
    country_name: Optional[str] = None
    university_name: Optional[str] = None