import { apiFetch } from "@kaara/shared/lib/api-client";
import type { FinanceOverview, Single } from "@kaara/shared/types/api";

export interface PeriodParams {
  from?: string;
  to?: string;
}

/** Commission plateforme, toutes compagnies confondues (permission finance.view). */
export async function overview(params: PeriodParams = {}): Promise<FinanceOverview> {
  return (await apiFetch<Single<FinanceOverview>>("/finances", { query: { ...params } })).data;
}
