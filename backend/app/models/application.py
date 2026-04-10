# app/models/application.py
from sqlmodel import Field, SQLModel, Relationship
from datetime import datetime
from typing import Optional

import uuid
from sqlalchemy import text

class TeamApplication(SQLModel, table=True):
    __tablename__ = "team_applications"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    public_id: uuid.UUID = Field(
        default_factory=uuid.uuid4, 
        index=True, 
        sa_column_kwargs={
            "unique": True,
            "server_default": text("gen_random_uuid()")
        }
    )
    user_id: int = Field(foreign_key="user.id", nullable=False)
    
    # Rôle auquel l'utilisateur postule
    role: str = Field(max_length=50, description="ambassador ou moderator")
    
    # --- Informations obligatoires pour les deux rôles ---
    # Pays du candidat (requis pour les deux rôles)
    country_id: int = Field(foreign_key="country.id", nullable=False)
    country: Optional["Country"] = Relationship(sa_relationship_kwargs={"foreign_keys": "TeamApplication.country_id"})
    
    # Preuve : numéro étudiant ou email universitaire
    student_proof: str = Field(max_length=255, description="Numéro étudiant ou email universitaire (ex: john@univ-benin.ci)")
    
    # --- Uniquement pour ambassadeur ---
    # Université que le candidat veut représenter
    university_id: Optional[int] = Field(default=None, foreign_key="university.id")
    university: Optional["University"] = Relationship(sa_relationship_kwargs={"foreign_keys": "TeamApplication.university_id"})
    
    # Motivation de la candidature
    motivation: str = Field(max_length=2000)
    
    # Disponibilité en heures/semaine
    availability: Optional[str] = Field(default=None, max_length=50)
    
    # Statut de la candidature
    status: str = Field(default="pending", max_length=50, description="pending, approved, rejected")
    
    # Notes internes pour les administrateurs
    admin_notes: Optional[str] = Field(default=None, max_length=1000)
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    reviewed_at: Optional[datetime] = Field(default=None)
    reviewed_by: Optional[int] = Field(default=None, foreign_key="user.id")
    
    # Relation avec l'utilisateur
    user: Optional["User"] = Relationship(
        back_populates="team_applications",
        sa_relationship_kwargs={"foreign_keys": "TeamApplication.user_id"}
    )
    reviewer: Optional["User"] = Relationship(sa_relationship_kwargs={"foreign_keys": "TeamApplication.reviewed_by"})
    
    class Config:
        json_schema_extra = {
            "example": {
                "role": "ambassador",
                "country_id": 1,
                "university_id": 5,
                "student_proof": "john@univ-abidjan.ci",
                "motivation": "Je souhaite contribuer à la qualité du contenu académique...",
                "availability": "5-8"
            }
        }