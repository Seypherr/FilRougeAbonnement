# Frovely

Application web internationale de gestion d'abonnements, conçue pour une bêta publique, avec React, Express, Prisma et PostgreSQL.

Le projet permet à un utilisateur de centraliser ses abonnements, suivre ses dépenses mensuelles et gérer ses services. Un espace administrateur permet de gérer les comptes et de consulter les abonnements de la plateforme.

## Stack technique

- Frontend: React, Vite, Tailwind CSS
- Backend: Node.js, Express.js
- ORM: Prisma
- Base de données: PostgreSQL
- Base locale: Docker Compose
- Authentification: JWT stocké dans un cookie HTTP-only
- Validation: Zod
- Tests: Vitest, Supertest, Testing Library

## Fonctionnalités

- Inscription ouverte à tous
- Connexion et déconnexion sécurisées
- Sessions via cookie HTTP-only
- Rôles `USER` et `ADMIN`
- CRUD abonnements utilisateur
- Archivage des abonnements côté utilisateur au lieu d'une suppression définitive
- Statuts `ACTIVE`, `INACTIVE`, `ARCHIVED`
- Cycles `MONTHLY`, `ANNUAL`, `WEEKLY`
- Calcul automatique du coût mensualisé
- Recherche et filtres sur les abonnements
- Dashboard avec total mensuel, estimation annuelle et prochains renouvellements
- Page Analytics avec répartition par catégorie et abonnements les plus coûteux
- Espace Admin: gestion des utilisateurs et consultation globale des abonnements
- Interface français / anglais / espagnol
- Interface responsive mobile et desktop
- PWA installable Android et iPhone, sans cache des données privées
- Devise et fuseau horaire par compte
- Rappels de renouvellement par email, exécutés par une tâche planifiée idempotente
- Accès `FREE`, `BETA` et `PREMIUM` préparés côté serveur
- Export et suppression de compte

## Ports utilisés

| Service | URL locale |
|---|---|
| Frontend | `http://localhost:5173` |
| Backend API | `http://localhost:4000/api` |
| PostgreSQL Docker | `localhost:15432` |

PostgreSQL est exposé sur le port local `15432` pour éviter les conflits fréquents avec un PostgreSQL déjà installé sur `5432`.

## Installation locale

Prérequis:

- Node.js
- npm
- Docker Desktop

Commandes:

```bash
npm install
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env
npm run db:up
npm run db:migrate
npm run db:generate
npm run db:seed
npm run dev
```

