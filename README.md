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
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env
npm run db:up
npm run db:migrate
npm run db:generate
npm run db:seed
npm run dev
```

API: `http://localhost:4000`

Frontend: `http://localhost:5173`

PostgreSQL local: `localhost:15432` vers le port conteneur `5432`.

Si le port `5432` est indisponible sous Windows, c'est normal pour cette configuration: Docker expose PostgreSQL sur le port local `15432`.

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
npm run db:generate
npm run db:seed
```

## Variables d'environnement

Backend: `backend/.env`

```env
NODE_ENV=development
PORT=4000
CLIENT_ORIGIN=http://localhost:5173
DATABASE_URL=postgresql://subscription_user:subscription_password@localhost:15432/subscription_manager?schema=public
JWT_SECRET=change-this-secret-before-production
JWT_EXPIRES_IN=7d
COOKIE_NAME=subscription_manager_token
```

Frontend: `frontend/.env`

```env
VITE_API_URL=http://localhost:4000/api
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
- Dashboard avec prochains renouvellements
- Statistiques par catégorie et top coûts
- Messages succès/erreur côté interface
- Confirmation avant archivage ou suppression admin

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

## Captures

Les captures mobiles et desktop utilisées pour la validation et le rendu sont disponibles dans `docs/screenshots`.

## Documentation de conception

Voir [docs/conception.md](docs/conception.md).

Voir aussi [docs/roadmap.md](docs/roadmap.md).

Déploiement: [docs/deployment.md](docs/deployment.md).

Scénario de démonstration: [docs/demo-script.md](docs/demo-script.md).

Prompts design: [docs/design-prompts.md](docs/design-prompts.md).

Intégration des designs: [docs/design-integration.md](docs/design-integration.md).
