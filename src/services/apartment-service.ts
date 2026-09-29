import { apiFetch } from "@/lib/api-client";
import type { Apartment, ListingStatus, Paginated, Single } from "@/types/api";

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

// --- Administration : validation des fiches (permission housing.view/manage) --------

export function list(
  params: { search?: string; is_active?: boolean; status?: ListingStatus; per_page?: number; page?: number } = {},
): Promise<Paginated<Apartment>> {
  return apiFetch<Paginated<Apartment>>("/apartments", { query: { ...params } });
}

/** Validation ou rejet d'une fiche en attente, reserve a l'administrateur de plateforme. */
export async function changeStatus(id: string, status: "active" | "rejected"): Promise<Apartment> {
  return (await apiFetch<Single<Apartment>>(`/apartments/${id}/status`, { method: "POST", body: { status } })).data;
}
