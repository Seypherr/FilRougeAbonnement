# Plan de presentation orale

Format attendu: 15 minutes avec demonstration.

## 1. Introduction - 1 min

- Presenter Frovely.
- Probleme traite: centraliser et suivre ses abonnements.
- Public cible: utilisateurs avec plusieurs abonnements recurrents.

## 2. Fonctionnalites - 3 min

- Inscription, connexion et session securisee.
- Gestion des abonnements.
- Dashboard et analytics.
- Catalogue de suggestions.
- Espace administrateur.
- Interface bilingue et responsive.

## 3. Architecture technique - 3 min

- Frontend React/Vite.
- Backend Express.
- Base PostgreSQL.
- Prisma pour le modele et les migrations.
- Zod pour la validation.
- Auth JWT en cookie HTTP-only.

## 4. Modele de donnees - 2 min

- Tables: `users`, `categories`, `subscriptions`.
- Relations utilisateur-abonnements et categorie-abonnements.
- Roles `USER` et `ADMIN`.
- Migrations Prisma versionnees.

## 5. Demonstration - 5 min

Scenario conseille:

1. Connexion avec le compte admin.
2. Affichage du dashboard.
3. Creation d'un abonnement.
4. Consultation des statistiques.
5. Passage dans l'espace admin.
6. Consultation des utilisateurs et abonnements.

Compte de demonstration local:

```text
Email: admin@subscription.local
Mot de passe: Admin123!
```

## 6. Conclusion - 1 min

- Rappeler les objectifs atteints.
- Mentionner les tests automatises.
- Ouvrir sur les ameliorations possibles: notifications, paiement, protection CSRF complete, recuperation email reelle en production.
