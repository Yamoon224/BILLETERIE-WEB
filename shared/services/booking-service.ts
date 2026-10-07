import { apiFetch } from "../lib/api-client";
import type { Booking, BookingChannel, BookingStatus, ListParams, Paginated, Single } from "../types/api";

/**
 * Suivi des reservations dans les espaces connectes (permission
 * bookings.view). La reservation elle-meme, le paiement et la vente au
 * guichet appartiennent aux espaces qui les realisent.
 */
export function list(
  params: ListParams & { status?: BookingStatus | ""; channel?: BookingChannel | ""; trip_id?: string; from?: string; to?: string } = {},
): Promise<Paginated<Booking>> {
  return apiFetch<Paginated<Booking>>("/bookings", { query: { ...params } });
}

export async function find(id: string): Promise<Booking> {
  return (await apiFetch<Single<Booking>>(`/bookings/${id}`)).data;
}

export async function cancel(id: string, reason?: string): Promise<Booking> {
  // Une annulation libere des places : les departs memorises sont perimes.
  return (await apiFetch<Single<Booking>>(`/bookings/${id}/cancel`, { method: "POST", body: { reason }, invalidates: ["/trips"] })).data;
}
