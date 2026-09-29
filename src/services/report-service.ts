import { apiDownload, apiFetch } from "@/lib/api-client";
import type { DashboardOverview, Single } from "@/types/api";

export interface PeriodParams {
  from?: string;
  to?: string;
}

export async function dashboard(params: PeriodParams = {}): Promise<DashboardOverview> {
  return (await apiFetch<Single<DashboardOverview>>("/dashboard", { query: { ...params } })).data;
}

export interface CashierSummary {
  date: string;
  tickets_sold: number;
  cash_amount: number;
  mobile_money_amount: number;
  total_amount: number;
}

/** Cloture de caisse de l'agent connecte : ce que lui, et lui seul, a encaisse un jour donne. */
export async function cashierSummary(date?: string): Promise<CashierSummary> {
  return (await apiFetch<Single<CashierSummary>>("/me/cashier-summary", { query: { date } })).data;
}

export function exportBookings(params: PeriodParams = {}): Promise<void> {
  return apiDownload("/exports/bookings", "ventes.csv", { ...params });
}

export function exportOccupancy(params: PeriodParams = {}): Promise<void> {
  return apiDownload("/exports/occupancy", "remplissage.csv", { ...params });
}
