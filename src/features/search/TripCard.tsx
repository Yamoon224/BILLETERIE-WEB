import Link from "next/link";
import { Badge, Card } from "@/components/ui";
import { IconHeadphones, IconSeat, IconWifi } from "@/components/ui/icons";
import { formatDuration, formatMoney, formatTime } from "@/lib/format";
import { pseudoRating } from "@/lib/rating";
import type { Trip } from "@/types/api";

/**
 * Un depart dans la liste de resultats.
 *
 * L'ordre de lecture est celui du voyageur : compagnie et note d'abord,
 * l'heure et le prix ensuite.
 */
export function TripCard({ trip, passengers }: { trip: Trip; passengers: number }) {
  const available = trip.seats_available ?? trip.seat_capacity;
  const isFull = available < passengers;
  const rating = pseudoRating(trip.company_id);
  // Equipements deduits de la classe du vehicule, seule donnee reelle de
  // confort disponible : pas de wifi/casque affiche sans base pour l'affirmer.
  const isComfortClass = trip.vehicle?.class === "vip" || trip.vehicle?.class === "comfort";

  return (
    <Card interactive accent={false} className="rounded-2xl">
      <div className="p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-base font-bold text-stone-900 dark:text-stone-50">{trip.company?.name}</span>
            {trip.vehicle ? <Badge tone={trip.vehicle.class === "vip" ? "brand" : "neutral"}>{trip.vehicle.class_label}</Badge> : null}
          </div>
          <span className="flex items-center gap-1.5 text-sm">
            <span className="text-[var(--muted)]">{rating.reviews} avis</span>
            <span className="rounded-md bg-yellow px-2 py-1 text-xs font-extrabold text-stone-900">{rating.score}</span>
          </span>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <p className="text-2xl font-extrabold tabular-nums tracking-tight text-stone-900 dark:text-stone-50">
            {formatTime(trip.departs_at)}
          </p>
          <div className="min-w-16 flex-1 text-center">
            <span className="text-xs font-semibold text-[var(--muted)]">{formatDuration(trip.itinerary?.duration_minutes)}</span>
            <span className="mt-1.5 block h-px w-full bg-[var(--hairline)]" />
          </div>
          <p className="text-2xl font-extrabold tabular-nums tracking-tight text-stone-900 dark:text-stone-50">
            {formatTime(trip.arrives_at)}
          </p>
        </div>

        {trip.departure_station || trip.arrival_station ? (
          <p className="mt-1.5 text-sm leading-relaxed text-[var(--muted)]">
            {trip.departure_station?.name}
            {trip.departure_station && trip.arrival_station ? " → " : null}
            {trip.arrival_station?.name}
          </p>
        ) : null}

        <div className="mt-2.5 flex items-center gap-2 text-brand-500">
          <IconHeadphones className="h-4 w-4" />
          {isComfortClass ? <IconWifi className="h-4 w-4" /> : null}
        </div>

        <div className="mt-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-xl font-extrabold tabular-nums text-stone-900 dark:text-stone-50">{formatMoney(trip.price)}</p>
            <p className="mt-0.5 inline-flex items-center gap-1 text-xs font-semibold text-rose-600">
              <IconSeat className="h-3.5 w-3.5" />
              {isFull ? "Complet" : `${available} place${available > 1 ? "s" : ""} restante${available > 1 ? "s" : ""}`}
            </p>
          </div>

          {isFull ? (
            <span className="text-sm font-semibold text-[var(--muted)]">Indisponible</span>
          ) : (
            <Link
              href={`/reservation/${trip.id}?voyageurs=${passengers}`}
              className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-brand-400 px-7 text-sm font-bold text-white shadow-sm transition-colors hover:bg-brand-500 active:translate-y-px"
            >
              Choisir
            </Link>
          )}
        </div>
      </div>
    </Card>
  );
}
