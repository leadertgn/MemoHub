# app/models/user.py

from typing import List, Optional
from sqlmodel import SQLModel, Field, Relationship
from .base import TimestampMixin
from .enums import UserRole
from .application import TeamApplication


class UserBase(SQLModel):
    email: str = Field(index=True, unique=True)
    full_name: str
    avatar_url: Optional[str] = None       # Photo de profil retournée par Google OAuth
    role: UserRole = Field(default=UserRole.student)


class UserCreate(UserBase):
    google_id: str                          # Fourni par Google OAuth, jamais saisi manuellement


class UserUpdate(SQLModel):
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    role: Optional[UserRole] = None        # Seul l'admin peut modifier le rôle


class User(UserBase, TimestampMixin, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    google_id: str = Field(unique=True, index=True)

    # Relations
    # université affiliée (seulement pour l'ambassadeur)
    university_id: Optional[int] = Field(default=None, foreign_key="university.id")
    university: Optional["University"] = Relationship(
        back_populates="ambassadors",
        sa_relationship_kwargs={"foreign_keys": "User.university_id"}
    )

    # pays modéré (seulement pour le modérateur)
    country_id: Optional[int] = Field(default=None, foreign_key="country.id")
    country: Optional["Country"] = Relationship(
        sa_relationship_kwargs={"foreign_keys": "User.country_id"}
    )

    memoirs: List["Memoir"] = Relationship(
        back_populates="author",
        sa_relationship_kwargs={"foreign_keys": "Memoir.author_id"}
    )

    # Universités soumises par l'user (modération de la communauté)
    submitted_universities: List["University"] = Relationship(
        back_populates="submitted_by_user",
        sa_relationship_kwargs={"foreign_keys": "University.submitted_by"}
    )

    # Candidatures à l'équipe (ambassadeur/modérateur)
    team_applications: List["TeamApplication"] = Relationship(
        back_populates="user",
        sa_relationship_kwargs={"foreign_keys": "TeamApplication.user_id"}
    )
