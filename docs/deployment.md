# Déploiement

## Stratégie recommandée

- Frontend: Vercel
- Backend: Render ou Railway
- Base de données: Railway, Supabase ou Neon PostgreSQL

## Variables d'environnement backend

```env
NODE_ENV=production
PORT=4000
CLIENT_ORIGIN=https://url-du-frontend.vercel.app
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DB?schema=public
JWT_SECRET=secret-long-et-unique
JWT_EXPIRES_IN=7d
COOKIE_NAME=subscription_manager_token
ADMIN_EMAIL=admin@subscription.local
ADMIN_PASSWORD=mot-de-passe-fort
ADMIN_NAME=Admin Subscription
```

## Variables d'environnement frontend

```env
VITE_API_URL=https://url-du-backend.onrender.com/api
```

## Étapes

1. Créer la base PostgreSQL hébergée.
2. Copier l'URL PostgreSQL dans `DATABASE_URL`.
3. Déployer le backend.
4. Exécuter les migrations Prisma sur l'environnement backend.
5. Exécuter le seed admin.
6. Déployer le frontend avec `VITE_API_URL`.
7. Vérifier que `CLIENT_ORIGIN` correspond exactement à l'URL frontend.

## Points de vigilance

- En production, les cookies sont configurés en `secure`.
- Le frontend doit appeler l'API avec `credentials: "include"`.
- `CLIENT_ORIGIN` doit contenir l'origine complète du frontend, sans slash final.
- `JWT_SECRET` doit être long, privé et différent de celui du développement.
