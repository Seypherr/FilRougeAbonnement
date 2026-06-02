# Déploiement

## Objectif

Cette documentation décrit une stratégie de déploiement simple et réaliste pour présenter le projet et préparer une future mise en production.

Stratégie recommandée:

- Frontend: Vercel
- Backend: Render ou Railway
- Base de données: PostgreSQL hébergé sur Railway, Supabase ou Neon

## Architecture de production

```mermaid
flowchart LR
  User["Utilisateur"] --> Vercel["Frontend Vercel"]
  Vercel --> Api["Backend Render/Railway"]
  Api --> Db["PostgreSQL hébergé"]
```

## Frontend sur Vercel

Configuration:

- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`

Variable d'environnement:

```env
VITE_API_URL=https://url-du-backend.onrender.com/api
```

Après déploiement, récupérer l'URL Vercel finale. Exemple:

```txt
https://subscription-manager.vercel.app
```

Cette URL devra être ajoutée côté backend dans `CLIENT_ORIGIN`.

## Backend sur Render ou Railway

Configuration recommandée:

- Root directory: `backend`
- Build command: `npm install && npm run prisma:generate`
- Start command: `npm start`
- Runtime: Node.js

Variables d'environnement backend:

```env
NODE_ENV=production
PORT=4000
CLIENT_ORIGIN=https://url-du-frontend.vercel.app
CLIENT_ORIGINS=https://url-du-frontend.vercel.app
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DB?schema=public
JWT_SECRET=generer-une-valeur-aleatoire-privee-d-au-moins-48-caracteres
JWT_EXPIRES_IN=7d
COOKIE_NAME=subscription_manager_token
COOKIE_SECURE=true
COOKIE_SAME_SITE=none
AUTH_RATE_LIMIT_WINDOW_MS=900000
AUTH_RATE_LIMIT_MAX=10
ADMIN_EMAIL=admin@subscription.local
ADMIN_PASSWORD=mot-de-passe-fort
ADMIN_NAME=Admin Subscription
```

Important:

- `CLIENT_ORIGIN` doit être exactement l'origine du frontend, sans slash final.
- `JWT_SECRET` doit être privé, long et généré aléatoirement.
- `COOKIE_SECURE=true` est obligatoire en HTTPS.
- `COOKIE_SAME_SITE=none` est nécessaire si frontend et backend sont sur deux domaines différents.

## PostgreSQL hébergé

Options possibles:

- Railway PostgreSQL
- Supabase PostgreSQL
- Neon PostgreSQL

Étapes:

1. Créer une base PostgreSQL.
2. Copier l'URL de connexion dans `DATABASE_URL`.
3. Vérifier que l'URL utilise bien le provider PostgreSQL.
4. Lancer les migrations Prisma sur l'environnement backend.
5. Lancer le seed admin.

Commandes utiles selon l'hébergeur:

```bash
npm run prisma:migrate --workspace backend
npm run prisma:seed --workspace backend
```

Sur certaines plateformes, ces commandes doivent être lancées dans une console fournie par l'hébergeur ou dans un job de déploiement.

## Ordre de déploiement conseillé

1. Créer la base PostgreSQL hébergée.
2. Déployer le backend avec `DATABASE_URL`, `JWT_SECRET` et les variables cookies.
3. Exécuter les migrations Prisma.
4. Exécuter le seed admin.
5. Déployer le frontend avec `VITE_API_URL`.
6. Mettre l'URL frontend réelle dans `CLIENT_ORIGIN`.
7. Redéployer le backend si nécessaire.
8. Tester login, register, logout, dashboard, abonnements et admin.

## Sécurité production

Mesures déjà présentes:

- Helmet pour les en-têtes HTTP.
- Rate-limit sur login/register.
- Cookie HTTP-only pour le JWT.
- Cookie `Secure` en production.
- CORS par allowlist.
- Validation Zod.
- Mot de passe hashé avec bcrypt.
- Secret JWT renforcé en production.

Limite CSRF:

L'authentification repose sur un cookie HTTP-only. C'est plus sûr que stocker un token dans `localStorage`, mais le navigateur envoie automatiquement le cookie avec certaines requêtes. Si `SameSite=None` est utilisé, une protection CSRF dédiée devient importante.

Pour une production grand public, il faudra ajouter:

- un token CSRF côté API et frontend, ou
- une validation stricte des en-têtes `Origin` et `Sec-Fetch-Site` sur les routes qui modifient les données.

## Tests après déploiement

À vérifier manuellement:

- Inscription utilisateur.
- Connexion utilisateur.
- Création d'un abonnement.
- Modification d'un abonnement.
- Archivage d'un abonnement.
- Dashboard et Analytics cohérents.
- Connexion admin.
- Liste utilisateurs admin.
- Liste abonnements admin.
- Déconnexion.

À vérifier techniquement:

- Le frontend appelle bien l'URL backend de production.
- Les cookies sont présents en HTTPS.
- Les requêtes incluent `credentials: "include"`.
- CORS n'accepte pas d'origine inconnue.
- Les logs backend ne montrent pas d'erreur Prisma ou CORS.

## Limites connues

- Pas de protection CSRF complète pour le moment.
- Pas de workflow CI/CD complet.
- Pas de monitoring ou alerting production.
- Pas de stockage externe pour captures ou exports.
- Pas de reset password par email.
