# Subscription Manager

Application web bilingue de gestion d'abonnements réalisée avec React, Express, Prisma et PostgreSQL.

## Stack

- Frontend: React, Vite, Tailwind CSS
- Backend: Node.js, Express.js
- ORM: Prisma
- Base de données: PostgreSQL via Docker
- Authentification: JWT stocké dans un cookie HTTP-only
- Tests: Vitest

## Démarrage

```bash
npm install
npm run db:up
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env
npm run db:migrate
npm run db:seed
npm run dev
```

API: `http://localhost:4000`

Frontend: `http://localhost:5173`

## Compte admin de développement

Le seed crée un admin avec les valeurs de `backend/.env`.

Par défaut:

- Email: `admin@subscription.local`
- Mot de passe: `Admin123!`

## Scripts utiles

```bash
npm run dev
npm run test
npm run build
npm run db:up
npm run db:down
npm run db:migrate
npm run db:seed
```

## Fonctionnalités

- Inscription ouverte
- Connexion sécurisée via cookie HTTP-only
- Gestion des rôles `USER` et `ADMIN`
- CRUD abonnements utilisateur
- Statuts `ACTIVE`, `INACTIVE`, `ARCHIVED`
- Cycles mensuel, annuel et hebdomadaire
- Calcul automatique du coût mensuel
- Recherche et filtre actif
- Admin: consultation des utilisateurs, CRUD comptes, consultation des abonnements
- Interface français / anglais

## Routes API principales

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `GET /api/subscriptions`
- `POST /api/subscriptions`
- `PUT /api/subscriptions/:id`
- `DELETE /api/subscriptions/:id`
- `GET /api/categories`
- `GET /api/admin/users`
- `POST /api/admin/users`
- `PUT /api/admin/users/:id`
- `DELETE /api/admin/users/:id`
- `GET /api/admin/subscriptions`

## Tests

```bash
npm test
npm run build
```

Les tests couvrent le calcul mensualisé, l'authentification, les cookies HTTP-only, les routes protégées, l'isolation utilisateur et les accès admin.

## Documentation de conception

Voir [docs/conception.md](docs/conception.md).

Voir aussi [docs/roadmap.md](docs/roadmap.md).
