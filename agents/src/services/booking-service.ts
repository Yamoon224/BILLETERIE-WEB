import { apiFetch } from "@kaara/shared/lib/api-client";
import type { Booking, MobileMoneyProvider, PassengerInput, Payment, PaymentMethod, Single, Ticket } from "@kaara/shared/types/api";

export interface CounterSaleInput {
  trip_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  passengers: PassengerInput[];
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

// --- Guichet (permission sales.create) -----------------------------------------------

export async function counterSale(input: CounterSaleInput): Promise<{ booking: Booking; payment: Payment }> {
  return (
    await apiFetch<Single<{ booking: Booking; payment: Payment }>>("/counter-sales", { method: "POST", body: input })
  ).data;
}

/** Lots de 100 au plus : la limite de l'API, qui borne la duree d'une transaction. */
export async function syncOfflineSales(sales: OfflineSaleInput[]): Promise<OfflineSyncResult> {
  return (await apiFetch<Single<OfflineSyncResult>>("/offline-sales/sync", { method: "POST", body: { sales } })).data;
}

// --- Embarquement (permission tickets.validate) ---------------------------------------

/** Liste d'embarquement d'un depart : tous ses billets, pour controler meme sans reseau. */
export async function manifest(tripId: string): Promise<Ticket[]> {
  return (await apiFetch<{ data: Ticket[] }>(`/trips/${tripId}/manifest`)).data;
}
