import { apiFetch } from "../lib/api-client";
import type { ListingStatus, Paginated, RentalVehicle } from "../types/api";

/**
 * Catalogue des vehicules de location (permission car_rental.view) : toutes
 * les fiches pour la Console Admin, celles de son partenaire pour l'Espace
 * Partenaires - le cloisonnement est applique par l'API.
 */
export function list(
  params: { search?: string; is_active?: boolean; status?: ListingStatus; per_page?: number; page?: number } = {},
): Promise<Paginated<RentalVehicle>> {
  return apiFetch<Paginated<RentalVehicle>>("/rental-vehicles", { query: { ...params } });
}
