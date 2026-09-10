"use client";

import { useMemo, useState } from "react";
import type { SortState } from "@/components/ui/DataTable";

/**
 * Tri d'une liste, delegue a l'API.
 *
 * `sortParams` est memoise : il entre dans les dependances du chargeur de la
 * liste, et un nouvel objet a chaque rendu relancerait la requete en boucle.
 */
export function useSort(initial: SortState = { key: null, direction: "asc" }) {
  const [sort, setSort] = useState<SortState>(initial);

  const sortParams = useMemo(
    () => (sort.key ? { sort: sort.key, direction: sort.direction } : {}),
    [sort],
  );

  return { sort, setSort, sortParams };
}
