# app/models/country.py

from typing import List, Optional
from sqlmodel import SQLModel, Field, Relationship
from .base import TimestampMixin


class CountryBase(SQLModel):
    name: str = Field(index=True, unique=True)
    iso_code: str = Field(max_length=3)  # ex: "BEN", "SEN", "FRA"


class CountryCreate(CountryBase):
    pass


class CountryUpdate(SQLModel):
    name: Optional[str] = None
    iso_code: Optional[str] = None


class Country(CountryBase, TimestampMixin, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

    # Relations
    universities: List["University"] = Relationship(back_populates="country")
