"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { errorMessage } from "@/lib/api-client";
import {
  queuedScans,
  queuedSales,
  removeQueuedScans,
  removeQueuedSales,
  subscribeOfflineStore,
  toOfflineSale,
} from "@/lib/offline-store";
import type { QueuedScan, QueuedSale } from "@/lib/offline-store";
import { bookingService, ticketService } from "@/services";
import type { OfflineSyncResult } from "@/services/booking-service";
import { useOnlineStatus } from "./useOnlineStatus";

const EMPTY_SALES: QueuedSale[] = [];
const EMPTY_SCANS: QueuedScan[] = [];

/**
 * File des gestes realises hors ligne, et leur synchronisation.
 *
 * La synchronisation part d'elle-meme a l'ouverture de l'ecran et a chaque
 * retour du reseau, et peut etre relancee a la main. Elle est rejouable sans
 * risque : chaque vente et chaque scan portent leur reference client, que le
 * serveur reconnait.
 *
 * Seuls les elements **acceptes ou reconnus comme doublons** quittent la file.
 * Un refus reste visible avec son motif : une vente au guichet a deja eu lieu
 * dans le monde reel, et la faire disparaitre creerait un ecart de caisse que
 * personne ne verrait avant le soir.
 */
export function useOfflineQueue() {
  const isOnline = useOnlineStatus();

  // Instantanes memorises par leur serialisation : `useSyncExternalStore`
  // exige une valeur stable entre deux lectures sans changement.
  const salesCache = useRef<{ raw: string; value: QueuedSale[] }>({ raw: "[]", value: EMPTY_SALES });
  const scansCache = useRef<{ raw: string; value: QueuedScan[] }>({ raw: "[]", value: EMPTY_SCANS });

  const sales = useSyncExternalStore(
    subscribeOfflineStore,
    () => {
      const value = queuedSales();
      const raw = JSON.stringify(value);
      if (raw !== salesCache.current.raw) salesCache.current = { raw, value };
      return salesCache.current.value;
    },
    () => EMPTY_SALES,
  );

  const scans = useSyncExternalStore(
    subscribeOfflineStore,
    () => {
      const value = queuedScans();
      const raw = JSON.stringify(value);
      if (raw !== scansCache.current.raw) scansCache.current = { raw, value };
      return scansCache.current.value;
    },
    () => EMPTY_SCANS,
  );

  const [isSyncing, setIsSyncing] = useState(false);
  const [lastResult, setLastResult] = useState<OfflineSyncResult | null>(null);
  const [rejectedScans, setRejectedScans] = useState<Array<{ code: string; reason: string }>>([]);
  const [syncError, setSyncError] = useState<string | null>(null);

  const synchronise = useCallback(async () => {
    const pendingSales = queuedSales();
    const pendingScans = queuedScans();
    if (pendingSales.length === 0 && pendingScans.length === 0) return;

    setIsSyncing(true);
    setSyncError(null);

    try {
      // Lots de 100 : la limite de l'API, qui borne la duree d'une transaction.
      for (let index = 0; index < pendingSales.length; index += 100) {
        const result = await bookingService.syncOfflineSales(pendingSales.slice(index, index + 100).map(toOfflineSale));

        setLastResult(result);
        removeQueuedSales(result.results.filter((item) => item.status !== "rejected").map((item) => item.client_reference));
      }

      const rejected: Array<{ code: string; reason: string }> = [];
      const synced: string[] = [];

      for (const scan of pendingScans) {
        const verdict = await ticketService.validate({
          code: scan.code,
          trip_id: scan.trip_id,
          client_reference: scan.client_reference,
        });

        synced.push(scan.client_reference);
        if (!verdict.accepted) rejected.push({ code: scan.code, reason: verdict.outcome_label });
      }

      removeQueuedScans(synced);
      setRejectedScans(rejected);
    } catch (error) {
      setSyncError(errorMessage(error, "La synchronisation a echoue. Elle sera retentee au retour du reseau."));
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Abonnement au retour du reseau, plus une tentative a l'ouverture : les
  // deux declenchent la synchronisation depuis un rappel, jamais pendant le
  // rendu.
  useEffect(() => {
    const run = () => void synchronise();
    const initial = window.setTimeout(run, 0);
    window.addEventListener("online", run);

    return () => {
      window.clearTimeout(initial);
      window.removeEventListener("online", run);
    };
  }, [synchronise]);

  return { isOnline, sales, scans, isSyncing, lastResult, rejectedScans, syncError, synchronise };
}
