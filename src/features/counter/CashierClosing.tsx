"use client";

import { useCallback } from "react";
import { Button, ErrorState, LoadingState } from "@/components/ui";
import { IconArrowLeft } from "@/components/ui/icons";
import { useAsyncData } from "@/hooks/useAsyncData";
import { formatDayLong, formatMoney } from "@/lib/format";
import { reportService } from "@/services";

/**
 * Cloture de caisse de l'agent connecte : ce qu'il a lui-meme vendu et
 * encaisse aujourd'hui, par moyen de paiement (voir GET /me/cashier-summary).
 *
 * Purement consultatif : valider ne persiste rien de plus que ce que chaque
 * vente a deja enregistre - il n'y a rien a corriger ici, seulement a
 * verifier avant de rendre la caisse.
 */
export function CashierClosing({ onBack }: { onBack: () => void }) {
  const loader = useCallback(() => reportService.cashierSummary(), []);
  const { data, isLoading, error, reload } = useAsyncData(loader);

  return (
    <div className="p-5 sm:p-6">
      <button type="button" onClick={onBack} className="mb-4 inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:underline">
        <IconArrowLeft className="h-3.5 w-3.5" />
        Retour a la vente
      </button>

      {isLoading && !data ? <LoadingState label="Calcul de la caisse…" /> : null}
      {error && !data ? <ErrorState error={error} onRetry={reload} /> : null}

      {data ? (
        <>
          <p className="mb-4 text-base font-extrabold tracking-tight capitalize">Cloture de caisse - {formatDayLong(data.date)}</p>

          <div className="mb-4 overflow-hidden rounded-2xl border border-[var(--hairline)]">
            <Row label="Billets vendus" value={String(data.tickets_sold)} />
            <Row label="Encaisse en especes" value={formatMoney(data.cash_amount)} />
            <Row label="Encaisse en Mobile Money" value={formatMoney(data.mobile_money_amount)} />
            <Row label="Total de la session" value={formatMoney(data.total_amount)} strong />
          </div>

          <Button size="lg" className="w-full" onClick={onBack}>
            Valider la cloture
          </Button>
        </>
      ) : null}
    </div>
  );
}

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex items-center justify-between border-b border-[var(--hairline)] px-4 py-3 text-sm last:border-0 ${strong ? "text-base font-extrabold" : ""}`}>
      <span className={strong ? "" : "text-[var(--muted)]"}>{label}</span>
      <span className={strong ? "" : "font-semibold"}>{value}</span>
    </div>
  );
}
