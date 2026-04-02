# MemoHub - Frontend

Application React pour la plateforme de partage de mémoires académiques en Afrique et dans le monde.

## 🚀 Stack Technique

- **Framework** : React 18+ avec Vite
- **Langage** : JavaScript (ES6+)
- **Routing** : React Router v6
- **HTTP Client** : Axios
- **UI** : Tailwind CSS + composants personnalisés
- **Icons** : Lucide React
- **Notifications** : Sonner (toasts)
- **Gestion d'état** : React Query (TanStack Query)

## 📋 Prérequis

- Node.js 18+
- npm ou yarn

## ⚡ Installation

```bash
# Installer les dépendances
cd frontend
npm install

# Configuration
cp .env.example .env
# Éditer .env avec vos variables d'environnement
```

## 🔧 Variables d'environnement

| Variable | Description | Exemple |
|----------|-------------|---------|
| `VITE_API_URL` | URL de l'API backend | `http://localhost:8000` |
| `VITE_GOOGLE_CLIENT_ID` | Client ID Google OAuth | `xxx.apps.googleusercontent.com` |

## 🏃‍♂️ Lancer l'application

```bash
# Mode développement
npm run dev

# L'application sera disponible sur http://localhost:5173
```

## 📁 Structure du projet

```
frontend/
├── public/              # Ressources statiques
├── src/
│   ├── api/            # Clients API (axios)
│   ├── components/     # Composants React
│   │   ├── admin/      # Composants dashboard admin
│   │   ├── layout/    # Layout (Navbar, Footer)
│   │   ├── memoir/    # Cartes/mémoires
│   │   └── upload/    # Composants upload
│   ├── context/        # Context React (Auth)
│   ├── hooks/          # Hooks personnalisés
│   ├── pages/          # Pages principales
│   ├── assets/         # Images, styles
│   ├── App.jsx         # Point d'entrée
│   └── main.jsx        # Render React
├── .env                # Variables d'environnement
├── package.json        # Dépendances npm
├── vite.config.js     # Configuration Vite
└── index.html          # HTML principal
```

## 🎨 Fonctionnalités principales

### Pages
- **Home** (`/`) : Page d'accueil avec formulaire de candidature équipe
- **Login** (`/login`) : Authentification Google OAuth
- **Search** (`/search`) : Recherche et filtres de mémoires
- **Upload** (`/upload`) : Soumission de nouveaux mémoires
- **Profile** (`/profile`) : Profil utilisateur et historique
- **Dashboard** (`/admin`) : Panel d'administration (modération)

### Authentification
- Login via Google OAuth2
- Gestion des rôles : student, ambassador, moderator, admin
- Tokens JWT stockés côté backend

### Modération
- Dashboard admin pour valider/rejeter :
  - Mémoires soumis
  - Universités suggérées
  - Filières suggérées
- Système de rôles avec permissions

### Candidatures équipe
- Formulaire de candidature ambassadeur/modérateur
- Champs : pays, université (ambassadeur), preuve étudiant, motivation
- Notification email aux admins

## 🔌 API Intégration

Le frontend communique avec le backend via axios :

```javascript
import apiClient from './api/client';

// Exemple de requête
const response = await apiClient.get('/memoirs');
```

## 🛠️ Scripts disponibles

```bash
npm run dev      # Lancer en mode développement
npm run build    # Build production
npm run preview  # Prévisualiser le build
npm run lint     # Linting ESLint
```

## 📱 Responsive Design

L'application est responsive et fonctionne sur :
- Desktop (1920px+)
- Tablet (768px - 1919px)
- Mobile (320px - 767px)

## 🔧 Configuration Google OAuth

1. Aller sur Google Cloud Console
2. Créer un projet ou utiliser un existant
3. Activer l'API Google+ / OAuth2
4. Créer des identifiants OAuth2
5. Configurer l'URI de redirection : `http://localhost:5173/auth/callback`

## 📝 Guidelines de contribution

1. Utiliser des composants fonctionnels avec Hooks
2. Suivre les conventions de nommage (camelCase)
3. Utiliser Tailwind CSS pour le styling
4. Tester les modifications localement avant de pusher

## ⚠️ Notes importantes

- Le fichier `.env` n'est PAS inclus dans le dépôt (cf `.gitignore`)
- En production, configurer les URLs correctes pour l'API
- Le frontend attend une API REST sur `/api/v1/*`

## 📄 License

Propriétaire - Tous droits réservés
