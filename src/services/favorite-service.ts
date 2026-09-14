import { apiFetch } from "@/lib/api-client";
import type { Favorite, Single } from "@/types/api";

/** Trajets favoris du voyageur connecte. */
export async function mine(): Promise<Favorite[]> {
  return (await apiFetch<{ data: Favorite[] }>("/me/favorites")).data;
}

/** Idempotent cote API : ajouter deux fois le meme trajet renvoie le favori existant. */
export async function add(originCityId: string, destinationCityId: string): Promise<Favorite> {
  return (
    await apiFetch<Single<Favorite>>("/favorites", {
      method: "POST",
      body: { origin_city_id: originCityId, destination_city_id: destinationCityId },
    })
  ).data;
}

export async function remove(id: string): Promise<void> {
  await apiFetch(`/favorites/${id}`, { method: "DELETE" });
}
