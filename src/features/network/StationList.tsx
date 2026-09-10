"use client";

import { useCallback, useState } from "react";
import type { FormEvent } from "react";
import { Badge, Button, ConfirmDialog, DataTable, FormAlert, Modal, SelectField, TextField } from "@/components/ui";
import type { Column } from "@/components/ui";
import { IconPencil, IconPlus, IconTrash } from "@/components/ui/icons";
import { useAuth } from "@/features/auth/AuthContext";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useMutation } from "@/hooks/useMutation";
import { useCityOptions } from "@/hooks/useOptions";
import { usePaginatedData } from "@/hooks/usePaginatedData";
import { useSort } from "@/hooks/useSort";
import { errorMessage } from "@/lib/api-client";
import { networkService } from "@/services";
import type { StationInput } from "@/services/network-service";
import type { Station } from "@/types/api";

export function StationList() {
  const { can, user, hasRole } = useAuth();
  const canManage = can("network.manage");
  const isPlatformAdmin = hasRole("platform_admin");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Station | "new" | null>(null);
  const [deleting, setDeleting] = useState<Station | null>(null);

  const debounced = useDebouncedValue(search);
  const { sort, setSort, sortParams } = useSort();

  const fetcher = useCallback(
    (page: number, perPage: number) => networkService.listStations({ page, per_page: perPage, search: debounced || undefined, ...sortParams }),
    [debounced, sortParams],
  );
  const list = usePaginatedData(fetcher);

  const deleteAction = useCallback((id: string) => networkService.deleteStation(id), []);
  const deletion = useMutation(deleteAction);

  // Une gare partagee ne se modifie que par l'administrateur plateforme.
  const canEdit = (station: Station) => canManage && (isPlatformAdmin || station.company_id === user?.company_id);

  const columns: Array<Column<Station>> = [
    { key: "name", header: "Gare", sortKey: "name", cell: (station) => <span className="font-semibold">{station.name}</span> },
    { key: "city", header: "Ville", sortKey: "city", cell: (station) => station.city?.name },
    { key: "address", header: "Adresse", hideOnMobile: true, cell: (station) => <span className="text-sm text-[var(--muted)]">{station.address ?? "—"}</span> },
    { key: "owner", header: "Exploitation", cell: (station) => (station.is_shared ? <Badge tone="info">Partagee</Badge> : <Badge>{station.company?.name}</Badge>) },
    { key: "state", header: "Etat", sortKey: "is_active", hideOnMobile: true, cell: (station) => <Badge tone={station.is_active ? "success" : "neutral"}>{station.is_active ? "Active" : "Inactive"}</Badge> },
    {
      key: "actions",
      header: "",
      className: "text-right",
      cell: (station) =>
        canEdit(station) ? (
          <div className="flex justify-end gap-1">
            <Button size="icon" variant="ghost" aria-label="Modifier" onClick={() => setEditing(station)} icon={<IconPencil />} />
            <Button size="icon" variant="ghost" aria-label="Supprimer" onClick={() => setDeleting(station)} icon={<IconTrash className="h-4 w-4 text-rose-600" />} />
          </div>
        ) : null,
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        rows={list.items}
        getRowKey={(station) => station.id}
        isLoading={list.isLoading}
        error={list.error}
        onRetry={list.reload}
        meta={list.meta}
        onPageChange={list.setPage}
        onPerPageChange={list.setPerPage}
        sort={sort}
        onSortChange={setSort}
        search={{ value: search, onChange: setSearch, placeholder: "Nom de la gare…" }}
        emptyTitle="Aucune gare"
        toolbar={
          canManage ? (
            <Button onClick={() => setEditing("new")} icon={<IconPlus className="h-4 w-4" />}>
              Ajouter
            </Button>
          ) : null
        }
      />

      {editing ? (
        <StationFormDialog
          station={editing === "new" ? null : editing}
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
        title="Supprimer cette gare"
        confirmLabel="Supprimer"
        isPending={deletion.isPending}
        error={deletion.error}
      >
        Une gare deja desservie par un depart ne peut pas etre supprimee : desactivez-la plutot.
      </ConfirmDialog>
    </>
  );
}

function StationFormDialog({ station, onClose, onSaved }: { station: Station | null; onClose: () => void; onSaved: () => void }) {
  const cities = useCityOptions();
  const [form, setForm] = useState({
    city_id: station?.city_id ?? "",
    name: station?.name ?? "",
    address: station?.address ?? "",
    phone: station?.phone ?? "",
    is_active: station?.is_active ?? true,
  });

  const action = useCallback(
    (input: StationInput) => (station ? networkService.updateStation(station.id, input) : networkService.createStation(input)),
    [station],
  );
  const save = useMutation(action);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const result = await save.run({
      city_id: form.city_id,
      name: form.name.trim(),
      address: form.address.trim() || null,
      phone: form.phone.trim() || null,
      is_active: form.is_active,
    });
    if (result) onSaved();
  }

  const errors = save.fieldErrors;

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={station ? "Modifier la gare" : "Ajouter une gare"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" form="station-form" isLoading={save.isPending}>
            Enregistrer
          </Button>
        </>
      }
    >
      <form id="station-form" onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <TextField label="Nom" placeholder="Gare routiere d'Adjame" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} errors={errors.name} required fieldClassName="sm:col-span-2" />
        <SelectField label="Ville" value={form.city_id} onChange={(event) => setForm({ ...form, city_id: event.target.value })} errors={errors.city_id} required>
          <option value="">Choisir</option>
          {cities.map((city) => (
            <option key={city.id} value={city.id}>
              {city.name}
            </option>
          ))}
        </SelectField>
        <TextField label="Telephone" type="tel" placeholder="+225 27 00 00 00 00" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} errors={errors.phone} />
        <TextField label="Adresse" placeholder="Boulevard Nangui Abrogoua" value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} errors={errors.address} fieldClassName="sm:col-span-2" />
        <SelectField label="Etat" value={form.is_active ? "1" : "0"} onChange={(event) => setForm({ ...form, is_active: event.target.value === "1" })}>
          <option value="1">Active</option>
          <option value="0">Inactive</option>
        </SelectField>
        {save.error && !Object.keys(errors).length ? <FormAlert className="sm:col-span-2">{errorMessage(save.error)}</FormAlert> : null}
      </form>
    </Modal>
  );
}
