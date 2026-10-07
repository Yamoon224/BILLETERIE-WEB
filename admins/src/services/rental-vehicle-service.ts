import { apiFetch } from "@kaara/shared/lib/api-client";
import type { RentalVehicle, Single } from "@kaara/shared/types/api";

export { list } from "@kaara/shared/services/rental-vehicle-service";

/** Validation ou rejet d'une fiche en attente, reserve a l'administrateur de plateforme. */
export async function changeStatus(id: string, status: "active" | "rejected"): Promise<RentalVehicle> {
  return (await apiFetch<Single<RentalVehicle>>(`/rental-vehicles/${id}/status`, { method: "POST", body: { status } })).data;
}
