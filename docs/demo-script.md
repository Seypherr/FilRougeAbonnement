# Scénario de démonstration orale

Objectif: présenter clairement le besoin, les fonctionnalités, l'architecture et les choix techniques en moins de 10 minutes.

## Introduction courte

Frovely est une application web de gestion d'abonnements. Elle répond à un besoin simple: centraliser ses abonnements, suivre ses dépenses mensuelles et garder une vision claire des services actifs, inactifs ou archivés.

Le projet contient:

- une authentification sécurisée,
- un espace utilisateur,
- un espace administrateur,
- une base PostgreSQL,
- une architecture backend MVC,
- une interface responsive bilingue français/anglais.

## Démo utilisateur - 3 minutes

### 1. Connexion ou inscription

Montrer:

- la page Auth,
- le switch login/register,
- la connexion avec un compte de démonstration.

Compte possible:

```txt
alex.student@demo.local
Demo123!
```

Phrase à dire:

> L'utilisateur peut créer un compte ou se connecter. Le JWT n'est pas stocké dans le navigateur en JavaScript, il est envoyé dans un cookie HTTP-only.

### 2. Dashboard

Montrer:

- total mensuel,
- estimation annuelle,
- nombre d'abonnements actifs,
- nombre d'abonnements archivés,
- prochains renouvellements.

Phrase à dire:

> Le dashboard résume les dépenses et les prochains renouvellements. Le total mensuel ne prend en compte que les abonnements actifs.

### 3. Ajout d'un abonnement

Créer un abonnement:

- nom,
- prix,
- cycle mensuel, annuel ou hebdomadaire,
- statut,
- date de renouvellement,
- catégorie,
- moyen de paiement si besoin.

Phrase à dire:

> Le formulaire est validé côté frontend et côté backend avec Zod pour éviter les données invalides.

### 4. Recherche, filtre et modification

Montrer:

- recherche par nom ou description,
- filtre `All`, `Active`, `Paused`, `Archived`,
- modification d'un abonnement.

Phrase à dire:

> Chaque utilisateur ne peut consulter et modifier que ses propres abonnements.

### 5. Archivage

Archiver un abonnement utilisateur.

Phrase à dire:

> Côté utilisateur, la suppression devient un archivage. Cela évite de perdre l'historique par erreur.

### 6. Analytics

Montrer:

- total mensuel,
- estimation annuelle,
- moyenne,
- plus gros abonnement,
- répartition par catégorie,
- abonnements les plus coûteux.

Phrase à dire:

> Les statistiques sont calculées à partir des abonnements disponibles et restent lisibles même si l'utilisateur n'a pas encore de données.

## Démo admin - 2 minutes

Compte admin:

```txt
admin@subscription.local
Admin123!
```

### 1. Connexion admin

Montrer que l'interface admin est accessible uniquement avec un rôle `ADMIN`.

Phrase à dire:

> Les routes admin sont protégées par un middleware d'authentification et un middleware de rôle.

### 2. Gestion utilisateurs

Montrer:

- liste des utilisateurs,
- création utilisateur,
- changement de rôle,
- activation/désactivation,
- suppression avec confirmation.

Phrase à dire:

> L'admin peut gérer les comptes. Une protection empêche aussi un admin de supprimer son propre compte.

### 3. Abonnements globaux

Montrer:

- liste globale des abonnements,
- utilisateur associé,
- statut,
- montant mensualisé.

Phrase à dire:

> L'admin peut consulter les abonnements de la plateforme pour avoir une vue globale.

## Explication technique - 2 minutes

### Architecture

```txt
React/Vite -> Express routes -> Controllers -> Services/Prisma -> PostgreSQL
```

Points à expliquer:

- React gère l'interface.
- Express expose l'API REST.
- Prisma fait le lien avec PostgreSQL.
- Les controllers contiennent la logique des requêtes.
- Les middlewares gèrent auth, rôles, validation et erreurs.

### Base de données

Tables:

- `users`
- `subscriptions`
- `categories`

Relations:

- un utilisateur possède plusieurs abonnements,
- une catégorie peut classer plusieurs abonnements,
- si un utilisateur est supprimé, ses abonnements sont supprimés en cascade,
- si une catégorie est supprimée, les abonnements restent mais perdent leur catégorie.

### Sécurité

Points à citer:

- mots de passe hashés avec bcrypt,
- JWT en cookie HTTP-only,
- pas de token dans `localStorage`,
- validation Zod,
- routes privées protégées,
- routes admin protégées par rôle,
- Helmet,
- rate-limit sur login/register,
- CORS configuré.

Limite à assumer:

> Pour une mise en production grand public, il faudra ajouter une protection CSRF complète, car l'authentification utilise des cookies.

## Questions probables

### Pourquoi Prisma ?

Prisma permet de décrire la base dans un schema clair, de gérer les migrations et d'écrire des requêtes plus lisibles qu'en SQL brut.

### Pourquoi PostgreSQL ?

Le projet repose sur des relations entre utilisateurs, abonnements et catégories. PostgreSQL est adapté à ce type de modèle relationnel.

### Pourquoi un cookie HTTP-only ?

Un cookie HTTP-only réduit le risque d'exposition du JWT à un script côté navigateur. Le frontend ne manipule pas directement le token.

### Pourquoi archiver au lieu de supprimer ?

L'archivage évite les suppressions accidentelles et permet de garder une trace des anciens abonnements.

### Pourquoi React/Vite ?

React permet de créer une interface dynamique par composants. Vite simplifie le développement et accélère le build.

### Quelles limites restent à corriger ?

- Protection CSRF dédiée.
- Notifications de renouvellement.
- Reset password.
- Gestion complète des moyens de paiement.
- Monitoring production.
- Tests end-to-end navigateur plus complets.

## Plan de conclusion

Phrase possible:

> Le projet couvre les fonctionnalités principales demandées: authentification, CRUD, rôles, base relationnelle, dashboard, statistiques et administration. Il est prêt pour une démonstration, et les limites restantes sont identifiées pour une mise en production plus avancée.
