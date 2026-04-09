# app/database.py
import logging
from sqlmodel import create_engine, SQLModel, Session
from app.core.config import settings

logger = logging.getLogger(__name__)

# La DATABASE_URL est chargée via settings (depuis .env)
database_url = settings.DATABASE_URL

# Correction automatique pour Psycopg3 avec Neon DB
if database_url and database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql+psycopg://", 1)
elif database_url and database_url.startswith("postgresql://"):
    database_url = database_url.replace("postgresql://", "postgresql+psycopg://", 1)

engine = create_engine(
    database_url,
    echo=False,          # True uniquement en dev local si tu veux voir les SQL
    connect_args={"sslmode": "require"},
    pool_pre_ping=True
)

def create_db_and_tables():
    """Utilisé uniquement pour les tests. En prod → Alembic."""
    import app.models
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session