"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import type { FormEvent } from "react";
import { Button, SelectField, TextField } from "@/components/ui";
import { IconCalendar, IconSearch } from "@/components/ui/icons";
import { useAsyncData } from "@/hooks/useAsyncData";
import { todayIso } from "@/lib/format";
import { tripService } from "@/services";

export interface RentalVehicleSearchCriteria {
  citySlug: string;
  pickupDate: string;
  returnDate: string;
}

export function rentalVehicleSearchHref(criteria: RentalVehicleSearchCriteria): string {
  const params = new URLSearchParams({
    ville: criteria.citySlug,
    prise_en_charge: criteria.pickupDate,
    retour: criteria.returnDate,
  });

  return `/location-auto?${params.toString()}`;
}

/** Formulaire de recherche de vehicule de location. */
export function RentalVehicleSearchForm({
  initial,
  layout = "stacked",
}: {
  initial?: Partial<RentalVehicleSearchCriteria>;
  layout?: "stacked" | "inline";
}) {
  const router = useRouter();
  const loadCities = useCallback(() => tripService.cityOptions(), []);
  const { data: cities, isLoading } = useAsyncData(loadCities);

  const [citySlug, setCitySlug] = useState(initial?.citySlug ?? "");
  const [pickupDate, setPickupDate] = useState(initial?.pickupDate ?? todayIso(1));
  const [returnDate, setReturnDate] = useState(initial?.returnDate ?? todayIso(4));
  const [error, setError] = useState<string | null>(null);

  function submit(event: FormEvent) {
    event.preventDefault();

    if (!citySlug) {
      setError("Choisissez un lieu de prise en charge.");
      return;
    }

    if (returnDate <= pickupDate) {
      setError("La date de retour doit etre posterieure a la date de prise en charge.");
      return;
    }

    setError(null);
    router.push(rentalVehicleSearchHref({ citySlug, pickupDate, returnDate }));
  }

  const cityOptions = cities ?? [];

  const pickupPlaceField = (
    <SelectField
      label="Lieu de prise en charge"
      value={citySlug}
      onChange={(event) => setCitySlug(event.target.value)}
      disabled={isLoading}
      required
    >
      <option value="">{isLoading ? "Chargement des villes…" : "Choisir une ville"}</option>
      {cityOptions.map((city) => (
        <option key={city.id} value={city.slug}>
          {city.name}
        </option>
      ))}
    </SelectField>
  );

  const pickupDateField = (
    <TextField
      label="Prise en charge"
      type="date"
      value={pickupDate}
      min={todayIso()}
      onChange={(event) => setPickupDate(event.target.value)}
      placeholder="jj/mm/aaaa"
      required
      adornment={<IconCalendar className="h-4 w-4 text-stone-400" />}
    />
  );

  const returnDateField = (
    <TextField
      label="Retour"
      type="date"
      value={returnDate}
      min={pickupDate}
      onChange={(event) => setReturnDate(event.target.value)}
      placeholder="jj/mm/aaaa"
      required
      adornment={<IconCalendar className="h-4 w-4 text-stone-400" />}
    />
  );

  const errorMessage = error ? (
    <p role="alert" className="mt-3 text-sm font-medium text-rose-600 dark:text-rose-400">
      {error}
    </p>
  ) : null;

  if (layout === "stacked") {
    return (
      <form onSubmit={submit} noValidate aria-label="Rechercher un vehicule de location" className="flex flex-col gap-3">
        {pickupPlaceField}

        <div className="grid grid-cols-2 gap-3">
          {pickupDateField}
          {returnDateField}
        </div>

        <Button type="submit" size="lg" icon={<IconSearch className="h-4 w-4" />} className="w-full">
          Trouver un vehicule
        </Button>

        {errorMessage}
      </form>
    );
  }

  return (
    <form onSubmit={submit} noValidate aria-label="Rechercher un vehicule de location">
      <div className="grid gap-3 md:grid-cols-[1.2fr_1fr_1fr_auto] md:items-end">
        {pickupPlaceField}
        {pickupDateField}
        {returnDateField}

        <Button type="submit" size="lg" icon={<IconSearch className="h-4 w-4" />} className="w-full md:w-auto">
          Rechercher
        </Button>
      </div>

      {errorMessage}
    </form>
  );
}
