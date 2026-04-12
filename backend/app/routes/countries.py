# app/routes/countries.py
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select, col


from app.database import get_session
from app.models import Country
from app.schemas.country import CountryRead

router = APIRouter(
    prefix="/countries",
    tags=["Countries"]
)

@router.get("", response_model=List[CountryRead])
def get_countries(
    search: str = Query(default=None),
    session: Session = Depends(get_session)
):
    query = select(Country)

    if search:
        search_pattern = f"%{search}%"
        query = query.where(
            col(Country.name).ilike(search_pattern)
        )

    return session.exec(query.order_by(Country.name)).all()

@router.get("/{country_id}", response_model=CountryRead)
def get_country(
    country_id: int,
    session: Session = Depends(get_session)
):
    country = session.get(Country, country_id)
    if not country:
        raise HTTPException(status_code=404, detail="Pays introuvable")
    return country