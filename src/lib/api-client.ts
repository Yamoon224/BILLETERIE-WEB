import { config } from "./config";

/**
 * Point de passage unique vers l'API Laravel.
 *
 * Aucun composant n'appelle `fetch` directement : l'URL de base, l'injection du
 * jeton, la serialisation JSON et la traduction des erreurs HTTP en erreurs
 * typees vivent ici, et nulle part ailleurs.
 */

/** Forme d'erreur garantie par le backend (voir bootstrap/app.php). */
export interface ApiErrorBody {
  message: string;
  error_code: string;
  context?: Record<string, unknown>;
  /** Present uniquement sur les erreurs de validation (422). */
  errors?: Record<string, string[]>;
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly body: ApiErrorBody | null,
  ) {
    super(body?.message ?? `Erreur API ${status}`);
    this.name = "ApiError";
  }

  /** Code applicatif stable, sur lequel l'interface branche un comportement. */
  get code(): string {
    return this.body?.error_code ?? "unknown_error";
  }

  get fieldErrors(): Record<string, string[]> {
    return this.body?.errors ?? {};
  }

  get isUnauthenticated(): boolean {
    return this.status === 401;
  }
}

/** Le serveur n'a pas repondu du tout : reseau coupe ou backend arrete. */
export class NetworkError extends Error {
  constructor(cause: unknown) {
    super("Connexion impossible. Verifiez votre reseau puis reessayez.");
    this.name = "NetworkError";
    this.cause = cause;
  }
}

function readToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(config.tokenStorageKey);
  } catch {
    // Navigation privee ou stockage bloque : on continue en anonyme.
    return null;
  }
}

export function storeToken(token: string): void {
  try {
    window.localStorage.setItem(config.tokenStorageKey, token);
  } catch {
    /* sans persistance, la session ne survivra pas au rechargement */
  }
}

export function clearToken(): void {
  try {
    window.localStorage.removeItem(config.tokenStorageKey);
  } catch {
    /* idem */
  }
}

/**
 * Reaction a un jeton refuse par l'API.
 *
 * Les jetons expirent cote backend. Sans traitement central, chaque ecran
 * decouvrirait le 401 separement et afficherait une erreur en restant, en
 * apparence, connecte. Le jeton est donc efface ici — seul endroit qui voit
 * passer toutes les reponses — et l'abonne referme la session.
 */
type UnauthenticatedListener = () => void;

let unauthenticatedListener: UnauthenticatedListener | null = null;

export function onUnauthenticated(listener: UnauthenticatedListener): () => void {
  unauthenticatedListener = listener;

  return () => {
    if (unauthenticatedListener === listener) unauthenticatedListener = null;
  };
}

export interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  /** Parametres de requete ; les valeurs vides sont ignorees. */
  query?: Record<string, string | number | boolean | null | undefined>;
}

export function buildUrl(path: string, query?: RequestOptions["query"]): string {
  const url = `${config.apiUrl}${path}`;
  if (!query) return url;

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === null || value === undefined || value === "") continue;
    params.set(key, typeof value === "boolean" ? (value ? "1" : "0") : String(value));
  }

  const queryString = params.toString();
  return queryString ? `${url}?${queryString}` : url;
}

async function send(path: string, options: RequestOptions, accept: string): Promise<Response> {
  const { body, query, headers, ...rest } = options;

  const requestHeaders = new Headers(headers);
  requestHeaders.set("Accept", accept);
  if (body !== undefined) requestHeaders.set("Content-Type", "application/json");

  const token = readToken();
  if (token) requestHeaders.set("Authorization", `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      ...rest,
      headers: requestHeaders,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (cause) {
    throw new NetworkError(cause);
  }

  if (!response.ok) {
    // Un 401 sans jeton envoye est une simple visite anonyme, pas une
    // expiration : il ne referme aucune session.
    if (response.status === 401 && token !== null) {
      clearToken();
      unauthenticatedListener?.();
    }

    const errorBody = (await response.json().catch(() => null)) as ApiErrorBody | null;
    throw new ApiError(response.status, errorBody);
  }

  return response;
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await send(path, options, "application/json");

  if (response.status === 204) return undefined as T;

  return (await response.json()) as T;
}

/**
 * Telecharge un fichier servi par l'API (exports CSV).
 *
 * Un simple lien ne conviendrait pas : le jeton voyage dans un en-tete, et un
 * `<a href>` nu recevrait un 401. Le flux est recupere puis enregistre depuis
 * une URL objet locale.
 */
export async function apiDownload(
  path: string,
  fallbackFilename: string,
  query?: RequestOptions["query"],
): Promise<void> {
  const response = await send(path, { query }, "text/csv, application/octet-stream");
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filenameFrom(response.headers.get("Content-Disposition")) ?? fallbackFilename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(objectUrl);
}

function filenameFrom(disposition: string | null): string | null {
  if (!disposition) return null;

  const utf8 = /filename\*=UTF-8''([^;]+)/i.exec(disposition);
  if (utf8) return decodeURIComponent(utf8[1]);

  const plain = /filename="?([^";]+)"?/i.exec(disposition);
  return plain ? plain[1] : null;
}

/** Message lisible pour n'importe quelle erreur remontee par la couche API. */
export function errorMessage(error: unknown, fallback = "Une erreur est survenue."): string {
  if (error instanceof ApiError || error instanceof NetworkError) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
