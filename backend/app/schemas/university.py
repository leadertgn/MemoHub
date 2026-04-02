# app/schemas/university.py
from typing import Optional
from sqlmodel import SQLModel
from app.models.enums import UniversityStatus
from app.schemas.country import CountryRead


class UniversityRead(SQLModel):
    id: int
    name: str
    acronym: Optional[str] = None
    website: Optional[str] = None
    country_id: int
    country: Optional[CountryRead] = None
    status: UniversityStatus
    submitted_by: Optional[int] = None  # ID du'utilisateur qui a soumis
    submitted_by_name: Optional[str] = None  # Nom de l'utilisateur qui a soumis


class UniversityCreate(SQLModel):
    name: str
    acronym: Optional[str] = None
    country_id: int
    website: Optional[str] = None


class UniversityUpdate(SQLModel):
    name: Optional[str] = None
    acronym: Optional[str] = None
    website: Optional[str] = None
    country_id: Optional[int] = None


class UniversityStatusUpdate(SQLModel):
    status: UniversityStatus
    rejection_reason: Optional[str] = None