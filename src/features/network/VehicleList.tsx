"use client";

import { useCallback, useState } from "react";
import type { FormEvent } from "react";
import { Badge, Button, ConfirmDialog, DataTable, FormAlert, Modal, SelectField, TextField } from "@/components/ui";
import type { Column } from "@/components/ui";
import { IconPencil, IconPlus, IconTrash } from "@/components/ui/icons";
import { useAuth } from "@/features/auth/AuthContext";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useMutation } from "@/hooks/useMutation";
import { useCompanyOptions } from "@/hooks/useOptions";
import { usePaginatedData } from "@/hooks/usePaginatedData";
import { useSort } from "@/hooks/useSort";
import { errorMessage } from "@/lib/api-client";
import { VEHICLE_CLASS_LABEL } from "@/lib/labels";
import { networkService } from "@/services";
import type { VehicleInput } from "@/services/network-service";
import type { Vehicle, VehicleClass } from "@/types/api";

export function VehicleList() {
  const { can, user } = useAuth();
  const canManage = can("network.manage");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Vehicle | "new" | null>(null);
  const [deleting, setDeleting] = useState<Vehicle | null>(null);

  const debounced = useDebouncedValue(search);
  const { sort, setSort, sortParams } = useSort();

  const fetcher = useCallback(
    (page: number, perPage: number) => networkService.listVehicles({ page, per_page: perPage, search: debounced || undefined, ...sortParams }),
    [debounced, sortParams],
  );
  const list = usePaginatedData(fetcher);

  const deleteAction = useCallback((id: string) => networkService.deleteVehicle(id), []);
  const deletion = useMutation(deleteAction);

  const columns: Array<Column<Vehicle>> = [
    { key: "registration", header: "Immatriculation", sortKey: "registration", cell: (vehicle) => <span className="font-mono font-bold">{vehicle.registration}</span> },
    { key: "model", header: "Modele", sortKey: "model", hideOnMobile: true, cell: (vehicle) => vehicle.model ?? "—" },
    { key: "class", header: "Classe", sortKey: "class", cell: (vehicle) => <Badge tone={vehicle.class === "vip" ? "brand" : "neutral"}>{vehicle.class_label}</Badge> },
    {
      key: "capacity",
      header: "Places",
      sortKey: "capacity",
      cell: (vehicle) => (
        <span className="tabular-nums">
          {vehicle.seat_capacity} <span className="text-xs text-[var(--muted)]">({vehicle.seats_per_row} par rangee)</span>
        </span>
      ),
    },
    { key: "company", header: "Compagnie", hideOnMobile: true, cell: (vehicle) => vehicle.company?.name ?? "—" },
    { key: "state", header: "Etat", sortKey: "is_active", cell: (vehicle) => <Badge tone={vehicle.is_active ? "success" : "neutral"}>{vehicle.is_active ? "Actif" : "Inactif"}</Badge> },
    {
      key: "actions",
      header: "",
      className: "text-right",
      cell: (vehicle) =>
        canManage ? (
          <div className="flex justify-end gap-1">
            <Button size="icon" variant="ghost" aria-label="Modifier" onClick={() => setEditing(vehicle)} icon={<IconPencil />} />
            <Button size="icon" variant="ghost" aria-label="Supprimer" onClick={() => setDeleting(vehicle)} icon={<IconTrash className="h-4 w-4 text-rose-600" />} />
          </div>
        ) : null,
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        rows={list.items}
        getRowKey={(vehicle) => vehicle.id}
        isLoading={list.isLoading}
        error={list.error}
        onRetry={list.reload}
        meta={list.meta}
        onPageChange={list.setPage}
        onPerPageChange={list.setPerPage}
        sort={sort}
        onSortChange={setSort}
        search={{ value: search, onChange: setSearch, placeholder: "Immatriculation ou modele…" }}
        emptyTitle="Aucun vehicule"
        toolbar={
          canManage ? (
            <Button onClick={() => setEditing("new")} icon={<IconPlus className="h-4 w-4" />}>
              Ajouter
            </Button>
          ) : null
        }
      />

      {editing ? (
        <VehicleFormDialog
          vehicle={editing === "new" ? null : editing}
          needsCompany={user?.company_id === null}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            list.reload();
          }}
        />
      ) : null}

      <ConfirmDialog
        isOpen={deleting !== null}
        onClose={() => {
          setDeleting(null);
          deletion.reset();
        }}
        onConfirm={async () => {
          if (deleting && (await deletion.run(deleting.id)) !== null) {
            setDeleting(null);
            list.reload();
          }
        }}
        title="Supprimer ce vehicule"
        confirmLabel="Supprimer"
        isPending={deletion.isPending}
        error={deletion.error}
      >
        Un vehicule deja utilise par un depart ne peut pas etre supprime : desactivez-le plutot.
      </ConfirmDialog>
    </>
  );
}

