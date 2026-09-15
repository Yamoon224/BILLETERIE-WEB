"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import type { FormEvent } from "react";
import { Button, Modal, SelectField, TextField } from "@/components/ui";
import { IconCalendar, IconMinus, IconPlus, IconSearch, IconUsers } from "@/components/ui/icons";
import { useAsyncData } from "@/hooks/useAsyncData";
import { todayIso } from "@/lib/format";
import { tripService } from "@/services";

export interface ApartmentSearchCriteria {
  citySlug: string;
  checkIn: string;
  checkOut: string;
  guests: number;
}

export function apartmentSearchHref(criteria: ApartmentSearchCriteria): string {
  const params = new URLSearchParams({
    ville: criteria.citySlug,
    arrivee: criteria.checkIn,
    depart: criteria.checkOut,
    voyageurs: String(criteria.guests),
  });

  return `/appartements?${params.toString()}`;
}

/**
 * Formulaire de recherche d'appartement.
 *
 * Les villes viennent du meme referentiel que la recherche de bus
 * (`tripService.cityOptions`) : un seul catalogue de villes pour les trois
 * piliers, pas de doublon a maintenir cote frontend.
 */
export function ApartmentSearchForm({
  initial,
  layout = "stacked",
}: {
  initial?: Partial<ApartmentSearchCriteria>;
  layout?: "stacked" | "inline";
}) {
  const router = useRouter();
  const loadCities = useCallback(() => tripService.cityOptions(), []);
  const { data: cities, isLoading } = useAsyncData(loadCities);

  const [citySlug, setCitySlug] = useState(initial?.citySlug ?? "");
  const [checkIn, setCheckIn] = useState(initial?.checkIn ?? todayIso(7));
  const [checkOut, setCheckOut] = useState(initial?.checkOut ?? todayIso(9));
  const [guests, setGuests] = useState(initial?.guests ?? 2);
  const [error, setError] = useState<string | null>(null);
  const [isGuestsOpen, setIsGuestsOpen] = useState(false);

  function submit(event: FormEvent) {
    event.preventDefault();

    if (!citySlug) {
      setError("Choisissez une destination.");
      return;
    }

    if (checkOut <= checkIn) {
      setError("La date de depart doit etre posterieure a la date d'arrivee.");
      return;
    }

    setError(null);
    router.push(apartmentSearchHref({ citySlug, checkIn, checkOut, guests }));
  }

  const cityOptions = cities ?? [];

  const destinationField = (
    <SelectField
      label="Destination"
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

  const checkInField = (
    <TextField
      label="Arrivee"
      type="date"
      value={checkIn}
      min={todayIso()}
      onChange={(event) => setCheckIn(event.target.value)}
      placeholder="jj/mm/aaaa"
      required
      adornment={<IconCalendar className="h-4 w-4 text-stone-400" />}
    />
  );

  const checkOutField = (
    <TextField
      label="Depart"
      type="date"
      value={checkOut}
      min={checkIn}
      onChange={(event) => setCheckOut(event.target.value)}
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
      <form onSubmit={submit} noValidate aria-label="Rechercher un appartement" className="flex flex-col gap-3">
        {destinationField}

        <div className="grid grid-cols-2 gap-3">
          {checkInField}
          {checkOutField}
        </div>

        <button
          type="button"
          onClick={() => setIsGuestsOpen(true)}
          className="flex w-full items-center justify-between rounded-sm border border-[var(--field-border)] bg-transparent px-3.5 py-3 text-left transition-colors hover:border-[var(--field-border-hover)]"
        >
          <span className="min-w-0">
            <span className="block text-[0.7rem] font-semibold text-[var(--field-label)]">Voyageurs</span>
            <span className="block text-sm font-medium text-[var(--foreground)]">
              {guests} {guests > 1 ? "personnes" : "personne"}
            </span>
          </span>
          <IconUsers className="h-4 w-4 shrink-0 text-stone-400" />
        </button>

        <Button type="submit" size="lg" icon={<IconSearch className="h-4 w-4" />} className="w-full">
          Trouver un logement
        </Button>

        {errorMessage}

        <Modal
          isOpen={isGuestsOpen}
          onClose={() => setIsGuestsOpen(false)}
          title="Voyageurs"
          size="sm"
          footer={<Button onClick={() => setIsGuestsOpen(false)}>Valider</Button>}
        >
          <GuestCounter value={guests} onChange={setGuests} />
        </Modal>
      </form>
    );
  }

  return (
    <form onSubmit={submit} noValidate aria-label="Rechercher un appartement">
      <div className="grid gap-3 md:grid-cols-[1.2fr_1fr_1fr_9rem_auto] md:items-end">
        {destinationField}
        {checkInField}
        {checkOutField}
        <GuestStepper value={guests} onChange={setGuests} />

        <Button type="submit" size="lg" icon={<IconSearch className="h-4 w-4" />} className="w-full md:w-auto">
          Rechercher
        </Button>
      </div>

      {errorMessage}
    </form>
  );
}

function GuestStepper({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <div className="field-shell">
      <div className="flex h-[2.85rem] items-center justify-between rounded-sm px-1.5">
        <button
          type="button"
          onClick={() => onChange(Math.max(1, value - 1))}
          disabled={value <= 1}
          aria-label="Retirer un voyageur"
          className="flex h-8 w-8 items-center justify-center rounded-sm text-brand-600 hover:bg-brand-50 disabled:opacity-40 dark:hover:bg-stone-800"
        >
          <IconMinus />
        </button>
        <output aria-live="polite" className="text-sm font-bold tabular-nums">
          {value} {value > 1 ? "personnes" : "personne"}
        </output>
        <button
          type="button"
          onClick={() => onChange(Math.min(16, value + 1))}
          disabled={value >= 16}
          aria-label="Ajouter un voyageur"
          className="flex h-8 w-8 items-center justify-center rounded-sm text-brand-600 hover:bg-brand-50 disabled:opacity-40 dark:hover:bg-stone-800"
        >
          <IconPlus />
        </button>
      </div>
      <fieldset aria-hidden="true" className="field-outline">
        <legend style={{ maxWidth: "100%" }}>
          <span>Voyageurs</span>
        </legend>
      </fieldset>
      <span className="field-label" style={{ top: "-0.4rem", fontSize: "0.7rem", fontWeight: 600 }}>
        Voyageurs
      </span>
    </div>
  );
}

function GuestCounter({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <span className="text-sm font-semibold">Personne{value > 1 ? "s" : ""}</span>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => onChange(Math.max(1, value - 1))}
          disabled={value <= 1}
          aria-label="Retirer un voyageur"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--hairline)] text-brand-600 hover:bg-brand-50 disabled:opacity-40 dark:hover:bg-stone-800"
        >
          <IconMinus className="h-4 w-4" />
        </button>
        <output aria-live="polite" className="w-6 text-center text-lg font-bold tabular-nums">
          {value}
        </output>
        <button
          type="button"
          onClick={() => onChange(Math.min(16, value + 1))}
          disabled={value >= 16}
          aria-label="Ajouter un voyageur"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--hairline)] text-brand-600 hover:bg-brand-50 disabled:opacity-40 dark:hover:bg-stone-800"
        >
          <IconPlus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
