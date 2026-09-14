"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import type { FormEvent } from "react";
import { Button, Modal, SelectField, TextField } from "@/components/ui";
import { IconCalendar, IconMinus, IconPlus, IconSearch, IconSwap, IconUsers } from "@/components/ui/icons";
import { useAsyncData } from "@/hooks/useAsyncData";
import { config } from "@/lib/config";
import { todayIso } from "@/lib/format";
import { tripService } from "@/services";

export interface SearchCriteria {
  origin: string;
  destination: string;
  date: string;
  passengers: number;
}

export function searchHref(criteria: SearchCriteria): string {
  const params = new URLSearchParams({
    depart: criteria.origin,
    arrivee: criteria.destination,
    date: criteria.date,
    voyageurs: String(criteria.passengers),
  });

  return `/recherche?${params.toString()}`;
}

/**
 * Formulaire de recherche de trajet.
 *
 * Le resultat est une URL et non un etat : une recherche se partage par
 * messagerie (« regarde, il y a un car a 14 h »), se met en favori, et survit
 * a un rechargement de page sur un reseau qui coupe.
 */
export function TripSearchForm({
  initial,
  layout = "stacked",
}: {
  initial?: Partial<SearchCriteria>;
  layout?: "stacked" | "inline";
}) {
  const router = useRouter();
  const loadCities = useCallback(() => tripService.cityOptions(), []);
  const { data: cities, isLoading } = useAsyncData(loadCities);

  const [origin, setOrigin] = useState(initial?.origin ?? "");
  const [destination, setDestination] = useState(initial?.destination ?? "");
  const [date, setDate] = useState(initial?.date ?? todayIso(1));
  const [passengers, setPassengers] = useState(initial?.passengers ?? 1);
  const [error, setError] = useState<string | null>(null);
  const [isPassengersOpen, setIsPassengersOpen] = useState(false);

  function swap() {
    setOrigin(destination);
    setDestination(origin);
  }

  function submit(event: FormEvent) {
    event.preventDefault();

    if (!origin || !destination) {
      setError("Choisissez une ville de depart et une ville d'arrivee.");
      return;
    }

    if (origin === destination) {
      setError("La ville d'arrivee doit differer de la ville de depart.");
      return;
    }

    setError(null);
    router.push(searchHref({ origin, destination, date, passengers }));
  }

  const cityOptions = cities ?? [];

  const originField = (
    <SelectField
      label="Depart"
      value={origin}
      onChange={(event) => setOrigin(event.target.value)}
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

  const destinationField = (
    <SelectField
      label="Arrivee"
      value={destination}
      onChange={(event) => setDestination(event.target.value)}
      disabled={isLoading}
      required
    >
      <option value="">{isLoading ? "Chargement des villes…" : "Choisir une ville"}</option>
      {cityOptions.map((city) => (
        <option key={city.id} value={city.slug} disabled={city.slug === origin}>
          {city.name}
        </option>
      ))}
    </SelectField>
  );

  const dateField = (
    <TextField
      label="Date du voyage"
      type="date"
      value={date}
      min={todayIso()}
      onChange={(event) => setDate(event.target.value)}
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
    // Ordre impose : depart, inversion, arrivee, date, voyageurs, rechercher.
    // Rien n'est cote a cote — chaque champ occupe toute la largeur pour rester
    // atteignable au pouce sur un telephone tenu d'une main.
    return (
      <form onSubmit={submit} noValidate aria-label="Rechercher un trajet" className="flex flex-col gap-3">
        <div className="relative flex flex-col gap-3">
          {originField}
          {destinationField}
          <button
            type="button"
            onClick={swap}
            aria-label="Inverser depart et arrivee"
            title="Inverser"
            className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-brand-500 text-white shadow-md transition-transform hover:rotate-180 hover:bg-brand-600"
          >
            <IconSwap className="h-4 w-4 rotate-90" />
          </button>
        </div>

        {dateField}

        <button
          type="button"
          onClick={() => setIsPassengersOpen(true)}
          className="flex w-full items-center justify-between rounded-sm border border-[var(--field-border)] bg-transparent px-3.5 py-3 text-left transition-colors hover:border-[var(--field-border-hover)]"
        >
          <span className="min-w-0">
            <span className="block text-[0.7rem] font-semibold text-[var(--field-label)]">Voyageurs</span>
            <span className="block text-sm font-medium text-[var(--foreground)]">
              {passengers} {passengers > 1 ? "voyageurs" : "voyageur"}
            </span>
          </span>
          <IconUsers className="h-4 w-4 shrink-0 text-stone-400" />
        </button>

        <Button type="submit" size="lg" icon={<IconSearch className="h-4 w-4" />} className="w-full">
          Rechercher
        </Button>

        {errorMessage}

        <Modal
          isOpen={isPassengersOpen}
          onClose={() => setIsPassengersOpen(false)}
          title="Voyageurs"
          size="sm"
          footer={
            <Button onClick={() => setIsPassengersOpen(false)}>Valider</Button>
          }
        >
          <PassengerCounter value={passengers} onChange={setPassengers} />
        </Modal>
      </form>
    );
  }

  return (
    <form onSubmit={submit} noValidate aria-label="Rechercher un trajet">
      <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr_11rem_9rem_auto] md:items-end">
        {originField}

        <div className="flex justify-center md:pb-1">
          <button
            type="button"
            onClick={swap}
            aria-label="Inverser depart et arrivee"
            title="Inverser"
            className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-[var(--hairline)] bg-[var(--surface)] text-brand-600 shadow-sm transition-transform hover:rotate-180 hover:border-brand-300 dark:text-brand-400"
          >
            <IconSwap className="h-4 w-4 rotate-90 md:rotate-0" />
          </button>
        </div>

        {destinationField}
        {dateField}
        <PassengerStepper value={passengers} onChange={setPassengers} />

        <Button type="submit" size="lg" icon={<IconSearch className="h-4 w-4" />} className="w-full md:w-auto">
          Rechercher
        </Button>
      </div>

      {errorMessage}
    </form>
  );
}

/**
 * Nombre de voyageurs par boutons plutot que par liste deroulante : sur un
 * telephone, deux touches valent mieux qu'un selecteur natif qui masque la
 * moitie de l'ecran.
 */
function PassengerStepper({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  const max = config.maxPassengersOnline;

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
          {value} {value > 1 ? "voyageurs" : "voyageur"}
        </output>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
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

/**
 * Compteur de voyageurs affiche dans le modal ouvert depuis le formulaire
 * mobile : un champ compact dans le formulaire, un choix confortable au pouce
 * une fois ouvert.
 */
function PassengerCounter({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  const max = config.maxPassengersOnline;

  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <span className="text-sm font-semibold">Voyageur{value > 1 ? "s" : ""}</span>
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
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          aria-label="Ajouter un voyageur"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--hairline)] text-brand-600 hover:bg-brand-50 disabled:opacity-40 dark:hover:bg-stone-800"
        >
          <IconPlus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
