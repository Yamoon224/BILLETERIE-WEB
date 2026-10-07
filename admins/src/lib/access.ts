import type { AuthenticatedUser } from "@kaara/shared/types/api";

/** Nom de cet espace, tel qu'il se lit apres « acces a ». */
export const SPACE_LABEL = "la Console Admin";

/**
 * La Console Admin est reservee au role `platform_admin` : la supervision
 * globale - compagnies, partenaires, finances de la plateforme - n'a rien a
 * faire dans les mains d'un gestionnaire ou d'un agent, meme en lecture.
 * Simple aiguillage d'interface : l'API applique la regle sur chaque route.
 */
export function belongsHere(user: AuthenticatedUser): boolean {
  return user.roles.includes("platform_admin");
}