Après lancement:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000/api`

## Variables d'environnement

Backend: `backend/.env`

```env
NODE_ENV=development
PORT=4000
CLIENT_ORIGIN=http://localhost:5173
CLIENT_ORIGINS=
DATABASE_URL=postgresql://subscription_user:subscription_password@localhost:15432/subscription_manager?schema=public
JWT_SECRET=replace-with-at-least-48-random-characters-generated-by-a-secret-manager
JWT_EXPIRES_IN=7d
COOKIE_NAME=frovely_session
COOKIE_SECURE=false
COOKIE_SAME_SITE=lax
PUBLIC_REGISTRATION_ENABLED=true
BETA_INVITE_ONLY=false
BETA_INVITE_LIMIT=30
AUTH_RATE_LIMIT_WINDOW_MS=900000
AUTH_RATE_LIMIT_MAX=100
ADMIN_EMAIL=admin@frovely.local
ADMIN_PASSWORD=Admin123!
ADMIN_NAME=Frovely Admin
```

Frontend: `frontend/.env`

```env
VITE_API_URL=http://localhost:4000/api
```

## Comptes de demonstration

Le seed Prisma cree un administrateur et un compte demo deja verifie, avec un onboarding termine et douze abonnements de demonstration. Relancer le seed remet uniquement les abonnements du compte demo dans leur etat initial.

Valeurs par défaut en développement:

- Administrateur: `admin@subscription.local` / `Admin123!`
- Demo: `demo@frovely.app` / `Demo123!`

Les variables `DEMO_EMAIL`, `DEMO_PASSWORD` et `DEMO_NAME` permettent de remplacer le compte demo local. `SEED_DEMO_ACCOUNT=true` l'autorise explicitement en production ; sinon il est toujours ignore lorsque `NODE_ENV=production`.

## Scripts npm

| Commande | Rôle |
|---|---|
| `npm run dev` | Lance backend et frontend |
| `npm run dev:backend` | Lance uniquement l'API Express |
| `npm run dev:frontend` | Lance uniquement React/Vite |
| `npm run build` | Compile le frontend |
| `npm test` | Lance les tests backend et frontend |
| `npm run db:up` | Lance PostgreSQL avec Docker |
| `npm run db:down` | Arrête les conteneurs Docker |
| `npm run db:migrate` | Lance les migrations Prisma |
| `npm run db:generate` | Génère le client Prisma |
| `npm run db:seed` | Crée les catégories et l'admin |

## Routes API principales

Préfixe backend: `/api`

### Authentification

| Méthode | Route | Rôle |
|---|---|---|
| `POST` | `/auth/register` | Inscription |
| `POST` | `/auth/login` | Connexion |
| `GET` | `/auth/me` | Session courante |
| `POST` | `/auth/logout` | Déconnexion |

### Abonnements utilisateur

| Méthode | Route | Rôle |
|---|---|---|
| `GET` | `/subscriptions` | Liste personnelle avec recherche/filtres |
| `POST` | `/subscriptions` | Création |
| `GET` | `/subscriptions/:id` | Détail personnel |
| `PUT` | `/subscriptions/:id` | Modification |
| `DELETE` | `/subscriptions/:id` | Archivage |

### Catégories

| Méthode | Route | Rôle |
|---|---|---|
| `GET` | `/categories` | Liste des catégories |
| `POST` | `/categories` | Création admin |
| `PUT` | `/categories/:id` | Modification admin |
| `DELETE` | `/categories/:id` | Suppression admin |

### Administration

| Méthode | Route | Rôle |
|---|---|---|
| `GET` | `/admin/users` | Liste utilisateurs |
| `POST` | `/admin/users` | Création utilisateur |
| `GET` | `/admin/users/:id` | Détail utilisateur |
| `PUT` | `/admin/users/:id` | Modification utilisateur |
| `DELETE` | `/admin/users/:id` | Suppression utilisateur |
| `GET` | `/admin/subscriptions` | Liste globale des abonnements |
| `DELETE` | `/admin/subscriptions/:id` | Suppression admin d'un abonnement |

## Tests et validation

```bash
npm test
npm run build
npm audit --omit=dev
```

Les tests couvrent notamment:

- Authentification et cookies HTTP-only
- Routes protégées
- Isolation des abonnements par utilisateur
- Rôles admin
- CRUD abonnements
- Calcul mensualisé
- Comportements principaux du frontend
- Présence des protections de sécurité backend

## Sécurité

- Les mots de passe sont hashés avec bcrypt.
- Le JWT est stocké dans un cookie HTTP-only.
- Le frontend ne stocke pas le token.
- Les routes privées passent par un middleware d'authentification.
- Les routes admin passent par un middleware de rôle.
- Les entrées utilisateur sont validées avec Zod.
- Helmet ajoute des en-têtes HTTP de sécurité.
- Les routes login/register sont protégées par un rate-limit.
- En production, `JWT_SECRET` doit être fort et les cookies doivent être `Secure`.

La protection CSRF est appliquée aux requêtes d'écriture, avec un cookie dédié et le header `x-csrf-token`.

## Documentation

- Spécifications fonctionnelles: [docs/specifications.md](docs/specifications.md)
- Architecture et choix techniques: [docs/architecture.md](docs/architecture.md)
- UML et MERISE: [docs/conception.md](docs/conception.md)
- Base de données et migrations: [docs/database.md](docs/database.md)
- Déploiement: [docs/deployment.md](docs/deployment.md)
- Plan de présentation orale: [docs/presentation.md](docs/presentation.md)

## Lancement bêta

La checklist de domaine, emails, légalité, Render, tests téléphone et activation future de Stripe est disponible dans [docs/beta-launch.md](docs/beta-launch.md).
