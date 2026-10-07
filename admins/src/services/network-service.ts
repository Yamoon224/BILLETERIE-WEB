import { apiFetch } from "@kaara/shared/lib/api-client";
import type { City, Company, Single } from "@kaara/shared/types/api";

// Le referentiel commun (compagnies, gares, vehicules, itineraires), complete
// ci-dessous de ce que seule l'administration de plateforme peut faire.
export * from "@kaara/shared/services/network-service";

export interface CityInput {
  name: string;
  region?: string | null;
  is_active?: boolean;
}

/** Validation ou rejet d'une compagnie en attente (permission platform.manage). */
export async function changeCompanyStatus(id: string, status: "active" | "rejected"): Promise<Company> {
  return (await apiFetch<Single<Company>>(`/companies/${id}/status`, { method: "POST", body: { status } })).data;
}

// --- Villes : referentiel partage par toutes les compagnies (platform.manage) -------------

export async function createCity(input: CityInput): Promise<City> {
  return (await apiFetch<Single<City>>("/cities", { method: "POST", body: input })).data;
}

export async function updateCity(slug: string, input: Partial<CityInput>): Promise<City> {
  return (await apiFetch<Single<City>>(`/cities/${slug}`, { method: "PATCH", body: input })).data;
}

export async function deleteCity(slug: string): Promise<void> {
  await apiFetch(`/cities/${slug}`, { method: "DELETE" });
}
