import { apiFetch, CACHE } from "@kaara/shared/lib/api-client";
import type { CityRef, Trip } from "@kaara/shared/types/api";

export { seatMap } from "@kaara/shared/services/trip-service";

export interface TripSearchParams {
  origin: string;
  destination: string;
  date: string;
  passengers?: number;
  only_available?: boolean;
}

/**
 * Villes desservies. Demandees par chaque formulaire de recherche et par
 * plusieurs ecrans de resultats : memorisees, elles ne coutent qu'un appel par
 * visite au lieu d'un par composant.
 */
export async function cityOptions(): Promise<CityRef[]> {
  return (await apiFetch<{ data: CityRef[] }>("/cities/options", { cacheFor: CACHE.reference })).data;
}

/**
 * Departs d'une liaison a une date. Le bandeau de dates interroge aussi les
 * jours voisins pour afficher leur prix : garder ces reponses quelques
 * secondes rend le passage au jour suivant instantane, sans nouvel appel.
 * Les places restent verifiees a la source sur le plan de salle, jamais ici.
 */
export async function search(params: TripSearchParams): Promise<Trip[]> {
  return (await apiFetch<{ data: Trip[] }>("/trips/search", { query: { ...params }, cacheFor: CACHE.search })).data;
}
