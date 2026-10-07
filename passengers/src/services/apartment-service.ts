import { apiFetch } from "@kaara/shared/lib/api-client";
import type { ReadOptions } from "@kaara/shared/lib/api-client";
import type { Apartment, Paginated } from "@kaara/shared/types/api";

export interface ApartmentSearchParams {
  city_id?: string;
  neighborhood?: string;
  capacity?: number;
  min_price?: number;
  max_price?: number;
  is_featured?: boolean;
  search?: string;
  per_page?: number;
  page?: number;
}

/** Recherche publique : uniquement les fiches actives, parcourable sans compte. */
export function search(params: ApartmentSearchParams = {}, read: ReadOptions = {}): Promise<Paginated<Apartment>> {
  return apiFetch<Paginated<Apartment>>("/apartments/search", { query: { ...params }, ...read });
}
