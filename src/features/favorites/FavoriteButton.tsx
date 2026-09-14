"use client";

import { useCallback } from "react";
import { IconHeart } from "@/components/ui/icons";
import { useAuth } from "@/features/auth/AuthContext";
import { useAsyncData } from "@/hooks/useAsyncData";
import { useMutation } from "@/hooks/useMutation";
import { cn } from "@/lib/cn";
import { favoriteService } from "@/services";

/**
 * Coeur pour enregistrer le trajet courant en favori.
 *
 * Invisible tant qu'on ne sait pas si un compte est connecte, et pour un
 * visiteur non connecte : proposer de se connecter au milieu d'une recherche
 * distrairait de l'action principale, et le menu Favoris invite deja a se
 * connecter pour qui veut vraiment la fonctionnalite.
 */
export function FavoriteButton({ originCityId, destinationCityId }: { originCityId: string; destinationCityId: string }) {
  const { user, isInitialising } = useAuth();

  const loadFavorites = useCallback(() => (user ? favoriteService.mine() : Promise.resolve([])), [user]);
  const { data: favorites, reload } = useAsyncData(loadFavorites);

  const existing = favorites?.find(
    (favorite) => favorite.origin_city.id === originCityId && favorite.destination_city.id === destinationCityId,
  );

  const toggleAction = useCallback(async () => {
    if (existing) {
      await favoriteService.remove(existing.id);
    } else {
      await favoriteService.add(originCityId, destinationCityId);
    }
  }, [existing, originCityId, destinationCityId]);
  const toggle = useMutation(toggleAction);

  if (isInitialising || !user) return null;

  return (
    <button
      type="button"
      onClick={() => toggle.run(undefined).then(reload)}
      disabled={toggle.isPending}
      aria-pressed={Boolean(existing)}
      aria-label={existing ? "Retirer des favoris" : "Ajouter aux favoris"}
      title={existing ? "Retirer des favoris" : "Ajouter aux favoris"}
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-stone-400 transition-colors hover:bg-brand-50 hover:text-brand-500 disabled:opacity-50 dark:hover:bg-stone-800"
    >
      <IconHeart className={cn("h-5 w-5", existing && "text-brand-500")} fill={existing ? "currentColor" : "none"} />
    </button>
  );
}
