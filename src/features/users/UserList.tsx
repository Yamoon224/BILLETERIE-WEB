"use client";

import { useCallback, useState } from "react";
import type { FormEvent } from "react";
import { Avatar, Badge, Button, DataTable, FormAlert, Modal, PasswordField, SelectField, TextField } from "@/components/ui";
import type { Column } from "@/components/ui";
import { IconPencil, IconPlus } from "@/components/ui/icons";
import { ToolbarSelect } from "@/components/ui/Toolbar";
import { useAuth } from "@/features/auth/AuthContext";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useMutation } from "@/hooks/useMutation";
import { useCompanyOptions } from "@/hooks/useOptions";
import { usePaginatedData } from "@/hooks/usePaginatedData";
import { useSort } from "@/hooks/useSort";
import { errorMessage } from "@/lib/api-client";
import { formatDateTime } from "@/lib/format";
import { ROLE_LABEL } from "@/lib/labels";
import { userService } from "@/services";
import type { UserInput } from "@/services/user-service";
import type { RoleName, User } from "@/types/api";

export function UserList() {
  const { can, hasRole } = useAuth();
  const canManage = can("users.manage");
  const isPlatformAdmin = hasRole("platform_admin");

  const [search, setSearch] = useState("");
  const [role, setRole] = useState<RoleName | "">("");
  const [editing, setEditing] = useState<User | "new" | null>(null);

  const debounced = useDebouncedValue(search);
  const { sort, setSort, sortParams } = useSort();

  const fetcher = useCallback(
    (page: number, perPage: number) => userService.list({ page, per_page: perPage, search: debounced || undefined, role, ...sortParams }),
    [debounced, role, sortParams],
  );
  const list = usePaginatedData(fetcher);

  const columns: Array<Column<User>> = [
    {
      key: "name",
      header: "Compte",
      sortKey: "name",
      cell: (user) => (
        <div className="flex items-center gap-3">
          <Avatar name={user.name} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-semibold">{user.name}</p>
            <p className="truncate text-xs text-[var(--muted)]">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "roles",
      header: "Roles",
      cell: (user) => (
        <div className="flex flex-wrap gap-1">
          {user.roles?.map((item) => (
            <Badge key={item} tone={item === "platform_admin" ? "brand" : "neutral"}>
              {ROLE_LABEL[item]}
            </Badge>
          ))}
        </div>
      ),
    },
    { key: "company", header: "Compagnie", hideOnMobile: true, cell: (user) => user.company?.name ?? "—" },
    { key: "last_login_at", header: "Derniere connexion", sortKey: "last_login_at", hideOnMobile: true, cell: (user) => <span className="text-sm">{formatDateTime(user.last_login_at)}</span> },
    { key: "state", header: "Etat", sortKey: "is_active", cell: (user) => <Badge tone={user.is_active ? "success" : "neutral"}>{user.is_active ? "Actif" : "Desactive"}</Badge> },
    {
      key: "actions",
      header: "",
      className: "text-right",
      cell: (user) => (canManage ? <Button size="icon" variant="ghost" aria-label="Modifier" onClick={() => setEditing(user)} icon={<IconPencil />} /> : null),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        rows={list.items}
        getRowKey={(user) => user.id}
        isLoading={list.isLoading}
        error={list.error}
        onRetry={list.reload}
        meta={list.meta}
        onPageChange={list.setPage}
        onPerPageChange={list.setPerPage}
        sort={sort}
        onSortChange={setSort}
        search={{ value: search, onChange: setSearch, placeholder: "Nom, e-mail ou telephone…" }}
        emptyTitle="Aucun compte"
        toolbar={
          <>
            <ToolbarSelect label="Role" value={role} onChange={(event) => setRole(event.target.value as RoleName | "")}>
              <option value="">Tous les roles</option>
              {Object.entries(ROLE_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </ToolbarSelect>
            {canManage ? (
              <Button onClick={() => setEditing("new")} icon={<IconPlus className="h-4 w-4" />}>
                Ajouter
              </Button>
            ) : null}
          </>
        }
      />

      {editing ? (
        <UserFormDialog
          user={editing === "new" ? null : editing}
          isPlatformAdmin={isPlatformAdmin}
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

/**
 * Un gestionnaire n'attribue que les roles de sa compagnie (gestionnaire,
 * agent) ; l'API refuse le reste de toute facon, l'ecran evite simplement de
 * les proposer.
 */
function UserFormDialog({
  user,
  isPlatformAdmin,
  onClose,
  onSaved,
}: {
  user: User | null;
  isPlatformAdmin: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const companies = useCompanyOptions(isPlatformAdmin);
  const assignable: RoleName[] = isPlatformAdmin ? ["platform_admin", "company_manager", "agent"] : ["company_manager", "agent"];

  const [form, setForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    password: "",
    company_id: user?.company_id ?? "",
    is_active: user?.is_active ?? true,
    roles: (user?.roles ?? ["agent"]) as RoleName[],
  });

  const action = useCallback((input: UserInput) => (user ? userService.update(user.id, input) : userService.create(input)), [user]);
  const save = useMutation(action);

  function toggleRole(value: RoleName) {
    setForm((current) => ({
      ...current,
      roles: current.roles.includes(value) ? current.roles.filter((item) => item !== value) : [...current.roles, value],
    }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const result = await save.run({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      password: form.password || null,
      ...(isPlatformAdmin ? { company_id: form.company_id || null } : {}),
      is_active: form.is_active,
      roles: form.roles,
    });
    if (result) onSaved();
  }

  const errors = save.fieldErrors;

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={user ? "Modifier le compte" : "Creer un compte"}
      description="Celui qui encaisse n'est pas celui qui rembourse : les roles agent et gestionnaire sont separes, et se cumulent seulement par decision explicite."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" form="user-form" isLoading={save.isPending}>
            Enregistrer
          </Button>
        </>
      }
    >
      <form id="user-form" onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <TextField label="Nom" placeholder="Prenom Nom" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} errors={errors.name} required />
        <TextField label="E-mail" type="email" placeholder="agent@compagnie.ci" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} errors={errors.email} required />
        <TextField label="Telephone" type="tel" placeholder="+225 07 00 00 00 00" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} errors={errors.phone} />
        <PasswordField
          label={user ? "Nouveau mot de passe" : "Mot de passe"}
          placeholder={user ? "Vide : inchange" : "8 caracteres minimum"}
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
          errors={errors.password}
          autoComplete="new-password"
          required={!user}
        />
        {isPlatformAdmin ? (
          <SelectField label="Compagnie" value={form.company_id} onChange={(event) => setForm({ ...form, company_id: event.target.value })} errors={errors.company_id}>
            <option value="">Aucune (plateforme)</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </SelectField>
        ) : null}
        <SelectField label="Etat" value={form.is_active ? "1" : "0"} onChange={(event) => setForm({ ...form, is_active: event.target.value === "1" })}>
          <option value="1">Actif</option>
          <option value="0">Desactive</option>
        </SelectField>

        <fieldset className="sm:col-span-2">
          <legend className="mb-2 text-sm font-semibold">Roles</legend>
          <div className="flex flex-wrap gap-2">
            {assignable.map((value) => {
              const checked = form.roles.includes(value);

              return (
                <label
                  key={value}
                  className={`flex cursor-pointer items-center gap-2 rounded-sm border px-3 py-2 text-sm font-semibold transition-colors ${
                    checked ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-300" : "border-[var(--hairline)]"
                  }`}
                >
                  <input type="checkbox" checked={checked} onChange={() => toggleRole(value)} className="accent-[var(--color-brand-500)]" />
                  {ROLE_LABEL[value]}
                </label>
              );
            })}
          </div>
          {errors.roles ? <p className="mt-1 text-xs font-medium text-rose-600">{errors.roles.join(" ")}</p> : null}
        </fieldset>

        {save.error && !Object.keys(errors).length ? <FormAlert className="sm:col-span-2">{errorMessage(save.error)}</FormAlert> : null}
      </form>
    </Modal>
  );
}
