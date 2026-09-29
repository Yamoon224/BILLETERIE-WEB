"use client";

import { useCallback } from "react";
import { Card, CardBody, CardHeader, ErrorState, LoadingState, StatCard } from "@/components/ui";
import { IconAlert, IconBuilding, IconChat, IconTicket, IconUsers, IconWallet } from "@/components/ui/icons";
import { useAsyncData } from "@/hooks/useAsyncData";
import { cn } from "@/lib/cn";
import { formatDayShort, formatMoney, formatNumber, todayIso } from "@/lib/format";
import { networkService, reportService, smsService, userService } from "@/services";
import { useAdminPendingCounts } from "./useAdminPendingCounts";

/** Objectif de phase 1 : un chiffre de lancement, fixe par la direction, pas une donnee mesuree. */
const WEEKLY_TRIP_GOAL = 1000;

function useOverviewData() {
  const loader = useCallback(async () => {
    const period = { from: todayIso(-6), to: todayIso() };

    const [weekly, companies, agents, sms] = await Promise.all([
      reportService.dashboard(period),
      networkService.listCompanies({ is_active: true, status: "active", per_page: 1 }),
      userService.list({ role: "agent", is_active: true, per_page: 1 }),
      smsService.overview(),
    ]);

    return { weekly, activeCompanies: companies.meta.total, activeAgents: agents.meta.total, sms };
  }, []);

  return useAsyncData(loader);
}

export function AdminOverview() {
  const { data, isLoading, error, reload } = useOverviewData();
  const pending = useAdminPendingCounts();

  if (isLoading && !data) return <LoadingState label="Calcul des indicateurs…" />;
  if (error && !data) return <ErrorState error={error} onRetry={reload} />;
  if (!data) return null;

  const bookingsThisWeek = data.weekly.summary.bookings;
  const goalRatio = Math.min(1, bookingsThisWeek / WEEKLY_TRIP_GOAL);
  const lowBalanceSims = data.sms.sim_cards.filter((sim) => sim.is_low_balance);
  const days = data.weekly.daily_revenue;
  const maxBookings = Math.max(1, ...days.map((day) => day.bookings));

  return (
    <div className="space-y-6">
      <Card>
        <CardBody>
          <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-sm font-bold">Objectif Phase 1 - trajets reserves cette semaine</p>
            <p className="text-base font-extrabold text-brand-700 dark:text-brand-400">
              {formatNumber(bookingsThisWeek)} / {formatNumber(WEEKLY_TRIP_GOAL)}
            </p>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-[var(--surface-muted)]">
            <div className="grad-brand h-full rounded-full" style={{ width: `${goalRatio * 100}%` }} />
          </div>
          <p className="mt-2 text-xs text-[var(--muted)]">
            {Math.round(goalRatio * 100)} % de l&apos;objectif atteint sur les sept derniers jours.
          </p>
        </CardBody>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Compagnies actives" value={formatNumber(data.activeCompanies)} tone="brand" icon={<IconBuilding className="h-5 w-5" />} />
        <StatCard label="Agents guichet actifs" value={formatNumber(data.activeAgents)} icon={<IconUsers className="h-5 w-5" />} />
        <StatCard label="Revenu plateforme (semaine)" value={formatMoney(data.weekly.summary.commission)} icon={<IconWallet className="h-5 w-5" />} />
        <StatCard label="Panier moyen" value={formatMoney(data.weekly.summary.average_basket)} icon={<IconTicket className="h-5 w-5" />} />
      </div>

      <Card>
        <CardHeader title="Trajets reserves - 7 derniers jours" />
        <CardBody>
          <div className="flex h-28 items-end gap-2">
            {days.map((day) => (
              <div key={day.date} className="flex flex-1 flex-col items-center gap-1.5">
                <div className="grad-brand w-full rounded-t-[4px]" style={{ height: `${Math.max(4, (day.bookings / maxBookings) * 100)}%` }} />
                <span className="text-[10px] capitalize text-[var(--muted)]">{formatDayShort(`${day.date}T12:00:00`)}</span>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Alertes recentes" />
        <CardBody className="space-y-2">
          {pending.companies === 0 && pending.partners === 0 && lowBalanceSims.length === 0 ? (
            <p className="py-4 text-center text-sm text-[var(--muted)]">Aucune alerte : tout est a jour.</p>
          ) : (
            <>
              {pending.companies > 0 ? (
                <AlertRow icon={<IconBuilding className="h-4 w-4" />} text={`${pending.companies} compagnie(s) en attente de validation`} />
              ) : null}
              {pending.partners > 0 ? (
                <AlertRow icon={<IconAlert className="h-4 w-4" />} text={`${pending.partners} annonce(s) partenaire en attente de validation`} />
              ) : null}
              {lowBalanceSims.map((sim) => (
                <AlertRow key={sim.id} icon={<IconChat className="h-4 w-4" />} text={`SIM ${sim.operator_label} du SMS Box - credit bas (${formatMoney(sim.balance)})`} tone="warn" />
              ))}
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

function AlertRow({ icon, text, tone = "info" }: { icon: React.ReactNode; text: string; tone?: "info" | "warn" }) {
  return (
    <div className="flex items-center gap-3 rounded-sm bg-[var(--surface-muted)] px-3.5 py-2.5">
      <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full", tone === "warn" ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300" : "grad-brand-soft text-brand-700 dark:text-brand-400")}>
        {icon}
      </span>
      <p className="text-sm text-[var(--foreground)]">{text}</p>
    </div>
  );
}
