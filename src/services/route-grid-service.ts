import { apiFetch } from "@/lib/api-client";
import type { ListParams, Paginated, RouteGridEntry, Single } from "@/types/api";

export interface RouteGridEntryInput {
  origin_city_id?: string;
  destination_city_id?: string;
  company_name?: string | null;
  price: number;
  distance_km?: number | null;
  duration_minutes?: number | null;
  departure_times?: string[];
  notes?: string | null;
  is_active?: boolean;
}

// --- Public : consultation par le voyageur ------------------------------------------------

/** Lignes actives d'une liaison, de la moins chere a la plus chere. */
export async function search(origin: string, destination: string): Promise<RouteGridEntry[]> {
  return (await apiFetch<{ data: RouteGridEntry[] }>("/route-grid/search", { query: { origin, destination } })).data;
}

// --- Administration (permission platform.manage) ---------------------------------------------

export function list(params: ListParams & { is_active?: boolean } = {}): Promise<Paginated<RouteGridEntry>> {
  return apiFetch<Paginated<RouteGridEntry>>("/route-grid", { query: { ...params } });
}

export async function create(input: RouteGridEntryInput): Promise<RouteGridEntry> {
  return (await apiFetch<Single<RouteGridEntry>>("/route-grid", { method: "POST", body: input })).data;
}

export async function update(id: string, input: Partial<RouteGridEntryInput>): Promise<RouteGridEntry> {
  return (await apiFetch<Single<RouteGridEntry>>(`/route-grid/${id}`, { method: "PATCH", body: input })).data;
}

export async function remove(id: string): Promise<void> {
  await apiFetch(`/route-grid/${id}`, { method: "DELETE" });
}
