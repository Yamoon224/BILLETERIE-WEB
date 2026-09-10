"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import type { FormEvent } from "react";
import { Badge, Button, Card, CardBody, CardHeader, ErrorState, FormAlert, LoadingState, TextField } from "@/components/ui";
import { IconArrowLeft, IconBus, IconClock, IconMapPin, IconSeat, IconUser } from "@/components/ui/icons";
import { useAuth } from "@/features/auth/AuthContext";
import { useAsyncData } from "@/hooks/useAsyncData";
import { useMutation } from "@/hooks/useMutation";
import { ApiError, errorMessage } from "@/lib/api-client";
import { formatDayLong, formatDuration, formatMoney, formatTime } from "@/lib/format";
import { bookingService, tripService } from "@/services";
import type { BookingInput } from "@/services/booking-service";
import type { Trip } from "@/types/api";
import { SeatPicker } from "./SeatPicker";

/**
 * Tunnel de reservation : places, voyageurs, coordonnees — sur un seul ecran.
 *
 * Un seul ecran et non trois etapes : chaque changement de page est un
 * aller-retour reseau de plus sur une connexion 3G, et une occasion de perdre
 * le voyageur. Le recapitulatif reste visible (colonne sur ordinateur, barre
 * collee en bas sur telephone) : le prix total ne doit jamais etre une surprise.
 */
