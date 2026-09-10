import { apiFetch } from "@/lib/api-client";
import type { AuditLog, ListParams, Paginated, Role, RoleName, Single, User } from "@/types/api";

export interface UserInput {
  name: string;
  email: string;
  phone?: string | null;
  password?: string | null;
  company_id?: string | null;
  is_active?: boolean;
  roles: RoleName[];
}

export function list(params: ListParams & { role?: RoleName | ""; is_active?: boolean } = {}): Promise<Paginated<User>> {
  return apiFetch<Paginated<User>>("/users", { query: { ...params } });
}

export async function create(input: UserInput): Promise<User> {
  return (await apiFetch<Single<User>>("/users", { method: "POST", body: input })).data;
}

export async function update(id: string, input: Partial<UserInput>): Promise<User> {
  return (await apiFetch<Single<User>>(`/users/${id}`, { method: "PATCH", body: input })).data;
}

export async function roles(): Promise<Role[]> {
  return (await apiFetch<{ data: Role[] }>("/roles")).data;
}

export function auditLogs(params: ListParams & { event?: string } = {}): Promise<Paginated<AuditLog>> {
  return apiFetch<Paginated<AuditLog>>("/audit-logs", { query: { ...params } });
}
