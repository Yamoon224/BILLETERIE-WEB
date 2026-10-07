import { apiFetch } from "../lib/api-client";
import type { Apartment, ListingStatus, Paginated } from "../types/api";

/**
 * Catalogue des appartements (permission housing.view) : toutes les fiches
 * pour la Console Admin, celles de son partenaire pour l'Espace Partenaires -
 * le cloisonnement est applique par l'API, pas par un filtre envoye d'ici.
 */
export function list(
  params: { search?: string; is_active?: boolean; status?: ListingStatus; per_page?: number; page?: number } = {},
): Promise<Paginated<Apartment>> {
  return apiFetch<Paginated<Apartment>>("/apartments", { query: { ...params } });
}
