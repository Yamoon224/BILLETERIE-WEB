"use client";

import { useCallback, useState } from "react";
import { Card, CardHeader, ErrorState, LoadingState, StatCard } from "@kaara/shared/components/ui";
import { IconBuilding, IconCash, IconTicket, IconWallet } from "@kaara/shared/components/ui/icons";
import { useAsyncData } from "@kaara/shared/hooks/useAsyncData";
import { cn } from "@kaara/shared/lib/cn";
import { formatMoney, formatPercent, todayIso } from "@kaara/shared/lib/format";
import { financeService } from "@/services";

const PERIODS = [
  { days: 7, label: "7 jours" },
  { days: 30, label: "30 jours" },
  { days: 90, label: "90 jours" },
];

export function FinanceDashboard() {
  const [days, setDays] = useState(7);

  const loader = useCallback(() => financeService.overview({ from: todayIso(-days), to: todayIso() }), [days]);
  const { data, isLoading, error, reload } = useAsyncData(loader);

  return (
    <div className="space-y-6">
      <div role="radiogroup" aria-label="Periode" className="inline-flex flex-wrap gap-1 rounded-sm border border-[var(--hairline)] bg-[var(--surface)] p-1">
        {PERIODS.map((option) => (
          <button
            key={option.days}
            type="button"
            role="radio"
            aria-checked={days === option.days}
            onClick={() => setDays(option.days)}
            className={cn(
              "rounded-sm px-3 py-1.5 text-sm font-semibold transition-colors",
              days === option.days ? "grad-brand text-white shadow-sm" : "text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {isLoading && !data ? <LoadingState label="Calcul des finances…" /> : null}
      {error && !data ? <ErrorState error={error} onRetry={reload} /> : null}

      {data ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Commission Kaara (periode)" value={formatMoney(data.summary.commission)} tone="brand" icon={<IconWallet className="h-5 w-5" />} />
            <StatCard label="Volume total transige" value={formatMoney(data.summary.gross_revenue)} icon={<IconCash className="h-5 w-5" />} />
            <StatCard label="Taux de commission moyen" value={formatPercent(data.average_commission_per_mille / 1000)} icon={<IconTicket className="h-5 w-5" />} />
            <StatCard label="Reverse aux compagnies" value={formatMoney(data.paid_out_to_companies)} icon={<IconBuilding className="h-5 w-5" />} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader title="Par compagnie" />
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase tracking-wider text-[var(--muted)]">
                    <tr>
                      <th className="px-4 py-2.5">Compagnie</th>
                      <th className="px-4 py-2.5 text-right">Revenu</th>
                      <th className="px-4 py-2.5 text-right">Commission</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.commission_by_company.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-4 py-6 text-center text-[var(--muted)]">
                          Aucune vente sur la periode.
                        </td>
                      </tr>
                    ) : (
                      data.commission_by_company.map((row) => (
                        <tr key={row.company_id} className="border-t border-[var(--hairline)]">
                          <td className="px-4 py-2.5 font-semibold">{row.company_name}</td>
                          <td className="px-4 py-2.5 text-right tabular-nums">{formatMoney(row.gross)}</td>
                          <td className="px-4 py-2.5 text-right tabular-nums">{formatMoney(row.commission)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card>
              <CardHeader title="Par mode de paiement" />
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase tracking-wider text-[var(--muted)]">
                    <tr>
                      <th className="px-4 py-2.5">Mode</th>
                      <th className="px-4 py-2.5 text-right">Part</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const total = data.revenue_by_payment_method.reduce((sum, item) => sum + item.amount, 0);
                      return data.revenue_by_payment_method.map((item) => (
                        <tr key={item.method} className="border-t border-[var(--hairline)]">
                          <td className="px-4 py-2.5 font-semibold">{item.label}</td>
                          <td className="px-4 py-2.5 text-right tabular-nums">{total > 0 ? formatPercent(item.amount / total) : "-"}</td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      ) : null}
    </div>
  );
}
