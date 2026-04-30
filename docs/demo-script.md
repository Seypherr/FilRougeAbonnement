# Scénario de démonstration orale

## Démo utilisateur - 3 minutes

1. Présenter l'objectif: centraliser et suivre ses abonnements.
2. Créer un compte utilisateur.
3. Ajouter trois abonnements:
   - mensuel
   - annuel
   - hebdomadaire
4. Montrer le calcul du total mensuel.
5. Modifier un abonnement.
6. Filtrer les abonnements actifs.
7. Archiver un abonnement.
8. Afficher l'onglet statistiques.

## Démo admin - 2 minutes

1. Se connecter avec le compte admin.
2. Afficher la liste des utilisateurs.
3. Créer un utilisateur.
4. Changer son rôle.
5. Désactiver puis réactiver un compte.
6. Afficher tous les abonnements.

## Explications techniques

- Architecture MVC:
  - Model: Prisma et PostgreSQL
  - View: React
  - Controller: Express controllers
- Sécurité:
  - mots de passe hashés avec bcrypt
  - JWT stocké dans un cookie HTTP-only
  - middleware d'authentification
  - middleware admin
- Base de données:
  - relation `User` vers `Subscription`
  - relation `Category` vers `Subscription`
  - suppression utilisateur en cascade sur ses abonnements
  - archivage des abonnements côté utilisateur

## Difficultés et solutions

- Port PostgreSQL `5432` réservé par Windows:
  - solution: exposer PostgreSQL sur `localhost:15432`.
- Sécurité du token:
  - solution: cookie HTTP-only plutôt que stockage direct dans `localStorage`.
- Interface admin mobile:
  - solution: cartes mobiles et tableau seulement sur écran plus large.

## Questions probables

- Pourquoi Prisma ?
  - Pour gérer les migrations, les relations et éviter d'écrire toutes les requêtes SQL à la main.
- Pourquoi PostgreSQL ?
  - Parce que le projet repose sur des relations fortes entre utilisateurs, abonnements et catégories.
- Pourquoi cookie HTTP-only ?
  - Pour réduire l'exposition du JWT aux scripts côté navigateur.
- Pourquoi archiver un abonnement ?
  - Pour conserver l'historique et éviter une suppression accidentelle.
