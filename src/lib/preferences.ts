/**
 * Preferences d'interface persistees dans le navigateur (theme, barre laterale
 * repliee).
 *
 * Elles vivent hors de React : le rendu serveur ne les connait pas, un autre
 * onglet peut les modifier, et le stockage peut etre bloque. Elles sont donc
 * exposees comme un magasin externe abonnable, lu avec `useSyncExternalStore`,
 * plutot que recopiees dans un etat au montage — ce qui provoquerait un rendu
 * en cascade a chaque chargement.
 */

type Listener = () => void;

const listeners = new Map<string, Set<Listener>>();

export function readPreference(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writePreference(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Sans persistance, le choix ne vaudra que pour l'onglet courant : les
    // abonnes sont notifies quand meme, sinon l'interface ne reagirait pas.
  }

  for (const listener of listeners.get(key) ?? []) listener();
}

export function subscribePreference(key: string, listener: Listener): () => void {
  const forKey = listeners.get(key) ?? new Set<Listener>();
  forKey.add(listener);
  listeners.set(key, forKey);

  // `storage` ne se declenche que pour les *autres* onglets : c'est ce qui
  // garde deux fenetres de l'application coherentes entre elles.
  const onStorage = (event: StorageEvent) => {
    if (event.key === key || event.key === null) listener();
  };
  window.addEventListener("storage", onStorage);

  return () => {
    forKey.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}
