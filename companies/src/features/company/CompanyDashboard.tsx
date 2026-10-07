"use client";

import { useCallback } from "react";
import { Badge, Card, ErrorState, LoadingState, StatCard } from "@kaara/shared/components/ui";
import { IconSeat, IconTicket, IconWallet } from "@kaara/shared/components/ui/icons";
import { useAsyncData } from "@kaara/shared/hooks/useAsyncData";
import { formatMoney, formatNumber, formatPercent, formatTime, todayIso } from "@kaara/shared/lib/format";
import { reportService, tripService } from "@/services";
import type { DashboardOverview } from "@kaara/shared/types/api";

function delta(today: number, yesterday: number): { label: string; positive: boolean } | null {
  if (yesterday === 0) return null;
  const ratio = (today - yesterday) / yesterday;

  return { label: `${ratio >= 0 ? "+" : ""}${formatPercent(ratio, 0)} vs hier`, positive: ratio >= 0 };
}

/**
 * Ventes d'un jour, lues dans la serie quotidienne du tableau de bord. Un jour
 * sans vente n'y figure pas : il vaut zero, pas « inconnu ».
 */
function salesOn(report: DashboardOverview, date: string): { tickets: number; revenue: number } {
  const day = report.daily_revenue.find((entry) => entry.date === date);

  return { tickets: day?.tickets ?? 0, revenue: day?.amount ?? 0 };
}

function useCompanyOverview() {
  const loader = useCallback(async () => {
    // Un seul appel au tableau de bord couvre hier et aujourd'hui : sa serie
    // quotidienne porte les memes sommes que son resume, jour par jour.
    const [report, trips] = await Promise.all([
      reportService.dashboard({ from: todayIso(-1), to: todayIso() }),
      tripService.list({ from: todayIso(), to: todayIso(), sort: "departs_at", direction: "asc", per_page: 20 }),
    ]);

    const capacity = trips.data.reduce((sum, trip) => sum + trip.seat_capacity, 0);
    const sold = trips.data.reduce((sum, trip) => sum + (trip.seats_taken ?? 0), 0);

    return {
      today: salesOn(report, todayIso()),
      yesterday: salesOn(report, todayIso(-1)),
      trips: trips.data,
      occupancyRate: capacity > 0 ? sold / capacity : 0,
    };
  }, []);

  return useAsyncData(loader);
}

/** Ouverture de journee d'un gestionnaire : ce qui s'est vendu aujourd'hui, et ses prochains departs. */
export function CompanyDashboard() {
  const { data, isLoading, error, reload } = useCompanyOverview();

  if (isLoading && !data) return <LoadingState label="Calcul des indicateurs…" />;
  if (error && !data) return <ErrorState error={error} onRetry={reload} />;
  if (!data) return null;

  const ticketsDelta = delta(data.today.tickets, data.yesterday.tickets);
  const revenueDelta = delta(data.today.revenue, data.yesterday.revenue);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Billets vendus aujourd'hui"
          value={formatNumber(data.today.tickets)}
          hint={ticketsDelta?.label}
          tone={ticketsDelta === null ? "neutral" : ticketsDelta.positive ? "brand" : "warning"}
          icon={<IconTicket className="h-5 w-5" />}
        />
        <StatCard
          label="Revenu du jour"
          value={formatMoney(data.today.revenue)}
          hint={revenueDelta?.label}
          tone={revenueDelta === null ? "neutral" : revenueDelta.positive ? "brand" : "warning"}
          icon={<IconWallet className="h-5 w-5" />}
        />
        <StatCard
          label="Taux de remplissage"
          value={formatPercent(data.occupancyRate, 0)}
          hint={data.occupancyRate >= 0.7 ? "Objectif 70 % atteint" : "Objectif : 70 %"}
          tone={data.occupancyRate >= 0.7 ? "brand" : "neutral"}
          icon={<IconSeat className="h-5 w-5" />}
        />
      </div>

      <Card>
        <div className="border-b border-[var(--hairline)] px-4 py-3.5 sm:px-5">
          <p className="text-sm font-bold tracking-tight">Prochains departs</p>
        </div>
        {data.trips.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-[var(--muted)]">Aucun depart programme aujourd&apos;hui.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-[var(--muted)]">
                <tr>
                  <th className="px-4 py-2.5 sm:px-5">Depart</th>
                  <th className="px-4 py-2.5">Trajet</th>
                  <th className="px-4 py-2.5">Places vendues</th>
                  <th className="px-4 py-2.5 sm:px-5">Statut</th>
                </tr>
              </thead>
              <tbody>
                {data.trips.map((trip) => (
                  <tr key={trip.id} className="border-t border-[var(--hairline)]">
                    <td className="px-4 py-2.5 font-bold sm:px-5">{formatTime(trip.departs_at)}</td>
                    <td className="px-4 py-2.5">
                      {trip.itinerary?.origin_city?.name} → {trip.itinerary?.destination_city?.name}
                    </td>
                    <td className="px-4 py-2.5 tabular-nums">
                      {trip.seats_taken ?? 0} / {trip.seat_capacity}
                    </td>
                    <td className="px-4 py-2.5 sm:px-5">
                      <Badge tone={trip.status === "cancelled" ? "danger" : "success"}>{trip.status_label}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
