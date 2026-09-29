"use client";

import { useCallback } from "react";
import { Card, ErrorState, LoadingState, Toggle } from "@/components/ui";
import { useAsyncData } from "@/hooks/useAsyncData";
import { useMutation } from "@/hooks/useMutation";
import { formatDuration, formatMoney } from "@/lib/format";
import { networkService } from "@/services";
import type { Itinerary } from "@/types/api";

/**
 * Lignes de la compagnie, avec une bascule active/pause.
 *
 * Une ligne mise en pause (`is_active: false`) disparait immediatement de la
 * recherche publique - `TripSearchService` ne montre que les itineraires
 * actifs - mais les departs deja programmes et les reservations deja payees
 * restent valables : la pause bloque les *nouvelles* ventes, elle n'efface
 * rien de ce qui existe deja.
 */
export function CompanyLines() {
  const loader = useCallback(() => networkService.listItineraries({ per_page: 100 }), []);
  const { data, isLoading, error, reload } = useAsyncData(loader);

  const toggle = useMutation(({ id, is_active }: { id: string; is_active: boolean }) => networkService.updateItinerary(id, { is_active }));

  async function handleToggle(itinerary: Itinerary) {
    const result = await toggle.run({ id: itinerary.id, is_active: !itinerary.is_active });
    if (result) reload();
  }

  if (isLoading && !data) return <LoadingState label="Chargement des lignes…" />;
  if (error && !data) return <ErrorState error={error} onRetry={reload} />;
  if (!data) return null;

  return (
    <div className="space-y-4">
      <Card>
        <div className="border-b border-[var(--hairline)] px-4 py-3.5 sm:px-5">
          <p className="text-sm font-bold tracking-tight">Mes lignes - activer / mettre en pause</p>
        </div>
        {data.data.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-[var(--muted)]">Aucune ligne enregistree.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-[var(--muted)]">
                <tr>
                  <th className="px-4 py-2.5 sm:px-5">Ligne</th>
                  <th className="px-4 py-2.5">Duree</th>
                  <th className="px-4 py-2.5">Prix</th>
                  <th className="px-4 py-2.5 sm:px-5">Statut</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((itinerary) => (
                  <tr key={itinerary.id} className="border-t border-[var(--hairline)]">
                    <td className="px-4 py-2.5 font-semibold sm:px-5">
                      {itinerary.origin_city?.name} → {itinerary.destination_city?.name}
                    </td>
                    <td className="px-4 py-2.5">{formatDuration(itinerary.duration_minutes)}</td>
                    <td className="px-4 py-2.5">{formatMoney(itinerary.base_price)}</td>
                    <td className="px-4 py-2.5 sm:px-5">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-bold text-[var(--muted)]">{itinerary.is_active ? "Active" : "En pause"}</span>
                        <Toggle
                          checked={itinerary.is_active}
                          onChange={() => handleToggle(itinerary)}
                          disabled={toggle.isPending}
                          label={`Basculer la ligne ${itinerary.origin_city?.name ?? ""} vers ${itinerary.destination_city?.name ?? ""}`}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      <p className="text-xs text-[var(--muted)]">
        Mettre une ligne en pause bloque les nouvelles reservations sur cet itineraire - les reservations deja payees restent valables.
      </p>
    </div>
  );
}
