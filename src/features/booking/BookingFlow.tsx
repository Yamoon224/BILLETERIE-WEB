"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Badge, Button, Card, CardBody, CardHeader, ErrorState, FormAlert, LoadingState, TextField } from "@/components/ui";
import { IconBus, IconCheck, IconClock, IconMapPin, IconSeat, IconShield, IconUser } from "@/components/ui/icons";
import { useAuth } from "@/features/auth/AuthContext";
import { useAsyncData } from "@/hooks/useAsyncData";
import { useMutation } from "@/hooks/useMutation";
import { ApiError, errorMessage } from "@/lib/api-client";
import { cn } from "@/lib/cn";
import { formatDayLong, formatDuration, formatMoney, formatTime } from "@/lib/format";
import { bookingService, tripService } from "@/services";
import type { BookingInput } from "@/services/booking-service";
import type { Trip } from "@/types/api";
import { BookingStepper } from "./BookingStepper";
import { SeatPicker } from "./SeatPicker";

type Step = "siege" | "passager" | "options";

/** Doit rester egal a `config('ticketing.refund_guarantee_fee')` cote API : le
 *  total affiche avant la creation de la reservation doit annoncer exactement
 *  ce que le serveur facturera, sans attendre une reponse reseau pour le savoir. */
const REFUND_GUARANTEE_FEE = 300;

/**
 * Tunnel de reservation : trois etapes visibles (siege, voyageurs et
 * coordonnees, options), mais une seule page chargee — passer de l'une a
 * l'autre est un changement d'etat local, pas un aller-retour reseau. Sur une
 * connexion 3G, chaque navigation de page est une occasion de perdre le
 * voyageur ; le fil d'etapes (`BookingStepper`) donne le meme repere visuel
 * qu'un vrai changement d'ecran sans en payer le cout reseau. Le paiement,
 * lui, vit sur sa propre page (`/billets/[reference]`) : il exige une
 * reservation deja creee cote API.
 */
