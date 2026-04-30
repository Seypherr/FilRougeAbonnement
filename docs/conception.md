# Conception

## Architecture MVC

- Model: Prisma, PostgreSQL, modèles `User`, `Subscription`, `Category`
- View: React, composants et pages frontend
- Controller: Express controllers, routes REST et middlewares

## MCD simplifié

```mermaid
erDiagram
  USER ||--o{ SUBSCRIPTION : possede
  CATEGORY ||--o{ SUBSCRIPTION : classe

  USER {
    string id PK
    string name
    string email UK
    string password
    string role
    boolean is_active
    datetime created_at
    datetime updated_at
  }

  CATEGORY {
    string id PK
    string name UK
    string color
    datetime created_at
    datetime updated_at
  }

  SUBSCRIPTION {
    string id PK
    string name
    string description
    decimal price
    string billing_cycle
    datetime renewal_date
    string status
    string payment_method
    string user_id FK
    string category_id FK
    datetime created_at
    datetime updated_at
  }
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

## Architecture MVC

```mermaid
flowchart LR
  Browser["React / Vite"] --> Api["Express API"]
  Api --> Controllers["Controllers"]
  Controllers --> Services["Services"]
  Services --> Prisma["Prisma ORM"]
  Prisma --> Database["PostgreSQL Docker"]
  Api --> Middlewares["Auth, validation, errors"]
```

## Choix techniques

- React/Vite: frontend léger, rapide à développer et adapté à une interface dynamique.
- Tailwind CSS: permet une UI responsive rapidement sans dépendre d'un kit graphique lourd.
- Express: framework simple et robuste pour exposer une API REST.
- Prisma: ORM lisible, migrations versionnées, typage des modèles et requêtes plus sûres.
- PostgreSQL: base relationnelle adaptée aux relations `users`, `subscriptions`, `categories`.
- JWT cookie HTTP-only: évite de manipuler le token en JavaScript côté navigateur.

## Bonus possibles

- Graphiques avancés
- Notifications de renouvellement
- Export CSV/PDF
- Déploiement Vercel + Render/Railway
- Tests d'intégration complets
