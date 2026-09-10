"use client";

import { useCallback, useSyncExternalStore } from "react";
import { readPreference, subscribePreference, writePreference } from "@/lib/preferences";

/**
 * Lit une preference persistee et la tient a jour.
 *
 * Le rendu serveur et la premiere passe d'hydratation utilisent la valeur par
 * defaut — seul moyen d'eviter une divergence, le serveur n'ayant aucun acces
 * au stockage du navigateur. Le script inline du theme a deja evite tout
 * clignotement visuel.
 */
export function usePreference(key: string, fallback: string): [string, (value: string) => void] {
  const subscribe = useCallback(
    (onChange: () => void) => subscribePreference(key, onChange),
    [key],
  );

  const value = useSyncExternalStore(
    subscribe,
    useCallback(() => readPreference(key) ?? fallback, [key, fallback]),
    useCallback(() => fallback, [fallback]),
  );

  const setValue = useCallback((next: string) => writePreference(key, next), [key]);

  return [value, setValue];
}