export function BookingFlow({ tripId, passengers: initialPassengers }: { tripId: string; passengers: number }) {
  const router = useRouter();
  const { user } = useAuth();

  const loadSeatMap = useCallback(() => tripService.seatMap(tripId), [tripId]);
  const { data: seatMap, isLoading, error, reload } = useAsyncData(loadSeatMap);

  const [step, setStep] = useState<Step>("siege");
  const [passengerCount, setPassengerCount] = useState(initialPassengers);
  const [seats, setSeats] = useState<string[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  // Coche par defaut : c'est l'option qui protege le voyageur, celle qui
  // demande un geste explicite est de s'en passer.
  const [wantsGuarantee, setWantsGuarantee] = useState(true);
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
  const baseTotal = trip.price * seats.length;
  const guaranteeFee = step === "options" && wantsGuarantee ? REFUND_GUARANTEE_FEE : 0;
  const total = baseTotal + guaranteeFee;
  const maxPassengers = Math.min(10, seatMap.available);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLocalError(null);

    if (seats.length !== passengerCount) {
      setLocalError(`Choisissez ${passengerCount} place${passengerCount > 1 ? "s" : ""} sur le plan.`);
      return;
    }

    if (step === "siege") {
      setStep("passager");
      return;
    }

    if (step === "passager") {
      setStep("options");
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
      refund_guarantee: wantsGuarantee,
    });

    if (booking) {
      router.push(`/billets/${booking.reference}`);
    } else {
      // Une place prise entre-temps : on rafraichit le plan plutot que de
      // laisser le voyageur retenter sur une place qui n'existe plus.
      reload();
      setSeats([]);
      setStep("siege");
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
      <BookingStepper
        current={step === "options" ? "paiement" : step}
        onBack={
          step === "siege"
            ? () => router.back()
            : step === "passager"
              ? () => setStep("siege")
              : () => setStep("passager")
        }
        backLabel={
          step === "siege" ? "Retour aux departs" : step === "passager" ? "Retour au choix des sieges" : "Retour aux voyageurs"
        }
      />

      <form onSubmit={submit} noValidate className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          {step === "options" ? (
            <Card>
              <CardHeader title="Ajoutez de la tranquillite" />
              <CardBody className="space-y-3">
                <GuaranteeOption
                  selected={wantsGuarantee}
                  onSelect={() => setWantsGuarantee(true)}
                  icon={<IconShield className="h-4 w-4" />}
                  title="Garantie remboursement 100 %"
                  description="Annulez jusqu'a 1h avant le depart et recuperez l'integralite du montant."
                  price={REFUND_GUARANTEE_FEE}
                />
                <GuaranteeOption
                  selected={!wantsGuarantee}
                  onSelect={() => setWantsGuarantee(false)}
                  icon={null}
                  title="Sans garantie"
                  description="Billet non remboursable en cas d'annulation."
                  price={0}
                />
              </CardBody>
            </Card>
          ) : null}

          {step === "siege" ? (
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
          ) : null}

          {step === "passager" ? (
            <>
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
            </>
          ) : null}
        </div>

        {/* Recapitulatif : colonne collante sur grand ecran, presente a chaque etape. */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-4">
            <TripSummary trip={trip} seats={seats} total={total} guaranteeFee={guaranteeFee} />
            {localError ? <FormAlert>{localError}</FormAlert> : null}
            {reservationError ? <FormAlert>{reservationError}</FormAlert> : null}
            <Button type="submit" size="lg" className="w-full" isLoading={reservation.isPending} disabled={seats.length === 0}>
              Continuer
            </Button>
            {step === "options" ? (
              <p className="text-center text-xs text-[var(--muted)]">
                Vos places sont bloquees 15 minutes le temps du paiement.
              </p>
            ) : null}
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
                {step === "siege"
                  ? `Place${seats.length > 1 ? "s" : ""} ${seats.length ? seats.join(", ") : "—"} selectionnee${seats.length > 1 ? "s" : ""}`
                  : step === "passager"
                    ? `${passengerCount} voyageur${passengerCount > 1 ? "s" : ""}`
                    : wantsGuarantee
                      ? "Total avec garantie"
                      : "Sans garantie"}
              </p>
              <p className="text-lg font-extrabold tabular-nums text-brand-700 dark:text-brand-400">{formatMoney(total)}</p>
            </div>
            <Button type="submit" size="lg" isLoading={reservation.isPending} disabled={seats.length === 0}>
              Continuer
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

function GuaranteeOption({
  selected,
  onSelect,
  icon,
  title,
  description,
  price,
}: {
  selected: boolean;
  onSelect: () => void;
  icon: ReactNode;
  title: string;
  description: string;
  price: number;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "flex w-full items-start gap-3 rounded-sm border p-3.5 text-left transition-colors",
        selected ? "border-ink-700 dark:border-ink-500" : "border-[var(--hairline)] hover:border-brand-300",
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
          selected ? "border-ink-700 bg-ink-700 text-white dark:border-ink-500 dark:bg-ink-500" : "border-[var(--field-border)]",
        )}
      >
        {selected ? <IconCheck className="h-3 w-3" /> : null}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 text-sm font-bold">
          {icon}
          {title}
        </span>
        <span className="mt-0.5 block text-xs leading-snug text-[var(--muted)]">{description}</span>
      </span>
      <span className="shrink-0 text-sm font-bold tabular-nums">{price > 0 ? formatMoney(price) : "0 F"}</span>
    </button>
  );
}

function TripSummary({
  trip,
  seats,
  total,
  guaranteeFee,
}: {
  trip: Trip;
  seats: string[];
  total: number;
  guaranteeFee: number;
}) {
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
          {guaranteeFee > 0 ? (
            <div className="flex justify-between">
              <dt className="text-[var(--muted)]">Garantie remboursement</dt>
              <dd className="font-semibold tabular-nums">{formatMoney(guaranteeFee)}</dd>
            </div>
          ) : null}
          <div className="flex items-baseline justify-between border-t border-[var(--hairline)] pt-2">
            <dt className="font-bold">Total</dt>
            <dd className="text-xl font-extrabold tabular-nums text-brand-700 dark:text-brand-400">{formatMoney(total)}</dd>
          </div>
        </dl>
      </CardBody>
    </Card>
  );
}
