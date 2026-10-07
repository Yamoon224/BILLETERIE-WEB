import { apiFetch, clearToken, storeToken } from "../lib/api-client";
import type { AuthenticatedUser, Single } from "../types/api";

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
 *
 * `identifier` est une adresse e-mail, un numero de telephone, ou le code
 * d'une compagnie : l'API determine elle-meme laquelle des trois formes a ete
 * saisie. `code` (2FA) n'est exige que par les comptes qui l'ont active.
 */
export async function login(identifier: string, password: string, code?: string): Promise<AuthenticatedUser> {
  const response = await apiFetch<SessionResponse>("/login", {
    method: "POST",
    body: { login: identifier, password, code: code || undefined, device_name: "web" },
  });

  storeToken(response.data.token);

  return response.data.user;
}

/** Connexion rapide au guichet, par code PIN plutot que par mot de passe (comptes agents uniquement). */
export async function loginWithPin(identifier: string, pin: string): Promise<AuthenticatedUser> {
  const response = await apiFetch<SessionResponse>("/login/pin", {
    method: "POST",
    body: { login: identifier, pin, device_name: "tablette-guichet" },
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

// --- Verification en deux etapes (reservee au role platform_admin) -------------

export interface TwoFactorEnrollment {
  secret: string;
  otpauth_url: string;
}

export async function twoFactorStatus(): Promise<boolean> {
  return (await apiFetch<{ data: { enabled: boolean } }>("/me/two-factor")).data.enabled;
}

/** Demarre (ou redemarre) une inscription : sans effet tant que `confirmTwoFactor` n'a pas ete appelee avec succes. */
export async function enableTwoFactor(): Promise<TwoFactorEnrollment> {
  return (await apiFetch<{ data: TwoFactorEnrollment }>("/me/two-factor", { method: "POST" })).data;
}

export async function confirmTwoFactor(code: string): Promise<void> {
  await apiFetch("/me/two-factor/confirm", { method: "POST", body: { code } });
}

export async function disableTwoFactor(password: string): Promise<void> {
  await apiFetch("/me/two-factor", { method: "DELETE", body: { password } });
}
