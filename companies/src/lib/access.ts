import type { AuthenticatedUser } from "@kaara/shared/types/api";

/** Nom de cet espace, tel qu'il se lit apres « acces a ». */
export const SPACE_LABEL = "l'Espace Compagnies";

/**
 * L'Espace Compagnies accueille les gestionnaires de compagnie. Simple
 * aiguillage d'interface : l'API cloisonne de toute facon chaque appel a la
 * compagnie du jeton.
 */
export function belongsHere(user: AuthenticatedUser): boolean {
  return user.roles.includes("company_manager");
}
