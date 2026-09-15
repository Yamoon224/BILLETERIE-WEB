import { apiFetch } from "@/lib/api-client";
import type { Apartment, Paginated } from "@/types/api";

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

// --- Parcours voyageur (public) ------------------------------------------------

export function search(params: ApartmentSearchParams = {}): Promise<Paginated<Apartment>> {
  return apiFetch<Paginated<Apartment>>("/apartments/search", { query: { ...params } });
}
