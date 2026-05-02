# app/main.py
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select, func
import time
import asyncio
import httpx
from datetime import datetime, timezone
import logging
from app.database import engine
from app.database import get_session
from app.core.config import settings
from app.models import Memoir, University, User, RefreshTokenBlacklist
from app.models.enums import MemoirStatus, UniversityStatus

from app.routes import countries,auth,users,domains,universities,fields_of_study,memoirs,admin,applications

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


async def self_ping_task():
    """Tâche en arrière-plan pour garder le serveur éveillé sur Render."""
    if not getattr(settings, "BACKEND_URL", None):
        return
        
    ping_url = f"{settings.BACKEND_URL.rstrip('/')}/api/v1/ping"
    logger.info(f"{Colors.CYAN}⏰ Auto-ping configuré sur : {ping_url} (toutes les 14 minutes){Colors.RESET}")
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        while True:
            await asyncio.sleep(14 * 60)  # 14 minutes
            try:
                response = await client.get(ping_url)
                if response.status_code == 200:
                    logger.info(f"{Colors.GREEN}✅ Self-ping réussi : Maintien en éveil !{Colors.RESET}")
                else:
                    logger.warning(f"{Colors.YELLOW}⚠️ Self-ping a retourné le code : {response.status_code}{Colors.RESET}")
            except Exception as e:
                logger.error(f"{Colors.RED}❌ Erreur lors du self-ping : {e}{Colors.RESET}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Exécuté au démarrage et à l'arrêt de l'app.
    Combine les logs de démarrage et le nettoyage des refresh tokens expirés.
    """
    # --- DÉMARRAGE ---
    logger.info(f"{Colors.BG_BLUE}{Colors.BOLD}🚀 MemoHub API{Colors.RESET} - Démarrage en cours...")
    logger.info(f"{Colors.CYAN}📡 Environment:{Colors.RESET} {settings.ENVIRONMENT}")
    logger.info(f"{Colors.CYAN}🌐 CORS Origins:{Colors.RESET} {settings.allowed_origins_list}")

    # URL de l'API — utile pour configurer le frontend
    API_PREFIX = "/api/v1"
    if settings.BACKEND_URL:
        full_api_url = f"{settings.BACKEND_URL.rstrip('/')}{API_PREFIX}"
        logger.info(f"{Colors.BG_GREEN}{Colors.BOLD}🔗 API Base URL:{Colors.RESET} {Colors.GREEN}{full_api_url}{Colors.RESET}")
        logger.info(f"{Colors.CYAN}   ↳ VITE_API_URL (Vercel) ={Colors.RESET} {Colors.BOLD}{full_api_url}{Colors.RESET}")
    else:
        logger.info(f"{Colors.YELLOW}🔗 API Base URL:{Colors.RESET} http://localhost:8000{API_PREFIX} (local)")
        logger.info(f"{Colors.YELLOW}   ↳ VITE_API_URL (Vercel) = http://localhost:8000{API_PREFIX}{Colors.RESET}")

    # Nettoyage des refresh tokens expirés au démarrage
    try:
        with Session(engine) as session:
            now = datetime.now(timezone.utc)
            expired_tokens = session.exec(
                select(RefreshTokenBlacklist)
                .where(RefreshTokenBlacklist.expires_at < now)
            ).all()

            if expired_tokens:
                for token in expired_tokens:
                    session.delete(token)
                session.commit()
                logger.info(f"{Colors.GREEN}🧹 Nettoyage : {len(expired_tokens)} refresh token(s) expiré(s) supprimé(s){Colors.RESET}")
            else:
                logger.info(f"{Colors.CYAN}🧹 Aucun refresh token expiré à nettoyer{Colors.RESET}")
    except Exception as e:
        logger.error(f"{Colors.RED}❌ Erreur lors du nettoyage des refresh tokens : {e}{Colors.RESET}")
        # On ne bloque pas le démarrage pour cette erreur non critique

    # create_db_and_tables()  # temporaire, sera remplacé par Alembic

    # Lancement de la tâche d'auto-ping
    ping_task = asyncio.create_task(self_ping_task())

    yield  # L'application tourne ici

    # --- ARRÊT ---
    ping_task.cancel()
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

@app.get("/api/v1/ping")
def ping_server():
    """Route légère pour le cron job afin d'éviter la mise en veille sur les hébergeurs gratuits."""
    return {"status": "ok", "message": "pong"}

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

    memoirs_pending = session.exec(
        select(func.count()).select_from(Memoir)
        .where(Memoir.status == MemoirStatus.pending)
    ).one()

    memoirs_pre_validated = session.exec(
        select(func.count()).select_from(Memoir)
        .where(Memoir.status == MemoirStatus.pre_validated)
    ).one()

    return {
        "memoirs": {
            "total": total_memoirs,
            "pending": memoirs_pending,
            "pre_validated": memoirs_pre_validated,
        },
        "universities": {"total": total_universities},
        "users": {"total": total_users}
    }



