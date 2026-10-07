import type { ComponentType } from "react";
import { findNavItem, navItems } from "@kaara/shared/components/layout/nav-config";
import {
  IconBuilding,
  IconChat,
  IconDashboard,
  IconHome,
  IconSparkle,
  IconUsers,
  IconWallet,
} from "@kaara/shared/components/ui/icons";
import type { IconProps } from "@kaara/shared/components/ui/icons";

/**
 * Navigation de la Console Admin.
 *
 * Deux familles d'ecrans dans une seule barre : la supervision propre a
 * l'administration (« Console interne »), puis les ecrans d'exploitation
 * communs aux compagnies, vus ici toutes compagnies confondues. Aucun filtrage
 * par permission : qui atteint cette coquille a le role `platform_admin`
 * (voir app/(console)/layout.tsx), donc toutes les permissions.
 */
export interface AdminNavItem {
  href: string;
  label: string;
  icon: ComponentType<IconProps>;
  group: string;
}

const CONSOLE = "Console interne";

/** Ecrans dont l'entree de menu porte une puce « en attente de validation ». */
export const COMPANIES_HREF = "/companies";
export const PARTNERS_HREF = "/partners";
export const PROFILE_HREF = "/profile";

const CONSOLE_ITEMS: AdminNavItem[] = [
  { href: "/", label: "Vue d'ensemble", icon: IconDashboard, group: CONSOLE },
  { href: COMPANIES_HREF, label: "Compagnies", icon: IconBuilding, group: CONSOLE },
  { href: PARTNERS_HREF, label: "Partenaires", icon: IconHome, group: CONSOLE },
  { href: "/agents", label: "Agents guichet", icon: IconUsers, group: CONSOLE },
  { href: "/sms", label: "SMS Box", icon: IconChat, group: CONSOLE },
  { href: "/promotions", label: "Offres & Promos", icon: IconSparkle, group: CONSOLE },
  { href: "/finances", label: "Finances", icon: IconWallet, group: CONSOLE },
];

/** Libelles propres a la console, la ou celui du catalogue commun preterait a confusion. */
const LABEL_OVERRIDES: Record<string, string> = {
  "/activity": "Activite detaillee",
  // « Compagnies » designe deja l'ecran de validation ci-dessus.
  "/companies/manage": "Fiches & commissions",
};

const OPERATIONS_ITEMS: AdminNavItem[] = navItems({
  activity: "/activity",
  bookings: "/bookings",
  departures: "/departures",
  routes: "/routes",
  vehicles: "/vehicles",
  stations: "/stations",
  cities: "/cities",
  routeGrid: "/route-grid",
  companies: "/companies/manage",
  users: "/users",
  auditLog: "/audit-log",
}).map((item) => ({ href: item.href, label: LABEL_OVERRIDES[item.href] ?? item.label, icon: item.icon, group: item.group }));

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [...CONSOLE_ITEMS, ...OPERATIONS_ITEMS];

export const ADMIN_NAV_GROUPS: string[] = [...new Set(ADMIN_NAV_ITEMS.map((item) => item.group))];

export function findAdminNavItem(pathname: string): AdminNavItem | undefined {
  return findNavItem(ADMIN_NAV_ITEMS, pathname);
}
