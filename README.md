# Web — Kaara

Interfaces Next.js 16 (App Router, React 19, Tailwind CSS 4) de Kaara : **un
projet par role**, chacun deploye sur son propre sous-domaine, et un socle
commun. Le tout forme un monorepo npm workspaces.

| Dossier | Role | Domaine | Port local |
| --- | --- | --- | --- |
| `passengers/` | Voyageur (`passenger`) | `kaara.ci` | 3000 |
| `companies/` | Gestionnaire de compagnie (`company_manager`) | `companies.kaara.ci` | 3001 |
| `agents/` | Agent de vente (`agent`) | `agents.kaara.ci` | 3002 |
| `admins/` | Administrateur plateforme (`platform_admin`) | `admins.kaara.ci` | 3003 |
| `partners/` | Gestionnaire partenaire (`partner_manager`) | `partners.kaara.ci` | 3004 |
| `shared/` | Socle commun `@kaara/shared` | — (compile par chaque projet) | — |

```bash
npm install                 # une seule fois, a la racine de web/
npm run dev:passengers      # http://localhost:3000   (dev:companies, dev:agents, dev:admins, dev:partners)
npm run build:admins        # build d'un seul projet
npm run check               # lint + types + tests + build de tous les projets
```

Chaque projet lit `NEXT_PUBLIC_API_URL` dans son `.env.local` (voir
`.env.local.example`, par defaut `http://localhost:8000/api`).

L'API doit autoriser l'origine de chaque projet : dans `backend/.env`,
`CORS_ALLOWED_ORIGINS` liste les cinq origines separees par des virgules
(`http://localhost:3000,…,http://localhost:3004` en local, les cinq
sous-domaines en production).

## Ecrans

**passengers** — `/` recherche · `/search` departs · `/booking/[tripId]` plan de
salle et voyageurs · `/tickets/[reference]` paiement puis billets QR ·
`/my-tickets` · `/favorites` · `/profile` · `/apartments` · `/car-rental` ·
`/login` · `/register`

**companies** — `/` tableau de bord du jour · `/lines` · `/bookings` ;
gestion avancee sous `/manage` : activite, `bookings`, `departures`, `routes`,
`vehicles`, `stations`, `company`, `users`, `audit-log`, `profile` · `/login`

**agents** — `/` guichet tablette ; poste complet sous `/desk` : `counter`,
`boarding`, `bookings`, `departures`, `profile` · `/login` (code PIN ou mot de
passe)

**admins** — `/` vue d'ensemble · `/companies` validation ·
`/companies/manage` fiches et commissions · `/partners` · `/agents` · `/sms` ·
`/promotions` · `/finances` · `/activity` · `/bookings` · `/departures` ·
`/routes` · `/vehicles` · `/stations` · `/cities` · `/route-grid` · `/users` ·
`/audit-log` · `/profile` · `/login` (2FA)

**partners** — `/` mes annonces (residences, vehicules) · `/profile` · `/login`

## Sessions

Le jeton est memorise dans le stockage local, donc **par origine** : une session
ouverte sur un sous-domaine n'existe pas sur un autre. Chaque projet porte donc
sa propre page `/login` et n'accueille que les comptes de son role
(`src/lib/access.ts`). Un compte qui se presente au mauvais endroit est
deconnecte avec un message plutot que de tomber sur des ecrans refuses un par
un. L'Espace Agents se decide sur les permissions (`sales.create`,
`tickets.validate`) et non sur le seul role : les roles sont cumulables.

Ce n'est que de l'aiguillage : l'autorisation reelle est appliquee par l'API sur
chaque route.

## Organisation

```text
shared/                 @kaara/shared, importe par `@kaara/shared/...`
  components/ui/        Design system : Card, Modal, champs, DataTable, Badge…
  components/theme/     Theme clair / sombre / systeme, sans flash au chargement
  components/layout/    Barre laterale et en-tete des espaces connectes
  features/             Ecrans communs a plusieurs espaces (reservations, departs,
                        referentiel, comptes, journal, session et connexion)
  services/             Appels d'API communs a plusieurs espaces
  hooks/ lib/ types/    Chargement, mutation, pagination, client API, contrat type
  styles/theme.css      Charte : cyan, jaune, blanc, fuchsia et degrade de marque

<projet>/src/
  app/                  Routes du projet (App Router)
  features/             Ecrans propres a ce role
  services/             Appels d'API propres a ce role + ceux du socle qu'il utilise
  lib/access.ts         Qui a sa place dans cet espace
```

Regle de rangement : ce qui sert a un seul role vit dans son projet ; ce qui
sert a plusieurs vit dans `shared/`. `shared/` n'importe jamais un projet.

## Appels d'API

Un composant ne fait jamais de `fetch` : il appelle un service. Chaque projet
expose dans `src/services/index.ts` **les seuls endpoints qu'il appelle** — le
site voyageur n'embarque aucun appel de back-office.

`shared/lib/api-client.ts` est le point de passage unique (jeton, erreurs
typees, `ApiError.code` = `error_code` du backend) et economise les requetes :

- **lectures simultanees fusionnees** : plusieurs composants qui demandent la
  meme chose au meme instant partagent une seule requete ;
- **cache court sur demande** (`cacheFor`) pour ce qui change rarement : villes
  desservies, listes deroulantes des formulaires, favoris, grille des trajets,
  mises en avant de l'accueil, resultats de recherche (30 s, pour passer d'un
  jour au voisin sans rappeler l'API). Jamais pour un plan de salle ;
- **invalidation par les ecritures** : une ecriture perime les lectures de la
  meme ressource (`POST /stations` → `/stations…`), plus les chemins qu'elle
  declare (`invalidates`) ;
- pas d'appel a `/me` pour un visiteur sans jeton.

## Mode hors ligne (agents)

`agents/src/lib/offline-store.ts` conserve sur le poste les departs du jour, les
plans de salle, les listes d'embarquement, et les ventes et scans realises sans
reseau, chacun avec sa reference client. `hooks/useOfflineQueue.ts` les
synchronise au retour du reseau ; l'API reconnait les rejeux et ne cree aucun
doublon.

Limite assumee du navigateur : la signature des QR codes n'y est pas verifiee
hors ligne (le secret n'est pas embarque dans une page web) ; le controle
s'appuie alors sur la liste d'embarquement en cache, et le serveur reverifie a
la synchronisation.

## Deploiement

Un deploiement par projet, tous depuis ce depot. Sur Vercel : un projet Vercel
par dossier, « Root Directory » = `passengers`, `companies`, etc. ; l'installation
se fait a la racine du monorepo, ce qui rend `shared/` disponible. Variable a
definir sur chacun : `NEXT_PUBLIC_API_URL`.
