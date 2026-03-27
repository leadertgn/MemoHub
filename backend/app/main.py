# app/main.py
from contextlib import asynccontextmanager
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from app.database import create_db_and_tables

# Plus tard tu ajouteras tes routers ici :
from app.routes import countries,auth,users,domains,universities,fields_of_study,memoirs,admin

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Exécuté au démarrage et à l'arrêt de l'app.
    C'est le pattern moderne FastAPI (remplace @app.on_event deprecated).
    """
    # --- Démarrage ---
    #create_db_and_tables()   # temporaire, sera remplacé par Alembic
    yield
    # --- Arrêt (optionnel, pour fermer des ressources) ---

app = FastAPI(
    title="MemoHub API",
    description="API de gestion des archives de mémoires académiques",
    version="1.0.0",
    lifespan=lifespan
)

# CORS — origines autorisées à appeler l'API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",    # frontend React en dev
        "http://localhost:5173",    # frontend Vite en dev
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],  # Restrict to necessary methods
    allow_headers=["Content-Type", "Authorization"],  # Only necessary headers
)

app.include_router(countries.router, prefix="/api/v1")
app.include_router(auth.router, prefix="/api/v1")
app.include_router(users.router,prefix="/api/v1")
app.include_router(domains.router,prefix="/api/v1")
app.include_router(universities.router,prefix="/api/v1")
app.include_router(fields_of_study.router,prefix="/api/v1")
app.include_router(memoirs.router,prefix="/api/v1")
app.include_router(admin.router,prefix="/api/v1")

@app.get("/")
def read_root():
    return {"message": "Bienvenue sur MemoHub API v1.0"}



