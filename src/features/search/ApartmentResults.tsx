"use client";

import { useCallback } from "react";
import { Card, CardBody, EmptyState, ErrorState, Skeleton } from "@/components/ui";
import { IconHome, IconUsers } from "@/components/ui/icons";
import { useAsyncData } from "@/hooks/useAsyncData";
import { formatDayShort } from "@/lib/format";
import { apartmentService, tripService } from "@/services";
import { ApartmentCard } from "./ApartmentCard";
import { ApartmentSearchForm } from "./ApartmentSearchForm";
import type { ApartmentSearchCriteria } from "./ApartmentSearchForm";

/**
 * Resultats de recherche d'appartements.
 *
 * La ville arrive dans l'URL sous forme de slug (comme la recherche de bus) ;
 * elle est resolue en identifiant aupres du meme referentiel de villes avant
 * d'interroger le catalogue - un seul appel compose, pour que l'ecran reste
 * un chargement unique plutot que deux requetes en cascade visibles.
 */
export function ApartmentResults({ criteria }: { criteria: ApartmentSearchCriteria }) {
  const loader = useCallback(async () => {
    const cities = await tripService.cityOptions();
    const city = cities.find((candidate) => candidate.slug === criteria.citySlug) ?? null;
    const result = await apartmentService.search({
      city_id: city?.id,
      capacity: criteria.guests,
      per_page: 20,
    });

    return { cityName: city?.name ?? criteria.citySlug, apartments: result.data };
  }, [criteria.citySlug, criteria.guests]);

  const { data, isLoading, error, reload } = useAsyncData(loader);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
      <Card className="mb-6">
        <CardBody>
          <ApartmentSearchForm initial={criteria} layout="inline" />
        </CardBody>
      </Card>

      <header className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-xl font-extrabold tracking-tight">
          {data ? `Appartements a ${data.cityName}` : "Appartements"}
        </h1>
        <p className="flex items-center gap-3 text-sm text-[var(--muted)]">
          <span>
            {formatDayShort(`${criteria.checkIn}T12:00:00`)} → {formatDayShort(`${criteria.checkOut}T12:00:00`)}
          </span>
          <span className="flex items-center gap-1">
            <IconUsers className="h-4 w-4" /> {criteria.guests}
          </span>
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

      {data && data.apartments.length === 0 ? (
        <Card>
          <EmptyState
            icon={<IconHome className="h-5 w-5" />}
            title="Aucun appartement pour cette recherche"
            description="Essayez une autre ville ou une capacite d'accueil plus large : le catalogue s'agrandit chaque semaine."
          />
        </Card>
      ) : null}

      {data && data.apartments.length > 0 ? (
        <ul className="space-y-3">
          {data.apartments.map((apartment) => (
            <li key={apartment.id} className="animate-fade-rise">
              <ApartmentCard apartment={apartment} />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
