# Specifications fonctionnelles

## Objectif

Frovely est une application web de gestion d'abonnements. Elle permet a un utilisateur de centraliser ses abonnements, suivre ses depenses recurrentes, visualiser ses renouvellements et administrer les comptes lorsque son role le permet.

## Roles

### Visiteur

- Creer un compte.
- Se connecter avec un email et un mot de passe.
- Demander un lien de reinitialisation de mot de passe.
- Verifier son adresse email.

### Utilisateur

- Consulter son tableau de bord personnel.
- Creer, modifier, archiver et supprimer definitivement ses abonnements archives.
- Rechercher et filtrer ses abonnements.
- Consulter ses statistiques de depenses.
- Modifier son profil.
- Consulter le catalogue de services pour pre-remplir un abonnement.
- Changer la langue de l'interface.

### Administrateur

- Acceder a toutes les fonctionnalites utilisateur.
- Lister les utilisateurs.
- Creer, modifier, activer/desactiver et supprimer des utilisateurs.
- Consulter tous les abonnements de la plateforme.
- Supprimer un abonnement en tant qu'administrateur.
- Creer, modifier et supprimer les categories.

## Fonctionnalites attendues

### Authentification

- Inscription par nom, email et mot de passe.
- Connexion securisee.
- Session maintenue par cookie HTTP-only.
- Deconnexion.
- Recuperation de la session courante.
- Verification d'email.
- Renvoi d'email de verification.
- Demande et validation de reinitialisation de mot de passe.

### Gestion des abonnements

- Creation d'un abonnement avec nom, prix, cycle, date de renouvellement, statut, moyen de paiement et categorie optionnelle.
- Liste personnelle des abonnements.
- Recherche par texte.
- Filtrage par statut, categorie ou cycle.
- Consultation du detail d'un abonnement.
- Modification d'un abonnement.
- Archivage d'un abonnement utilisateur.
- Suppression definitive d'un abonnement archive.
- Calcul du cout mensualise selon le cycle.

### Dashboard et analytics

- Affichage du total mensuel.
- Estimation annuelle.
- Mise en avant des prochains renouvellements.
- Repartition par categorie.
- Identification des abonnements les plus couteux.

### Catalogue

- Recherche dans un catalogue de services connus.
- Suggestion de logo, categorie, prix indicatif et libelle pour accelerer la creation d'abonnements.

### Administration

- Gestion CRUD des utilisateurs.
- Gestion des roles `USER` et `ADMIN`.
- Activation/desactivation des comptes.
- Consultation globale des abonnements.
- Suppression admin d'un abonnement.
- Gestion CRUD des categories.

## Cas d'utilisation principaux

### UC01 - Creer un compte

1. Le visiteur ouvre l'application.
2. Il choisit l'onglet inscription.
3. Il renseigne son nom, son email et son mot de passe.
4. Le backend valide les donnees.
5. Le mot de passe est hache.
6. Le compte est cree avec le role `USER`.
7. L'utilisateur peut ensuite se connecter.

### UC02 - Se connecter

1. L'utilisateur saisit son email et son mot de passe.
2. Le backend verifie les identifiants.
3. Un JWT est emis dans un cookie HTTP-only.
4. Le frontend recharge la session avec `/auth/me`.
5. L'utilisateur accede a son espace.

### UC03 - Ajouter un abonnement

1. L'utilisateur ouvre la page Abonnements.
2. Il clique sur l'action d'ajout.
3. Il renseigne les informations de l'abonnement.
4. Il peut utiliser les suggestions du catalogue.
5. Le backend valide la requete.
6. L'abonnement est rattache a l'utilisateur connecte.
7. La liste et les statistiques sont mises a jour.

### UC04 - Archiver un abonnement

1. L'utilisateur choisit un abonnement existant.
2. Il demande sa suppression.
3. Le systeme passe le statut a `ARCHIVED`.
4. L'abonnement n'est plus traite comme actif dans les vues principales.
5. Une suppression definitive reste possible pour les abonnements archives.

### UC05 - Consulter les statistiques

1. L'utilisateur ouvre la page Analytics.
2. Le frontend recupere les abonnements de l'utilisateur.
3. Les couts sont normalises en cout mensuel.
4. L'interface affiche total, repartition par categorie et abonnements majeurs.

### UC06 - Administrer les utilisateurs

1. Un administrateur connecte ouvre l'espace Admin.
2. Le backend verifie le role `ADMIN`.
3. L'administrateur consulte la liste des utilisateurs.
4. Il peut creer, modifier, desactiver ou supprimer un compte.

## Exigences non fonctionnelles

### Performance

- Chargement initial rapide via Vite et React.
- Requetes API JSON limitees aux donnees necessaires.
- Index en base sur `subscriptions.user_id` et `subscriptions.category_id`.
- Pagination ou limitation recommandee si le volume de donnees augmente.

### Securite

- Mots de passe haches avec bcrypt.
- JWT stocke dans un cookie HTTP-only.
- Token absent du localStorage.
- Validation des entrees avec Zod.
- Routes privees protegees par middleware d'authentification.
- Routes admin protegees par middleware de role.
- Rate limiting sur les routes sensibles d'authentification.
- En-tetes de securite avec Helmet.
- CORS limite aux origines configurees.
- Secret JWT fort obligatoire en production.

### Accessibilite

- Interface responsive mobile et desktop.
- Champs de formulaire labels et messages d'erreur lisibles.
- Contrastes coherents avec une interface claire.
- Navigation possible par controles standards.
- Langues francais et anglais disponibles.

### Maintenabilite

- Separation frontend/backend.
- Architecture backend par routes, controllers, services, validators et middlewares.
- Schema Prisma centralise.
- Tests automatises backend et frontend.
- Documentation versionnee dans le depot.
