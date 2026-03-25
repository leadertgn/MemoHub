# app/schemas/field_of_study.py
from typing import Optional
from sqlmodel import SQLModel


class FieldOfStudyRead(SQLModel):
    id: int
    label: str
    university_id: int
    domain_id: int


class FieldOfStudyCreate(SQLModel):
    label: str
    university_id: int
    domain_id: int


class FieldOfStudyUpdate(SQLModel):
    label: Optional[str] = None
    domain_id: Optional[int] = None