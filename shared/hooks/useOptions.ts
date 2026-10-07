"use client";

import { useCallback } from "react";
import { CACHE } from "../lib/api-client";
import { networkService } from "../services";
import type { City, Company, Itinerary, Station, Vehicle } from "../types/api";
import { useAsyncData } from "./useAsyncData";

/**
 * Options des listes deroulantes de formulaire.
 *
 * Cent entrees au plus : le referentiel d'une compagnie tient largement dans
 * ce volume, et une liste deroulante paginee obligerait a chercher une gare
 * page par page.
 *
 * Memorisees le temps d'une session de saisie : rouvrir un formulaire, ou en
 * ouvrir un second qui propose les memes gares, ne relance aucun appel. Une
 * creation ou une modification sur la meme ressource perime la liste (voir
 * lib/api-client), qui est alors relue a la prochaine ouverture.
 */
function useList<T>(loader: () => Promise<{ data: T[] }>, enabled = true): T[] {
  const stable = useCallback(() => (enabled ? loader().then((page) => page.data) : Promise.resolve([] as T[])), [loader, enabled]);
  const { data } = useAsyncData(stable);

  return data ?? [];
}

const OPTIONS = { per_page: 100, is_active: true } as const;
const READ = { cacheFor: CACHE.options } as const;

const loadCompanies = () => networkService.listCompanies(OPTIONS, READ);
const loadCities = () => networkService.listCities(OPTIONS, READ);
const loadStations = () => networkService.listStations(OPTIONS, READ);
const loadVehicles = () => networkService.listVehicles(OPTIONS, READ);
const loadItineraries = () => networkService.listItineraries(OPTIONS, READ);

export const useCompanyOptions = (enabled = true) => useList<Company>(loadCompanies, enabled);
export const useCityOptions = () => useList<City>(loadCities);
export const useStationOptions = () => useList<Station>(loadStations);
export const useVehicleOptions = () => useList<Vehicle>(loadVehicles);
export const useItineraryOptions = () => useList<Itinerary>(loadItineraries);
