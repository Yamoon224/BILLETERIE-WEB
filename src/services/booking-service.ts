import { apiFetch, buildUrl } from "@/lib/api-client";
import type {
  Booking,
  BookingChannel,
  BookingStatus,
  ListParams,
  MobileMoneyProvider,
  Paginated,
  PassengerInput,
  Payment,
  PaymentMethod,
  Single,
  Ticket,
} from "@/types/api";

export interface BookingInput {
  trip_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  passengers: PassengerInput[];
}

export interface CounterSaleInput extends BookingInput {
  payment_method: PaymentMethod;
  payment_provider?: MobileMoneyProvider | null;
  payer_msisdn?: string | null;
  station_id?: string | null;
  client_reference?: string | null;
  notes?: string | null;
}

export interface OfflineSaleInput extends Omit<CounterSaleInput, "payment_provider" | "client_reference"> {
  client_reference: string;
  sold_at: string;
}

export interface OfflineSyncResult {
  summary: { total: number; accepted: number; duplicate: number; rejected: number };
  results: Array<{
    client_reference: string;
    status: "accepted" | "duplicate" | "rejected";
    booking_reference?: string;
    booking_id?: string;
    error_code?: string;
    message?: string;
  }>;
}

// --- Parcours voyageur ---------------------------------------------------------------

export async function reserve(input: BookingInput): Promise<Booking> {
  return (await apiFetch<Single<Booking>>("/bookings", { method: "POST", body: input })).data;
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

// --- Espace connecte ----------------------------------------------------------------------

export function list(
  params: ListParams & { status?: BookingStatus | ""; channel?: BookingChannel | ""; trip_id?: string } = {},
): Promise<Paginated<Booking>> {
  return apiFetch<Paginated<Booking>>("/bookings", { query: { ...params } });
}

export async function find(id: string): Promise<Booking> {
  return (await apiFetch<Single<Booking>>(`/bookings/${id}`)).data;
}

export async function cancel(id: string, reason?: string): Promise<Booking> {
  return (await apiFetch<Single<Booking>>(`/bookings/${id}/cancel`, { method: "POST", body: { reason } })).data;
}

export async function counterSale(input: CounterSaleInput): Promise<{ booking: Booking; payment: Payment }> {
  return (
    await apiFetch<Single<{ booking: Booking; payment: Payment }>>("/counter-sales", { method: "POST", body: input })
  ).data;
}

export async function syncOfflineSales(sales: OfflineSaleInput[]): Promise<OfflineSyncResult> {
  return (await apiFetch<Single<OfflineSyncResult>>("/offline-sales/sync", { method: "POST", body: { sales } })).data;
}

export async function manifest(tripId: string): Promise<Ticket[]> {
  return (await apiFetch<{ data: Ticket[] }>(`/trips/${tripId}/manifest`)).data;
}
