"use client";

import { useCallback, useState } from "react";
import type { FormEvent } from "react";
import { Avatar, Badge, Button, DataTable, FormAlert, Modal, PasswordField, SelectField, TextField } from "@/components/ui";
import type { Column } from "@/components/ui";
import { IconPlus } from "@/components/ui/icons";
import { useAsyncData } from "@/hooks/useAsyncData";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useMutation } from "@/hooks/useMutation";
import { useCompanyOptions, useStationOptions } from "@/hooks/useOptions";
import { usePaginatedData } from "@/hooks/usePaginatedData";
import { errorMessage } from "@/lib/api-client";
import { todayIso } from "@/lib/format";
import { reportService, userService } from "@/services";
import type { UserInput } from "@/services/user-service";
import type { User } from "@/types/api";

/**
 * Comptes agents de guichet, toutes gares confondues.
 *
 * Les ventes du jour viennent du meme agregat que le tableau de bord
 * (`sales_by_agent`), filtre sur la journee en cours : un deuxieme compteur de
 * ventes, tenu separement, finirait par diverger du chiffre que l'agent
 * lui-meme voit sur son ecran de guichet.
 */
function useTodaySales(): Map<string, { bookings: number; tickets: number }> {
  const loader = useCallback(() => reportService.dashboard({ from: todayIso(), to: todayIso() }), []);
  const { data } = useAsyncData(loader);

  const map = new Map<string, { bookings: number; tickets: number }>();
  for (const agent of data?.sales_by_agent ?? []) map.set(agent.user_id, { bookings: agent.bookings, tickets: agent.tickets });

  return map;
}

export function AgentList() {
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<User | "new" | null>(null);
  const debounced = useDebouncedValue(search);
  const todaySales = useTodaySales();

  const fetcher = useCallback(
    (page: number, perPage: number) => userService.list({ page, per_page: perPage, search: debounced || undefined, role: "agent" }),
    [debounced],
  );
  const list = usePaginatedData(fetcher);

  const toggleActive = useMutation(({ id, is_active }: { id: string; is_active: boolean }) => userService.update(id, { is_active }));

  async function handleToggle(agent: User) {
    const result = await toggleActive.run({ id: agent.id, is_active: !agent.is_active });
    if (result) list.reload();
  }

  const columns: Array<Column<User>> = [
    {
      key: "name",
      header: "Agent",
      cell: (agent) => (
        <div className="flex items-center gap-3">
          <Avatar name={agent.name} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-semibold">{agent.name}</p>
            <p className="truncate text-xs text-[var(--muted)]">{agent.email}</p>
          </div>
        </div>
      ),
    },
    { key: "station", header: "Gare", hideOnMobile: true, cell: (agent) => agent.station?.name ?? "-" },
    {
      key: "sales",
      header: "Ventes aujourd'hui",
      cell: (agent) => {
        const sales = todaySales.get(agent.id);
        const tickets = sales?.tickets ?? 0;
        return <span className="tabular-nums">{tickets === 0 ? "0 billet" : `${tickets} billet${tickets > 1 ? "s" : ""}`}</span>;
      },
    },
    { key: "state", header: "Statut", cell: (agent) => <Badge tone={agent.is_active ? "success" : "danger"}>{agent.is_active ? "Actif" : "Inactif"}</Badge> },
    {
      key: "actions",
      header: "",
      className: "text-right",
      cell: (agent) => (
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="ghost" onClick={() => setEditing(agent)}>
            Modifier
          </Button>
          <Button size="sm" variant={agent.is_active ? "ghost" : "brand"} onClick={() => handleToggle(agent)} isLoading={toggleActive.isPending}>
            {agent.is_active ? "Desactiver" : "Reactiver"}
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
        getRowKey={(agent) => agent.id}
        isLoading={list.isLoading}
        error={list.error}
        onRetry={list.reload}
        meta={list.meta}
        onPageChange={list.setPage}
        onPerPageChange={list.setPerPage}
        search={{ value: search, onChange: setSearch, placeholder: "Nom ou e-mail…" }}
        emptyTitle="Aucun agent"
        toolbar={
          <Button onClick={() => setEditing("new")} icon={<IconPlus className="h-4 w-4" />}>
            Creer un agent
          </Button>
        }
      />

      {editing ? (
        <AgentFormDialog
          agent={editing === "new" ? null : editing}
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

function AgentFormDialog({ agent, onClose, onSaved }: { agent: User | null; onClose: () => void; onSaved: () => void }) {
  const companies = useCompanyOptions();
  const stations = useStationOptions();

  const [form, setForm] = useState({
    name: agent?.name ?? "",
    email: agent?.email ?? "",
    phone: agent?.phone ?? "",
    password: "",
    company_id: agent?.company_id ?? "",
    station_id: agent?.station_id ?? "",
    is_active: agent?.is_active ?? true,
  });

  const action = useCallback((input: UserInput) => (agent ? userService.update(agent.id, input) : userService.create(input)), [agent]);
  const save = useMutation(action);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const result = await save.run({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      password: form.password || null,
      company_id: form.company_id || null,
      station_id: form.station_id || null,
      is_active: form.is_active,
      roles: ["agent"],
    });
    if (result) onSaved();
  }

  const errors = save.fieldErrors;

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={agent ? "Modifier l'agent" : "Creer un agent"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" form="agent-form" isLoading={save.isPending}>
            Enregistrer
          </Button>
        </>
      }
    >
      <form id="agent-form" onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <TextField label="Nom" placeholder="Prenom Nom" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} errors={errors.name} required />
        <TextField label="E-mail" type="email" placeholder="agent@compagnie.ci" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} errors={errors.email} required />
        <TextField label="Telephone" type="tel" placeholder="+225 07 00 00 00 00" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} errors={errors.phone} />
        <PasswordField
          label={agent ? "Nouveau mot de passe" : "Mot de passe"}
          placeholder={agent ? "Vide : inchange" : "8 caracteres minimum"}
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
          errors={errors.password}
          autoComplete="new-password"
          required={!agent}
        />
        <SelectField label="Compagnie" value={form.company_id} onChange={(event) => setForm({ ...form, company_id: event.target.value })} errors={errors.company_id}>
          <option value="">Aucune</option>
          {companies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
        </SelectField>
        <SelectField label="Gare" value={form.station_id} onChange={(event) => setForm({ ...form, station_id: event.target.value })} errors={errors.station_id}>
          <option value="">Non affecte</option>
          {stations.map((station) => (
            <option key={station.id} value={station.id}>
              {station.name}
            </option>
          ))}
        </SelectField>
        <SelectField label="Statut" value={form.is_active ? "1" : "0"} onChange={(event) => setForm({ ...form, is_active: event.target.value === "1" })} fieldClassName="sm:col-span-2">
          <option value="1">Actif</option>
          <option value="0">Inactif</option>
        </SelectField>
        {save.error && !Object.keys(errors).length ? <FormAlert className="sm:col-span-2">{errorMessage(save.error)}</FormAlert> : null}
      </form>
    </Modal>
  );
}
