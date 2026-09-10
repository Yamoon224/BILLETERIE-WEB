import { apiFetch } from "@/lib/api-client";
import type { CityRef, ListParams, Paginated, SeatMap, Single, Trip, TripStatus } from "@/types/api";

export interface TripSearchParams {
  origin: string;
  destination: string;
  date: string;
  passengers?: number;
  only_available?: boolean;
}

export interface TripInput {
  itinerary_id: string;
  vehicle_id: string;
  departure_station_id: string;
  arrival_station_id: string;
  departs_at: string;
  arrives_at?: string | null;
  price?: number | null;
}

// --- Parcours voyageur (public) ------------------------------------------------

export async function cityOptions(): Promise<CityRef[]> {
  return (await apiFetch<{ data: CityRef[] }>("/cities/options")).data;
}

export async function search(params: TripSearchParams): Promise<Trip[]> {
  return (await apiFetch<{ data: Trip[] }>("/trips/search", { query: { ...params } })).data;
}

export async function seatMap(tripId: string): Promise<SeatMap> {
  return (await apiFetch<Single<SeatMap>>(`/trips/${tripId}/seat-map`)).data;
}

// --- Exploitation ------------------------------------------------------------------

export function list(
  params: ListParams & { status?: TripStatus | ""; from?: string; to?: string; itinerary_id?: string } = {},
): Promise<Paginated<Trip>> {
  return apiFetch<Paginated<Trip>>("/trips", { query: { ...params } });
}

export async function find(id: string): Promise<Trip> {
  return (await apiFetch<Single<Trip>>(`/trips/${id}`)).data;
}

export async function create(input: TripInput): Promise<Trip> {
  return (await apiFetch<Single<Trip>>("/trips", { method: "POST", body: input })).data;
}

export async function cancel(id: string, reason: string): Promise<Trip> {
  return (await apiFetch<Single<Trip>>(`/trips/${id}/cancel`, { method: "POST", body: { reason } })).data;
}

export async function changeStatus(id: string, status: TripStatus): Promise<Trip> {
  return (await apiFetch<Single<Trip>>(`/trips/${id}/status`, { method: "POST", body: { status } })).data;
}
