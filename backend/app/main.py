# app/main.py
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, Request
from starlette.middleware.cors import CORSMiddleware
from sqlmodel import Session, select, func
import time
import logging

# Configuration du logging avec couleurs
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s | %(levelname)-8s | %(message)s',
    datefmt='%H:%M:%S'
)
logger = logging.getLogger(__name__)

# Couleurs ANSI pour les logs
class Colors:
    RESET = "\033[0m"
    BOLD = "\033[1m"
    # Couleurs
    RED = "\033[91m"
    GREEN = "\033[92m"
    YELLOW = "\033[93m"
    BLUE = "\033[94m"
    MAGENTA = "\033[95m"
    CYAN = "\033[96m"
    # Fond
    BG_RED = "\033[41m"
    BG_GREEN = "\033[42m"
    BG_YELLOW = "\033[43m"
    BG_BLUE = "\033[44m"

from app.database import create_db_and_tables, get_session
from app.core.config import settings
from app.models import Memoir, University, User
from app.models.enums import MemoirStatus, UniversityStatus

# Plus tard tu ajouteras tes routers ici :
from app.routes import countries,auth,users,domains,universities,fields_of_study,memoirs,admin,applications

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Exécuté au démarrage et à l'arrêt de l'app.
    C'est le pattern moderne FastAPI (remplace @app.on_event deprecated).
    """
    # --- Démarrage ---
    logger.info(f"{Colors.BG_BLUE}{Colors.BOLD}🚀 MemoHub API{Colors.RESET} - Démarrage en cours...")
    logger.info(f"{Colors.CYAN}📡 Environment:{Colors.RESET} {settings.ENVIRONMENT}")
    logger.info(f"{Colors.CYAN}🌐 CORS Origins:{Colors.RESET} {settings.allowed_origins_list}")
    #create_db_and_tables()   # temporaire, sera remplacé par Alembic
    yield
    # --- Arrêt (optionnel, pour fermer des ressources) ---
    logger.info(f"{Colors.YELLOW}🛑 Arrêt de l'API{Colors.RESET}")

app = FastAPI(
    title="MemoHub API",
    description="API de gestion des archives de mémoires académiques",
    version="1.0.0",
    lifespan=lifespan
)

# Middleware pour logger visiblement chaque requête (utile pour le debug du dashboard)
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    
    # Log de la requête entrante
    logger.info(f"{Colors.MAGENTA}📥 REQ{Colors.RESET} {request.method} {request.url.path}")
    
    response = await call_next(request)
    
    process_time = (time.time() - start_time) * 1000
    
    # Couleur selon le status code
    if response.status_code < 300:
        status_color = Colors.GREEN
        status_icon = "✅"
    elif response.status_code < 400:
        status_color = Colors.YELLOW
        status_icon = "🔄"
    elif response.status_code < 500:
        status_color = Colors.RED
        status_icon = "⚠️"
    else:
        status_color = Colors.BOLD + Colors.RED
        status_icon = "❌"
    
    logger.info(f"{status_icon} RESP{Colors.RESET} {request.method} {request.url.path} -> {status_color}HTTP {response.status_code}{Colors.RESET} ({process_time:.2f}ms)")
    
    return response

# CORS — origines autorisées à appeler l'API
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],  # Ajout de PATCH pour corriger l'erreur 400
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
app.include_router(applications.router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {"message": "Bienvenue sur MemoHub API v1.0"}

@app.get("/api/v1/public/stats")
def get_public_stats(session: Session = Depends(get_session)):
    total_memoirs = session.exec(
        select(func.count()).select_from(Memoir)
        .where(Memoir.status == MemoirStatus.approved)
    ).one()

    total_universities = session.exec(
        select(func.count()).select_from(University)
        .where(University.status == UniversityStatus.approved)
    ).one()

    total_users = session.exec(
        select(func.count()).select_from(User)
    ).one()

    return {
        "memoirs": {"total": total_memoirs},
        "universities": {"total": total_universities},
        "users": {"total": total_users}
    }



