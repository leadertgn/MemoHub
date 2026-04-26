import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool
from app.main import app
from app.database import get_session

# Utilisation d'une base de données SQLite en mémoire pour les tests
DATABASE_URL = "sqlite://"
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

@pytest.fixture(name="session")
def session_fixture():
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session
    SQLModel.metadata.drop_all(engine)

@pytest.fixture(name="client")
def client_fixture(session: Session):
    def get_session_override():
        return session
    
    # On remplace la dépendance get_session par notre version de test
    app.dependency_overrides[get_session] = get_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()
