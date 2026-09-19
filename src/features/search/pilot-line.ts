import { config } from "@/lib/config";

/**
 * Vrai pour la ligne pilote, dans les deux sens.
 *
 * Seule cette liaison se reserve en ligne : toute autre recherche affiche la
 * grille des trajets avec « Bientot disponible » (voir RouteGridResults).
 */
export function isPilotLine(origin: string, destination: string): boolean {
  const { origin: a, destination: b } = config.pilotLine;

  return (origin === a && destination === b) || (origin === b && destination === a);
}
