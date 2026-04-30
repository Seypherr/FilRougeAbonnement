# Script design et prompts par page

## Script global de direction artistique

Créer une interface web moderne, claire et mobile-first pour une application de gestion d'abonnements appelée **Subscription Manager**.

L'application doit donner une impression de sérieux, de simplicité et de contrôle financier. Le design doit rester scolaire/propre et facile à expliquer à l'oral, sans devenir trop complexe. L'utilisateur doit comprendre rapidement combien il dépense, quels abonnements sont actifs, et quelles actions il peut faire.

Style attendu:

- Interface responsive mobile-first.
- Design sobre, lisible et professionnel.
- Couleurs principales: blanc, gris clair, noir/bleu très foncé, vert pour les succès, rouge pour les actions dangereuses.
- Pas de landing page marketing: l'utilisateur arrive directement sur l'expérience applicative.
- Cartes simples avec bordures fines.
- Boutons clairs avec icônes.
- Navigation compacte.
- États visibles: loading, erreur, succès, vide.
- Formulaires faciles à remplir sur mobile.
- Admin lisible sans tableau trop large sur mobile.

Contraintes:

- Garder React + Tailwind CSS.
- Garder les pages existantes: auth, dashboard, abonnements, statistiques, admin.
- Ne pas changer la logique backend.
- Ne pas changer les noms des champs API.
- Garder le bilingue français/anglais.
- Garder une interface facile à présenter dans une démo Ynov.

## Prompt page Connexion / Inscription

Créer une page mobile-first de connexion et d'inscription pour une application appelée **Subscription Manager**.

La page doit contenir:

- Le nom de l'application en haut.
- Un bouton de changement de langue FR/EN.
- Un bloc central avec deux onglets: Connexion et Inscription.
- Formulaire connexion: email, mot de passe, bouton de connexion.
- Formulaire inscription: nom, email, mot de passe, bouton créer un compte.
- Messages d'erreur visibles sous le formulaire.
- Design sobre, rassurant et professionnel.

Objectif UX:

- L'utilisateur doit comprendre immédiatement comment se connecter ou créer un compte.
- Les champs doivent être grands et faciles à utiliser sur mobile.
- Les boutons doivent être visibles et accessibles.

Prompt court:

```txt
Design a mobile-first authentication screen for a subscription management app named Subscription Manager. Include a language switcher, login/register tabs, clean form fields, clear error states, and a sober professional dashboard-style visual identity using white, light gray, dark navy, and subtle borders. Keep the page simple, accessible, and ready for a student project demo.
```

## Prompt page Dashboard

Créer un dashboard principal pour l'utilisateur connecté.

La page doit contenir:

- Header avec nom de l'application, nom utilisateur, rôle, langue, déconnexion.
- Navigation: Dashboard, Abonnements, Statistiques, Admin si l'utilisateur est admin.
- Carte principale: total mensuel.
- Carte: total annuel estimé.
- Carte: nombre d'abonnements actifs.
- Carte: abonnements archivés.
- Section prochains renouvellements.
- Raccourci pour ajouter un abonnement.

Objectif UX:

- L'utilisateur doit voir rapidement ses dépenses.
- Les informations importantes doivent être visibles sans scroller trop loin.
- Sur mobile, les cartes doivent être empilées proprement.

Prompt court:

```txt
Design a mobile-first user dashboard for Subscription Manager. Show monthly total, estimated yearly total, active subscriptions, archived subscriptions, upcoming renewals, and a clear add-subscription call to action. Use compact cards, clean spacing, dark primary buttons, subtle borders, and a professional student-project style. The page must work well on mobile and desktop.
```

## Prompt page Abonnements

Créer une page de gestion des abonnements.

La page doit contenir:

- Formulaire d'ajout/modification d'abonnement.
- Champs: nom, prix, cycle, statut, date de renouvellement, catégorie, moyen de paiement, description.
- Barre de recherche.
- Filtre par statut: tous, actif, inactif, archivé.
- Liste des abonnements sous forme de cartes.
- Chaque carte affiche: nom, catégorie, cycle, prix, coût mensuel, date de renouvellement, statut.
- Actions: modifier, archiver.
- Message de succès après création/modification/archivage.
- Confirmation avant archivage.