function VehicleFormDialog({
  vehicle,
  needsCompany,
  onClose,
  onSaved,
}: {
  vehicle: Vehicle | null;
  needsCompany: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const companies = useCompanyOptions(needsCompany && vehicle === null);
  const [form, setForm] = useState({
    company_id: vehicle?.company_id ?? "",
    registration: vehicle?.registration ?? "",
    model: vehicle?.model ?? "",
    class: (vehicle?.class ?? "standard") as VehicleClass,
    seat_capacity: String(vehicle?.seat_capacity ?? 70),
    seats_per_row: String(vehicle?.seats_per_row ?? 4),
    is_active: vehicle?.is_active ?? true,
  });

  const action = useCallback(
    (input: VehicleInput) => (vehicle ? networkService.updateVehicle(vehicle.id, input) : networkService.createVehicle(input)),
    [vehicle],
  );
  const save = useMutation(action);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const result = await save.run({
      ...(needsCompany && !vehicle ? { company_id: form.company_id } : {}),
      registration: form.registration.trim(),
      model: form.model.trim() || null,
      class: form.class,
      seat_capacity: Number(form.seat_capacity),
      seats_per_row: Number(form.seats_per_row),
      is_active: form.is_active,
    });
    if (result) onSaved();
  }

  const errors = save.fieldErrors;

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={vehicle ? "Modifier le vehicule" : "Ajouter un vehicule"}
      description="La capacite est recopiee dans chaque nouveau depart : la modifier ne renumerote jamais les places deja vendues."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" form="vehicle-form" isLoading={save.isPending}>
            Enregistrer
          </Button>
        </>
      }
    >
      <form id="vehicle-form" onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        {needsCompany && !vehicle ? (
          <SelectField label="Compagnie" value={form.company_id} onChange={(event) => setForm({ ...form, company_id: event.target.value })} errors={errors.company_id} required fieldClassName="sm:col-span-2">
            <option value="">Choisir</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </SelectField>
        ) : null}
        <TextField label="Immatriculation" placeholder="1234 AB 01" value={form.registration} onChange={(event) => setForm({ ...form, registration: event.target.value })} errors={errors.registration} required />
        <TextField label="Modele" placeholder="Higer KLQ6128" value={form.model} onChange={(event) => setForm({ ...form, model: event.target.value })} errors={errors.model} />
        <SelectField label="Classe" value={form.class} onChange={(event) => setForm({ ...form, class: event.target.value as VehicleClass })} errors={errors.class}>
          {Object.entries(VEHICLE_CLASS_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </SelectField>
        <SelectField label="Etat" value={form.is_active ? "1" : "0"} onChange={(event) => setForm({ ...form, is_active: event.target.value === "1" })}>
          <option value="1">Actif</option>
          <option value="0">Inactif</option>
        </SelectField>
        <TextField label="Nombre de places" type="number" min={4} max={120} placeholder="70" value={form.seat_capacity} onChange={(event) => setForm({ ...form, seat_capacity: event.target.value })} errors={errors.seat_capacity} required />
        <TextField label="Places par rangee" type="number" min={2} max={6} placeholder="4" value={form.seats_per_row} onChange={(event) => setForm({ ...form, seats_per_row: event.target.value })} errors={errors.seats_per_row} hint="4 pour un 2+2, 5 pour un 3+2." required />
        {save.error && !Object.keys(errors).length ? <FormAlert className="sm:col-span-2">{errorMessage(save.error)}</FormAlert> : null}
      </form>
    </Modal>
  );
}
