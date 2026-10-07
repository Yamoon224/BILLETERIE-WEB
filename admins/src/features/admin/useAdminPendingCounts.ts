"use client";

import { createContext, createElement, useCallback, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import { useAsyncData } from "@kaara/shared/hooks/useAsyncData";
import { apartmentService, networkService, rentalVehicleService } from "@/services";

export interface AdminPendingCounts {
  companies: number;
  partners: number;
  /** A appeler apres une validation ou un rejet : les puces doivent suivre le geste. */
  reload: () => void;
}

const PendingCountsContext = createContext<AdminPendingCounts>({ companies: 0, partners: 0, reload: () => undefined });

/**
 * Compte des fiches en attente de validation, pour les puces de la barre
 * laterale et l'ecran d'ensemble.
 *
 * Charge une seule fois, par la coquille de la console, et partage par
 * contexte : la barre laterale et la vue d'ensemble affichent les memes
 * nombres sans les demander chacune de leur cote.
 *
 * `per_page: 1` : seul `meta.total` interesse ici, pas les lignes elles-memes
 * - inutile de faire transiter des fiches qu'on n'affiche pas.
 */
export function AdminPendingCountsProvider({ children }: { children: ReactNode }) {
  const loader = useCallback(async () => {
    const [companies, apartments, vehicles] = await Promise.all([
      networkService.listCompanies({ status: "pending", per_page: 1 }),
      apartmentService.list({ status: "pending", per_page: 1 }),
      rentalVehicleService.list({ status: "pending", per_page: 1 }),
    ]);

    return { companies: companies.meta.total, partners: apartments.meta.total + vehicles.meta.total };
  }, []);

  const { data, reload } = useAsyncData(loader);

  const value = useMemo<AdminPendingCounts>(
    () => ({ companies: data?.companies ?? 0, partners: data?.partners ?? 0, reload }),
    [data, reload],
  );

  return createElement(PendingCountsContext.Provider, { value }, children);
}

export function useAdminPendingCounts(): AdminPendingCounts {
  return useContext(PendingCountsContext);
}
