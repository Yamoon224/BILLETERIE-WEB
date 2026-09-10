"use client";

import { useCallback, useState } from "react";
import type { FormEvent } from "react";
import { Badge, Button, ConfirmDialog, DataTable, FormAlert, Modal, SelectField, TextField } from "@/components/ui";
import type { Column } from "@/components/ui";
import { IconPencil, IconPlus, IconTrash } from "@/components/ui/icons";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useMutation } from "@/hooks/useMutation";
import { usePaginatedData } from "@/hooks/usePaginatedData";
import { useSort } from "@/hooks/useSort";
import { errorMessage } from "@/lib/api-client";
import { networkService } from "@/services";
import type { CityInput } from "@/services/network-service";
import type { City } from "@/types/api";

export function CityList() {
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<City | "new" | null>(null);
  const [deleting, setDeleting] = useState<City | null>(null);

  const debounced = useDebouncedValue(search);
  const { sort, setSort, sortParams } = useSort();

  const fetcher = useCallback(
    (page: number, perPage: number) => networkService.listCities({ page, per_page: perPage, search: debounced || undefined, ...sortParams }),
    [debounced, sortParams],
  );
  const list = usePaginatedData(fetcher);

  const deleteAction = useCallback((slug: string) => networkService.deleteCity(slug), []);
  const deletion = useMutation(deleteAction);

  const columns: Array<Column<City>> = [
    { key: "name", header: "Ville", sortKey: "name", cell: (city) => <span className="font-semibold">{city.name}</span> },
    { key: "slug", header: "Identifiant d'URL", hideOnMobile: true, cell: (city) => <span className="font-mono text-xs">{city.slug}</span> },
    { key: "region", header: "Region", sortKey: "region", cell: (city) => city.region ?? "—" },
    { key: "stations", header: "Gares", hideOnMobile: true, className: "tabular-nums", cell: (city) => city.stations_count ?? 0 },
    { key: "state", header: "Etat", sortKey: "is_active", cell: (city) => <Badge tone={city.is_active ? "success" : "neutral"}>{city.is_active ? "Desservie" : "Inactive"}</Badge> },
    {
      key: "actions",
      header: "",
      className: "text-right",
      cell: (city) => (
        <div className="flex justify-end gap-1">
          <Button size="icon" variant="ghost" aria-label="Modifier" onClick={() => setEditing(city)} icon={<IconPencil />} />
          <Button size="icon" variant="ghost" aria-label="Supprimer" onClick={() => setDeleting(city)} icon={<IconTrash className="h-4 w-4 text-rose-600" />} />
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        rows={list.items}
        getRowKey={(city) => city.id}
        isLoading={list.isLoading}
        error={list.error}
        onRetry={list.reload}
        meta={list.meta}
        onPageChange={list.setPage}
        onPerPageChange={list.setPerPage}
        sort={sort}
        onSortChange={setSort}
        search={{ value: search, onChange: setSearch, placeholder: "Ville ou region…" }}
        emptyTitle="Aucune ville"
        toolbar={
          <Button onClick={() => setEditing("new")} icon={<IconPlus className="h-4 w-4" />}>
            Ajouter
          </Button>
        }
      />

      {editing ? <CityFormDialog city={editing === "new" ? null : editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); list.reload(); }} /> : null}

      <ConfirmDialog
        isOpen={deleting !== null}
        onClose={() => {
          setDeleting(null);
          deletion.reset();
        }}
        onConfirm={async () => {
          if (deleting && (await deletion.run(deleting.slug)) !== null) {
            setDeleting(null);
            list.reload();
          }
        }}
        title="Supprimer cette ville"
        confirmLabel="Supprimer"
        isPending={deletion.isPending}
        error={deletion.error}
      >
        Une ville qui porte des gares ou des itineraires ne peut pas etre supprimee : desactivez-la plutot.
      </ConfirmDialog>
    </>
  );
}

function CityFormDialog({ city, onClose, onSaved }: { city: City | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ name: city?.name ?? "", region: city?.region ?? "", is_active: city?.is_active ?? true });

  const action = useCallback((input: CityInput) => (city ? networkService.updateCity(city.slug, input) : networkService.createCity(input)), [city]);
  const save = useMutation(action);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (await save.run({ name: form.name.trim(), region: form.region.trim() || null, is_active: form.is_active })) onSaved();
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      size="sm"
      title={city ? "Modifier la ville" : "Ajouter une ville"}
      description="L'identifiant d'URL est genere a la creation et ne change plus : il vit dans des liens de recherche deja partages."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" form="city-form" isLoading={save.isPending}>
            Enregistrer
          </Button>
        </>
      }
    >
      <form id="city-form" onSubmit={submit} className="grid gap-4">
        <TextField label="Nom" placeholder="Yamoussoukro" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} errors={save.fieldErrors.name} required />
        <TextField label="Region" placeholder="Lacs" value={form.region} onChange={(event) => setForm({ ...form, region: event.target.value })} errors={save.fieldErrors.region} />
        <SelectField label="Etat" value={form.is_active ? "1" : "0"} onChange={(event) => setForm({ ...form, is_active: event.target.value === "1" })}>
          <option value="1">Desservie</option>
          <option value="0">Inactive</option>
        </SelectField>
        {save.error && !Object.keys(save.fieldErrors).length ? <FormAlert>{errorMessage(save.error)}</FormAlert> : null}
      </form>
    </Modal>
  );
}
