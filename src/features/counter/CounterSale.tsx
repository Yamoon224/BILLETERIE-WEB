"use client";

import { useCallback, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  FormAlert,
  LoadingState,
  SelectField,
  TextField,
} from "@/components/ui";
import { IconCash, IconCheckCircle, IconPhone, IconPrinter, IconRefresh, IconWifiOff } from "@/components/ui/icons";
import { SeatPicker } from "@/features/booking/SeatPicker";
import { useAsyncData } from "@/hooks/useAsyncData";
import { useOfflineQueue } from "@/hooks/useOfflineQueue";
import { ApiError, NetworkError, errorMessage } from "@/lib/api-client";
import { cn } from "@/lib/cn";
import { formatDateTime, formatMoney, formatTime, todayIso } from "@/lib/format";
import { MOBILE_MONEY_PROVIDERS } from "@/lib/labels";
import { cachedSeatMap, cachedTrips, cacheSeatMap, cacheTrips, enqueueSale, newClientReference } from "@/lib/offline-store";
import { bookingService, tripService } from "@/services";
import type { Booking, MobileMoneyProvider, PaymentMethod, SeatMap, Trip } from "@/types/api";

type Receipt =
  | { kind: "online"; booking: Booking; method: PaymentMethod }
  | { kind: "offline"; clientReference: string; tripLabel: string; seats: string[]; total: number; customer: string };

