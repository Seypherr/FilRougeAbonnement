# Conception

## Architecture MVC

- Model: Prisma, PostgreSQL, modèles `User`, `Subscription`, `Category`
- View: React, composants et pages frontend
- Controller: Express controllers, routes REST et middlewares

## MCD simplifié

```txt
USER (0,n) possede SUBSCRIPTION
CATEGORY (0,n) classe SUBSCRIPTION

USER
- id
- name
- email
- password
- role
- isActive

SUBSCRIPTION
- id
- name
- description
- price
- billingCycle
- renewalDate
- status
- paymentMethod

CATEGORY
- id
- name
- color
```

## MLD simplifié

```txt
users(
  id PK,
  name,
  email UNIQUE,
  password,
  role,
  is_active,
  created_at,
  updated_at
)

categories(
  id PK,
  name UNIQUE,
  color,
  created_at,
  updated_at
)

subscriptions(
  id PK,
  name,
  description,
  price,
  billing_cycle,
  renewal_date,
  status,
  payment_method,
  user_id FK -> users(id),
  category_id FK -> categories(id),
  created_at,
  updated_at
)
```

## Sécurité

- Les mots de passe sont hashés avec bcrypt.
- Le JWT est stocké dans un cookie HTTP-only.
- Les routes privées passent par un middleware d'authentification.
- Les routes admin passent par un middleware de rôle.
- Les utilisateurs ne peuvent accéder qu'à leurs propres abonnements.

## Bonus possibles

- Graphiques avancés
- Notifications de renouvellement
- Export CSV/PDF
- Déploiement Vercel + Render/Railway
- Tests d'intégration complets