export function BookingFlow({ tripId, passengers: initialPassengers }: { tripId: string; passengers: number }) {
  const router = useRouter();
  const { user } = useAuth();

  const loadSeatMap = useCallback(() => tripService.seatMap(tripId), [tripId]);
  const { data: seatMap, isLoading, error, reload } = useAsyncData(loadSeatMap);

  const [passengerCount, setPassengerCount] = useState(initialPassengers);
  const [seats, setSeats] = useState<string[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  // `null` signifie « pas encore touche » : la valeur affichee retombe alors
  // sur le compte connecte, qui peut arriver apres le premier rendu. Une
  // saisie, meme vide, l emporte ensuite toujours sur le pre-remplissage.
  const [customerNameInput, setCustomerName] = useState<string | null>(null);
  const [customerPhoneInput, setCustomerPhone] = useState<string | null>(null);
  const [customerEmailInput, setCustomerEmail] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const customerName = customerNameInput ?? user?.name ?? "";
  const customerPhone = customerPhoneInput ?? user?.phone ?? "";
  const customerEmail = customerEmailInput ?? user?.email ?? "";

  const reserveAction = useCallback((input: BookingInput) => bookingService.reserve(input), []);
  const reservation = useMutation(reserveAction);

  if (isLoading) return <LoadingState label="Chargement du plan de salle…" className="py-24" />;

  if (error || !seatMap) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <Card>
          <ErrorState error={error} onRetry={reload} />
        </Card>
      </div>
    );
  }

  const trip = seatMap.trip;
  const total = trip.price * seats.length;
  const maxPassengers = Math.min(10, seatMap.available);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLocalError(null);

    if (seats.length !== passengerCount) {
      setLocalError(`Choisissez ${passengerCount} place${passengerCount > 1 ? "s" : ""} sur le plan.`);
      return;
    }

    const booking = await reservation.run({
      trip_id: trip.id,
      customer_name: customerName.trim(),
      customer_phone: customerPhone.trim(),
      customer_email: customerEmail.trim() || null,
      passengers: seats.map((seat, index) => ({
        seat_number: seat,
        name: (names[seat] ?? "").trim() || (index === 0 ? customerName.trim() : `Voyageur ${index + 1}`),
      })),
    });

    if (booking) {
      router.push(`/billets/${booking.reference}`);
    } else {
      // Une place prise entre-temps : on rafraichit le plan plutot que de
      // laisser le voyageur retenter sur une place qui n'existe plus.
      reload();
      setSeats([]);
    }
  }

  const reservationError =
    reservation.error instanceof ApiError && reservation.error.code === "seat_unavailable"
      ? "Une des places choisies vient d'etre reservee par quelqu'un d'autre. Le plan a ete mis a jour : choisissez-en une autre."
      : reservation.error
        ? errorMessage(reservation.error)
        : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 pb-32 sm:px-6 sm:py-8 lg:pb-8">
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--muted)] hover:text-brand-600"
      >
        <IconArrowLeft className="h-4 w-4" /> Retour aux departs
      </button>

      <form onSubmit={submit} noValidate className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          <Card>
            <CardHeader
              icon={<IconSeat className="h-4 w-4" />}
              title="Choisissez vos places"
              description={`${seatMap.available} place${seatMap.available > 1 ? "s" : ""} libre${seatMap.available > 1 ? "s" : ""} sur ${seatMap.capacity}.`}
              actions={
                <div className="flex items-center gap-2 text-sm">
                  <label htmlFor="passenger-count" className="text-[var(--muted)]">
                    Voyageurs
                  </label>
                  <select
                    id="passenger-count"
                    value={passengerCount}
                    onChange={(event) => {
                      const next = Number(event.target.value);
                      setPassengerCount(next);
                      setSeats((current) => current.slice(0, next));
                    }}
                    className="rounded-sm bg-[var(--surface)] px-2 py-1.5 font-semibold ring-1 ring-inset ring-[var(--field-border)] focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {Array.from({ length: Math.max(1, maxPassengers) }, (_, index) => index + 1).map((count) => (
                      <option key={count} value={count}>
                        {count}
                      </option>
                    ))}
                  </select>
                </div>
              }
            />
            <CardBody>
              <SeatPicker seatMap={seatMap} selected={seats} max={passengerCount} onChange={setSeats} />
            </CardBody>
          </Card>

          {seats.length > 0 ? (
            <Card>
              <CardHeader
                icon={<IconUser className="h-4 w-4" />}
                title="Voyageurs"
                description="Le nom figure sur le billet. Il peut vous etre demande a l'embarquement."
              />
              <CardBody className="grid gap-4 sm:grid-cols-2">
                {seats.map((seat, index) => (
                  <TextField
                    key={seat}
                    label={`Voyageur ${index + 1} — place ${seat}`}
                    placeholder="Prenom et nom"
                    value={names[seat] ?? ""}
                    onChange={(event) => setNames((current) => ({ ...current, [seat]: event.target.value }))}
                    autoComplete={index === 0 ? "name" : "off"}
                  />
                ))}
              </CardBody>
            </Card>
          ) : null}

          <Card>
            <CardHeader
              title="Vos coordonnees"
              description="Le billet vous est envoye par SMS sur ce numero. Verifiez-le bien."
            />
            <CardBody className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Nom complet"
                placeholder="Awa Kone"
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                errors={reservation.fieldErrors.customer_name}
                autoComplete="name"
                required
              />
              <TextField
                label="Telephone"
                type="tel"
                inputMode="tel"
                placeholder="+225 07 00 00 00 00"
                value={customerPhone}
                onChange={(event) => setCustomerPhone(event.target.value)}
                errors={reservation.fieldErrors.customer_phone}
                autoComplete="tel"
                required
              />
              <TextField
                label="E-mail (facultatif)"
                type="email"
                placeholder="vous@exemple.ci"
                value={customerEmail}
                onChange={(event) => setCustomerEmail(event.target.value)}
                errors={reservation.fieldErrors.customer_email}
                autoComplete="email"
                fieldClassName="sm:col-span-2"
              />
            </CardBody>
          </Card>
        </div>

        {/* Recapitulatif : colonne collante sur grand ecran. */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-4">
            <TripSummary trip={trip} seats={seats} total={total} />
            {localError ? <FormAlert>{localError}</FormAlert> : null}
            {reservationError ? <FormAlert>{reservationError}</FormAlert> : null}
            <Button type="submit" size="lg" className="w-full" isLoading={reservation.isPending} disabled={seats.length === 0}>
              Reserver — {formatMoney(total)}
            </Button>
            <p className="text-center text-xs text-[var(--muted)]">
              Vos places sont bloquees 15 minutes le temps du paiement.
            </p>
          </div>
        </aside>

        {/* Barre de validation collee en bas sur telephone. */}
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[var(--hairline)] bg-[var(--surface)]/95 p-3 shadow-card backdrop-blur lg:hidden">
          {localError || reservationError ? (
            <p role="alert" className="mb-2 text-xs font-medium text-rose-600">
              {localError ?? reservationError}
            </p>
          ) : null}
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-[var(--muted)]">
                {seats.length} place{seats.length > 1 ? "s" : ""}
                {seats.length ? ` · ${seats.join(", ")}` : ""}
              </p>
              <p className="text-lg font-extrabold tabular-nums text-brand-700 dark:text-brand-400">{formatMoney(total)}</p>
            </div>
            <Button type="submit" size="lg" isLoading={reservation.isPending} disabled={seats.length === 0}>
              Reserver
            </Button>
          </div>
        </div>
      </form>

      <p className="mt-6 text-center text-xs text-[var(--muted)]">
        En reservant, vous acceptez les conditions de transport de la compagnie.{" "}
        <Link href="/mes-billets" className="font-semibold text-brand-600">
          Deja un billet ?
        </Link>
      </p>
    </div>
  );
}

