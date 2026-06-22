# Base de donnees

## Technologie

La base de donnees utilise PostgreSQL. Le modele est gere par Prisma dans `backend/prisma/schema.prisma`.

## Demarrage local

```bash
npm run db:up
npm run db:generate
npm run db:migrate
npm run db:seed
```

Le conteneur PostgreSQL expose la base sur:

```text
localhost:15432
```

URL locale par defaut:

```text
postgresql://subscription_user:subscription_password@localhost:15432/subscription_manager?schema=public
```

## Migrations versionnees

Les fichiers SQL de migration sont stockes dans:

```text
backend/prisma/migrations/
```

Migrations presentes:

```text
20260430000000_init/
20260602151424_add_user_avatar_url/
20260611102000_add_auth_public_v1_fields/
```

Ces fichiers constituent le depot de base de donnees attendu: ils permettent de reconstruire le schema sur une base PostgreSQL vide.

## Commandes Prisma

| Commande | Role |
|---|---|
| `npm run db:generate` | Genere le client Prisma |
| `npm run db:migrate` | Applique les migrations en developpement |
| `npm run db:deploy` | Applique les migrations en production |
| `npm run db:seed` | Insere les categories initiales et le compte admin |

## Seed

Le fichier `backend/prisma/seed.js` cree:

- les categories principales;
- un compte administrateur.

Les identifiants admin sont lus depuis les variables:

```env
ADMIN_EMAIL=admin@subscription.local
ADMIN_PASSWORD=Admin123!
ADMIN_NAME=Admin Subscription
```

## Tables principales

### users

Stocke les comptes utilisateurs, les informations de profil, le role et les champs techniques d'authentification.

### categories

Stocke les categories d'abonnements et leur couleur d'affichage.

### subscriptions

Stocke les abonnements rattaches a un utilisateur et, optionnellement, a une categorie.

## Export SQL

Un export SQL complet n'est pas necessaire pour installer le projet, car les migrations Prisma sont versionnees. Pour generer un dump depuis une base locale:

```bash
docker exec subscription-manager-postgres pg_dump -U subscription_user subscription_manager > frovely.sql
```

Pour restaurer ce dump:

```bash
docker exec -i subscription-manager-postgres psql -U subscription_user subscription_manager < frovely.sql
```
