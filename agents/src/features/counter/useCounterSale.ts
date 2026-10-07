"use client";

import { useCallback, useMemo, useState } from "react";
import { useAsyncData } from "@kaara/shared/hooks/useAsyncData";
import { useOfflineQueue } from "@/hooks/useOfflineQueue";
import { ApiError, NetworkError } from "@kaara/shared/lib/api-client";
import { formatTime, todayIso } from "@kaara/shared/lib/format";
import { cachedSeatMap, cachedTrips, cacheSeatMap, cacheTrips, enqueueSale, newClientReference } from "@/lib/offline-store";
import { bookingService, tripService } from "@/services";
import type { Booking, MobileMoneyProvider, PaymentMethod, SeatMap, Trip } from "@kaara/shared/types/api";

export type Receipt =
  | { kind: "online"; booking: Booking; method: PaymentMethod }
  | { kind: "offline"; clientReference: string; tripLabel: string; seats: string[]; total: number; customer: string };

export function tripLabel(trip: Trip): string {
  return `${formatTime(trip.departs_at)} · ${trip.itinerary?.origin_city?.name} → ${trip.itinerary?.destination_city?.name}`;
}

/** Departs du jour et du lendemain : en ligne si possible, sinon depuis le cache du poste. */
async function loadSellableTrips(): Promise<{ trips: Trip[]; savedAt: string | null }> {
  try {
    const page = await tripService.list({ from: todayIso(), to: todayIso(2), per_page: 100, sort: "departs_at", direction: "asc" });
    const open = page.data.filter((trip) => trip.accepts_bookings);
    cacheTrips(open);

    return { trips: open, savedAt: null };
  } catch {
    return cachedTrips();
  }
}

/**
 * Etat et logique de la vente au guichet, communs a l'ecran du dashboard
 * (CounterSale) et a l'ecran tablette (TabletCounter) : deux presentations,
 * un seul comportement - le choix du depart, le plan de salle, l'encaissement
 * et la file hors ligne ne doivent jamais diverger entre les deux.
 */
export function useCounterSale() {
  const queue = useOfflineQueue();

  const { data: tripsData, isLoading: isLoadingTrips, reload: reloadTrips } = useAsyncData(loadSellableTrips);
  const trips = tripsData?.trips ?? [];

  const [tripId, setTripIdState] = useState("");
  const seatMapLoader = useCallback(async (): Promise<SeatMap | null> => {
    if (!tripId) return null;
    try {
      const fresh = await tripService.seatMap(tripId);
      cacheSeatMap(tripId, fresh);
      return fresh;
    } catch {
      return cachedSeatMap(tripId);
    }
  }, [tripId]);
  const { data: seatMap, isLoading: isLoadingSeatMap, reload: reloadSeatMap } = useAsyncData(seatMapLoader);

  const [seats, setSeats] = useState<string[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [provider, setProvider] = useState<MobileMoneyProvider>("orange_money");
  const [payerMsisdn, setPayerMsisdn] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  // Les places vendues hors ligne sont marquees prises sur le plan en cache :
  // sans cela, l'agent revendrait la meme place au client suivant.
  const effectiveSeatMap = useMemo<SeatMap | null>(() => {
    if (!seatMap) return null;

    const local = new Set(
      queue.sales.filter((sale) => sale.trip_id === seatMap.trip.id).flatMap((sale) => sale.passengers.map((passenger) => passenger.seat_number)),
    );
    if (local.size === 0) return seatMap;

    return {
      ...seatMap,
      rows: seatMap.rows.map((row) => ({
        ...row,
        seats: row.seats.map((seat) => ({ ...seat, is_taken: seat.is_taken || local.has(seat.number) })),
      })),
    };
  }, [seatMap, queue.sales]);

  const selectedTrip = trips.find((trip) => trip.id === tripId) ?? seatMap?.trip ?? null;
  const total = (selectedTrip?.price ?? 0) * seats.length;

  function selectTrip(id: string) {
    setTripIdState(id);
    setSeats([]);
  }

  function resetSale() {
    setSeats([]);
    setCustomerName("");
    setCustomerPhone("");
    setPayerMsisdn("");
    setError(null);
  }

  async function submit() {
    if (!selectedTrip || seats.length === 0) return;

    setIsSubmitting(true);
    setError(null);

    const clientReference = newClientReference("VENTE");
    const passengers = seats.map((seat, index) => ({
      seat_number: seat,
      name: index === 0 ? customerName.trim() : `${customerName.trim()} (${index + 1})`,
    }));

    const effectiveMethod: PaymentMethod = queue.isOnline ? method : "cash";

    try {
      const result = await bookingService.counterSale({
        trip_id: selectedTrip.id,
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        passengers,
        payment_method: effectiveMethod,
        payment_provider: effectiveMethod === "mobile_money" ? provider : null,
        payer_msisdn: effectiveMethod === "mobile_money" ? payerMsisdn.trim() || customerPhone.trim() : null,
        client_reference: clientReference,
      });

      setReceipt({ kind: "online", booking: result.booking, method: effectiveMethod });
      resetSale();
      reloadSeatMap();
    } catch (caught) {
      if (caught instanceof NetworkError && effectiveMethod === "cash") {
        enqueueSale({
          client_reference: clientReference,
          sold_at: new Date().toISOString(),
          trip_id: selectedTrip.id,
          customer_name: customerName.trim(),
          customer_phone: customerPhone.trim(),
          passengers,
          payment_method: "cash",
          total_amount: total,
          trip_label: tripLabel(selectedTrip),
        });
        setReceipt({ kind: "offline", clientReference, tripLabel: tripLabel(selectedTrip), seats, total, customer: customerName.trim() });
        resetSale();
      } else {
        setError(caught);
        if (caught instanceof ApiError && caught.code === "seat_unavailable") {
          setSeats([]);
          reloadSeatMap();
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    queue,
    trips,
    isLoadingTrips,
    reloadTrips,
    tripsSavedAt: tripsData?.savedAt ?? null,
    tripId,
    selectTrip,
    selectedTrip,
    seatMap: effectiveSeatMap,
    isLoadingSeatMap,
    seats,
    setSeats,
    customerName,
    setCustomerName,
    customerPhone,
    setCustomerPhone,
    method,
    setMethod,
    provider,
    setProvider,
    payerMsisdn,
    setPayerMsisdn,
    total,
    isSubmitting,
    error,
    submit,
    receipt,
    setReceipt,
  };
}

export type CounterSaleState = ReturnType<typeof useCounterSale>;
