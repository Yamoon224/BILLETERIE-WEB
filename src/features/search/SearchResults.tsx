"use client";

import Link from "next/link";
import { useCallback, useMemo } from "react";
import { Card, CardBody, EmptyState, ErrorState, Skeleton } from "@/components/ui";
import { IconBus, IconCalendar, IconChevronLeft, IconChevronRight } from "@/components/ui/icons";
import { useAsyncData } from "@/hooks/useAsyncData";
import { cn } from "@/lib/cn";
import { formatDayLong, formatDayShort, todayIso } from "@/lib/format";
import { tripService } from "@/services";
import { TripCard } from "./TripCard";
import { searchHref, TripSearchForm } from "./TripSearchForm";
import type { SearchCriteria } from "./TripSearchForm";

function shiftDate(isoDate: string, days: number): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(year, month - 1, day + days);

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/**
 * Resultats de recherche.
 *
 * Le bandeau de dates permet de passer au jour voisin en un geste : quand le
 * car du samedi est complet, la question suivante est toujours « et
 * dimanche ? », et la reposer via le formulaire ferait ressaisir quatre champs.
 */
export function SearchResults({ criteria }: { criteria: SearchCriteria }) {
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

  const routeLabel =
    trips && trips[0]?.itinerary
      ? `${trips[0].itinerary.origin_city?.name} → ${trips[0].itinerary.destination_city?.name}`
      : "Departs disponibles";

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
      <Card className="mb-6">
        <CardBody>
          <TripSearchForm initial={criteria} layout="inline" />
        </CardBody>
      </Card>

      <nav aria-label="Changer de date" className="mb-5 flex items-center gap-2 overflow-x-auto pb-1">
        <Link
          href={searchHref({ ...criteria, date: shiftDate(criteria.date, -1) })}
          aria-label="Jour precedent"
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-[var(--hairline)] bg-[var(--surface)] hover:border-brand-300",
            criteria.date <= today && "pointer-events-none opacity-40",
          )}
        >
          <IconChevronLeft />
        </Link>
        {days.map((day) => {
          const isActive = day === criteria.date;
          const isPast = day < today;

          return (
            <Link
              key={day}
              href={searchHref({ ...criteria, date: day })}
              aria-current={isActive ? "date" : undefined}
              className={cn(
                "flex h-10 shrink-0 items-center rounded-sm px-4 text-sm font-semibold capitalize transition-colors",
                isActive
                  ? "grad-brand text-white shadow-sm"
                  : "border border-[var(--hairline)] bg-[var(--surface)] hover:border-brand-300",
                isPast && "pointer-events-none opacity-40",
              )}
            >
              {formatDayShort(`${day}T12:00:00`)}
            </Link>
          );
        })}
        <Link
          href={searchHref({ ...criteria, date: shiftDate(criteria.date, 1) })}
          aria-label="Jour suivant"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-[var(--hairline)] bg-[var(--surface)] hover:border-brand-300"
        >
          <IconChevronRight />
        </Link>
      </nav>

      <header className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-xl font-extrabold tracking-tight">{routeLabel}</h1>
        <p className="flex items-center gap-1.5 text-sm capitalize text-[var(--muted)]">
          <IconCalendar className="h-4 w-4" />
          {formatDayLong(`${criteria.date}T12:00:00`)}
        </p>
      </header>

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
