import type { AuthenticatedUser } from "@kaara/shared/types/api";

/** Nom de cet espace, tel qu'il se lit apres « acces a ». */
export const SPACE_LABEL = "l'Espace Agents";

export const canSell = (user: AuthenticatedUser) => user.permissions.includes("sales.create");
export const canBoard = (user: AuthenticatedUser) => user.permissions.includes("tickets.validate");

/**
 * L'Espace Agents accueille quiconque peut vendre au guichet ou controler a
 * l'embarquement. Il se decide sur les permissions plutot que sur le seul
 * role `agent` : les roles sont cumulables, et un gestionnaire qui tient
 * aussi le guichet doit pouvoir y vendre. Simple aiguillage d'interface :
 * l'autorisation reelle reste appliquee par l'API sur chaque route.
 */
export function belongsHere(user: AuthenticatedUser): boolean {
  return canSell(user) || canBoard(user);
}

/** Poste complet (barre laterale) : guichet, embarquement, reservations, departs. */
export const DESK = {
  counter: "/desk/counter",
  boarding: "/desk/boarding",
  bookings: "/desk/bookings",
  departures: "/desk/departures",
  profile: "/desk/profile",
} as const;

/**
 * Premier ecran de la journee : le guichet tablette pour qui vend, le
 * controle des billets pour qui ne fait qu'embarquer.
 */
export function homeFor(user: AuthenticatedUser): string {
  return canSell(user) ? "/" : DESK.boarding;
}
