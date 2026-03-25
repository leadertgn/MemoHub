# app/schemas/university.py
from typing import Optional
from sqlmodel import SQLModel
from app.models.enums import UniversityStatus


class UniversityRead(SQLModel):
    id: int
    name: str
    website: Optional[str] = None
    country_id: int
    status: UniversityStatus


class UniversityCreate(SQLModel):
    name: str
    country_id: int
    website: Optional[str] = None


class UniversityUpdate(SQLModel):
    name: Optional[str] = None
    website: Optional[str] = None
    country_id: Optional[int] = None


class UniversityStatusUpdate(SQLModel):
    status: UniversityStatus