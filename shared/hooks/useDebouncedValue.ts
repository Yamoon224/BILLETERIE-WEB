"use client";

import { useEffect, useState } from "react";

/**
 * Retarde la prise en compte d'une valeur saisie.
 *
 * Sans ce delai, chaque frappe dans une recherche declenche une requete : sur
 * un reseau 3G, dix requetes pour « Yamoussoukro » arrivent dans le desordre et
 * font clignoter la liste.
 */
export function useDebouncedValue<T>(value: T, delayMs = 350): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs);

    return () => window.clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
