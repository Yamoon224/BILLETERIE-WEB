"use client";

import { useCallback, useState } from "react";
import type { FormEvent } from "react";
import { Badge, Button, ConfirmDialog, DataTable, FormAlert, Modal, SelectField, TextField } from "@/components/ui";
import type { Column } from "@/components/ui";
import { IconPencil, IconPlus, IconTrash } from "@/components/ui/icons";
import { useAuth } from "@/features/auth/AuthContext";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useMutation } from "@/hooks/useMutation";
import { useCityOptions, useCompanyOptions } from "@/hooks/useOptions";
import { usePaginatedData } from "@/hooks/usePaginatedData";
import { useSort } from "@/hooks/useSort";
import { errorMessage } from "@/lib/api-client";
import { formatDuration, formatMoney } from "@/lib/format";
import { networkService } from "@/services";
import type { ItineraryInput } from "@/services/network-service";
import type { Itinerary } from "@/types/api";

export function ItineraryList() {
  const { can, user } = useAuth();
  const canManage = can("network.manage");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Itinerary | "new" | null>(null);
  const [deleting, setDeleting] = useState<Itinerary | null>(null);

  const debounced = useDebouncedValue(search);
  const { sort, setSort, sortParams } = useSort();

  const fetcher = useCallback(
    (page: number, perPage: number) => networkService.listItineraries({ page, per_page: perPage, search: debounced || undefined, ...sortParams }),
    [debounced, sortParams],
  );
  const list = usePaginatedData(fetcher);

  const deleteAction = useCallback((id: string) => networkService.deleteItinerary(id), []);
  const deletion = useMutation(deleteAction);

  const columns: Array<Column<Itinerary>> = [
    { key: "origin", header: "Depart", sortKey: "origin", cell: (item) => <span className="font-semibold">{item.origin_city?.name}</span> },
    { key: "destination", header: "Arrivee", sortKey: "destination", cell: (item) => <span className="font-semibold">{item.destination_city?.name}</span> },
    { key: "duration", header: "Duree", sortKey: "duration", hideOnMobile: true, cell: (item) => formatDuration(item.duration_minutes) },
    { key: "distance", header: "Distance", sortKey: "distance", hideOnMobile: true, cell: (item) => (item.distance_km ? `${item.distance_km} km` : "—") },
    { key: "price", header: "Tarif", sortKey: "price", className: "tabular-nums font-semibold", cell: (item) => formatMoney(item.base_price) },
    { key: "company", header: "Compagnie", hideOnMobile: true, cell: (item) => item.company?.name ?? "—" },
    { key: "state", header: "Etat", sortKey: "is_active", cell: (item) => <Badge tone={item.is_active ? "success" : "neutral"}>{item.is_active ? "Actif" : "Inactif"}</Badge> },
    {
      key: "actions",
      header: "",
      className: "text-right",
      cell: (item) =>
        canManage ? (
          <div className="flex justify-end gap-1">
            <Button size="icon" variant="ghost" aria-label="Modifier" onClick={() => setEditing(item)} icon={<IconPencil />} />
            <Button size="icon" variant="ghost" aria-label="Supprimer" onClick={() => setDeleting(item)} icon={<IconTrash className="h-4 w-4 text-rose-600" />} />
          </div>
        ) : null,
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
        search={{ value: search, onChange: setSearch, placeholder: "Ville…" }}
        emptyTitle="Aucun itineraire"
        toolbar={
          canManage ? (
            <Button onClick={() => setEditing("new")} icon={<IconPlus className="h-4 w-4" />}>
              Ajouter
            </Button>
          ) : null
        }
      />

      {editing ? (
        <ItineraryFormDialog
          itinerary={editing === "new" ? null : editing}
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
        title="Supprimer cet itineraire"
        confirmLabel="Supprimer"
        isPending={deletion.isPending}
        error={deletion.error}
      >
        Un itineraire deja programme ne peut pas etre supprime : desactivez-le plutot.
      </ConfirmDialog>
    </>
  );
}

function ItineraryFormDialog({
  itinerary,
  needsCompany,
  onClose,
  onSaved,
}: {
  itinerary: Itinerary | null;
  needsCompany: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const cities = useCityOptions();
  const companies = useCompanyOptions(needsCompany && itinerary === null);
  const isEdit = itinerary !== null;

  const [form, setForm] = useState({
    company_id: "",
    origin_city_id: itinerary?.origin_city_id ?? "",
    destination_city_id: itinerary?.destination_city_id ?? "",
    distance_km: itinerary?.distance_km ? String(itinerary.distance_km) : "",
    duration_minutes: String(itinerary?.duration_minutes ?? 240),
    base_price: String(itinerary?.base_price ?? 5000),
    is_active: itinerary?.is_active ?? true,
  });

  const action = useCallback(
    (input: ItineraryInput) => (itinerary ? networkService.updateItinerary(itinerary.id, input) : networkService.createItinerary(input)),
    [itinerary],
  );
  const save = useMutation(action);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const result = await save.run({
      ...(needsCompany && !isEdit ? { company_id: form.company_id } : {}),
      origin_city_id: form.origin_city_id,
      destination_city_id: form.destination_city_id,
      distance_km: form.distance_km ? Number(form.distance_km) : null,
      duration_minutes: Number(form.duration_minutes),
      base_price: Number(form.base_price),
      is_active: form.is_active,
    });
    if (result) onSaved();
  }

  const errors = save.fieldErrors;

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={isEdit ? "Modifier l'itineraire" : "Ajouter un itineraire"}
      description={isEdit ? "Les villes ne changent pas apres creation : une liaison erronee se desactive." : "Le tarif de reference est propose par defaut aux nouveaux departs."}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" form="itinerary-form" isLoading={save.isPending}>
            Enregistrer
          </Button>
        </>
      }
    >
      <form id="itinerary-form" onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        {needsCompany && !isEdit ? (
          <SelectField label="Compagnie" value={form.company_id} onChange={(event) => setForm({ ...form, company_id: event.target.value })} errors={errors.company_id} required fieldClassName="sm:col-span-2">
            <option value="">Choisir</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </SelectField>
        ) : null}
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
        <TextField label="Duree (minutes)" type="number" min={15} placeholder="240" value={form.duration_minutes} onChange={(event) => setForm({ ...form, duration_minutes: event.target.value })} errors={errors.duration_minutes} required />
        <TextField label="Distance (km)" type="number" min={1} placeholder="350" value={form.distance_km} onChange={(event) => setForm({ ...form, distance_km: event.target.value })} errors={errors.distance_km} />
        <TextField label="Tarif de reference (F CFA)" type="number" min={0} step={100} placeholder="7000" value={form.base_price} onChange={(event) => setForm({ ...form, base_price: event.target.value })} errors={errors.base_price} required />
        <SelectField label="Etat" value={form.is_active ? "1" : "0"} onChange={(event) => setForm({ ...form, is_active: event.target.value === "1" })}>
          <option value="1">Actif</option>
          <option value="0">Inactif</option>
        </SelectField>
        {save.error && !Object.keys(errors).length ? <FormAlert className="sm:col-span-2">{errorMessage(save.error)}</FormAlert> : null}
      </form>
    </Modal>
  );
}
