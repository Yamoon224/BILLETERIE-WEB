import type { ComponentType } from "react";
import {
  IconBuilding,
  IconBus,
  IconCalendar,
  IconCity,
  IconDashboard,
  IconHistory,
  IconMapPin,
  IconRoute,
  IconScan,
  IconTicket,
  IconUsers,
  IconWallet,
} from "@kaara/shared/components/ui/icons";
import type { IconProps } from "@kaara/shared/components/ui/icons";

/**
 * Navigation des espaces connectes.
 *
 * Chaque entree porte la permission qui la rend utile : afficher un lien qui
 * menera a un 403 est une mauvaise experience, et masquer ce qu'un role ne
 * peut pas faire clarifie son perimetre.
 *
 * Les ecrans d'exploitation sont communs a plusieurs espaces, mais chacun les
 * range a ses propres adresses : ce catalogue decrit les ecrans une fois, et
 * chaque espace dit seulement ou il les sert (voir `navItems`).
 */
export type NavGroup = "Activite" | "Exploitation" | "Referentiel" | "Administration";

export interface NavItem {
  href: string;
  label: string;
  description: string;
  permission: string;
  icon: ComponentType<IconProps>;
  group: NavGroup;
}

const SCREENS = {
  activity: {
    label: "Tableau de bord",
    description: "Ventes, recettes par moyen de paiement, remplissage",
    permission: "reports.view",
    icon: IconDashboard,
    group: "Activite",
  },
  counter: {
    label: "Guichet",
    description: "Vente au comptoir, en ligne ou hors ligne",
    permission: "sales.create",
    icon: IconWallet,
    group: "Activite",
  },
  boarding: {
    label: "Embarquement",
    description: "Controle des billets a la porte du car",
    permission: "tickets.validate",
    icon: IconScan,
    group: "Activite",
  },
  bookings: {
    label: "Reservations",
    description: "Toutes les ventes, en ligne et au guichet",
    permission: "bookings.view",
    icon: IconTicket,
    group: "Exploitation",
  },
  departures: {
    label: "Departs",
    description: "Programmation des horaires et suivi des departs",
    permission: "trips.view",
    icon: IconCalendar,
    group: "Exploitation",
  },
  routes: {
    label: "Itineraires",
    description: "Liaisons exploitees et tarifs de reference",
    permission: "network.view",
    icon: IconRoute,
    group: "Referentiel",
  },
  vehicles: {
    label: "Vehicules",
    description: "Parc, capacite et plan de salle",
    permission: "network.view",
    icon: IconBus,
    group: "Referentiel",
  },
  stations: {
    label: "Gares",
    description: "Gares routieres et points d'embarquement",
    permission: "network.view",
    icon: IconMapPin,
    group: "Referentiel",
  },
  cities: {
    label: "Villes",
    description: "Villes desservies, partagees par toutes les compagnies",
    permission: "platform.manage",
    icon: IconCity,
    group: "Referentiel",
  },
  routeGrid: {
    label: "Grille des trajets",
    description: "Prix, horaires et durees affiches avant l'ouverture a la vente",
    permission: "platform.manage",
    icon: IconRoute,
    group: "Referentiel",
  },
  companies: {
    label: "Compagnies",
    description: "Partenaires et commissions",
    permission: "network.view",
    icon: IconBuilding,
    group: "Administration",
  },
  users: {
    label: "Utilisateurs",
    description: "Comptes, roles et separation des taches",
    permission: "users.view",
    icon: IconUsers,
    group: "Administration",
  },
  auditLog: {
    label: "Journal d'audit",
    description: "Qui a change quoi, et quand",
    permission: "audit.view",
    icon: IconHistory,
    group: "Administration",
  },
} satisfies Record<string, Omit<NavItem, "href">>;

export type ScreenKey = keyof typeof SCREENS;

/**
 * Navigation d'un espace : les ecrans qu'il sert, a l'adresse ou il les sert.
 * L'ordre est celui du catalogue, identique d'un espace a l'autre.
 */
export function navItems(routes: Partial<Record<ScreenKey, string>>): NavItem[] {
  return (Object.keys(SCREENS) as ScreenKey[]).flatMap((key) => {
    const href = routes[key];
    return href ? [{ ...SCREENS[key], href }] : [];
  });
}

export function findNavItem<T extends { href: string }>(items: T[], pathname: string): T | undefined {
  // L'entree la plus specifique l'emporte : « /manage » ne doit pas capter
  // « /manage/bookings ».
  return [...items]
    .sort((a, b) => b.href.length - a.href.length)
    .find((item) => pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`)));
}
