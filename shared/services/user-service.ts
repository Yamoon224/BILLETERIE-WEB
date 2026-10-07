import { apiFetch, CACHE } from "../lib/api-client";
import type { AuditLog, ListParams, Paginated, Role, RoleName, Single, User } from "../types/api";

export interface UserInput {
  name: string;
  email: string;
  phone?: string | null;
  password?: string | null;
  company_id?: string | null;
  station_id?: string | null;
  is_active?: boolean;
  roles: RoleName[];
}

/** Comptes (permissions users.view / users.manage), cloisonnes par compagnie cote API. */
export function list(
  params: ListParams & { role?: RoleName | ""; is_active?: boolean; station_id?: string } = {},
): Promise<Paginated<User>> {
  return apiFetch<Paginated<User>>("/users", { query: { ...params } });
}

export async function create(input: UserInput): Promise<User> {
  return (await apiFetch<Single<User>>("/users", { method: "POST", body: input })).data;
}

export async function update(id: string, input: Partial<UserInput>): Promise<User> {
  return (await apiFetch<Single<User>>(`/users/${id}`, { method: "PATCH", body: input })).data;
}

/** La matrice des roles est figee par un seeder : elle ne change pas en cours de session. */
export async function roles(): Promise<Role[]> {
  return (await apiFetch<{ data: Role[] }>("/roles", { cacheFor: CACHE.reference })).data;
}

export function auditLogs(params: ListParams & { event?: string } = {}): Promise<Paginated<AuditLog>> {
  return apiFetch<Paginated<AuditLog>>("/audit-logs", { query: { ...params } });
}
