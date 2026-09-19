"use client";

import { useCallback, useState } from "react";
import type { FormEvent } from "react";
import { Badge, Button, ConfirmDialog, DataTable, FormAlert, Modal, SelectField, TextField } from "@/components/ui";
import type { Column } from "@/components/ui";
import { IconPencil, IconPlus, IconTrash } from "@/components/ui/icons";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useMutation } from "@/hooks/useMutation";
import { useCityOptions } from "@/hooks/useOptions";
import { usePaginatedData } from "@/hooks/usePaginatedData";
import { useSort } from "@/hooks/useSort";
import { errorMessage } from "@/lib/api-client";
import { formatDuration, formatMoney } from "@/lib/format";
import { routeGridService } from "@/services";
import type { RouteGridEntryInput } from "@/services/route-grid-service";
import type { RouteGridEntry } from "@/types/api";

/**
 * Grille des trajets : ce que le site affiche, avec « Bientot disponible »,
 * pour les liaisons autres que la ligne pilote. Reservee a l'administrateur de
 * la plateforme (la page exige `platform.manage`), donc sans garde de droits
 * supplementaire ici.
 */
export function RouteGridList() {
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<RouteGridEntry | "new" | null>(null);
  const [deleting, setDeleting] = useState<RouteGridEntry | null>(null);

  const debounced = useDebouncedValue(search);
  const { sort, setSort, sortParams } = useSort();

  const fetcher = useCallback(
    (page: number, perPage: number) =>
      routeGridService.list({ page, per_page: perPage, search: debounced || undefined, ...sortParams }),
    [debounced, sortParams],
  );
  const list = usePaginatedData(fetcher);

  const deleteAction = useCallback((id: string) => routeGridService.remove(id), []);
  const deletion = useMutation(deleteAction);

  const columns: Array<Column<RouteGridEntry>> = [
    { key: "origin", header: "Depart", sortKey: "origin", cell: (item) => <span className="font-semibold">{item.origin_city?.name}</span> },
    { key: "destination", header: "Arrivee", sortKey: "destination", cell: (item) => <span className="font-semibold">{item.destination_city?.name}</span> },
    { key: "company", header: "Compagnie", hideOnMobile: true, cell: (item) => item.company_name ?? "-" },
    { key: "times", header: "Horaires", hideOnMobile: true, cell: (item) => (item.departure_times.length > 0 ? item.departure_times.join(" · ") : "-") },
    { key: "duration", header: "Duree", sortKey: "duration", hideOnMobile: true, cell: (item) => formatDuration(item.duration_minutes) },
    { key: "price", header: "Prix", sortKey: "price", className: "tabular-nums font-semibold", cell: (item) => formatMoney(item.price) },
    { key: "state", header: "Etat", sortKey: "is_active", cell: (item) => <Badge tone={item.is_active ? "success" : "neutral"}>{item.is_active ? "Publie" : "Masque"}</Badge> },
    {
      key: "actions",
      header: "",
      className: "text-right",
      cell: (item) => (
        <div className="flex justify-end gap-1">
          <Button size="icon" variant="ghost" aria-label="Modifier" onClick={() => setEditing(item)} icon={<IconPencil />} />
          <Button size="icon" variant="ghost" aria-label="Supprimer" onClick={() => setDeleting(item)} icon={<IconTrash className="h-4 w-4 text-rose-600" />} />
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        rows={list.items}
        getRowKey={(item) => item.id}
        isLoading={list.isLoading}
        error={list.error}
        onRetry={list.reload}
        meta={list.meta}
        onPageChange={list.setPage}
        onPerPageChange={list.setPerPage}
        sort={sort}
        onSortChange={setSort}
        search={{ value: search, onChange: setSearch, placeholder: "Ville ou compagnie…" }}
        emptyTitle="Aucune ligne dans la grille"
        toolbar={
          <Button onClick={() => setEditing("new")} icon={<IconPlus className="h-4 w-4" />}>
            Ajouter
          </Button>
        }
      />

      {editing ? (
        <RouteGridFormDialog
          entry={editing === "new" ? null : editing}
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
        title="Supprimer cette ligne"
        confirmLabel="Supprimer"
        isPending={deletion.isPending}
        error={deletion.error}
      >
        Pour retirer temporairement une ligne du site sans la perdre, passez-la plutot en « Masque ».
      </ConfirmDialog>
    </>
  );
}

/** « 6:00, 18:00 » → ["06:00", "18:00"]. Une saisie illisible est laissee telle quelle : le serveur la refuse et l'affiche. */
function parseTimes(raw: string): string[] {
  return raw
    .split(/[,;\s]+/)
    .filter(Boolean)
    .map((time) => (/^\d:\d{2}$/.test(time) ? `0${time}` : time));
}

function RouteGridFormDialog({
  entry,
  onClose,
  onSaved,
}: {
  entry: RouteGridEntry | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const cities = useCityOptions();
  const isEdit = entry !== null;

  const [form, setForm] = useState({
    origin_city_id: entry?.origin_city_id ?? "",
    destination_city_id: entry?.destination_city_id ?? "",
    company_name: entry?.company_name ?? "",
    price: String(entry?.price ?? 5000),
    duration_minutes: entry?.duration_minutes ? String(entry.duration_minutes) : "",
    distance_km: entry?.distance_km ? String(entry.distance_km) : "",
    departure_times: entry?.departure_times.join(", ") ?? "",
    notes: entry?.notes ?? "",
    is_active: entry?.is_active ?? true,
  });

  const action = useCallback(
    (input: RouteGridEntryInput) => (entry ? routeGridService.update(entry.id, input) : routeGridService.create(input)),
    [entry],
  );
  const save = useMutation(action);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const result = await save.run({
      ...(isEdit ? {} : { origin_city_id: form.origin_city_id, destination_city_id: form.destination_city_id }),
      company_name: form.company_name || null,
      price: Number(form.price),
      duration_minutes: form.duration_minutes ? Number(form.duration_minutes) : null,
      distance_km: form.distance_km ? Number(form.distance_km) : null,
      departure_times: parseTimes(form.departure_times),
      notes: form.notes || null,
      is_active: form.is_active,
    });
    if (result) onSaved();
  }

  const errors = save.fieldErrors;
  const timesErrors = Object.entries(errors)
    .filter(([key]) => key.startsWith("departure_times"))
    .flatMap(([, messages]) => messages);

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={isEdit ? "Modifier la ligne" : "Ajouter une ligne"}
      description={
        isEdit
          ? "Les villes ne changent pas apres creation : une ligne erronee se supprime et se recree."
          : "Ces informations s'affichent au voyageur qui recherche cette liaison, avec « Bientot disponible »."
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" form="route-grid-form" isLoading={save.isPending}>
            Enregistrer
          </Button>
        </>
      }
    >
      <form id="route-grid-form" onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <SelectField label="Ville de depart" value={form.origin_city_id} onChange={(event) => setForm({ ...form, origin_city_id: event.target.value })} errors={errors.origin_city_id} disabled={isEdit} required>
          <option value="">Choisir</option>
          {cities.map((city) => (
            <option key={city.id} value={city.id}>
              {city.name}
            </option>
          ))}
        </SelectField>
        <SelectField label="Ville d'arrivee" value={form.destination_city_id} onChange={(event) => setForm({ ...form, destination_city_id: event.target.value })} errors={errors.destination_city_id} disabled={isEdit} required>
          <option value="">Choisir</option>
          {cities.map((city) => (
            <option key={city.id} value={city.id}>
              {city.name}
            </option>
          ))}
        </SelectField>
        <TextField label="Compagnie (informatif)" placeholder="UTB" value={form.company_name} onChange={(event) => setForm({ ...form, company_name: event.target.value })} errors={errors.company_name} fieldClassName="sm:col-span-2" />
        <TextField label="Prix indicatif (F CFA)" type="number" min={0} step={100} placeholder="7000" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} errors={errors.price} required />
        <SelectField label="Etat" value={form.is_active ? "1" : "0"} onChange={(event) => setForm({ ...form, is_active: event.target.value === "1" })}>
          <option value="1">Publie sur le site</option>
          <option value="0">Masque</option>
        </SelectField>
        <TextField label="Duree (minutes)" type="number" min={1} placeholder="300" value={form.duration_minutes} onChange={(event) => setForm({ ...form, duration_minutes: event.target.value })} errors={errors.duration_minutes} />
        <TextField label="Distance (km)" type="number" min={1} placeholder="350" value={form.distance_km} onChange={(event) => setForm({ ...form, distance_km: event.target.value })} errors={errors.distance_km} />
        <TextField label="Horaires habituels" placeholder="06:00, 12:00, 18:00" value={form.departure_times} onChange={(event) => setForm({ ...form, departure_times: event.target.value })} errors={timesErrors.length > 0 ? timesErrors : undefined} fieldClassName="sm:col-span-2" />
        <TextField label="Note (facultatif)" placeholder="Depart de la gare routiere d'Adjame" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} errors={errors.notes} fieldClassName="sm:col-span-2" />
        {save.error && !Object.keys(errors).length ? <FormAlert className="sm:col-span-2">{errorMessage(save.error)}</FormAlert> : null}
      </form>
    </Modal>
  );
}
