"use client";

import Link from "next/link";
import { useCallback } from "react";
import { Card, EmptyState, ErrorState, LinkButton, LoadingState } from "@/components/ui";
import { IconArrowRight, IconHeart, IconTrash } from "@/components/ui/icons";
import { useAuth } from "@/features/auth/AuthContext";
import { searchHref } from "@/features/search/TripSearchForm";
import { useAsyncData } from "@/hooks/useAsyncData";
import { useMutation } from "@/hooks/useMutation";
import { todayIso } from "@/lib/format";
import { favoriteService } from "@/services";

/**
 * Trajets favoris : un couple ville de depart / ville d'arrivee qu'un
 * voyageur enregistre depuis une recherche (bouton coeur), pour le
 * retrouver ici en un geste plutot que de retaper les deux villes.
 */
export function FavoritesView() {
  const { user, isInitialising } = useAuth();

  if (isInitialising) return null;

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center sm:px-6">
        <IconHeart className="mx-auto h-10 w-10 text-brand-500" />
        <h1 className="mt-4 text-xl font-extrabold tracking-tight">Vos trajets favoris</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Connectez-vous pour enregistrer vos trajets habituels et les retrouver en un geste.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <LinkButton href="/connexion?next=/favoris">Se connecter</LinkButton>
          <LinkButton href="/inscription" variant="secondary">
            Creer un compte
          </LinkButton>
        </div>
      </div>
    );
  }

  return <FavoritesList />;
}

function FavoritesList() {
  const loader = useCallback(() => favoriteService.mine(), []);
  const { data: favorites, isLoading, error, reload } = useAsyncData(loader);

  const removeAction = useCallback((id: string) => favoriteService.remove(id), []);
  const removal = useMutation(removeAction);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="text-center">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Trajets favoris</h1>
        <span aria-hidden="true" className="grad-brand mx-auto mt-3 block h-[3px] w-16 rounded-full" />
      </div>

      <div className="mt-8">
        {isLoading ? <LoadingState /> : null}
        {error ? <ErrorState error={error} onRetry={reload} /> : null}

        {favorites && favorites.length === 0 ? (
          <EmptyState
            icon={<IconHeart className="h-5 w-5" />}
            title="Aucun favori pour le moment"
            description="Depuis une recherche, touchez le coeur a cote du trajet pour l'enregistrer ici."
          />
        ) : null}

        {favorites && favorites.length > 0 ? (
          <Card>
            <ul className="divide-y divide-[var(--hairline)]">
              {favorites.map((favorite) => (
                <li key={favorite.id} className="flex items-center justify-between gap-3 p-4">
                  <Link
                    href={searchHref({
                      origin: favorite.origin_city.slug,
                      destination: favorite.destination_city.slug,
                      date: todayIso(1),
                      passengers: 1,
                    })}
                    className="flex min-w-0 flex-1 items-center gap-2 font-semibold hover:text-brand-600"
                  >
                    <span className="truncate">{favorite.origin_city.name}</span>
                    <IconArrowRight className="h-3.5 w-3.5 shrink-0 text-[var(--muted)]" />
                    <span className="truncate">{favorite.destination_city.name}</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => removal.run(favorite.id).then(reload)}
                    disabled={removal.isPending}
                    aria-label="Retirer des favoris"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm text-stone-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50 dark:hover:bg-stone-800"
                  >
                    <IconTrash className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
