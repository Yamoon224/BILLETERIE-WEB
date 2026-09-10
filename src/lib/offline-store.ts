import type { OfflineSaleInput } from "@/services/booking-service";
import type { SeatMap, Ticket, Trip } from "@/types/api";

/**
 * Stockage local du guichet et du controle, pour fonctionner sans reseau.
 *
 * Le cahier des charges exige qu'un agent vende et controle hors ligne, avec
 * une synchronisation correcte au retour du reseau. Trois choses doivent donc
 * survivre a une coupure et a un rechargement de page :
 *
 *  1. **le necessaire pour vendre** — les departs du jour et leur plan de salle,
 *     mis en cache a chaque chargement en ligne ;
 *  2. **les ventes realisees hors ligne**, chacune avec une reference client
 *     attribuee *avant* l'envoi : c'est elle qui rend la synchronisation
 *     rejouable sans doublon cote serveur ;
 *  3. **les controles realises hors ligne**, sur le meme principe, et la liste
 *     d'embarquement qui permet de refuser un second scan meme sans reseau.
 *
 * `localStorage` et non IndexedDB : les volumes sont faibles (une journee de
 * guichet tient en quelques centaines de ko) et l'API synchrone rend chaque
 * ecriture immediatement durable — une vente enregistree ne peut pas se perdre
 * dans une transaction asynchrone interrompue par la fermeture de l'onglet.
 *
 * **Limite assumee du web** : la signature des QR codes n'est pas verifiee hors
 * ligne dans le navigateur, faute d'y embarquer le secret de signature. Hors
 * ligne, le controle s'appuie sur la liste d'embarquement mise en cache ; la
 * signature est reverifiee par le serveur a la synchronisation. L'application
 * Android, elle, embarque la cle de verification (voir la documentation).
 */

const KEYS = {
  trips: "billetterie_offline_trips",
  seatMaps: "billetterie_offline_seatmaps",
  sales: "billetterie_offline_sales",
  manifests: "billetterie_offline_manifests",
  scans: "billetterie_offline_scans",
} as const;

type Listener = () => void;
const listeners = new Set<Listener>();

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } finally {
    for (const listener of listeners) listener();
  }
}

export function subscribeOfflineStore(listener: Listener): () => void {
  listeners.add(listener);
  const onStorage = () => listener();
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** Reference unique d'un geste realise sur ce poste. */
export function newClientReference(prefix: "VENTE" | "SCAN"): string {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);

  return `${prefix}-${Date.now().toString(36)}-${random}`.toUpperCase();
}

// --- Departs et plans de salle ------------------------------------------------------

export function cacheTrips(trips: Trip[]): void {
  write(KEYS.trips, { savedAt: new Date().toISOString(), trips });
}

export function cachedTrips(): { savedAt: string | null; trips: Trip[] } {
  return read(KEYS.trips, { savedAt: null, trips: [] });
}

export function cacheSeatMap(tripId: string, seatMap: SeatMap): void {
  write(KEYS.seatMaps, { ...read<Record<string, SeatMap>>(KEYS.seatMaps, {}), [tripId]: seatMap });
}

export function cachedSeatMap(tripId: string): SeatMap | null {
  return read<Record<string, SeatMap>>(KEYS.seatMaps, {})[tripId] ?? null;
}

// --- Ventes hors ligne -----------------------------------------------------------------

export interface QueuedSale extends OfflineSaleInput {
  /** Montant affiche sur le recu local, a titre indicatif. */
  total_amount: number;
  trip_label: string;
}

/** Vente telle que l'API l'attend, sans les champs d'affichage du recu local. */
export function toOfflineSale(sale: QueuedSale): OfflineSaleInput {
  return {
    client_reference: sale.client_reference,
    sold_at: sale.sold_at,
    trip_id: sale.trip_id,
    customer_name: sale.customer_name,
    customer_phone: sale.customer_phone,
    customer_email: sale.customer_email,
    passengers: sale.passengers,
    payment_method: sale.payment_method,
    payer_msisdn: sale.payer_msisdn,
    station_id: sale.station_id,
    notes: sale.notes,
  };
}

export function queuedSales(): QueuedSale[] {
  return read<QueuedSale[]>(KEYS.sales, []);
}

export function enqueueSale(sale: QueuedSale): void {
  write(KEYS.sales, [...queuedSales(), sale]);
}

export function removeQueuedSales(clientReferences: string[]): void {
  const done = new Set(clientReferences);
  write(KEYS.sales, queuedSales().filter((sale) => !done.has(sale.client_reference)));
}

/** Places vendues localement sur un depart, en attente de synchronisation. */
export function locallySoldSeats(tripId: string): string[] {
  return queuedSales()
    .filter((sale) => sale.trip_id === tripId)
    .flatMap((sale) => sale.passengers.map((passenger) => passenger.seat_number));
}

// --- Controle a l'embarquement ------------------------------------------------------------

export function cacheManifest(tripId: string, tickets: Ticket[]): void {
  write(KEYS.manifests, {
    ...read<Record<string, { savedAt: string; tickets: Ticket[] }>>(KEYS.manifests, {}),
    [tripId]: { savedAt: new Date().toISOString(), tickets },
  });
}

export function cachedManifest(tripId: string): { savedAt: string; tickets: Ticket[] } | null {
  return read<Record<string, { savedAt: string; tickets: Ticket[] }>>(KEYS.manifests, {})[tripId] ?? null;
}

export interface QueuedScan {
  client_reference: string;
  code: string;
  trip_id: string;
  scanned_at: string;
}

export function queuedScans(): QueuedScan[] {
  return read<QueuedScan[]>(KEYS.scans, []);
}

export function enqueueScan(scan: QueuedScan): void {
  write(KEYS.scans, [...queuedScans(), scan]);
}

export function removeQueuedScans(clientReferences: string[]): void {
  const done = new Set(clientReferences);
  write(KEYS.scans, queuedScans().filter((scan) => !done.has(scan.client_reference)));
}

/**
 * Extrait le code billet d'un contenu scanne.
 *
 * Le QR porte « B1|CODE|DEPART|PLACE|HORODATAGE|VERSION|SIGNATURE » ; une
 * saisie manuelle porte le code seul.
 */
export function ticketCodeFromScan(scanned: string): string {
  const value = scanned.trim();

  return (value.startsWith("B1|") ? value.split("|")[1] ?? "" : value).toUpperCase().replace(/\s+/g, "");
}
