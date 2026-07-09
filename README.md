# MemoHub

Plateforme de partage et d'archivage de **mémoires académiques en Afrique**. MemoHub permet aux étudiants de déposer leurs mémoires et thèses, à une équipe de modération collaborative de les valider, et à tous de consulter un catalogue protégé, filtrable et citable.

> Monorepo : une API REST (FastAPI) et une application web (React). Chaque partie a son propre README détaillé.

## 🏗️ Architecture

```
MemoHub/
├── backend/     # API REST — FastAPI + SQLModel + PostgreSQL   → voir backend/README.md
├── frontend/    # SPA — React 19 + Vite + Tailwind             → voir frontend/README.md
├── vercel.json  # Déploiement frontend (Vercel)
└── README.md    # Ce fichier
```

| Couche | Stack | Hébergement |
|---|---|---|
| **Backend** | FastAPI · SQLModel · PostgreSQL (Neon) · Alembic · Cloudinary · Brevo · Redis | Render / Railway |
| **Frontend** | React 19 · Vite · React Router 7 · TanStack Query · Tailwind CSS 4 | Vercel |
| **Auth** | Google OAuth2 → JWT (access + refresh) | — |

## ✨ Fonctionnalités clés

- **Catalogue** de mémoires avec recherche plein texte et filtres multi-critères (domaine, université, filière, diplôme, année) + pagination.
- **Workflow de modération** à plusieurs niveaux : un ambassadeur pré-valide les mémoires de son université, puis un modérateur/admin approuve.
- **Documents protégés** : les PDF ne sont jamais exposés directement, ils sont servis via un flux proxy ; téléchargement avec **filigrane dynamique** et désactivable par l'auteur.
- **Candidatures équipe** : postuler comme ambassadeur ou modérateur, avec notification email.
- **Rôles hiérarchiques** : `student` → `ambassador` → `moderator` → `admin`.

## 🔄 Cycle de vie d'un mémoire

```
soumis (pending)
   └─▶ pré-validé (pre_validated)   ← ambassadeur (université concernée)
          └─▶ approuvé (approved)   ← modérateur / admin   → visible dans le catalogue
          └─▶ rejeté (rejected)     ← raison obligatoire, email à l'auteur
```

## 🚀 Démarrage rapide

Prérequis : **Python 3.11+**, **Node.js 18+**, une base **PostgreSQL** et un **Redis** (rate limiting).

### 1. Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows : .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env          # puis renseigner les variables
alembic upgrade head          # créer le schéma de base
uvicorn app.main:app --reload --port 8000
```

API sur http://localhost:8000 · docs Swagger sur http://localhost:8000/docs.
Détails → [backend/README.md](backend/README.md).

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env          # VITE_API_URL doit pointer sur l'API (…/api/v1)
npm run dev
```

Application sur http://localhost:5173.
Détails → [frontend/README.md](frontend/README.md).

## 🔧 Configuration

Chaque partie a son `.env.example`. Les variables sensibles (clé JWT, secrets Google, Cloudinary, Brevo, URL PostgreSQL) ne sont **jamais** versionnées — voir le README de chaque partie pour la liste complète.

## 📦 Déploiement

- **Backend** : `Procfile` (uvicorn) prêt pour Render / Railway. Une tâche d'auto-ping maintient le service éveillé sur les offres gratuites.
- **Frontend** : `vercel.json` à la racine (build depuis `frontend/`, SPA rewrite vers `index.html`).

## 📄 License

Propriétaire — Tous droits réservés.
