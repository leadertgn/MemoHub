# 🔒 Guide de Sécurité - MemoHub

## 📋 Gestion des Variables Sensibles

### ✅ Fichiers Ignorés par Git

Les fichiers sensibles suivants sont **automatiquement ignorés** par `.gitignore` :

```
backend/.env                  # Variables d'environnement
backend/google.json           # Credentials Google OAuth2
frontend/.env                 # Configuration du frontend
node_modules/                 # Dépendances npm
```

### 📝 Fichiers Documentation

Des fichiers `.env.example` sont fournis pour documenter les variables requises **sans révéler les valeurs réelles** :

- `backend/.env.example`
- `frontend/.env.example`

## 🔐 Variables Sensibles

### Backend (backend/.env)

```env
DATABASE_URL=postgresql+psycopg2://user:password@host/dbname
SECRET_KEY=votre-clé-secrète
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### Frontend (frontend/.env)

```env
VITE_API_URL=http://localhost:8000/api/v1
```

## 🏗️ Architecture de Sécurité

### Config Centralisée

Toutes les variables d'environnement sont chargées une seule fois dans `app/core/config.py` :

```python
# load_dotenv() appelé UNE SEULE FOIS
load_dotenv(dotenv_path=BASE_DIR / ".env")

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str
    CLOUDINARY_CLOUD_NAME: str
    CLOUDINARY_API_KEY: str
    CLOUDINARY_API_SECRET: str

settings = Settings()
```

### Utilisation dans le Code

Pour accéder aux variables sensibles :

```python
from app.core.config import settings

# Utiliser settings.DATABASE_URL, settings.SECRET_KEY, etc.
engine = create_engine(settings.DATABASE_URL)
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET
)
```

## 🚀 Avant de Déployer en Production

- [ ] Générer de nouvelles valeurs pour `SECRET_KEY`
- [ ] Créer des credentials Google OAuth2 spécifiques à la prod
- [ ] Configurer les variables à partir des secrets de l'environnement
- [ ] Vérifier les CORS (ne pas avoir `*` en prod)
- [ ] Activer HTTPS
- [ ] Configurer un certificat SSL/TLS

## 🔍 Vérification de Sécurité

Pour vérifier que aucun secret n'a été commité accidentellement :

```bash
# Vérifier les fichiers ignorés
git check-ignore -v backend/.env backend/google.json frontend/.env

# Scanner les commits pour les secrets (si déjà initialisé)
# git log --all --source --remotes -S "SECRET_KEY" -- *.py
```

## 📚 Ressources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [12 Factor App - Config](https://12factor.net/config)
- [Pydantic Settings](https://docs.pydantic.dev/latest/concepts/pydantic_settings/)
