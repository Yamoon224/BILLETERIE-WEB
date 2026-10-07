import type { AuthenticatedUser } from "@kaara/shared/types/api";

/** Nom de cet espace, tel qu'il se lit apres « acces a ». */
export const SPACE_LABEL = "l'Espace Partenaires";

/**
 * L'Espace Partenaires accueille les gestionnaires de partenaire (residences
 * meublees, location de vehicules). Simple aiguillage d'interface : l'API
 * cloisonne de toute facon chaque appel au partenaire du jeton.
 */
export function belongsHere(user: AuthenticatedUser): boolean {
  return user.roles.includes("partner_manager");
}
