# app/schemas/field_of_study.py
from typing import Optional
from sqlmodel import SQLModel
from app.models.enums import FieldStatus
from app.schemas.university import UniversityRead
from app.schemas.domain import DomainRead

class FieldOfStudyRead(SQLModel):
    id: int
    label: str
    university_id: int
    university: Optional[UniversityRead] = None
    domain_id: int
    domain: Optional[DomainRead] = None
    status: FieldStatus
    submitted_by: Optional[int] = None

class FieldOfStudyCreate(SQLModel):
    label: str
    university_id: int
    domain_id: int


class FieldOfStudyUpdate(SQLModel):
    label: Optional[str] = None
    domain_id: Optional[int] = None

class FieldOfStudyStatusUpdate(SQLModel):
    status: FieldStatus
    rejection_reason: Optional[str] = None