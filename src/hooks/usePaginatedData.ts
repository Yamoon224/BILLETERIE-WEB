"use client";

import { useCallback, useMemo, useState } from "react";
import { config } from "@/lib/config";
import type { Paginated } from "@/types/api";
import { useAsyncData } from "./useAsyncData";

export interface PaginatedState<T> {
  items: T[];
  meta: Paginated<T>["meta"] | null;
  page: number;
  setPage: (page: number) => void;
  perPage: number;
  setPerPage: (perPage: number) => void;
  isLoading: boolean;
  error: unknown;
  reload: () => void;
  /** Vrai uniquement une fois le chargement termine sans resultat. */
  isEmpty: boolean;
}

/**
 * Liste paginee : page, taille de page, chargement, erreur et etat vide en un
 * seul endroit. Les ecrans de liste n'ont plus qu'a decrire leurs colonnes.
 *
 * @param fetcher  doit etre stable (useCallback)
 */
export function usePaginatedData<T>(
  fetcher: (page: number, perPage: number) => Promise<Paginated<T>>,
): PaginatedState<T> {
  const [page, setPage] = useState(1);
  const [perPage, setPerPageState] = useState<number>(config.defaultPageSize);

  const loader = useCallback(() => fetcher(page, perPage), [fetcher, page, perPage]);
  const { data, isLoading, error, reload } = useAsyncData(loader);

  const items = useMemo(() => data?.data ?? [], [data]);

  // Changer la taille de page ramene a la premiere : la page 7 d'un decoupage
  // a 15 n'a pas d'equivalent dans un decoupage a 50.
  const setPerPage = useCallback((next: number) => {
    setPerPageState(next);
    setPage(1);
  }, []);

  return {
    items,
    meta: data?.meta ?? null,
    page,
    setPage,
    perPage,
    setPerPage,
    isLoading,
    error,
    reload,
    isEmpty: !isLoading && error === null && items.length === 0,
  };
}