function TripSummary({ trip, seats, total }: { trip: Trip; seats: string[]; total: number }) {
  return (
    <Card>
      <CardHeader icon={<IconBus className="h-4 w-4" />} title="Votre trajet" />
      <CardBody className="space-y-4 text-sm">
        <p className="font-semibold capitalize">{formatDayLong(trip.departs_at)}</p>

        <ol className="relative space-y-4 border-l-2 border-brand-200 pl-4 dark:border-brand-900">
          <li>
            <span className="absolute -left-[5px] mt-1.5 h-2 w-2 rounded-full bg-brand-500" />
            <p className="font-extrabold tabular-nums">{formatTime(trip.departs_at)} · {trip.itinerary?.origin_city?.name}</p>
            <p className="flex items-center gap-1 text-xs text-[var(--muted)]">
              <IconMapPin className="h-3 w-3" /> {trip.departure_station?.name}
            </p>
          </li>
          <li>
            <span className="absolute -left-[5px] mt-1.5 h-2 w-2 rounded-full bg-[var(--color-flag-green)]" />
            <p className="font-extrabold tabular-nums">{formatTime(trip.arrives_at)} · {trip.itinerary?.destination_city?.name}</p>
            <p className="flex items-center gap-1 text-xs text-[var(--muted)]">
              <IconMapPin className="h-3 w-3" /> {trip.arrival_station?.name}
            </p>
          </li>
        </ol>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Badge>{trip.company?.name}</Badge>
          {trip.vehicle ? <Badge tone="brand">{trip.vehicle.class_label}</Badge> : null}
          <span className="inline-flex items-center gap-1 text-[var(--muted)]">
            <IconClock className="h-3 w-3" /> {formatDuration(trip.itinerary?.duration_minutes)}
          </span>
        </div>

        <dl className="space-y-2 border-t border-[var(--hairline)] pt-3">
          <div className="flex justify-between">
            <dt className="text-[var(--muted)]">Prix par place</dt>
            <dd className="font-semibold tabular-nums">{formatMoney(trip.price)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[var(--muted)]">Places</dt>
            <dd className="font-semibold">{seats.length ? seats.join(", ") : "—"}</dd>
          </div>
          <div className="flex items-baseline justify-between border-t border-[var(--hairline)] pt-2">
            <dt className="font-bold">Total</dt>
            <dd className="text-xl font-extrabold tabular-nums text-brand-700 dark:text-brand-400">{formatMoney(total)}</dd>
          </div>
        </dl>
      </CardBody>
    </Card>
  );
}
