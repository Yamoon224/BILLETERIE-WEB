"use client";

import { useCallback } from "react";
import { useAsyncData } from "@/hooks/useAsyncData";
import { apartmentService, networkService, rentalVehicleService } from "@/services";

export interface AdminPendingCounts {
  companies: number;
  partners: number;
}

/**
 * Compte des fiches en attente de validation, pour les puces de la barre
 * laterale et l'ecran d'ensemble.
 *
 * `per_page: 1` : seul `meta.total` interesse ici, pas les lignes elles-memes
 * - inutile de faire transiter des fiches qu'on n'affiche pas.
 */
export function useAdminPendingCounts(): AdminPendingCounts {
  const loader = useCallback(async () => {
    const [companies, apartments, vehicles] = await Promise.all([
      networkService.listCompanies({ status: "pending", per_page: 1 }),
      apartmentService.list({ status: "pending", per_page: 1 }),
      rentalVehicleService.list({ status: "pending", per_page: 1 }),
    ]);

    return { companies: companies.meta.total, partners: apartments.meta.total + vehicles.meta.total };
  }, []);

  const { data } = useAsyncData(loader);

  return data ?? { companies: 0, partners: 0 };
}
