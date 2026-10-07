import { apiFetch } from "@kaara/shared/lib/api-client";
import type { Paginated, SimCard, SmsBoxOverview, SmsDeliveryStatus, SmsDispatch, Single } from "@kaara/shared/types/api";

export interface SimCardUpdateInput {
  balance?: number;
  low_balance_threshold?: number;
  is_active?: boolean;
}

export async function overview(): Promise<SmsBoxOverview> {
  return (await apiFetch<Single<SmsBoxOverview>>("/sms/overview")).data;
}

export function queue(
  params: { status?: SmsDeliveryStatus; per_page?: number; page?: number; sort?: string; direction?: "asc" | "desc" } = {},
): Promise<Paginated<SmsDispatch>> {
  return apiFetch<Paginated<SmsDispatch>>("/sms/queue", { query: { ...params } });
}

export async function updateSimCard(id: string, input: SimCardUpdateInput): Promise<SimCard> {
  return (await apiFetch<Single<SimCard>>(`/sms/sim-cards/${id}`, { method: "PATCH", body: input })).data;
}
