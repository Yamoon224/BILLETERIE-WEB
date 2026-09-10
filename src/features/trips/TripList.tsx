"use client";

import { useCallback, useState } from "react";
import type { FormEvent } from "react";
import {
  Badge,
  Button,
  ConfirmDialog,
  DataTable,
  FormAlert,
  Modal,
  SelectField,
  TextField,
  TextareaField,
} from "@/components/ui";
import type { Column } from "@/components/ui";
import { IconBan, IconPlus } from "@/components/ui/icons";
import { ToolbarSelect } from "@/components/ui/Toolbar";
import { useAuth } from "@/features/auth/AuthContext";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useMutation } from "@/hooks/useMutation";
import { useItineraryOptions, useStationOptions, useVehicleOptions } from "@/hooks/useOptions";
import { usePaginatedData } from "@/hooks/usePaginatedData";
import { useSort } from "@/hooks/useSort";
import { errorMessage } from "@/lib/api-client";
import { formatDayShort, formatMoney, formatTime } from "@/lib/format";
import { TRIP_TONE } from "@/lib/labels";
import { tripService } from "@/services";
import type { TripInput } from "@/services/trip-service";
import type { Trip, TripStatus } from "@/types/api";

const STATUS_OPTIONS: Array<{ value: TripStatus | ""; label: string }> = [
  { value: "", label: "Tous les statuts" },
  { value: "scheduled", label: "Programmes" },
  { value: "boarding", label: "En embarquement" },
  { value: "departed", label: "Partis" },
  { value: "arrived", label: "Arrives" },
  { value: "cancelled", label: "Annules" },
];

/** Etape suivante proposee dans le cycle de vie d'un depart. */
const NEXT_STATUS: Partial<Record<TripStatus, { status: TripStatus; label: string }>> = {
  scheduled: { status: "boarding", label: "Ouvrir l'embarquement" },
  boarding: { status: "departed", label: "Marquer parti" },
  departed: { status: "arrived", label: "Marquer arrive" },
};

export function TripList() {
  const { can } = useAuth();
  const canManage = can("trips.manage");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<TripStatus | "">("");
  const [isCreating, setIsCreating] = useState(false);
  const [cancelling, setCancelling] = useState<Trip | null>(null);
  const [reason, setReason] = useState("");

  const debounced = useDebouncedValue(search);
  const { sort, setSort, sortParams } = useSort({ key: "departs_at", direction: "asc" });

  const fetcher = useCallback(
    (page: number, perPage: number) =>
      tripService.list({ page, per_page: perPage, search: debounced || undefined, status, ...sortParams }),
    [debounced, status, sortParams],
  );
  const list = usePaginatedData(fetcher);

  const cancelAction = useCallback((input: { id: string; reason: string }) => tripService.cancel(input.id, input.reason), []);
  const cancellation = useMutation(cancelAction);

  const statusAction = useCallback((input: { id: string; status: TripStatus }) => tripService.changeStatus(input.id, input.status), []);
  const statusChange = useMutation(statusAction);

  async function confirmCancel() {
    if (!cancelling) return;
    if (await cancellation.run({ id: cancelling.id, reason })) {
      setCancelling(null);
      setReason("");
      list.reload();
    }
  }

  const columns: Array<Column<Trip>> = [
    {
      key: "departs_at",
      header: "Depart",
      sortKey: "departs_at",
      cell: (trip) => (
        <div>
          <p className="font-bold tabular-nums">{formatTime(trip.departs_at)}</p>
          <p className="text-xs capitalize text-[var(--muted)]">{formatDayShort(trip.departs_at)}</p>
        </div>
      ),
    },
    {
      key: "route",
      header: "Trajet",
      cell: (trip) => (
        <div>
          <p className="font-semibold">
            {trip.itinerary?.origin_city?.name} → {trip.itinerary?.destination_city?.name}
          </p>
          <p className="font-mono text-xs text-[var(--muted)]">{trip.reference}</p>
        </div>
      ),
    },
    {
      key: "vehicle",
      header: "Vehicule",
      hideOnMobile: true,
      cell: (trip) => (
        <span className="text-sm">
          {trip.vehicle?.registration} <span className="text-[var(--muted)]">· {trip.seat_capacity} pl.</span>
        </span>
      ),
    },
    { key: "price", header: "Tarif", sortKey: "price", hideOnMobile: true, cell: (trip) => <span className="tabular-nums">{formatMoney(trip.price)}</span> },
    { key: "status", header: "Statut", sortKey: "status", cell: (trip) => <Badge tone={TRIP_TONE[trip.status]}>{trip.status_label}</Badge> },
    {
      key: "actions",
      header: "",
      className: "text-right",
      cell: (trip) =>
        canManage && !["arrived", "cancelled"].includes(trip.status) ? (
          <div className="flex justify-end gap-1">
            {NEXT_STATUS[trip.status] ? (
              <Button
                size="sm"
                variant="secondary"
                isLoading={statusChange.isPending}
                onClick={async () => {
                  if (await statusChange.run({ id: trip.id, status: NEXT_STATUS[trip.status]!.status })) list.reload();
                }}
              >
                {NEXT_STATUS[trip.status]!.label}
              </Button>
            ) : null}
            {trip.status !== "departed" ? (
              <Button size="sm" variant="ghost" aria-label="Annuler le depart" onClick={() => setCancelling(trip)} icon={<IconBan className="h-3.5 w-3.5 text-rose-600" />} />
            ) : null}
          </div>
        ) : null,
    },
  ];

  return (
    <>
      {statusChange.error ? <FormAlert className="mb-4">{errorMessage(statusChange.error)}</FormAlert> : null}

      <DataTable
        columns={columns}
        rows={list.items}
        getRowKey={(trip) => trip.id}
        isLoading={list.isLoading}
        error={list.error}
        onRetry={list.reload}
        meta={list.meta}
        onPageChange={list.setPage}
        onPerPageChange={list.setPerPage}
        sort={sort}
        onSortChange={setSort}
        search={{ value: search, onChange: setSearch, placeholder: "Reference du depart…" }}
        emptyTitle="Aucun depart"
        emptyDescription="Programmez un depart a partir d'un itineraire et d'un vehicule."
        toolbar={
          <>
            <ToolbarSelect label="Filtrer par statut" value={status} onChange={(event) => setStatus(event.target.value as TripStatus | "")}>
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </ToolbarSelect>
            {canManage ? (
              <Button onClick={() => setIsCreating(true)} icon={<IconPlus className="h-4 w-4" />}>
                Programmer
              </Button>
            ) : null}
          </>
        }
      />

      {isCreating ? (
        <TripFormDialog
          onClose={() => setIsCreating(false)}
          onSaved={() => {
            setIsCreating(false);
            list.reload();
          }}
        />
      ) : null}

      <ConfirmDialog
        isOpen={cancelling !== null}
        onClose={() => {
          setCancelling(null);
          cancellation.reset();
        }}
        onConfirm={confirmCancel}
        title="Annuler ce depart"
        confirmLabel="Annuler le depart"
        isPending={cancellation.isPending}
        error={cancellation.error}
      >
        <p className="mb-4">
          Le depart ne sera plus vendu ni embarquable. Les reservations existantes restent visibles pour etre remboursees ou reportees.
        </p>
        <TextareaField label="Motif" placeholder="Vehicule immobilise, route coupee…" value={reason} onChange={(event) => setReason(event.target.value)} required />
      </ConfirmDialog>
    </>
  );
}

