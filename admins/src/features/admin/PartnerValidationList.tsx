"use client";

import { useCallback, useMemo, useState } from "react";
import { Badge, Button, DataTable } from "@kaara/shared/components/ui";
import type { Column } from "@kaara/shared/components/ui";
import { useAsyncData } from "@kaara/shared/hooks/useAsyncData";
import { useMutation } from "@kaara/shared/hooks/useMutation";
import { apartmentService, rentalVehicleService } from "@/services";
import { useAdminPendingCounts } from "./useAdminPendingCounts";
import type { ListingStatus } from "@kaara/shared/types/api";

const STATUS_TONE: Record<ListingStatus, "success" | "warning" | "danger"> = {
  active: "success",
  pending: "warning",
  rejected: "danger",
};

interface ListingRow {
  id: string;
  title: string;
  typeLabel: string;
  status: ListingStatus;
  statusLabel: string;
  source: "apartment" | "rental_vehicle";
  createdAt: string | null;
}

/**
 * Validation des fiches Appartements et Location auto en une seule liste.
 *
 * Les deux catalogues sont pagines separement cote API - un partenaire peut
 * publier plusieurs dizaines de vehicules sans qu'un appartement en soit
 * affecte. Ici, ou le volume attendu se compte en dizaines de fiches en
 * attente et non en centaines, les deux sont recuperes en une page large et
 * fusionnes cote client plutot que de reconstruire une pagination combinee.
 */
function usePartnerListings() {
  const loader = useCallback(async () => {
    const [apartments, vehicles] = await Promise.all([
      apartmentService.list({ per_page: 100 }),
      rentalVehicleService.list({ per_page: 100 }),
    ]);

    const rows: ListingRow[] = [
      ...apartments.data.map(
        (item): ListingRow => ({
          id: item.id,
          title: item.title,
          typeLabel: "Residence",
          status: item.status,
          statusLabel: item.status_label,
          source: "apartment",
          createdAt: item.created_at,
        }),
      ),
      ...vehicles.data.map(
        (item): ListingRow => ({
          id: item.id,
          title: `${item.brand} ${item.model}`,
          typeLabel: "Location auto",
          status: item.status,
          statusLabel: item.status_label,
          source: "rental_vehicle",
          createdAt: item.created_at,
        }),
      ),
    ];

    // En attente d'abord : c'est ce que l'administrateur vient trancher.
    rows.sort((a, b) => {
      if (a.status !== b.status) return a.status === "pending" ? -1 : b.status === "pending" ? 1 : 0;
      return (b.createdAt ?? "").localeCompare(a.createdAt ?? "");
    });

    return rows;
  }, []);

  return useAsyncData(loader);
}

export function PartnerValidationList() {
  const { data, isLoading, error, reload } = usePartnerListings();
  const [search, setSearch] = useState("");
  const pending = useAdminPendingCounts();

  const decideApartment = useMutation(({ id, status }: { id: string; status: "active" | "rejected" }) => apartmentService.changeStatus(id, status));
  const decideVehicle = useMutation(({ id, status }: { id: string; status: "active" | "rejected" }) => rentalVehicleService.changeStatus(id, status));

  async function handleDecision(row: ListingRow, status: "active" | "rejected") {
    const action = row.source === "apartment" ? decideApartment : decideVehicle;
    const result = await action.run({ id: row.id, status });
    if (!result) return;
    reload();
    pending.reload();
  }

  const filtered = useMemo(() => {
    const rows = data ?? [];
    if (!search.trim()) return rows;
    const needle = search.trim().toLowerCase();
    return rows.filter((row) => row.title.toLowerCase().includes(needle));
  }, [data, search]);

  const columns: Array<Column<ListingRow>> = [
    { key: "title", header: "Annonce", cell: (row) => <span className="font-semibold">{row.title}</span> },
    { key: "type", header: "Type", cell: (row) => <span className="text-sm text-[var(--muted)]">{row.typeLabel}</span> },
    { key: "status", header: "Statut", cell: (row) => <Badge tone={STATUS_TONE[row.status]}>{row.statusLabel}</Badge> },
    {
      key: "actions",
      header: "",
      className: "text-right",
      cell: (row) =>
        row.status === "pending" ? (
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="danger" onClick={() => handleDecision(row, "rejected")}>
              Rejeter
            </Button>
            <Button size="sm" onClick={() => handleDecision(row, "active")}>
              Valider
            </Button>
          </div>
        ) : null,
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={filtered}
      getRowKey={(row) => `${row.source}-${row.id}`}
      isLoading={isLoading}
      error={error}
      onRetry={reload}
      search={{ value: search, onChange: setSearch, placeholder: "Titre de l'annonce…" }}
      emptyTitle="Aucune annonce"
    />
  );
}
