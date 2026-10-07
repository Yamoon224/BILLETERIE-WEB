import { navItems } from "@kaara/shared/components/layout/nav-config";

export interface CompanyNavItem {
  href: string;
  label: string;
}

/** Onglets de l'Espace Compagnies - trois ecrans, pas de sous-navigation. */
export const COMPANY_NAV_ITEMS: CompanyNavItem[] = [
  { href: "/", label: "Tableau de bord" },
  { href: "/lines", label: "Mes lignes" },
  { href: "/bookings", label: "Reservations" },
];

/** Racine de la gestion avancee : la console d'exploitation complete, a barre laterale. */
export const MANAGE_HOME = "/manage";
export const MANAGE_PROFILE = "/manage/profile";

/**
 * Ecrans de la gestion avancee. Ni guichet ni embarquement : un gestionnaire
 * rembourse et annule, et cumuler ces gestes avec la tenue de caisse
 * supprimerait tout controle croise - la vente vit dans l'Espace Agents.
 */
export const MANAGE_NAV_ITEMS = navItems({
  activity: "/manage",
  bookings: "/manage/bookings",
  departures: "/manage/departures",
  routes: "/manage/routes",
  vehicles: "/manage/vehicles",
  stations: "/manage/stations",
  companies: "/manage/company",
  users: "/manage/users",
  auditLog: "/manage/audit-log",
});
