# app/schemas/domain.py
from typing import Optional
from sqlmodel import SQLModel
from app.models.enums import DomainStatus


class DomainRead(SQLModel):
    id: int
    label: str
    description: Optional[str] = None
    status: DomainStatus


class DomainCreate(SQLModel):
    label: str
    description: Optional[str] = None


class DomainUpdate(SQLModel):
    label: Optional[str] = None
    description: Optional[str] = None
    status: Optional[DomainStatus] = None