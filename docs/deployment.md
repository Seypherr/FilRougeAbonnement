# Deploiement

## Objectif

Cette documentation decrit une strategie de deploiement simple et realiste pour presenter le projet et preparer une mise en production publique.

Strategie recommandee:

- Frontend: Vercel
- Backend: Render ou Railway
- Base de donnees: PostgreSQL heberge sur Railway, Supabase ou Neon

## Architecture de production

```mermaid
flowchart LR
  User["Utilisateur"] --> Vercel["Frontend Vercel"]
  Vercel --> Api["Backend Render/Railway"]
  Api --> Db["PostgreSQL heberge"]
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

Apres deploiement, recuperer l'URL Vercel finale. Exemple:

```txt
https://subscription-manager.vercel.app
```

Cette URL devra etre ajoutee cote backend dans `CLIENT_ORIGIN` et `CLIENT_ORIGINS`.

## Backend sur Render ou Railway

Configuration recommandee:

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
CSRF_COOKIE_NAME=subscription_manager_csrf
CSRF_HEADER_NAME=x-csrf-token
AUTH_RATE_LIMIT_WINDOW_MS=900000
AUTH_RATE_LIMIT_MAX=10
ADMIN_EMAIL=admin@subscription.local
ADMIN_PASSWORD=mot-de-passe-fort
ADMIN_NAME=Admin Subscription
```

Important:

- `CLIENT_ORIGIN` doit etre exactement l'origine du frontend, sans slash final.
- En production, les origines `localhost` sont refusees par la configuration backend.
- `JWT_SECRET` doit etre prive, long, aleatoire et contenir au moins 48 caracteres.
- `COOKIE_SECURE=true` est obligatoire en production.
- `COOKIE_SAME_SITE=none` est attendu si frontend et backend sont sur deux domaines differents.
- Le frontend ne stocke pas le JWT: l'authentification reste basee sur cookie HTTP-only.

## PostgreSQL heberge

Options possibles:

- Railway PostgreSQL
- Supabase PostgreSQL
- Neon PostgreSQL

Etapes:

1. Creer une base PostgreSQL.
2. Copier l'URL de connexion dans `DATABASE_URL`.
3. Verifier que l'URL utilise bien le provider PostgreSQL.
4. Lancer les migrations Prisma sur l'environnement backend.
5. Lancer le seed admin si necessaire.

Commandes utiles selon l'hebergeur:

```bash
npm run prisma:migrate --workspace backend
npm run prisma:seed --workspace backend
```

Sur certaines plateformes, ces commandes doivent etre lancees dans une console fournie par l'hebergeur ou dans un job de deploiement.

## Ordre de deploiement conseille

1. Creer la base PostgreSQL hebergee.
2. Deployer le backend avec `DATABASE_URL`, `JWT_SECRET` et les variables cookies.
3. Executer les migrations Prisma.
4. Executer le seed admin.
5. Deployer le frontend avec `VITE_API_URL`.
6. Mettre l'URL frontend reelle dans `CLIENT_ORIGIN` et `CLIENT_ORIGINS`.
7. Redeployer le backend si necessaire.
8. Tester login, register, logout, dashboard, abonnements, profil et admin.

## Securite production

Mesures presentes:

- Helmet pour les en-tetes HTTP.
- Rate-limit sur login/register.
- Cookie HTTP-only pour le JWT.
- Cookie `Secure` obligatoire en production.
- `SameSite=None` attendu en production cross-site.
- CORS par allowlist stricte.
- Protection CSRF par token signe envoye dans le header `x-csrf-token`.
- Validation Zod sur les routes sensibles.
- Mot de passe hashe avec bcrypt.
- Secret JWT renforce en production.

Fonctionnement CSRF:

1. Le frontend recupere un token via `GET /api/auth/csrf`.
2. Pour les routes `POST`, `PUT`, `PATCH` et `DELETE`, le frontend envoie le header `x-csrf-token`.
3. Le backend verifie que le token est signe avec le secret applicatif.
4. Les routes `login` et `register` restent accessibles sans token CSRF.

Cette strategie fonctionne avec les cookies HTTP-only et evite de stocker le JWT cote frontend.

## Avatar en production

Le champ `avatarUrl` accepte uniquement une URL d'image externe valide.

Limite volontaire:

- Les images `data:image` ne sont plus acceptees par le backend.
- Aucun fichier image n'est stocke dans PostgreSQL.
- L'upload reel devra etre branche plus tard sur un stockage externe: Cloudinary, Supabase Storage, S3 ou service equivalent.

## Tests apres deploiement

A verifier manuellement:

- Inscription utilisateur.
- Connexion utilisateur.
- Creation d'un abonnement.
- Modification d'un abonnement.
- Archivage d'un abonnement.
- Modification du profil avec URL avatar HTTPS.
- Dashboard et Analytics coherents.
- Connexion admin.
- Liste utilisateurs admin.
- Liste abonnements admin.
- Deconnexion.

A verifier techniquement:

- Le frontend appelle bien l'URL backend de production.
- Les cookies sont presents en HTTPS.
- Les requetes incluent `credentials: "include"`.
- Les mutations envoient le header `x-csrf-token`.
- CORS n'accepte pas d'origine inconnue.
- Les logs backend ne montrent pas d'erreur Prisma ou CORS.

## Limites connues

- Pas encore d'upload fichier avatar en production.
- Pas de workflow CI/CD complet.
- Pas de monitoring ou alerting production.
- Pas de reset password par email.
