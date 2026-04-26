# app/core/rate_limit.py
from fastapi import Request, HTTPException
import time
from collections import defaultdict
from typing import Dict
import logging
from app.core.config import settings

# Configuration du logger
logger = logging.getLogger(__name__)

# Fallback en mémoire pour le développement local
memory_history: Dict[str, list] = defaultdict(list)

# Tentative de connexion à Redis
redis_client = None
try:
    import redis
    redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
    redis_client.ping()
    logger.info("✅ Redis connecté avec succès pour le rate limiting.")
except Exception as e:
    logger.warning(f"⚠️ Redis indisponible ({e}). Utilisation du mode 'en mémoire'.")

def rate_limiter(requests_limit: int, window_seconds: int):
    """
    Décorateur pour limiter le débit des requêtes.
    Utilise Redis en priorité, sinon bascule sur la RAM.
    """
    async def limit_checker(request: Request):
        client_ip = request.client.host
        now = time.time()
        
        # --- MODE REDIS ---
        if redis_client:
            try:
                key = f"rate_limit:{client_ip}:{request.url.path}"
                # Utilisation d'un pipeline pour l'atomicité
                pipe = redis_client.pipeline()
                pipe.zadd(key, {str(now): now})
                pipe.zremrangebyscore(key, 0, now - window_seconds)
                pipe.zcard(key)
                pipe.expire(key, window_seconds)
                results = pipe.execute()
                
                request_count = results[2]
                if request_count > requests_limit:
                    raise HTTPException(
                        status_code=429, 
                        detail="Trop de requêtes. Veuillez patienter."
                    )
                return True
            except HTTPException:
                raise
            except Exception as e:
                logger.error(f"Erreur Redis Rate Limit: {e}")
                # En cas d'erreur Redis critique, on continue en mode dégradé (mémoire)
        
        # --- MODE MÉMOIRE (Fallback) ---
        memory_history[client_ip] = [
            t for t in memory_history[client_ip] 
            if t > now - window_seconds
        ]
        
        if len(memory_history[client_ip]) >= requests_limit:
            raise HTTPException(
                status_code=429, 
                detail="Trop de requêtes. Veuillez patienter."
            )
        
        memory_history[client_ip].append(now)
        return True

    return limit_checker
