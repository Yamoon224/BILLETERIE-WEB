"use client";

import { useCallback, useState } from "react";
import { Button, Card, CardBody, CardHeader, ErrorState, LoadingState, StatCard } from "@/components/ui";
import { IconBan, IconDownload, IconSeat, IconTicket, IconUsers, IconWallet } from "@/components/ui/icons";
import { useAsyncData } from "@/hooks/useAsyncData";
import { cn } from "@/lib/cn";
import { formatMoney, formatNumber, todayIso } from "@/lib/format";
import { reportService } from "@/services";
import type { BookingChannel, DashboardOverview as Overview, PaymentMethod } from "@/types/api";
import { OccupancyMeters, RevenueColumns, ShareBar } from "./charts";

/** La couleur suit l'entite, jamais son rang : un filtre ne repeint rien. */
const METHOD_COLOR: Record<PaymentMethod, string> = {
  mobile_money: "var(--series-1)",
  cash: "var(--series-2)",
  card: "var(--series-3)",
};

const CHANNEL_COLOR: Record<BookingChannel, string> = {
  online: "var(--series-1)",
  counter: "var(--series-2)",
  offline_counter: "var(--series-3)",
};

const PERIODS = [
  { days: 0, label: "Aujourd'hui" },
  { days: 7, label: "7 jours" },
  { days: 30, label: "30 jours" },
  { days: 90, label: "90 jours" },
];

/**
 * Tableau de bord de suivi d'activite.
 *
 * Un seul filtre, en tete, qui gouverne tout l'ecran : la periode. Toutes les
 * cartes lisent la meme reponse, si bien que leurs chiffres concordent toujours.
 * Pendant un rechargement, l'ecran garde l'affichage precedent attenue plutot
 * que de clignoter.
 */
export function DashboardOverview() {
  const [days, setDays] = useState(30);
  const [isExporting, setIsExporting] = useState<"bookings" | "occupancy" | null>(null);

  const period = { from: todayIso(-days), to: todayIso() };

  const loader = useCallback(() => reportService.dashboard({ from: todayIso(-days), to: todayIso() }), [days]);
  const { data, isLoading, error, reload } = useAsyncData(loader);

  // Dernier rendu reussi, conserve pendant le rechargement.
  const [lastData, setLastData] = useState<Overview | null>(null);
  if (data && data !== lastData) setLastData(data);
  const overview = data ?? lastData;

  async function download(kind: "bookings" | "occupancy") {
    setIsExporting(kind);
    try {
      await (kind === "bookings" ? reportService.exportBookings(period) : reportService.exportOccupancy(period));
    } finally {
      setIsExporting(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
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
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={() => void download("bookings")} isLoading={isExporting === "bookings"} icon={<IconDownload className="h-3.5 w-3.5" />}>
            Export des ventes
          </Button>
          <Button variant="secondary" size="sm" onClick={() => void download("occupancy")} isLoading={isExporting === "occupancy"} icon={<IconDownload className="h-3.5 w-3.5" />}>
            Export du remplissage
          </Button>
        </div>
      </div>

      {!overview && isLoading ? <LoadingState label="Calcul des indicateurs…" /> : null}
      {error && !overview ? (
        <Card>
          <ErrorState error={error} onRetry={reload} />
        </Card>
      ) : null}

      {overview ? (
        <div className={cn("space-y-6 transition-opacity", isLoading && "opacity-60")}>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Recette encaissee"
              value={formatMoney(overview.summary.gross_revenue)}
              hint={`Net compagnies ${formatMoney(overview.summary.net_revenue)}`}
              tone="brand"
              icon={<IconWallet className="h-5 w-5" />}
            />
            <StatCard
              label="Billets vendus"
              value={formatNumber(overview.summary.tickets)}
              hint={`${formatNumber(overview.summary.bookings)} reservations`}
              icon={<IconTicket className="h-5 w-5" />}
            />
            <StatCard label="Panier moyen" value={formatMoney(overview.summary.average_basket)} hint={`Commission ${formatMoney(overview.summary.commission)}`} icon={<IconUsers className="h-5 w-5" />} />
            <StatCard
              label="Abandons"
              value={formatNumber(overview.summary.expired_bookings + overview.summary.cancelled_bookings)}
              hint={`${overview.summary.expired_bookings} non payees · ${overview.summary.cancelled_bookings} annulees`}
              tone={overview.summary.expired_bookings > overview.summary.bookings / 4 ? "warning" : "neutral"}
              icon={<IconBan className="h-5 w-5" />}
            />
          </div>

          <Card>
            <CardHeader title="Recette par jour" description="Reservations confirmees, en francs CFA." />
            <CardBody>
              <RevenueColumns data={overview.daily_revenue} />
            </CardBody>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader icon={<IconWallet className="h-4 w-4" />} title="Encaissements par moyen de paiement" description="A rapprocher de la caisse physique de chaque gare." />
              <CardBody>
                <ShareBar
                  total={overview.revenue_by_payment_method.reduce((sum, item) => sum + item.amount, 0)}
                  items={overview.revenue_by_payment_method.map((item) => ({
                    key: item.method,
                    label: item.label,
                    amount: item.amount,
                    count: item.count,
                    countLabel: item.count > 1 ? "operations" : "operation",
                    color: METHOD_COLOR[item.method],
                  }))}
                />
              </CardBody>
            </Card>

            <Card>
              <CardHeader icon={<IconTicket className="h-4 w-4" />} title="Ventes par canal" description="En ligne, au guichet, et au guichet hors ligne." />
              <CardBody>
                <ShareBar
                  total={overview.sales_by_channel.reduce((sum, item) => sum + item.amount, 0)}
                  items={overview.sales_by_channel.map((item) => ({
                    key: item.channel,
                    label: item.label,
                    amount: item.amount,
                    count: item.tickets,
                    countLabel: item.tickets > 1 ? "billets" : "billet",
                    color: CHANNEL_COLOR[item.channel],
                  }))}
                />
              </CardBody>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <Card>
              <CardHeader icon={<IconSeat className="h-4 w-4" />} title="Taux de remplissage" description="Departs de la periode et des quatorze jours suivants." />
              <CardBody>
                <OccupancyMeters trips={overview.occupancy} />
              </CardBody>
            </Card>

            <Card>
              <CardHeader icon={<IconUsers className="h-4 w-4" />} title="Ventes par agent" description="Pour le suivi de caisse de chaque guichet." />
              <CardBody>
                {overview.sales_by_agent.length === 0 ? (
                  <p className="py-6 text-center text-sm text-[var(--muted)]">Aucune vente au guichet sur la periode.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="text-left text-xs uppercase tracking-wider text-[var(--muted)]">
                      <tr>
                        <th className="pb-2">Agent</th>
                        <th className="pb-2 text-right">Billets</th>
                        <th className="pb-2 text-right">Montant</th>
                      </tr>
                    </thead>
                    <tbody>
                      {overview.sales_by_agent.map((agent) => (
                        <tr key={agent.user_id} className="border-t border-[var(--hairline)]">
                          <td className="py-2 font-semibold">{agent.name}</td>
                          <td className="py-2 text-right tabular-nums">{agent.tickets}</td>
                          <td className="py-2 text-right tabular-nums">{formatMoney(agent.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      ) : null}
    </div>
  );
}
