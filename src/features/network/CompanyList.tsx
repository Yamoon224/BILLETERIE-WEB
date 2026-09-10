"use client";

import { useCallback, useState } from "react";
import type { FormEvent } from "react";
import { Badge, Button, DataTable, FormAlert, Modal, SelectField, TextField } from "@/components/ui";
import type { Column } from "@/components/ui";
import { IconPencil, IconPlus } from "@/components/ui/icons";
import { useAuth } from "@/features/auth/AuthContext";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useMutation } from "@/hooks/useMutation";
import { usePaginatedData } from "@/hooks/usePaginatedData";
import { useSort } from "@/hooks/useSort";
import { errorMessage } from "@/lib/api-client";
import { networkService } from "@/services";
import type { CompanyInput } from "@/services/network-service";
import type { Company } from "@/types/api";

function formatPerMille(value: number): string {
  return `${(value / 10).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} %`;
}

export function CompanyList() {
  const { can } = useAuth();
  const canCreate = can("platform.manage");
  const canEdit = can("network.manage");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Company | "new" | null>(null);

  const debounced = useDebouncedValue(search);
  const { sort, setSort, sortParams } = useSort();

  const fetcher = useCallback(
    (page: number, perPage: number) => networkService.listCompanies({ page, per_page: perPage, search: debounced || undefined, ...sortParams }),
    [debounced, sortParams],
  );
  const list = usePaginatedData(fetcher);

  const columns: Array<Column<Company>> = [
    { key: "code", header: "Code", sortKey: "code", cell: (company) => <span className="font-mono font-bold">{company.code}</span> },
    {
      key: "name",
      header: "Compagnie",
      sortKey: "name",
      cell: (company) => (
        <div>
          <p className="font-semibold">{company.name}</p>
          <p className="text-xs text-[var(--muted)]">{company.email ?? company.phone ?? ""}</p>
        </div>
      ),
    },
    {
      key: "fleet",
      header: "Parc",
      hideOnMobile: true,
      cell: (company) => (
        <span className="text-sm text-[var(--muted)]">
          {company.vehicles_count ?? 0} vehicules · {company.itineraries_count ?? 0} itineraires
        </span>
      ),
    },
    {
      key: "commission",
      header: "Commission",
      sortKey: "commission",
      cell: (company) => (
        <span className="tabular-nums">
          {formatPerMille(company.effective_commission_per_mille)}
          {company.commission_per_mille === null ? <span className="ml-1 text-xs text-[var(--muted)]">(bareme)</span> : null}
        </span>
      ),
    },
    { key: "state", header: "Etat", sortKey: "is_active", cell: (company) => <Badge tone={company.is_active ? "success" : "neutral"}>{company.is_active ? "Active" : "Inactive"}</Badge> },
    {
      key: "actions",
      header: "",
      className: "text-right",
      cell: (company) => (canEdit ? <Button size="icon" variant="ghost" aria-label="Modifier" onClick={() => setEditing(company)} icon={<IconPencil />} /> : null),
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
        toolbar={
          canCreate ? (
            <Button onClick={() => setEditing("new")} icon={<IconPlus className="h-4 w-4" />}>
              Ajouter
            </Button>
          ) : null
        }
      />

      {editing ? (
        <CompanyFormDialog
          company={editing === "new" ? null : editing}
          canSetCommission={canCreate}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            list.reload();
          }}
        />
      ) : null}
    </>
  );
}

function CompanyFormDialog({
  company,
  canSetCommission,
  onClose,
  onSaved,
}: {
  company: Company | null;
  canSetCommission: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    code: company?.code ?? "",
    name: company?.name ?? "",
    legal_name: company?.legal_name ?? "",
    phone: company?.phone ?? "",
    email: company?.email ?? "",
    commission_per_mille: company?.commission_per_mille === null || company === null ? "" : String(company.commission_per_mille),
    is_active: company?.is_active ?? true,
  });

  const action = useCallback(
    (input: CompanyInput) => (company ? networkService.updateCompany(company.id, input) : networkService.createCompany(input)),
    [company],
  );
  const save = useMutation(action);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const result = await save.run({
      code: form.code.trim().toUpperCase(),
      name: form.name.trim(),
      legal_name: form.legal_name.trim() || null,
      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
      ...(canSetCommission ? { commission_per_mille: form.commission_per_mille === "" ? null : Number(form.commission_per_mille) } : {}),
      is_active: form.is_active,
    });
    if (result) onSaved();
  }

  const errors = save.fieldErrors;

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={company ? "Modifier la compagnie" : "Ajouter une compagnie"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" form="company-form" isLoading={save.isPending}>
            Enregistrer
          </Button>
        </>
      }
    >
      <form id="company-form" onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <TextField label="Code" placeholder="UTB" value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} errors={errors.code} required />
        <TextField label="Nom commercial" placeholder="Union des Transports de Bouake" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} errors={errors.name} required />
        <TextField label="Raison sociale" placeholder="UTB SA" value={form.legal_name} onChange={(event) => setForm({ ...form, legal_name: event.target.value })} errors={errors.legal_name} fieldClassName="sm:col-span-2" />
        <TextField label="Telephone" type="tel" placeholder="+225 27 00 00 00 00" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} errors={errors.phone} />
        <TextField label="E-mail" type="email" placeholder="contact@compagnie.ci" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} errors={errors.email} />
        {canSetCommission ? (
          <TextField
            label="Commission (pour mille)"
            type="number"
            min={0}
            max={1000}
            placeholder="25"
            value={form.commission_per_mille}
            onChange={(event) => setForm({ ...form, commission_per_mille: event.target.value })}
            errors={errors.commission_per_mille}
            hint="Vide : bareme de la plateforme. 25 = 2,5 %."
          />
        ) : null}
        <SelectField label="Etat" value={form.is_active ? "1" : "0"} onChange={(event) => setForm({ ...form, is_active: event.target.value === "1" })}>
          <option value="1">Active</option>
          <option value="0">Inactive</option>
        </SelectField>
        {save.error && !Object.keys(errors).length ? <FormAlert className="sm:col-span-2">{errorMessage(save.error)}</FormAlert> : null}
      </form>
    </Modal>
  );
}
