"use client";

import { useCallback, useState } from "react";
import { Badge, Button, DataTable } from "@/components/ui";
import type { Column } from "@/components/ui";
import { CompanyFormDialog } from "@/features/network/CompanyList";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useMutation } from "@/hooks/useMutation";
import { usePaginatedData } from "@/hooks/usePaginatedData";
import { useSort } from "@/hooks/useSort";
import { networkService } from "@/services";
import type { Company, ListingStatus } from "@/types/api";

const STATUS_TONE: Record<ListingStatus, "success" | "warning" | "danger"> = {
  active: "success",
  pending: "warning",
  rejected: "danger",
};

/**
 * Validation des compagnies partenaires par l'administrateur de plateforme.
 *
 * Contrairement a `CompanyList` (dashboard/companies), cet ecran met en avant
 * le statut de validation plutot que la commission : c'est le geste que la
 * console d'administration existe pour rendre possible.
 */
export function CompanyValidationList() {
  const [search, setSearch] = useState("");
  const [viewing, setViewing] = useState<Company | null>(null);
  const debounced = useDebouncedValue(search);
  const { sort, setSort, sortParams } = useSort();

  const fetcher = useCallback(
    (page: number, perPage: number) =>
      networkService.listCompanies({ page, per_page: perPage, search: debounced || undefined, ...sortParams }),
    [debounced, sortParams],
  );
  const list = usePaginatedData(fetcher);

  const decide = useMutation(({ id, status }: { id: string; status: "active" | "rejected" }) => networkService.changeCompanyStatus(id, status));

  async function handleDecision(company: Company, status: "active" | "rejected") {
    const result = await decide.run({ id: company.id, status });
    if (result) list.reload();
  }

  const columns: Array<Column<Company>> = [
    {
      key: "name",
      header: "Compagnie",
      sortKey: "name",
      cell: (company) => (
        <div>
          <p className="font-semibold">{company.name}</p>
          <p className="text-xs text-[var(--muted)]">{company.code}</p>
        </div>
      ),
    },
    {
      key: "lines",
      header: "Lignes actives",
      hideOnMobile: true,
      cell: (company) => <span className="text-sm text-[var(--muted)]">{company.itineraries_count ?? 0}</span>,
    },
    {
      key: "status",
      header: "Statut",
      cell: (company) => <Badge tone={STATUS_TONE[company.status]}>{company.status_label}</Badge>,
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      cell: (company) =>
        company.status === "pending" ? (
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="danger" onClick={() => handleDecision(company, "rejected")} isLoading={decide.isPending}>
              Rejeter
            </Button>
            <Button size="sm" onClick={() => handleDecision(company, "active")} isLoading={decide.isPending}>
              Valider
            </Button>
          </div>
        ) : (
          <div className="flex justify-end">
            <Button size="sm" variant="ghost" onClick={() => setViewing(company)}>
              Voir
            </Button>
          </div>
        ),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        rows={list.items}
        getRowKey={(company) => company.id}
        isLoading={list.isLoading}
        error={list.error}
        onRetry={list.reload}
        meta={list.meta}
        onPageChange={list.setPage}
        onPerPageChange={list.setPerPage}
        sort={sort}
        onSortChange={setSort}
        search={{ value: search, onChange: setSearch, placeholder: "Nom ou code…" }}
        emptyTitle="Aucune compagnie"
      />

      {viewing ? (
        <CompanyFormDialog
          company={viewing}
          canSetCommission
          onClose={() => setViewing(null)}
          onSaved={() => {
            setViewing(null);
            list.reload();
          }}
        />
      ) : null}
    </>
  );
}
