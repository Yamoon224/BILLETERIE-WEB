import { apiFetch } from "../lib/api-client";
import type { ListParams, Paginated, SeatMap, Single, Trip, TripStatus } from "../types/api";

export interface TripInput {
  itinerary_id: string;
  vehicle_id: string;
  departure_station_id: string;
  arrival_station_id: string;
  departs_at: string;
  arrives_at?: string | null;
  price?: number | null;
}

/**
 * Plan de salle d'un depart : consulte par le voyageur comme par le guichet.
 * Jamais mis en cache - une place affichee libre alors qu'elle vient d'etre
 * vendue se paie par un refus au moment de payer.
 */
export async function seatMap(tripId: string): Promise<SeatMap> {
  return (await apiFetch<Single<SeatMap>>(`/trips/${tripId}/seat-map`)).data;
}

// --- Exploitation (permissions trips.view / trips.manage) ----------------------------

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
  // Annuler un depart annule ses reservations : les deux listes sont perimees.
  return (await apiFetch<Single<Trip>>(`/trips/${id}/cancel`, { method: "POST", body: { reason }, invalidates: ["/bookings"] })).data;
}

export async function changeStatus(id: string, status: TripStatus): Promise<Trip> {
  return (await apiFetch<Single<Trip>>(`/trips/${id}/status`, { method: "POST", body: { status } })).data;
}
