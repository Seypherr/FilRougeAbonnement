# Deploiement Render

## Objectif

Cette documentation decrit la configuration de production Render preparee pour le projet.

Le projet est un monorepo npm:

- Frontend: React + Vite, heberge en Static Site Render.
- Backend: Express, heberge en Web Service Node Render.
- Base de donnees: PostgreSQL Render.
- ORM: Prisma.
- Seed: `backend/prisma/seed.js`, idempotent avec `upsert`.

## Architecture de production

```mermaid
flowchart LR
  User["Utilisateur"] --> Frontend["Frontend Render Static Site"]
  Frontend --> Api["Backend Render Web Service"]
  Api --> Db["Render PostgreSQL"]
```

## Blueprint Render

La configuration principale est dans `render.yaml` a la racine du depot.

Elle cree:

- `subscription-manager-api`: service web Node.
- `subscription-manager-frontend`: site statique Vite.
- `subscription-manager-db`: base PostgreSQL.

Configuration backend:

- Build command: `npm run render:build:backend`
- Pre-deploy command: `npm run render:predeploy:backend`
- Initial deploy hook: `npm run render:seed`
- Start command: `npm run render:start:backend`
- Health check: `/api/health`

Configuration frontend:

- Build command: `npm run render:build:frontend`
- Publish directory: `./frontend/dist`
- SPA rewrite: `/*` vers `/index.html`

## Variables Render

Backend:

```env
NODE_ENV=production
CLIENT_ORIGIN=https://subscription-manager-frontend.onrender.com
CLIENT_ORIGINS=https://subscription-manager-frontend.onrender.com
DATABASE_URL=<genere depuis subscription-manager-db>
JWT_SECRET=<genere automatiquement par Render>
JWT_EXPIRES_IN=7d
COOKIE_NAME=subscription_manager_token
COOKIE_SECURE=true
COOKIE_SAME_SITE=none
CSRF_COOKIE_NAME=subscription_manager_csrf
CSRF_HEADER_NAME=x-csrf-token
RESEND_API_KEY=<a renseigner dans Render>
EMAIL_FROM=Subscription Manager <onboarding@resend.dev>
AUTH_RATE_LIMIT_WINDOW_MS=900000
AUTH_RATE_LIMIT_MAX=10
ADMIN_EMAIL=<a renseigner dans Render>
ADMIN_PASSWORD=<a renseigner dans Render>
ADMIN_NAME=Admin Subscription
```

Frontend:

```env
VITE_API_URL=https://subscription-manager-api.onrender.com/api
```

Si Render attribue un sous-domaine different parce qu'un nom est deja pris, mettre a jour:

- `VITE_API_URL` cote frontend avec l'URL API finale.
- `CLIENT_ORIGIN` et `CLIENT_ORIGINS` cote backend avec l'URL frontend finale.

## Base de donnees, migrations et seed

Prisma utilise `DATABASE_URL`.

Commandes utiles:

```bash
npm run db:generate
npm run db:deploy
npm run db:seed
```

Sur Render:

- `preDeployCommand` lance `prisma migrate deploy` avant le demarrage du backend.
- `initialDeployHook` lance le seed seulement au premier deploiement reussi.
- Le seed est idempotent: les categories et l'admin sont crees/mis a jour avec `upsert`.

## Deploiement depuis Render

1. Pousser le projet sur GitHub avec `render.yaml`.
2. Dans Render, choisir `New` puis `Blueprint`.
3. Connecter le repository GitHub du projet.
4. Confirmer le blueprint.
5. Renseigner les variables demandees:
   - `RESEND_API_KEY`
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`
6. Laisser Render creer la base, le backend et le frontend.
7. Une fois les deux URLs publiques creees, verifier qu'elles correspondent aux valeurs du blueprint.

## Securite production

Mesures presentes:

- Helmet pour les en-tetes HTTP.
- Rate-limit sur login/register.
- Cookie HTTP-only pour le JWT.
- Cookie `Secure` obligatoire en production.
- `SameSite=None` pour l'authentification cross-site entre frontend et backend Render.
- CORS par allowlist stricte via `CLIENT_ORIGIN` et `CLIENT_ORIGINS`.
- Protection CSRF avec le header `x-csrf-token`.
- Validation Zod sur les routes sensibles.
- Mot de passe hashe avec bcrypt.
- `JWT_SECRET` genere par Render.

## Verification apres deploiement

Verifier:

- `https://subscription-manager-api.onrender.com/api/health`
- Chargement du frontend public.
- Inscription utilisateur.
- Verification email via Resend.
- Connexion utilisateur.
- Creation, modification et archivage d'un abonnement.
- Dashboard, analytics, profil et admin.
- Cookies presents en HTTPS.
- CORS sans erreur dans la console navigateur.

## Limites a surveiller

- Le plan gratuit Render peut mettre les services en veille.
- `onboarding@resend.dev` est surtout adapte aux tests Resend. Pour envoyer a de vrais utilisateurs, configurer un domaine verifie Resend et remplacer `EMAIL_FROM`.
- Si Render change les sous-domaines publics, ajuster les trois variables d'URL indiquees plus haut.
- Le stockage d'avatar reste externe uniquement via URL HTTPS.
