import { apiFetch, clearToken, storeToken } from "@/lib/api-client";
import type { AuthenticatedUser, Single } from "@/types/api";

interface SessionResponse {
  data: { token: string; user: AuthenticatedUser };
}

export interface RegisterInput {
  name: string;
  email: string;
  phone?: string;
  password: string;
  password_confirmation: string;
}

/**
 * Le jeton est persiste ici et nulle part ailleurs : c'est le seul endroit du
 * frontend qui sait comment une session commence et se termine.
 */
export async function login(email: string, password: string): Promise<AuthenticatedUser> {
  const response = await apiFetch<SessionResponse>("/login", {
    method: "POST",
    body: { email, password, device_name: "web" },
  });

  storeToken(response.data.token);

  return response.data.user;
}

export async function register(input: RegisterInput): Promise<AuthenticatedUser> {
  const response = await apiFetch<SessionResponse>("/register", { method: "POST", body: input });

  storeToken(response.data.token);

  return response.data.user;
}

export async function logout(): Promise<void> {
  try {
    await apiFetch<void>("/logout", { method: "POST" });
  } finally {
    // Efface meme si l'appel echoue : rester « connecte » avec un jeton deja
    // revoque serait pire que la deconnexion elle-meme.
    clearToken();
  }
}

export async function me(): Promise<AuthenticatedUser> {
  return (await apiFetch<Single<AuthenticatedUser>>("/me")).data;
}

export async function updateProfile(input: { name?: string; email?: string; phone?: string | null }): Promise<AuthenticatedUser> {
  return (await apiFetch<Single<AuthenticatedUser>>("/me", { method: "PATCH", body: input })).data;
}

export async function updatePassword(input: {
  current_password: string;
  password: string;
  password_confirmation: string;
}): Promise<void> {
  await apiFetch("/me/password", { method: "PUT", body: input });
}
