# MemoHub - API Backend

API REST pour la plateforme de partage de mémoires académiques en Afrique.

## 🚀 Stack Technique

- **Framework** : FastAPI (Python 3.13)
- **ORM** : SQLModel (SQLAlchemy + Pydantic)
- **Base de données** : PostgreSQL (Neon Tech)
- **Migrations** : Alembic
- **Authentification** : Google OAuth2 (JWT)
- **Emails** : Brevo (Sendinblue)
- **Hébergement** : Railway / Render

## 📋 Prérequis

- Python 3.13+
- PostgreSQL (local ou Neon)
- Virtualenv

## ⚡ Installation

```bash
# Créer l'environnement virtuel
cd backend
python -m venv .venv

# Activer l'environnement
# Windows:
.venv\Scripts\activate
# Linux/Mac:
source .venv/bin/activate

# Installer les dépendances
pip install -r requirements.txt

# Configuration
cp .env.example .env
# Éditer .env avec vos variables d'environnement
```

## 🔧 Variables d'environnement

| Variable | Description | Exemple |
|----------|-------------|---------|
| `DATABASE_URL` | URL de connexion PostgreSQL | `postgresql+psycopg2://user:pass@host/db` |
| `SECRET_KEY` | Clé secrète pour JWT | `votre-clé-secrète` |
| `GOOGLE_CLIENT_ID` | Client ID Google OAuth | `xxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Client Secret Google | `xxx` |
| `BREVO_API_KEY` | Clé API Brevo | `xkeysib-xxx` |
| `BREVO_SENDER_EMAIL` | Email expéditeur | `noreply@memohub.africa` |
| `BREVO_SENDER_NAME` | Nom expéditeur | `MemoHub` |
| `FRONTEND_URL` | URL du frontend | `http://localhost:5173` |
| `ALLOWED_ORIGINS` | Origins CORS | `http://localhost:5173,https://memohub.africa` |

## 🏃‍♂️ Lancer le serveur

```bash
# Mode développement (avec rechargement automatique)
uvicorn app.main:app --reload --port 8000

# L'API sera disponible sur http://127.0.0.1:8000
# Documentation Swagger: http://127.0.0.1:8000/docs
# Documentation ReDoc: http://127.0.0.1:8000/redoc
```

## 🗃️ Base de données

### Migrations Alembic

```bash
# Créer une nouvelle migration
alembic revision --autogenerate -m "Description"

# Appliquer les migrations
alembic upgrade head

# Revenir à une version précédente
alembic downgrade -1
```

### Structure des tables

- **users** : Utilisateurs (rôles: student, ambassador, moderator, admin)
- **countries** : Pays africains
- **universities** : Universités avec pays关联
- **domains** : Domaines d'étude (Informatique, Médecine, etc.)
- **field_of_study** : Filières/spécialisations
- **memoirs** : Mémoires/thèses soumis
- **team_applications** : Candidatures ambassadeur/modérateur

## 📁 Structure du projet

```
backend/
├── app/
│   ├── core/           # Config, services cloud (Cloudinary), sécurité
│   ├── models/         # Modèles SQLModel (tables DB)
│   ├── routes/         # Endpoints API (auth, memoirs, admin...)
│   ├── schemas/        # Schemas Pydantic (validation)
│   ├── services/       # Logique métier (emails, notifications)
│   ├── database.py     # Configuration DB
│   └── main.py         # Application FastAPI
├── alembic/            # Migrations
│   └── versions/       # Scripts de migration
├── .env                # Variables d'environnement (non versionné)
├── requirements.txt    # Dépendances Python
└── alembic.ini         # Configuration Alembic
```

## 🔐 Authentification

L'API utilise Google OAuth2 pour l'authentification :
1. Le frontend redirige vers Google
2. Google retourne un code d'autorisation
3. Le backend échange le code contre un JWT
4. Le JWT est utilisé pour les requêtes authentifiées

## 📧 Notifications

Les notifications email sont envoyées via Brevo pour :
- Nouvelle candidature équipe (admin reçoit un email)
- Approbation/Rejet de mémoire
- Mise à jour du rôle utilisateur

## 🛠️ Commandes utilitaires

```bash
# Seed de la base de données (données initiales)
python seed.py

# Vérifier les migrations
alembic current

# Lister les versions disponibles
alembic history

# Test rapide de connexion DB
python -c "from app.database import engine; print(engine.connect())"
```

## 📝 API Endpoints principaux

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/auth/google` | Login Google OAuth |
| GET | `/memoirs` | Liste des mémoires approuvés |
| POST | `/memoirs` | Soumettre un mémoire |
| GET | `/countries` | Liste des pays |
| GET | `/universities` | Liste des universités |
| GET | `/domains` | Liste des domaines |
| POST | `/applications/team` | Postuler ambassadeur/modérateur |
| GET | `/admin/stats` | Statistiques (admin) |
| PATCH | `/memoirs/{id}/status` | Modérer un mémoire |

## ⚠️ Notes importantes

- La table `team_applications` doit être créée via Alembic
- Le fichier `.env` n'est PAS inclus dans le dépôt (cf `.gitignore`)
- En production, utiliser HTTPS et des variables d'environnement sécurisées

## 📄 License

Propriétaire - Tous droits réservés