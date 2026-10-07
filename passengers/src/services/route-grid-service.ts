import { apiFetch, CACHE } from "@kaara/shared/lib/api-client";
import type { RouteGridEntry } from "@kaara/shared/types/api";

/**
 * Lignes actives d'une liaison pas encore reservable en ligne, de la moins
 * chere a la plus chere. Une vitrine editee a la main par l'administration :
 * elle se memorise sans risque.
 */
export async function search(origin: string, destination: string): Promise<RouteGridEntry[]> {
  return (await apiFetch<{ data: RouteGridEntry[] }>("/route-grid/search", { query: { origin, destination }, cacheFor: CACHE.reference })).data;
}
