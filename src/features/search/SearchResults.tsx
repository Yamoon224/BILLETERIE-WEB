"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";
import { Card, CardBody, EmptyState, ErrorState, Skeleton } from "@/components/ui";
import { IconBus, IconChevronLeft, IconChevronRight, IconSortAscending } from "@/components/ui/icons";
import { BookingStepper } from "@/features/booking/BookingStepper";
import { FavoriteButton } from "@/features/favorites/FavoriteButton";
import { useAsyncData } from "@/hooks/useAsyncData";
import { cn } from "@/lib/cn";
import { formatDayCompact, formatNumber, formatWeekdayShort, todayIso } from "@/lib/format";
import { tripService } from "@/services";
import { isPilotLine } from "./pilot-line";
import { RouteGridResults } from "./RouteGridResults";
import { TripCard } from "./TripCard";
import { searchHref } from "./TripSearchForm";
import type { SearchCriteria } from "./TripSearchForm";

function shiftDate(isoDate: string, days: number): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(year, month - 1, day + days);

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/**
 * Resultats de recherche.
 *
 * Seule la ligne pilote se reserve en ligne : toute autre liaison affiche sa
 * fiche de la grille des trajets, avec « Bientot disponible ». Le choix se
 * fait ici, avant tout appel, pour ne pas interroger des departs que le
 * voyageur ne pourra pas reserver.
 */
export function SearchResults({ criteria }: { criteria: SearchCriteria }) {
  return isPilotLine(criteria.origin, criteria.destination) ? (
    <BookableTripResults criteria={criteria} />
  ) : (
    <RouteGridResults criteria={criteria} />
  );
}

/**
 * Departs reservables de la ligne pilote.
 *
 * Le bandeau de dates permet de passer au jour voisin en un geste, prix a
 * l'appui : quand le car du samedi est complet, la question suivante est
 * toujours « et dimanche, c'est plus cher ? » - y repondre sans rejouer la
 * recherche evite un aller-retour.
 */
function BookableTripResults({ criteria }: { criteria: SearchCriteria }) {
  const router = useRouter();

  const loader = useCallback(
    () =>
      tripService.search({
        origin: criteria.origin,
        destination: criteria.destination,
        date: criteria.date,
        passengers: criteria.passengers,
      }),
    [criteria.origin, criteria.destination, criteria.date, criteria.passengers],
  );

  const { data: trips, isLoading, error, reload } = useAsyncData(loader);

  const days = useMemo(() => [-2, -1, 0, 1, 2].map((offset) => shiftDate(criteria.date, offset)), [criteria.date]);
  const today = todayIso();

  const otherDays = useMemo(() => days.filter((day) => day !== criteria.date), [days, criteria.date]);
  const pricesLoader = useCallback(async () => {
    const entries = await Promise.all(
      otherDays.map(async (day) => {
        try {
          const results = await tripService.search({
            origin: criteria.origin,
            destination: criteria.destination,
            date: day,
            passengers: criteria.passengers,
          });

          return [day, results.length > 0 ? Math.min(...results.map((trip) => trip.price)) : null] as const;
        } catch {
          return [day, null] as const;
        }
      }),
    );

    return Object.fromEntries(entries) as Record<string, number | null>;
  }, [otherDays, criteria.origin, criteria.destination, criteria.passengers]);

  const { data: otherPrices } = useAsyncData(pricesLoader);

  const currentDayPrice = trips && trips.length > 0 ? Math.min(...trips.map((trip) => trip.price)) : null;

  function priceForDay(day: string): number | null {
    return day === criteria.date ? currentDayPrice : (otherPrices?.[day] ?? null);
  }

  const routeLabel =
    trips && trips[0]?.itinerary
      ? `${trips[0].itinerary.origin_city?.name} → ${trips[0].itinerary.destination_city?.name}`
      : `${criteria.origin} → ${criteria.destination}`;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
      <BookingStepper current="recherche" onBack={() => router.back()} />

      <Card accent={false} className="mb-5">
        <CardBody className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">{routeLabel}</h1>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {formatDayCompact(criteria.date)}, {formatWeekdayShort(criteria.date)} · {criteria.passengers} passager
              {criteria.passengers > 1 ? "s" : ""}
            </p>
          </div>
          {trips && trips[0]?.itinerary?.origin_city && trips[0]?.itinerary?.destination_city ? (
            <FavoriteButton
              originCityId={trips[0].itinerary.origin_city.id}
              destinationCityId={trips[0].itinerary.destination_city.id}
            />
          ) : null}
        </CardBody>
      </Card>

      <nav aria-label="Changer de date" className="mb-5 flex items-center gap-2 overflow-x-auto pb-1">
        <Link
          href={searchHref({ ...criteria, date: shiftDate(criteria.date, -1) })}
          aria-label="Jour precedent"
          className={cn(
            "flex h-14 w-10 shrink-0 items-center justify-center rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] hover:border-brand-300",
            criteria.date <= today && "pointer-events-none opacity-40",
          )}
        >
          <IconChevronLeft />
        </Link>
        {days.map((day) => {
          const isActive = day === criteria.date;
          const isPast = day < today;
          const price = priceForDay(day);

          return (
            <Link
              key={day}
              href={searchHref({ ...criteria, date: day })}
              aria-current={isActive ? "date" : undefined}
              className={cn(
                "flex h-14 shrink-0 flex-col items-center justify-center gap-0.5 rounded-2xl px-4 transition-colors",
                isActive
                  ? "bg-[#0e1a3a] text-white shadow-sm"
                  : "border border-[var(--hairline)] bg-[var(--surface)] text-[var(--foreground)] hover:border-brand-300",
                isPast && "pointer-events-none opacity-40",
              )}
            >
              <span className="text-sm font-bold capitalize">{formatDayCompact(day)}</span>
              <span className={cn("text-xs font-medium", isActive ? "text-white/75" : "text-[var(--muted)]")}>
                {price !== null ? `${formatNumber(price)} F` : "-"}
              </span>
            </Link>
          );
        })}
        <Link
          href={searchHref({ ...criteria, date: shiftDate(criteria.date, 1) })}
          aria-label="Jour suivant"
          className="flex h-14 w-10 shrink-0 items-center justify-center rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] hover:border-brand-300"
        >
          <IconChevronRight />
        </Link>
      </nav>

      {trips && trips.length > 0 ? (
        <p className="mb-4 inline-flex w-max items-center gap-1.5 rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] px-3.5 py-2 text-xs font-semibold text-[var(--foreground)]">
          <IconSortAscending className="h-3.5 w-3.5" />
          Par heure de depart
        </p>
      ) : null}

      {isLoading ? (
        <div className="space-y-3" aria-busy="true">
          {[0, 1, 2].map((index) => (
            <Card key={index}>
              <div className="flex items-center justify-between gap-4 p-5">
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-7 w-48" />
                  <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-10 w-28" />
              </div>
            </Card>
          ))}
        </div>
      ) : null}

      {error ? (
        <Card>
          <ErrorState error={error} onRetry={reload} />
        </Card>
      ) : null}

      {trips && trips.length === 0 ? (
        <Card>
          <EmptyState
            icon={<IconBus className="h-5 w-5" />}
            title="Aucun depart ce jour-la"
            description="Essayez une autre date avec le bandeau ci-dessus : les compagnies publient leurs departs une a deux semaines a l'avance."
          />
        </Card>
      ) : null}

      {trips && trips.length > 0 ? (
        <ul className="space-y-3">
          {trips.map((trip) => (
            <li key={trip.id} className="animate-fade-rise">
              <TripCard trip={trip} passengers={criteria.passengers} />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
