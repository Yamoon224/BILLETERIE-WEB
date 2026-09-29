import { apiFetch } from "@/lib/api-client";
import type { ListParams, Paginated, Promotion, PromotionKind, PromotionZone, Single } from "@/types/api";

export interface PromotionInput {
  title: string;
  subtitle?: string | null;
  zone: PromotionZone;
  kind?: PromotionKind;
  advertiser_name?: string | null;
  partner_id?: string | null;
  starts_at?: string | null;
  ends_at?: string | null;
  is_active?: boolean;
}

export function list(params: ListParams & { zone?: PromotionZone; is_active?: boolean } = {}): Promise<Paginated<Promotion>> {
  return apiFetch<Paginated<Promotion>>("/promotions", { query: { ...params } });
}

export async function create(input: PromotionInput): Promise<Promotion> {
  return (await apiFetch<Single<Promotion>>("/promotions", { method: "POST", body: input })).data;
}

export async function update(id: string, input: Partial<PromotionInput>): Promise<Promotion> {
  return (await apiFetch<Single<Promotion>>(`/promotions/${id}`, { method: "PATCH", body: input })).data;
}

export async function remove(id: string): Promise<void> {
  await apiFetch(`/promotions/${id}`, { method: "DELETE" });
}
