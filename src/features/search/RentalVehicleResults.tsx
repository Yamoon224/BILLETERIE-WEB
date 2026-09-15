"use client";

import { useCallback } from "react";
import { Card, CardBody, EmptyState, ErrorState, Skeleton } from "@/components/ui";
import { IconCar } from "@/components/ui/icons";
import { useAsyncData } from "@/hooks/useAsyncData";
import { formatDayShort } from "@/lib/format";
import { rentalVehicleService, tripService } from "@/services";
import { RentalVehicleCard } from "./RentalVehicleCard";
import { RentalVehicleSearchForm } from "./RentalVehicleSearchForm";
import type { RentalVehicleSearchCriteria } from "./RentalVehicleSearchForm";

/** Resultats de recherche de vehicules de location. Meme logique qu'ApartmentResults. */
export function RentalVehicleResults({ criteria }: { criteria: RentalVehicleSearchCriteria }) {
  const loader = useCallback(async () => {
    const cities = await tripService.cityOptions();
    const city = cities.find((candidate) => candidate.slug === criteria.citySlug) ?? null;
    const result = await rentalVehicleService.search({
      city_id: city?.id,
      per_page: 20,
    });

    return { cityName: city?.name ?? criteria.citySlug, vehicles: result.data };
  }, [criteria.citySlug]);

  const { data, isLoading, error, reload } = useAsyncData(loader);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
      <Card className="mb-6">
        <CardBody>
          <RentalVehicleSearchForm initial={criteria} layout="inline" />
        </CardBody>
      </Card>

      <header className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-xl font-extrabold tracking-tight">
          {data ? `Vehicules de location a ${data.cityName}` : "Vehicules de location"}
        </h1>
        <p className="text-sm text-[var(--muted)]">
          {formatDayShort(`${criteria.pickupDate}T12:00:00`)} → {formatDayShort(`${criteria.returnDate}T12:00:00`)}
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

      {data && data.vehicles.length === 0 ? (
        <Card>
          <EmptyState
            icon={<IconCar className="h-5 w-5" />}
            title="Aucun vehicule pour cette recherche"
            description="Essayez une autre ville : le catalogue s'agrandit chaque semaine."
          />
        </Card>
      ) : null}

      {data && data.vehicles.length > 0 ? (
        <ul className="space-y-3">
          {data.vehicles.map((vehicle) => (
            <li key={vehicle.id} className="animate-fade-rise">
              <RentalVehicleCard vehicle={vehicle} />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
