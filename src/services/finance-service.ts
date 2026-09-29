import { apiFetch } from "@/lib/api-client";
import type { FinanceOverview, Single } from "@/types/api";

export interface PeriodParams {
  from?: string;
  to?: string;
}

export async function overview(params: PeriodParams = {}): Promise<FinanceOverview> {
  return (await apiFetch<Single<FinanceOverview>>("/finances", { query: { ...params } })).data;
}
