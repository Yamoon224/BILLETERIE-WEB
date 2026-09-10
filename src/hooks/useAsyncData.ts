"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: unknown;
  /** Relance la requete — apres une mutation, par exemple. */
  reload: () => void;
}

/**
 * Charge une donnee asynchrone en distinguant chargement, erreur et donnee.
 *
 * Chaque requete est identifiee par un objet recree des que le chargeur ou le
 * jeton de rechargement change, et le resultat memorise transporte l'identite
 * de la requete qui l'a produit. Deux proprietes en decoulent :
 *
 *  - `isLoading` est **derive** plutot que stocke : un drapeau stocke finit
 *    toujours par se desynchroniser sur un cas limite ;
 *  - une reponse obsolete est ignoree : c'est la derniere requete demandee qui
 *    gagne, pas la derniere arrivee — ce qui compte sur un reseau mobile ou
 *    les reponses se croisent.
 *
 * @param loader  doit etre stable (useCallback)
 */
export function useAsyncData<T>(loader: () => Promise<T>): AsyncState<T> {
  const [reloadToken, setReloadToken] = useState(0);

  const request = useMemo(() => ({ loader, generation: reloadToken }), [loader, reloadToken]);

  const [result, setResult] = useState<{ request: unknown; data: T | null; error: unknown } | null>(
    null,
  );

  useEffect(() => {
    let active = true;

    request
      .loader()
      .then((data) => {
        if (active) setResult({ request, data, error: null });
      })
      .catch((error: unknown) => {
        if (active) setResult({ request, data: null, error });
      });

    return () => {
      active = false;
    };
  }, [request]);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  const isCurrent = result !== null && result.request === request;

  return {
    data: isCurrent ? result.data : null,
    error: isCurrent ? result.error : null,
    isLoading: !isCurrent,
    reload,
  };
}