function TripFormDialog({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const itineraries = useItineraryOptions();
  const vehicles = useVehicleOptions();
  const stations = useStationOptions();

  const [form, setForm] = useState({
    itinerary_id: "",
    vehicle_id: "",
    departure_station_id: "",
    arrival_station_id: "",
    departs_at: "",
    price: "",
  });

  const action = useCallback((input: TripInput) => tripService.create(input), []);
  const creation = useMutation(action);

  const itinerary = itineraries.find((item) => item.id === form.itinerary_id);
  const originStations = stations.filter((station) => !itinerary || station.city_id === itinerary.origin_city_id);
  const arrivalStations = stations.filter((station) => !itinerary || station.city_id === itinerary.destination_city_id);

  function update(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const created = await creation.run({
      itinerary_id: form.itinerary_id,
      vehicle_id: form.vehicle_id,
      departure_station_id: form.departure_station_id,
      arrival_station_id: form.arrival_station_id,
      departs_at: form.departs_at ? new Date(form.departs_at).toISOString() : "",
      price: form.price ? Number(form.price) : null,
    });
    if (created) onSaved();
  }

  const errors = creation.fieldErrors;

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Programmer un depart"
      description="Le tarif et la capacite sont figes a la creation : un changement ulterieur de tarif ou de vehicule n'affecte pas les billets deja vendus."
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" form="trip-form" isLoading={creation.isPending}>
            Programmer
          </Button>
        </>
      }
    >
      <form id="trip-form" onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <SelectField label="Itineraire" value={form.itinerary_id} onChange={(event) => update("itinerary_id", event.target.value)} errors={errors.itinerary_id} required fieldClassName="sm:col-span-2">
          <option value="">Choisir</option>
          {itineraries.map((item) => (
            <option key={item.id} value={item.id}>
              {item.origin_city?.name} → {item.destination_city?.name} · {formatMoney(item.base_price)}
            </option>
          ))}
        </SelectField>
        <SelectField label="Gare de depart" value={form.departure_station_id} onChange={(event) => update("departure_station_id", event.target.value)} errors={errors.departure_station_id} required>
          <option value="">Choisir</option>
          {originStations.map((station) => (
            <option key={station.id} value={station.id}>
              {station.name}
            </option>
          ))}
        </SelectField>
        <SelectField label="Gare d'arrivee" value={form.arrival_station_id} onChange={(event) => update("arrival_station_id", event.target.value)} errors={errors.arrival_station_id} required>
          <option value="">Choisir</option>
          {arrivalStations.map((station) => (
            <option key={station.id} value={station.id}>
              {station.name}
            </option>
          ))}
        </SelectField>
        <SelectField label="Vehicule" value={form.vehicle_id} onChange={(event) => update("vehicle_id", event.target.value)} errors={errors.vehicle_id} required>
          <option value="">Choisir</option>
          {vehicles.map((vehicle) => (
            <option key={vehicle.id} value={vehicle.id}>
              {vehicle.registration} · {vehicle.class_label} · {vehicle.seat_capacity} places
            </option>
          ))}
        </SelectField>
        <TextField label="Date et heure de depart" type="datetime-local" placeholder="jj/mm/aaaa hh:mm" value={form.departs_at} onChange={(event) => update("departs_at", event.target.value)} errors={errors.departs_at} required />
        <TextField
          label="Tarif (F CFA)"
          type="number"
          inputMode="numeric"
          min={0}
          step={100}
          placeholder={itinerary ? String(itinerary.base_price) : "7000"}
          value={form.price}
          onChange={(event) => update("price", event.target.value)}
          errors={errors.price}
          hint="Vide : tarif de reference de l'itineraire."
          fieldClassName="sm:col-span-2"
        />
        {creation.error && !Object.keys(errors).length ? <FormAlert className="sm:col-span-2">{errorMessage(creation.error)}</FormAlert> : null}
      </form>
    </Modal>
  );
}
