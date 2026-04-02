# app/schemas/country.py
from typing import Optional
from sqlmodel import SQLModel


class CountryRead(SQLModel):
    """
    Ce que l'API retourne quand on lit un pays.
    On choisit exactement ce qu'on expose — pas forcément tout le modèle DB.
    """
    id: int
    name: str
    iso_code: str


class CountryCreate(SQLModel):
    """Ce que le client envoie pour créer un pays."""
    name: str
    iso_code: str


class CountryUpdate(SQLModel):
    """Tous les champs optionnels pour une mise à jour partielle."""
    name: Optional[str] = None
    iso_code: Optional[str] = None