import { apiFetch } from "@kaara/shared/lib/api-client";
import type { Apartment, Single } from "@kaara/shared/types/api";

export { list } from "@kaara/shared/services/apartment-service";

/** Validation ou rejet d'une fiche en attente, reserve a l'administrateur de plateforme. */
export async function changeStatus(id: string, status: "active" | "rejected"): Promise<Apartment> {
  return (await apiFetch<Single<Apartment>>(`/apartments/${id}/status`, { method: "POST", body: { status } })).data;
}
