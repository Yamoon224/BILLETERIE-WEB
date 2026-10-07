import { apiFetch } from "@kaara/shared/lib/api-client";
import type { Single } from "@kaara/shared/types/api";

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
