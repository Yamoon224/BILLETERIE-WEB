import { apiDownload, apiFetch } from "@/lib/api-client";
import type { DashboardOverview, Single } from "@/types/api";

export interface PeriodParams {
  from?: string;
  to?: string;
}

export async function dashboard(params: PeriodParams = {}): Promise<DashboardOverview> {
  return (await apiFetch<Single<DashboardOverview>>("/dashboard", { query: { ...params } })).data;
}

export function exportBookings(params: PeriodParams = {}): Promise<void> {
  return apiDownload("/exports/bookings", "ventes.csv", { ...params });
}

export function exportOccupancy(params: PeriodParams = {}): Promise<void> {
  return apiDownload("/exports/occupancy", "remplissage.csv", { ...params });
}
