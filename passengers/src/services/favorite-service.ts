import { apiFetch, CACHE } from "@kaara/shared/lib/api-client";
import type { Favorite, Single } from "@kaara/shared/types/api";

/**
 * Trajets favoris du voyageur connecte.
 *
 * Chaque coeur affiche sur une page demande cette liste : memorisee, elle est
 * lue une fois pour tous, puis relue seulement apres un ajout ou un retrait.
 */
export async function mine(): Promise<Favorite[]> {
  return (await apiFetch<{ data: Favorite[] }>("/me/favorites", { cacheFor: CACHE.options })).data;
}

/** Idempotent cote API : ajouter deux fois le meme trajet renvoie le favori existant. */
export async function add(originCityId: string, destinationCityId: string): Promise<Favorite> {
  return (
    await apiFetch<Single<Favorite>>("/favorites", {
      method: "POST",
      body: { origin_city_id: originCityId, destination_city_id: destinationCityId },
      invalidates: ["/me/favorites"],
    })
  ).data;
}

export async function remove(id: string): Promise<void> {
  await apiFetch(`/favorites/${id}`, { method: "DELETE", invalidates: ["/me/favorites"] });
}
