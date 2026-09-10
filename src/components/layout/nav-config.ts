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
} from "@/components/ui/icons";
import type { IconProps } from "@/components/ui/icons";

/**
 * Navigation de l'espace connecte.
 *
 * Chaque entree porte la permission qui la rend utile : afficher un lien qui
 * menera a un 403 est une mauvaise experience, et masquer ce qu'un role ne
 * peut pas faire clarifie son perimetre. Un agent de guichet voit trois
 * entrees, pas douze.
 */
export interface NavItem {
  href: string;
  label: string;
  description: string;
  permission: string;
  icon: ComponentType<IconProps>;
  group: "Activite" | "Exploitation" | "Referentiel" | "Administration";
}

export const NAV_ITEMS: NavItem[] = [
  {
    href: "/espace",
    label: "Tableau de bord",
    description: "Ventes, recettes par moyen de paiement, remplissage",
    permission: "reports.view",
    icon: IconDashboard,
    group: "Activite",
  },
  {
    href: "/espace/guichet",
    label: "Guichet",
    description: "Vente au comptoir, en ligne ou hors ligne",
    permission: "sales.create",
    icon: IconWallet,
    group: "Activite",
  },
  {
    href: "/espace/embarquement",
    label: "Embarquement",
    description: "Controle des billets a la porte du car",
    permission: "tickets.validate",
    icon: IconScan,
    group: "Activite",
  },
  {
    href: "/espace/reservations",
    label: "Reservations",
    description: "Toutes les ventes, en ligne et au guichet",
    permission: "bookings.view",
    icon: IconTicket,
    group: "Exploitation",
  },
  {
    href: "/espace/departs",
    label: "Departs",
    description: "Programmation des horaires et suivi des departs",
    permission: "trips.view",
    icon: IconCalendar,
    group: "Exploitation",
  },
  {
    href: "/espace/itineraires",
    label: "Itineraires",
    description: "Liaisons exploitees et tarifs de reference",
    permission: "network.view",
    icon: IconRoute,
    group: "Referentiel",
  },
  {
    href: "/espace/vehicules",
    label: "Vehicules",
    description: "Parc, capacite et plan de salle",
    permission: "network.view",
    icon: IconBus,
    group: "Referentiel",
  },
  {
    href: "/espace/gares",
    label: "Gares",
    description: "Gares routieres et points d'embarquement",
    permission: "network.view",
    icon: IconMapPin,
    group: "Referentiel",
  },
  {
    href: "/espace/villes",
    label: "Villes",
    description: "Villes desservies, partagees par toutes les compagnies",
    permission: "platform.manage",
    icon: IconCity,
    group: "Referentiel",
  },
  {
    href: "/espace/compagnies",
    label: "Compagnies",
    description: "Partenaires et commissions",
    permission: "network.view",
    icon: IconBuilding,
    group: "Administration",
  },
  {
    href: "/espace/utilisateurs",
    label: "Utilisateurs",
    description: "Comptes, roles et separation des taches",
    permission: "users.view",
    icon: IconUsers,
    group: "Administration",
  },
  {
    href: "/espace/journal",
    label: "Journal d'audit",
    description: "Qui a change quoi, et quand",
    permission: "audit.view",
    icon: IconHistory,
    group: "Administration",
  },
];

export function findNavItem(pathname: string): NavItem | undefined {
  // L'entree la plus specifique l'emporte : « /espace » ne doit pas capter
  // « /espace/guichet ».
  return [...NAV_ITEMS]
    .sort((a, b) => b.href.length - a.href.length)
    .find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
}
