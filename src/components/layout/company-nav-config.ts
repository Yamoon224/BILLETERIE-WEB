export interface CompanyNavItem {
  href: string;
  label: string;
}

/** Onglets de l'Espace Compagnies - trois ecrans, pas de sous-navigation. */
export const COMPANY_NAV_ITEMS: CompanyNavItem[] = [
  { href: "/company", label: "Tableau de bord" },
  { href: "/company/lines", label: "Mes lignes" },
  { href: "/company/bookings", label: "Reservations" },
];
