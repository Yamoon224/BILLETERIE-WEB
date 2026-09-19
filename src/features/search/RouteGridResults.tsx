"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { Card, CardBody, EmptyState, ErrorState, Skeleton } from "@/components/ui";
import { IconBus } from "@/components/ui/icons";
import { BookingStepper } from "@/features/booking/BookingStepper";
import { FavoriteButton } from "@/features/favorites/FavoriteButton";
import { useAsyncData } from "@/hooks/useAsyncData";
import { config } from "@/lib/config";
import { formatDayCompact, formatWeekdayShort } from "@/lib/format";
import { routeGridService, tripService } from "@/services";
import { RouteGridCard } from "./RouteGridCard";
import { searchHref } from "./TripSearchForm";
import type { SearchCriteria } from "./TripSearchForm";

/**
 * Resultat d'une recherche hors ligne pilote : les informations du trajet
 * saisies par l'administrateur (grille des trajets), avec un bouton
 * « Bientot disponible » a la place de la reservation.
 *
 * Aucun depart n'est interroge ici : tant qu'une liaison n'est pas ouverte a la
 * vente, montrer des departs reservables contredirait le bouton.
 */
export function RouteGridResults({ criteria }: { criteria: SearchCriteria }) {
  const router = useRouter();

  const loadEntries = useCallback(
    () => routeGridService.search(criteria.origin, criteria.destination),
    [criteria.origin, criteria.destination],
  );
  const { data: entries, isLoading, error, reload } = useAsyncData(loadEntries);

  // Les noms viennent du referentiel : la grille peut etre vide, et l'URL ne
  // porte que des slugs.
  const loadCities = useCallback(() => tripService.cityOptions(), []);
  const { data: cities } = useAsyncData(loadCities);
  const nameOf = (slug: string) => cities?.find((city) => city.slug === slug)?.name ?? slug;

  const first = entries?.[0];
  const routeLabel = `${first?.origin_city?.name ?? nameOf(criteria.origin)} → ${first?.destination_city?.name ?? nameOf(criteria.destination)}`;

  const pilotHref = searchHref({
    ...criteria,
    origin: config.pilotLine.origin,
    destination: config.pilotLine.destination,
  });

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
          {first?.origin_city && first.destination_city ? (
            <FavoriteButton originCityId={first.origin_city.id} destinationCityId={first.destination_city.id} />
          ) : null}
        </CardBody>
      </Card>

      {isLoading ? (
        <div className="space-y-3" aria-busy="true">
          {[0, 1].map((index) => (
            <Card key={index}>
              <div className="space-y-3 p-5">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-64" />
                <Skeleton className="h-10 w-full" />
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

      {entries && entries.length === 0 ? (
        <Card>
          <EmptyState
            icon={<IconBus className="h-5 w-5" />}
            title="Bientôt disponible"
            description="Les informations de ce trajet (prix, horaires, duree) seront publiees prochainement."
          />
        </Card>
      ) : null}

      {entries && entries.length > 0 ? (
        <ul className="space-y-3">
          {entries.map((entry) => (
            <li key={entry.id} className="animate-fade-rise">
              <RouteGridCard entry={entry} />
            </li>
          ))}
        </ul>
      ) : null}

      {entries ? (
        <p className="mt-5 rounded-2xl border border-[var(--hairline)] bg-[var(--surface-muted)] px-4 py-3 text-sm leading-relaxed text-[var(--muted)]">
          ℹ️ Cette ligne n&apos;est pas encore reservable sur Kaara. Seule la ligne pilote{" "}
          <Link href={pilotHref} className="font-semibold text-brand-600 underline underline-offset-2 dark:text-brand-400">
            {nameOf(config.pilotLine.origin)} – {nameOf(config.pilotLine.destination)}
          </Link>{" "}
          l&apos;est pour le moment.
        </p>
      ) : null}
    </div>
  );
}