function tripLabel(trip: Trip): string {
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
 * Guichet : vente au comptoir, avec ou sans reseau.
 *
 * Le flux est concu pour une file d'attente : choisir le depart, toucher les
 * places, encaisser, imprimer, recommencer. L'ecran se reinitialise apres chaque
 * vente sans quitter le depart selectionne — le client suivant part presque
 * toujours par le meme car.
 *
 * **Hors ligne.** Si la requete echoue faute de reseau (et non pour un refus
 * metier), la vente est enregistree localement avec sa reference client, les
 * places sont marquees prises sur le plan en cache, et un recu provisoire est
 * imprime. La synchronisation part d'elle-meme au retour du reseau. Le mobile
 * money exige un reseau : hors ligne, seules les especes sont proposees.
 */
export function CounterSale() {
  const queue = useOfflineQueue();

  const { data: tripsData, isLoading: isLoadingTrips, reload: reloadTrips } = useAsyncData(loadSellableTrips);
  const trips = tripsData?.trips ?? [];

  const [tripId, setTripId] = useState("");
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
    setTripId(id);
    setSeats([]);
  }

  function resetSale() {
    setSeats([]);
    setCustomerName("");
    setCustomerPhone("");
    setPayerMsisdn("");
    setError(null);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
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

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_24rem]">
      <div className="space-y-6">
        {!queue.isOnline ? (
          <FormAlert tone="warning">
            <strong>Mode hors ligne.</strong> Les ventes en especes sont enregistrees sur ce poste et seront synchronisees
            automatiquement au retour du reseau.
            {tripsData?.savedAt ? ` Departs en cache du ${formatDateTime(tripsData.savedAt)}.` : ""}
          </FormAlert>
        ) : null}

        <Card>
          <CardHeader
            title="Depart"
            description="Departs ouverts a la vente aujourd'hui et demain."
            actions={
              <Button variant="ghost" size="sm" onClick={reloadTrips} icon={<IconRefresh className="h-3.5 w-3.5" />}>
                Actualiser
              </Button>
            }
          />
          <CardBody>
            {isLoadingTrips ? (
              <LoadingState label="Chargement des departs…" className="py-6" />
            ) : trips.length === 0 ? (
              <EmptyState title="Aucun depart ouvert a la vente" description="Les departs programmes aujourd'hui et demain apparaitront ici." />
            ) : (
              <SelectField label="Depart a vendre" value={tripId} onChange={(event) => selectTrip(event.target.value)} required>
                <option value="">Choisir un depart</option>
                {trips.map((trip) => (
                  <option key={trip.id} value={trip.id}>
                    {new Date(trip.departs_at).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" })} · {tripLabel(trip)} ·{" "}
                    {formatMoney(trip.price)}
                  </option>
                ))}
              </SelectField>
            )}
          </CardBody>
        </Card>

        {tripId && isLoadingSeatMap && !effectiveSeatMap ? <LoadingState label="Chargement du plan de salle…" /> : null}

        {tripId && !isLoadingSeatMap && !effectiveSeatMap ? (
          <Card>
            <EmptyState
              icon={<IconWifiOff className="h-5 w-5" />}
              title="Plan de salle indisponible hors ligne"
              description="Ce depart n'a pas ete ouvert sur ce poste avant la coupure. Choisissez un depart deja consulte."
            />
          </Card>
        ) : null}

        {effectiveSeatMap ? (
          <Card>
            <CardHeader title="Places" description={`${effectiveSeatMap.available} libres sur ${effectiveSeatMap.capacity} — touchez les places a vendre.`} />
            <CardBody>
              <SeatPicker seatMap={effectiveSeatMap} selected={seats} max={20} onChange={setSeats} />
            </CardBody>
          </Card>
        ) : null}
      </div>

      <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
        <Card>
          <CardHeader title="Encaissement" />
          <CardBody>
            <form onSubmit={submit} className="space-y-4">
              <TextField label="Nom du client" placeholder="Yao Kouassi" value={customerName} onChange={(event) => setCustomerName(event.target.value)} required />
              <TextField
                label="Telephone du client"
                type="tel"
                inputMode="tel"
                placeholder="+225 05 00 00 00 00"
                value={customerPhone}
                onChange={(event) => setCustomerPhone(event.target.value)}
                hint="Le billet electronique est envoye par SMS sur ce numero."
                required
              />

              <fieldset>
                <legend className="mb-2 text-sm font-semibold">Moyen de paiement</legend>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      { value: "cash", label: "Especes", icon: <IconCash className="h-4 w-4" /> },
                      { value: "mobile_money", label: "Mobile money", icon: <IconPhone className="h-4 w-4" /> },
                    ] as const
                  ).map((option) => {
                    const disabled = option.value === "mobile_money" && !queue.isOnline;
                    const active = method === option.value && !disabled;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        disabled={disabled}
                        onClick={() => setMethod(option.value)}
                        aria-pressed={active}
                        className={cn(
                          "flex items-center justify-center gap-2 rounded-sm border px-3 py-3 text-sm font-bold transition-all",
                          active ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-300" : "border-[var(--hairline)] hover:border-brand-300",
                          disabled && "cursor-not-allowed opacity-40",
                        )}
                      >
                        {option.icon}
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              {method === "mobile_money" && queue.isOnline ? (
                <div className="grid gap-3">
                  <SelectField label="Operateur" value={provider} onChange={(event) => setProvider(event.target.value as MobileMoneyProvider)}>
                    {MOBILE_MONEY_PROVIDERS.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </SelectField>
                  <TextField label="Numero a debiter" type="tel" placeholder="Numero du client par defaut" value={payerMsisdn} onChange={(event) => setPayerMsisdn(event.target.value)} />
                </div>
              ) : null}

              <dl className="space-y-1.5 rounded-sm bg-[var(--surface-muted)] p-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-[var(--muted)]">Places</dt>
                  <dd className="font-semibold">{seats.length ? seats.join(", ") : "—"}</dd>
                </div>
                <div className="flex items-baseline justify-between">
                  <dt className="font-bold">A encaisser</dt>
                  <dd className="text-2xl font-extrabold text-brand-700 dark:text-brand-400">{formatMoney(total)}</dd>
                </div>
              </dl>

              {error ? <FormAlert>{errorMessage(error)}</FormAlert> : null}

              <Button
                type="submit"
                size="lg"
                className="w-full"
                isLoading={isSubmitting}
                disabled={!selectedTrip || seats.length === 0 || !customerName.trim() || !customerPhone.trim()}
              >
                {queue.isOnline ? "Valider la vente" : "Enregistrer hors ligne"}
              </Button>
            </form>
          </CardBody>
        </Card>

        {receipt ? <ReceiptCard receipt={receipt} onClose={() => setReceipt(null)} /> : null}

        <SyncStatus queue={queue} />
      </aside>
    </div>
  );
}

/**
 * Recu de vente, imprimable via l'impression du navigateur. En mode hors ligne,
 * il porte la reference client : c'est elle qui permettra de retrouver la vente
 * une fois synchronisee.
 */
function ReceiptCard({ receipt, onClose }: { receipt: Receipt; onClose: () => void }) {
  return (
    <Card>
      <CardBody className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-2 font-bold">
            <IconCheckCircle className="h-5 w-5 text-[var(--color-flag-green)]" />
            {receipt.kind === "online" ? "Vente enregistree" : "Vente enregistree hors ligne"}
          </p>
          <Badge tone={receipt.kind === "online" ? "success" : "warning"}>{receipt.kind === "online" ? "Payee" : "A synchroniser"}</Badge>
        </div>

        {receipt.kind === "online" ? (
          <>
            <p className="font-mono text-lg font-extrabold">{receipt.booking.reference}</p>
            <p>
              {receipt.booking.customer_name} · {receipt.booking.tickets?.map((ticket) => ticket.seat_number).join(", ")}
            </p>
            <p className="text-lg font-extrabold">{formatMoney(receipt.booking.total_amount)}</p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                icon={<IconPrinter className="h-3.5 w-3.5" />}
                onClick={() => window.open(`/billets/${receipt.booking.reference}`, "_blank", "noopener")}
              >
                Imprimer les billets
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                Client suivant
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="font-mono text-sm font-bold">{receipt.clientReference}</p>
            <p>
              {receipt.customer} · {receipt.tripLabel} · places {receipt.seats.join(", ")}
            </p>
            <p className="text-lg font-extrabold">{formatMoney(receipt.total)}</p>
            <p className="text-xs text-[var(--muted)]">Le billet electronique sera envoye au client des la synchronisation. Remettez-lui ce recu en attendant.</p>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" icon={<IconPrinter className="h-3.5 w-3.5" />} onClick={() => window.print()}>
                Imprimer le recu
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                Client suivant
              </Button>
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
}

function SyncStatus({ queue }: { queue: ReturnType<typeof useOfflineQueue> }) {
  const pending = queue.sales.length;
  const rejected = queue.lastResult?.results.filter((item) => item.status === "rejected") ?? [];

  if (pending === 0 && rejected.length === 0 && !queue.syncError) return null;

  return (
    <Card>
      <CardHeader
        icon={<IconWifiOff className="h-4 w-4" />}
        title="Ventes a synchroniser"
        description={pending > 0 ? `${pending} vente${pending > 1 ? "s" : ""} en attente sur ce poste.` : "Tout est synchronise."}
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => void queue.synchronise()}
            isLoading={queue.isSyncing}
            disabled={!queue.isOnline || pending === 0}
            icon={<IconRefresh className="h-3.5 w-3.5" />}
          >
            Synchroniser
          </Button>
        }
      />
      <CardBody className="space-y-3 text-sm">
        {queue.sales.map((sale) => (
          <div key={sale.client_reference} className="flex items-center justify-between gap-2">
            <span className="min-w-0 truncate">
              {sale.customer_name} · {sale.trip_label}
            </span>
            <span className="shrink-0 font-bold tabular-nums">{formatMoney(sale.total_amount)}</span>
          </div>
        ))}

        {queue.syncError ? <FormAlert>{queue.syncError}</FormAlert> : null}

        {rejected.length > 0 ? (
          <FormAlert tone="warning">
            <p className="font-bold">
              {rejected.length} vente{rejected.length > 1 ? "s" : ""} refusee{rejected.length > 1 ? "s" : ""} a la synchronisation
            </p>
            <ul className="mt-1 list-disc pl-4">
              {rejected.map((item) => (
                <li key={item.client_reference}>
                  {item.client_reference} : {item.message}
                </li>
              ))}
            </ul>
            <p className="mt-1 text-xs">Ces ventes restent a traiter : signalez-les a votre gestionnaire pour remboursement ou report.</p>
          </FormAlert>
        ) : null}
      </CardBody>
    </Card>
  );
}
