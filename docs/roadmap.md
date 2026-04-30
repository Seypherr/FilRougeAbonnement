# Roadmap et tableau d'avancement

## Avancement global

Le projet est actuellement au stade **MVP technique fonctionnel**, estimé à environ **70%**.

Le code principal est en place: backend Express/Prisma, frontend React minimal, authentification sécurisée, espace admin, CRUD abonnements, statistiques simples, tests et documentation. Le point restant le plus important avant validation complète est l'application réelle de la migration PostgreSQL après démarrage de Docker Desktop.

## Tableau d'avancement

| Lot | Étape | État actuel | Avancement | Priorité | Critère de validation |
|---|---|---:|---:|---:|---|
| 1 | Initialisation monorepo | Terminé | 100% | Haute | Dossiers `backend`, `frontend`, `docs` et scripts npm présents |
| 1 | Git et commits propres | Terminé | 100% | Haute | Historique découpé en commits fonctionnels |
| 1 | Docker PostgreSQL | Prêt, Docker à démarrer | 90% | Haute | `npm run db:up` lance PostgreSQL localement |
| 2 | Backend Express | Terminé pour MVP | 90% | Haute | API accessible sur `/api/health` |
| 2 | Prisma schema | Terminé | 90% | Haute | Modèles `User`, `Subscription`, `Category` définis |
| 2 | Migration Prisma | Créée côté code | 85% | Haute | Migration appliquée avec `npm run db:migrate` |
| 2 | Seed admin | Créé côté code | 80% | Haute | Admin disponible après `npm run db:seed` |
| 3 | Auth cookie HTTP-only | Terminé | 90% | Haute | Register/login/logout/me fonctionnels |
| 3 | Gestion rôles | Terminé pour MVP | 85% | Haute | `USER` refusé sur routes admin, `ADMIN` accepté |
| 4 | CRUD abonnements | Terminé pour MVP | 85% | Haute | Ajout, modification, liste, archivage fonctionnels |
| 4 | Recherche et filtre | Terminé pour MVP | 75% | Moyenne | Filtre statut + recherche texte côté API/frontend |
| 4 | Calcul mensualisé | Terminé | 100% | Haute | Mensuel, annuel et hebdomadaire testés |
| 5 | Admin comptes | Terminé pour MVP | 80% | Haute | Liste, création, rôle, activation/désactivation, suppression |
| 5 | Admin abonnements | Terminé pour MVP | 70% | Moyenne | Consultation globale des abonnements |
| 6 | Frontend React minimal | Terminé | 75% | Haute | Pages principales accessibles |
| 6 | Bilingue FR/EN | Terminé pour MVP | 75% | Moyenne | Switch FR/EN et dictionnaires alignés |
| 6 | Dashboard statistiques | Terminé simple | 65% | Moyenne | Total mensuel, annuel estimé, catégories, top coûts |
| 7 | Tests backend | Terminé pour MVP | 75% | Haute | Tests auth, admin, isolation utilisateur OK |
| 7 | Tests frontend | Minimal | 30% | Moyenne | Test alignement dictionnaires OK |
| 8 | UI mobile-first avancée | À améliorer | 35% | Haute | Interface testée mobile + desktop |
| 9 | Documentation finale | En cours | 55% | Haute | README, MCD/MLD, justification technique finalisés |
| 10 | Déploiement | À faire | 0% | Haute | Frontend + backend + DB disponibles en ligne |
| 11 | Présentation orale | À faire | 10% | Haute | Démo + support + réponses préparées |

## Plan pour la suite

### Jalon 1 - Stabiliser la base de données

Objectif: passer de code prêt à application réellement connectée à PostgreSQL.

Commandes:

```bash
npm run db:up
npm run db:migrate
npm run db:seed
```

Validation:

- Docker Desktop est démarré.
- PostgreSQL écoute sur le port `5432`.
- La migration Prisma est appliquée.
- Le compte admin existe.
- Le backend démarre sans erreur de connexion DB.

### Jalon 2 - Tester le parcours complet

Objectif: vérifier que l'application fonctionne comme une vraie démo.

Parcours utilisateur:

- inscription d'un nouvel utilisateur
- connexion
- ajout d'un abonnement mensuel
- ajout d'un abonnement annuel
- ajout d'un abonnement hebdomadaire
- recherche d'un abonnement
- filtre par statut actif/inactif/archivé
- modification d'un abonnement
- archivage d'un abonnement
- consultation des statistiques
- déconnexion

Parcours admin:

- connexion avec `admin@subscription.local`
- consultation des utilisateurs
- création d'un utilisateur
- changement de rôle
- désactivation/réactivation d'un compte
- consultation globale des abonnements

### Jalon 3 - Améliorer l'interface mobile-first

Objectif: gagner des points sur l'UX sans casser le backend.

À faire:

- rendre la navigation plus compacte sur mobile
- améliorer les formulaires abonnement/admin
- ajouter des messages succès/erreur plus propres
- améliorer les états loading/empty/error
- rendre les tableaux admin plus lisibles sur mobile
- améliorer les cartes statistiques

### Jalon 4 - Renforcer les tests

Objectif: sécuriser le rendu et montrer une démarche pro.

Tests à ajouter:

- test API création abonnement
- test API modification abonnement
- test API archivage abonnement
- test API refus d'accès à l'abonnement d'un autre utilisateur
- test admin suppression utilisateur
- tests frontend sur rendu login/dashboard si le temps le permet

### Jalon 5 - Préparer le rendu Ynov

Objectif: maximiser les points d'évaluation.

À produire:

- README final avec installation complète
- schéma MCD
- schéma MLD
- schéma architecture MVC
- justification des technologies
- captures d'écran
- scénario de démo
- liste des fonctionnalités réalisées
- limites connues
- améliorations futures

### Jalon 6 - Déploiement

Objectif: rendre l'application accessible en ligne.

Plan recommandé:

- frontend sur Vercel
- backend sur Render ou Railway
- PostgreSQL hébergé sur Railway, Supabase ou Neon
- variables d'environnement de production
- CORS limité au domaine frontend
- cookies configurés en `secure` et `sameSite=none`

## Objectif final

Pour atteindre **100%**, il reste principalement:

- appliquer réellement la DB Docker
- tester les parcours complets
- améliorer l'UX mobile-first
- renforcer les tests
- finaliser les documents de conception
- déployer l'application
- préparer la présentation orale
