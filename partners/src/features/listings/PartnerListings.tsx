"use client";

import { useCallback } from "react";
import { Badge, Card, ErrorState, LoadingState } from "@kaara/shared/components/ui";
import { useAsyncData } from "@kaara/shared/hooks/useAsyncData";
import { formatMoney } from "@kaara/shared/lib/format";
import type { ListingStatus } from "@kaara/shared/types/api";
import { apartmentService, rentalVehicleService } from "@/services";

const STATUS_TONE: Record<ListingStatus, "success" | "warning" | "danger"> = {
  active: "success",
  pending: "warning",
  rejected: "danger",
};

interface ListingRow {
  id: string;
  title: string;
  detail: string;
  price: string;
  status: ListingStatus;
  statusLabel: string;
}

/**
 * Les deux catalogues du partenaire, lus en parallele. L'API ne renvoie que
 * ses propres fiches : aucun filtre « mon partenaire » n'est envoye d'ici.
 */
function usePartnerCatalogue() {
  const loader = useCallback(async () => {
    const [apartments, vehicles] = await Promise.all([
      apartmentService.list({ per_page: 100 }),
      rentalVehicleService.list({ per_page: 100 }),
    ]);

    return {
      apartments: apartments.data.map(
        (item): ListingRow => ({
          id: item.id,
          title: item.title,
          detail: [item.neighborhood, item.city?.name].filter(Boolean).join(", ") || "-",
          price: `${formatMoney(item.price_per_night)} / nuit`,
          status: item.status,
          statusLabel: item.status_label,
        }),
      ),
      vehicles: vehicles.data.map(
        (item): ListingRow => ({
          id: item.id,
          title: `${item.brand} ${item.model}`,
          detail: [item.category_label, item.city?.name].filter(Boolean).join(", ") || "-",
          price: `${formatMoney(item.price_per_day)} / jour`,
          status: item.status,
          statusLabel: item.status_label,
        }),
      ),
    };
  }, []);

  return useAsyncData(loader);
}

/**
 * Annonces du partenaire connecte et leur etat de validation.
 *
 * Consultation seule : une annonce est publiee une fois validee par l'equipe
 * Kaara, et c'est ce statut que le partenaire vient verifier ici.
 */
export function PartnerListings() {
  const { data, isLoading, error, reload } = usePartnerCatalogue();

  if (isLoading && !data) return <LoadingState label="Chargement de vos annonces…" />;
  if (error && !data) return <ErrorState error={error} onRetry={reload} />;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <ListingTable title="Residences meublees" emptyLabel="Aucune residence enregistree." rows={data.apartments} />
      <ListingTable title="Vehicules de location" emptyLabel="Aucun vehicule enregistre." rows={data.vehicles} />
      <p className="text-xs text-[var(--muted)]">
        Une annonce « en attente » n&apos;apparait pas encore dans la recherche : elle est publiee des sa validation par l&apos;equipe Kaara.
      </p>
    </div>
  );
}

function ListingTable({ title, emptyLabel, rows }: { title: string; emptyLabel: string; rows: ListingRow[] }) {
  return (
    <Card>
      <div className="border-b border-[var(--hairline)] px-4 py-3.5 sm:px-5">
        <p className="text-sm font-bold tracking-tight">{title}</p>
      </div>
      {rows.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-[var(--muted)]">{emptyLabel}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-[var(--muted)]">
              <tr>
                <th className="px-4 py-2.5 sm:px-5">Annonce</th>
                <th className="px-4 py-2.5">Detail</th>
                <th className="px-4 py-2.5">Prix</th>
                <th className="px-4 py-2.5 sm:px-5">Statut</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-[var(--hairline)]">
                  <td className="px-4 py-2.5 font-semibold sm:px-5">{row.title}</td>
                  <td className="px-4 py-2.5 text-[var(--muted)]">{row.detail}</td>
                  <td className="px-4 py-2.5 tabular-nums">{row.price}</td>
                  <td className="px-4 py-2.5 sm:px-5">
                    <Badge tone={STATUS_TONE[row.status]}>{row.statusLabel}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
