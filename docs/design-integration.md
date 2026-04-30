# Intégration des designs

## État d'intégration

| Zone | Design source | État | Connexion fonctionnelle |
|---|---|---:|---:|
| Connexion / inscription | `react-app(1).js` | Intégré | Oui |
| Dashboard mobile | `react-app(2).js` | Intégré | Oui |
| Dashboard desktop | `react-app(9/11/12).js` | Intégré | Oui |
| Abonnements | `react-app(7/10).js` | Intégré | Oui |
| Add/Edit subscription | `react-app(7/10).js` | Intégré | Oui |
| Analytics | `react-app(3/4).js` | Intégré | Oui |
| Admin | `react-app(5).js` | Intégré | Oui |
| Profile | `react-app(13).js` | Hors scope v1 | Non |
| Payment Methods | `react-app(6/8).js` | Hors scope v1 | Non |
| Admin Settings | Design admin desktop | Hors scope v1 | Non |

## Fonctions reliées

| Fonction | Route / source | État |
|---|---|---:|
| Login | `POST /api/auth/login` | Reliée |
| Register | `POST /api/auth/register` | Reliée |
| Logout | `POST /api/auth/logout` | Reliée |
| Total mensuel | `GET /api/subscriptions` | Reliée |
| Total annuel estimé | Calcul frontend | Reliée |
| Prochains renouvellements | `GET /api/subscriptions` | Reliée |
| Liste abonnements | `GET /api/subscriptions` | Reliée |
| Recherche | query `search` | Reliée |
| Filtre statut | query `status` | Reliée |
| Ajout abonnement | `POST /api/subscriptions` | Reliée |
| Modification abonnement | `PUT /api/subscriptions/:id` | Reliée |
| Archivage abonnement | `DELETE /api/subscriptions/:id` | Reliée |
| Catégories | `GET /api/categories` | Reliée |
| Stats catégories | Calcul frontend | Reliée |
| Top coûts | Calcul frontend | Reliée |
| Admin utilisateurs | `GET /api/admin/users` | Reliée |
| Admin création utilisateur | `POST /api/admin/users` | Reliée |
| Admin modification rôle/statut | `PUT /api/admin/users/:id` | Reliée |
| Admin suppression utilisateur | `DELETE /api/admin/users/:id` | Reliée |
| Admin abonnements globaux | `GET /api/admin/subscriptions` | Reliée |

## Fonctions non reliées

| Fonction design | Décision |
|---|---|
| Payment Methods | Masquée en v1, pas de table backend |
| Profile edit | Masquée en v1, pas de route backend dédiée |
| Admin Settings | Masquée en v1, pas de route backend dédiée |
| Upgrade to Pro | Supprimée, hors cahier des charges |
| Forgot password | Non affichée, pas de flux backend |

## Choix techniques

- Le backend n'a pas été modifié.
- Le frontend reste en React/Vite/Tailwind.
- Le système reste basé sur des onglets internes, sans React Router.
- Les pages principales sont découpées en composants pour faciliter la maintenance.
- Les fonctions non supportées par l'API ne sont pas présentes dans la navigation.
