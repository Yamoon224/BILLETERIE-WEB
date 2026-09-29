import type { ComponentType } from "react";
import {
  IconBuilding,
  IconChat,
  IconDashboard,
  IconHome,
  IconSparkle,
  IconUsers,
  IconWallet,
} from "@/components/ui/icons";
import type { IconProps } from "@/components/ui/icons";

/**
 * Navigation de la console d'administration.
 *
 * Une seule liste plate, sans groupes : sept ecrans, tous reserves au role
 * `platform_admin` (voir src/app/admin/layout.tsx). Contrairement a
 * `nav-config.ts`, aucun filtrage par permission n'est necessaire ici - qui
 * atteint cette coquille les a deja toutes.
 */
export interface AdminNavItem {
  href: string;
  label: string;
  icon: ComponentType<IconProps>;
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { href: "/admin", label: "Vue d'ensemble", icon: IconDashboard },
  { href: "/admin/companies", label: "Compagnies", icon: IconBuilding },
  { href: "/admin/partners", label: "Partenaires", icon: IconHome },
  { href: "/admin/agents", label: "Agents guichet", icon: IconUsers },
  { href: "/admin/sms", label: "SMS Box", icon: IconChat },
  { href: "/admin/promotions", label: "Offres & Promos", icon: IconSparkle },
  { href: "/admin/finances", label: "Finances", icon: IconWallet },
];

export function findAdminNavItem(pathname: string): AdminNavItem | undefined {
  return [...ADMIN_NAV_ITEMS]
    .sort((a, b) => b.href.length - a.href.length)
    .find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
}
