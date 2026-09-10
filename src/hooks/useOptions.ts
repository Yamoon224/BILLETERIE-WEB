"use client";

import { useCallback } from "react";
import { networkService } from "@/services";
import type { City, Company, Itinerary, Station, Vehicle } from "@/types/api";
import { useAsyncData } from "./useAsyncData";

/**
 * Options des listes deroulantes de formulaire.
 *
 * Chargees une fois par ecran, cent entrees au plus : le referentiel d'une
 * compagnie tient largement dans ce volume, et une liste deroulante paginee
 * obligerait a chercher une gare page par page.
 */
function useList<T>(loader: () => Promise<{ data: T[] }>, enabled = true): T[] {
  const stable = useCallback(() => (enabled ? loader().then((page) => page.data) : Promise.resolve([] as T[])), [loader, enabled]);
  const { data } = useAsyncData(stable);

  return data ?? [];
}

const loadCompanies = () => networkService.listCompanies({ per_page: 100, is_active: true });
const loadCities = () => networkService.listCities({ per_page: 100, is_active: true });
const loadStations = () => networkService.listStations({ per_page: 100, is_active: true });
const loadVehicles = () => networkService.listVehicles({ per_page: 100, is_active: true });
const loadItineraries = () => networkService.listItineraries({ per_page: 100, is_active: true });

export const useCompanyOptions = (enabled = true) => useList<Company>(loadCompanies, enabled);
export const useCityOptions = () => useList<City>(loadCities);
export const useStationOptions = () => useList<Station>(loadStations);
export const useVehicleOptions = () => useList<Vehicle>(loadVehicles);
export const useItineraryOptions = () => useList<Itinerary>(loadItineraries);
