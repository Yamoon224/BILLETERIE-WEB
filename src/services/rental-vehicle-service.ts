import { apiFetch } from "@/lib/api-client";
import type { Paginated, RentalVehicle, RentalVehicleCategory } from "@/types/api";

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
