import { apiFetch, buildUrl } from "@kaara/shared/lib/api-client";
import type { Booking, ListParams, MobileMoneyProvider, Paginated, PassengerInput, Payment, Single } from "@kaara/shared/types/api";

export interface BookingInput {
  trip_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  passengers: PassengerInput[];
  /** Garantie remboursement optionnelle : son cout se deduit cote serveur, jamais de cette valeur. */
  refund_guarantee?: boolean;
}

export async function reserve(input: BookingInput): Promise<Booking> {
  // Des places viennent d'etre prises : les resultats de recherche memorises
  // ne sont plus a jour.
  return (await apiFetch<Single<Booking>>("/bookings", { method: "POST", body: input, invalidates: ["/trips"] })).data;
}

export async function findByReference(reference: string): Promise<Booking> {
  return (await apiFetch<Single<Booking>>(`/bookings/reference/${encodeURIComponent(reference.trim())}`)).data;
}

export async function payWithMobileMoney(
  bookingId: string,
  provider: MobileMoneyProvider,
  payerMsisdn: string,
): Promise<{ payment: Payment; booking: Booking }> {
  return (
    await apiFetch<Single<{ payment: Payment; booking: Booking }>>(`/bookings/${bookingId}/payments`, {
      method: "POST",
      body: { provider, payer_msisdn: payerMsisdn },
    })
  ).data;
}

/** URL du QR code d'un billet, servi en SVG par l'API. */
export function ticketQrUrl(code: string): string {
  return buildUrl(`/tickets/${encodeURIComponent(code)}/qr`);
}

/** Reservations du voyageur connecte. */
export function mine(params: ListParams = {}): Promise<Paginated<Booking>> {
  return apiFetch<Paginated<Booking>>("/me/bookings", { query: { ...params } });
}