Objectif UX:

- L'utilisateur doit pouvoir ajouter un abonnement rapidement.
- La liste doit être claire sur mobile.
- Les actions doivent être faciles à trouver.

Prompt court:

```txt
Design a mobile-first subscription management page. Include a compact add/edit form with name, price, billing cycle, status, renewal date, category, payment method, and description. Add search and status filters. Display subscriptions as readable cards with monthly cost, renewal date, status badges, edit and archive actions. Use clear success/error feedback and a sober professional style.
```

## Prompt page Statistiques

Créer une page statistiques simple et lisible.

La page doit contenir:

- Total mensuel.
- Total annuel estimé.
- Répartition par catégorie.
- Top abonnements les plus coûteux.
- État vide si aucune donnée.
- Graphiques simples ou barres horizontales.

Objectif UX:

- L'utilisateur doit comprendre où part son argent.
- Les données doivent être compréhensibles rapidement.
- La page doit rester simple pour une démo.

Prompt court:

```txt
Design a simple analytics page for a subscription manager app. Show monthly total, estimated yearly total, category breakdown, and top most expensive subscriptions. Use horizontal bars or simple chart cards, clear labels, empty states, and a clean mobile-first layout. Keep the style sober, readable, and professional.
```

## Prompt page Admin

Créer une page admin pour gérer les utilisateurs et consulter les abonnements.

La page doit contenir:

- Formulaire de création utilisateur: nom, email, mot de passe, rôle.
- Liste des utilisateurs.
- Sur mobile: cartes utilisateur.
- Sur desktop: tableau utilisateur possible.
- Informations utilisateur: nom, email, rôle, statut actif/inactif, nombre d'abonnements.
- Actions: changer rôle, activer/désactiver, supprimer.
- Confirmation avant suppression.
- Section consultation globale des abonnements.

Objectif UX:

- L'admin doit pouvoir gérer les comptes sans confusion.
- Les actions dangereuses doivent être visuellement séparées.
- La page doit rester lisible sur mobile.

Prompt court:

```txt
Design a mobile-first admin page for Subscription Manager. Include a create-user form, user management cards on mobile, a table-like layout on desktop, role selector, active/inactive toggle, delete action with danger styling, and a section listing all subscriptions. Keep the UI clear, compact, and suitable for a student web/database project demo.
```

## Prompt page Documentation / Présentation projet

Créer une page ou section de présentation interne du projet pour le rendu.

La page doit contenir:

- Nom du projet.
- Équipe projet.
- Objectif de l'application.
- Technologies utilisées.
- Architecture MVC.
- Base de données: users, subscriptions, categories.
- Fonctionnalités principales.
- Sécurité: JWT cookie HTTP-only, bcrypt, rôles.
- Tests.
- Déploiement prévu.

Objectif UX:

- Servir de support visuel pendant la présentation.
- Être lisible rapidement.
- Montrer que le projet est structuré.

Prompt court:

```txt
Design a project presentation page for a student web application named Subscription Manager. Show project goals, team, tech stack, MVC architecture, database entities, main features, security choices, tests, and deployment plan. Use a clean documentation-style layout with cards, icons, and concise sections.
```

## Prompt global pour refaire tout le frontend

```txt
Redesign the existing React + Tailwind frontend of Subscription Manager without changing backend API contracts. The app manages user subscriptions with secure HTTP-only cookie authentication, roles USER and ADMIN, subscriptions CRUD, statistics, and bilingual French/English UI.

Keep these pages:
- Login/Register
- Dashboard
- Subscriptions
- Statistics
- Admin

Design requirements:
- Mobile-first
- Clean student-project dashboard style
- White/light-gray background
- Dark navy primary actions
- Green success states
- Red danger actions
- Subtle borders and compact cards
- No marketing landing page
- No heavy visual effects
- Accessible forms
- Clear loading, empty, error, and success states
- Admin page must be usable on mobile with user cards
- Desktop can use wider grids and tables

Do not change:
- API routes
- request/response field names
- authentication strategy
- Prisma schema
- business logic

Improve:
- spacing
- readability
- navigation
- dashboard metrics
- subscription cards
- statistics charts
- admin mobile layout
- confirmation and feedback messages
```
