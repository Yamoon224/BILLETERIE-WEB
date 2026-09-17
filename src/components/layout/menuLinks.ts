/**
 * Contenu partage entre le tiroir de navigation (SiteHeader) et le pied de
 * page (SiteFooter) : memes libelles, memes textes, une seule source pour
 * eviter que les deux dérivent l'un de l'autre.
 */
export type MenuLinkItem = { kind: "link"; label: string; href: string; badge?: string };
export type MenuInfoItem = { kind: "info"; label: string; title: string; text: string };
export type MenuItem = MenuLinkItem | MenuInfoItem;

export const SERVICE_LINKS: MenuItem[] = [
  { kind: "link", label: "Bus / Car", href: "/", badge: "Actif" },
  { kind: "link", label: "Appartements", href: "/?onglet=appartements", badge: "Actif" },
  { kind: "link", label: "Location auto", href: "/?onglet=location-auto", badge: "Actif" },
  {
    kind: "info",
    label: "Aéroexpress",
    title: "Aéroexpress",
    text: "Liaison rapide entre l'aéroport Félix-Houphouët-Boigny et le centre d'Abidjan. Service en préparation.",
  },
];

export const TRAVELER_LINKS: MenuInfoItem[] = [
  {
    kind: "info",
    label: "Chèques cadeaux",
    title: "Chèques cadeaux",
    text: "Offrez un trajet Kaara à un proche. Les chèques cadeaux seront bientôt disponibles à l'achat directement sur l'application.",
  },
  {
    kind: "info",
    label: "Programme de fidélité",
    title: "Programme de fidélité",
    text: "Cumulez des points à chaque trajet réservé et échangez-les contre des réductions. Lancement prévu en phase 2 de la feuille de route Kaara.",
  },
  {
    kind: "info",
    label: "Guide des destinations",
    title: "Guide des destinations",
    text: "Des guides pratiques pour découvrir Assinie, Grand-Bassam, Yamoussoukro et bien d'autres destinations ivoiriennes arrivent bientôt sur Kaara.",
  },
];

export const PARTNER_LINKS: MenuInfoItem[] = [
  {
    kind: "info",
    label: "Devenir partenaire",
    title: "Devenir partenaire",
    text: "Compagnies de transport, propriétaires de résidences ou loueurs de véhicules : rejoignez Kaara et touchez des milliers de voyageurs chaque mois.",
  },
  {
    kind: "info",
    label: "Ajouter votre compagnie ou résidence",
    title: "Ajouter votre compagnie ou résidence",
    text: "Référencez vos lignes, votre résidence meublée ou votre véhicule de location sur Kaara. L'espace partenaires en libre-service arrive bientôt.",
  },
  {
    kind: "info",
    label: "Publicité sur Kaara",
    title: "Publicité sur Kaara",
    text: "Mettez en avant votre offre auprès de nos utilisateurs grâce aux espaces publicitaires « À la une » de l'application.",
  },
  {
    kind: "info",
    label: "Programme d'affiliation",
    title: "Programme d'affiliation",
    text: "Recommandez Kaara autour de vous et percevez une commission sur chaque réservation générée grâce à votre lien.",
  },
];

export const HELP_LINKS: MenuInfoItem[] = [
  {
    kind: "info",
    label: "Centre d'aide",
    title: "Centre d'aide",
    text: "Consultez nos réponses aux questions fréquentes sur la réservation, le paiement Mobile Money et l'utilisation du billet électronique.",
  },
  {
    kind: "info",
    label: "Nous contacter",
    title: "Nous contacter",
    text: "Une question ? Écrivez-nous par WhatsApp ou par email : notre équipe vous répond sous 24h.",
  },
];
