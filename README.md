# Subscription Manager

Application web bilingue de gestion d'abonnements réalisée avec React, Express, Prisma et PostgreSQL.

Le projet permet à un utilisateur de centraliser ses abonnements, suivre ses dépenses mensuelles et gérer ses services. Un espace administrateur permet de gérer les comptes et de consulter les abonnements de la plateforme.

## Équipe projet

- Louis DELARUE
- Ethan Porcarro

Projet réalisé dans le cadre du module Technologies Web & Base de données, Bachelor 2 Ynov.

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
- Interface français / anglais
- Interface responsive mobile et desktop

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
npm run db:demo
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
COOKIE_NAME=subscription_manager_token
COOKIE_SECURE=false
COOKIE_SAME_SITE=lax
AUTH_RATE_LIMIT_WINDOW_MS=900000
AUTH_RATE_LIMIT_MAX=100
ADMIN_EMAIL=admin@subscription.local
ADMIN_PASSWORD=Admin123!
ADMIN_NAME=Admin Subscription
```

Frontend: `frontend/.env`

```env
VITE_API_URL=http://localhost:4000/api
```

## Compte administrateur

Le compte administrateur est créé par le seed Prisma avec les variables du fichier `backend/.env`.

Valeurs par défaut en développement:

- Email: `admin@subscription.local`
- Mot de passe: `Admin123!`

## Données de démonstration

Le script suivant ajoute des utilisateurs et abonnements fictifs:

```bash
npm run db:demo
```

Comptes utiles:

- `alex.student@demo.local`
- `jamie.doe@demo.local`
- `louis.delarue@demo.local`
- `ethan.porcarro@demo.local`

Mot de passe commun: `Demo123!`

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
| `npm run db:demo` | Ajoute des données de démonstration |

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

Limite connue: la protection CSRF complète n'est pas encore implémentée. La documentation de déploiement explique le risque et les mesures à ajouter avant une mise en production grand public.

## Documentation

- Conception: [docs/conception.md](docs/conception.md)
- Déploiement: [docs/deployment.md](docs/deployment.md)
- Scénario de démonstration: [docs/demo-script.md](docs/demo-script.md)
- Roadmap: [docs/roadmap.md](docs/roadmap.md)
- Prompts design: [docs/design-prompts.md](docs/design-prompts.md)
- Intégration des designs: [docs/design-integration.md](docs/design-integration.md)

## Limites connues

- Pas de récupération de mot de passe par email.
- Pas de vraie page notifications.
- Pas de gestion complète des moyens de paiement.
- Pas de protection CSRF dédiée pour le moment.
- Les statistiques sont calculées côté frontend à partir des abonnements chargés.
- La mise en production nécessite une configuration précise des cookies, CORS et variables d'environnement.
