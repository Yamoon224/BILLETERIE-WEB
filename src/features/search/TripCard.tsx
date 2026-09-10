import { Badge, Card, LinkButton } from "@/components/ui";
import { IconArrowRight, IconBus, IconSeat } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { formatDuration, formatMoney, formatTime } from "@/lib/format";
import type { Trip } from "@/types/api";

/**
 * Un depart dans la liste de resultats.
 *
 * L'ordre de lecture est celui du voyageur : l'heure d'abord, le prix ensuite,
 * la compagnie et le confort apres. Les places restantes ne s'affichent en
 * alerte que lorsqu'elles deviennent rares — un « 52 places » en orange ferait
 * du bruit sans rien apprendre.
 */
export function TripCard({ trip, passengers }: { trip: Trip; passengers: number }) {
  const available = trip.seats_available ?? trip.seat_capacity;
  const isFull = available < passengers;
  const isScarce = !isFull && available <= 5;

  return (
    <Card interactive accent={!isFull}>
      <div className="grid gap-4 p-4 sm:grid-cols-[1fr_auto] sm:items-center sm:p-5">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <div className="text-center">
              <p className="text-2xl font-extrabold tabular-nums tracking-tight">{formatTime(trip.departs_at)}</p>
              <p className="text-xs font-medium text-[var(--muted)]">{trip.itinerary?.origin_city?.name}</p>
            </div>

            <div className="flex min-w-16 flex-1 flex-col items-center px-1">
              <span className="text-[11px] font-semibold text-[var(--muted)]">
                {formatDuration(trip.itinerary?.duration_minutes)}
              </span>
              <span className="relative my-1 block h-px w-full bg-[var(--hairline)]">
                <span className="absolute left-0 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full border-2 border-brand-500 bg-[var(--surface)]" />
                <span className="absolute right-0 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-brand-500" />
              </span>
              <IconBus className="h-3.5 w-3.5 text-brand-500" />
            </div>

            <div className="text-center">
              <p className="text-2xl font-extrabold tabular-nums tracking-tight text-stone-500 dark:text-stone-400">
                {formatTime(trip.arrives_at)}
              </p>
              <p className="text-xs font-medium text-[var(--muted)]">{trip.itinerary?.destination_city?.name}</p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-stone-700 dark:text-stone-200">{trip.company?.name}</span>
            {trip.vehicle ? <Badge tone={trip.vehicle.class === "vip" ? "brand" : "neutral"}>{trip.vehicle.class_label}</Badge> : null}
            <span className="text-[var(--muted)]">Depart : {trip.departure_station?.name}</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-[var(--hairline)] pt-3 sm:flex-col sm:items-end sm:border-0 sm:pt-0">
          <div className="sm:text-right">
            <p className="text-xl font-extrabold tabular-nums text-brand-700 dark:text-brand-400">{formatMoney(trip.price)}</p>
            <p
              className={cn(
                "mt-0.5 inline-flex items-center gap-1 text-xs font-semibold",
                isFull ? "text-rose-600" : isScarce ? "text-brand-700 dark:text-brand-400" : "text-[var(--muted)]",
              )}
            >
              <IconSeat className="h-3.5 w-3.5" />
              {isFull ? "Complet" : `${available} place${available > 1 ? "s" : ""} restante${available > 1 ? "s" : ""}`}
            </p>
          </div>

          {isFull ? (
            <span className="text-sm font-semibold text-[var(--muted)]">Indisponible</span>
          ) : (
            <LinkButton
              href={`/reservation/${trip.id}?voyageurs=${passengers}`}
              icon={<IconArrowRight className="h-4 w-4" />}
              className="flex-row-reverse"
            >
              Choisir
            </LinkButton>
          )}
        </div>
      </div>
    </Card>
  );
}
