# Web — Kaara

Application Next.js 16 (App Router, React 19, Tailwind CSS 4) de la billetterie
interurbaine.

```bash
cp .env.local.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:8000/api
npm install
npm run dev                        # http://localhost:3000
npm run check                      # lint + types + tests + build
```

## Ecrans

| Route | Public | Role |
|---|---|---|
| `/` | Voyageur | Recherche de trajet |
| `/recherche` | Voyageur | Departs du jour, bandeau de dates voisines |
| `/reservation/[tripId]` | Voyageur | Plan de salle, voyageurs, coordonnees |
| `/billets/[reference]` | Voyageur | Paiement mobile money, puis billets QR |
| `/mes-billets` | Voyageur | Retrouver une reservation |
| `/espace` | Gestionnaire, admin | Tableau de bord et exports |
| `/espace/guichet` | Agent | Vente au comptoir, en ligne ou hors ligne |
| `/espace/embarquement` | Agent | Controle des billets (camera ou saisie), hors ligne compris |
| `/espace/departs`, `/reservations` | Gestionnaire | Exploitation |
| `/espace/vehicules`, `/itineraires`, `/gares`, `/villes`, `/compagnies` | Gestionnaire, admin | Referentiel |
| `/espace/utilisateurs`, `/journal`, `/profil` | Selon permissions | Administration |

## Organisation

```text
src/
  app/                 Routes (App Router) : (public)/ pour le voyageur, espace/ pour l'exploitation
  components/
    ui/                Design system : Card, Modal, champs flottants, DataTable, Badge…
    theme/             Theme clair / sombre / systeme, sans flash au chargement
    layout/            En-tetes, barre laterale, navigation par permission
    brand/             Logo
  features/<domaine>/  Ecrans et composants metier, un dossier par domaine
  services/            Seuls modules autorises a connaitre les URL de l'API, un par domaine backend
  hooks/               Chargement, mutation, pagination, file hors ligne, preferences
  lib/                 Client API, formatage, stockage hors ligne, libelles
  types/api.ts         Contrat d'API type, aligne sur la specification OpenAPI
```

Separation des responsabilites : un composant ne fait jamais de `fetch`
(il appelle un service), un service ne touche jamais au DOM, et le client API est
le seul a gerer le jeton et la traduction des erreurs (`ApiError.code` reprend
l'`error_code` stable du backend).

## Charte

- **Orange du drapeau ivoirien** (`#F77F00`) decline en rampe `brand-50…900`,
  degrade diagonal pour l'action principale ; **blanc** pour les surfaces. Le
  vert du drapeau est reserve aux etats de succes.
- Cartes, modales, boutons et champs en **`rounded-sm`**.
- **Champs a libelle flottant** : contour porte par un `<fieldset>`/`<legend>`,
  sans double trait quel que soit le fond (`globals.css`, `components/ui/Field.tsx`).
- **Theme clair / sombre / systeme**, applique avant le premier rendu par un
  script inline (`components/theme/theme-script.tsx`).
- Mobile d'abord : modales ancrees en bas sur telephone, barre de validation
  collee sous le pouce, tableaux defilant dans leur propre conteneur.
- Graphiques du tableau de bord en SVG/CSS sans librairie, palette categorielle
  validee pour le daltonisme dans les deux themes, valeurs toujours lisibles sans
  survol.

## Mode hors ligne

`lib/offline-store.ts` conserve sur le poste les departs du jour, les plans de
salle, les listes d'embarquement, et les ventes et scans realises sans reseau,
chacun avec sa reference client. `hooks/useOfflineQueue.ts` les synchronise au
retour du reseau ; l'API reconnait les rejeux et ne cree aucun doublon.

Limite assumee du navigateur : la signature des QR codes n'y est pas verifiee hors
ligne (le secret n'est pas embarque dans une page web) ; le controle s'appuie alors
sur la liste d'embarquement en cache, et le serveur reverifie a la synchronisation.
# BILLETERIE-WEB
