import { apiFetch } from "@/lib/api-client";
import type { ListingStatus, Paginated, RentalVehicle, RentalVehicleCategory, Single } from "@/types/api";

export interface RentalVehicleSearchParams {
  city_id?: string;
  category?: RentalVehicleCategory | "";
  seats?: number;
  min_price?: number;
  max_price?: number;
  with_driver_available?: boolean;
  is_featured?: boolean;
  search?: string;
  per_page?: number;
  page?: number;
}

// --- Parcours voyageur (public) ------------------------------------------------

export function search(params: RentalVehicleSearchParams = {}): Promise<Paginated<RentalVehicle>> {
  return apiFetch<Paginated<RentalVehicle>>("/rental-vehicles/search", { query: { ...params } });
}

// --- Administration : validation des fiches (permission car_rental.view/manage) -----

export function list(
  params: { search?: string; is_active?: boolean; status?: ListingStatus; per_page?: number; page?: number } = {},
): Promise<Paginated<RentalVehicle>> {
  return apiFetch<Paginated<RentalVehicle>>("/rental-vehicles", { query: { ...params } });
}

/** Validation ou rejet d'une fiche en attente, reserve a l'administrateur de plateforme. */
export async function changeStatus(id: string, status: "active" | "rejected"): Promise<RentalVehicle> {
  return (await apiFetch<Single<RentalVehicle>>(`/rental-vehicles/${id}/status`, { method: "POST", body: { status } })).data;
}
