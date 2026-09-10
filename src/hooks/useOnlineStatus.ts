"use client";

import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void): () => void {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);

  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
}

/**
 * Etat du reseau selon le navigateur.
 *
 * `navigator.onLine` ne garantit pas que l'API repond — il dit seulement que
 * l'appareil a une interface active. Il sert donc a l'affichage et au
 * declenchement de la synchronisation ; la decision de basculer une vente en
 * file hors ligne, elle, repose sur l'echec reel de la requete.
 */
export function useOnlineStatus(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true,
  );
}
