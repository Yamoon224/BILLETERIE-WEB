import { config } from "./config";

/**
 * Point de passage unique vers l'API Laravel.
 *
 * Aucun composant n'appelle `fetch` directement : l'URL de base, l'injection du
 * jeton, la serialisation JSON, la traduction des erreurs HTTP en erreurs
 * typees et l'economie de requetes (lectures simultanees fusionnees, cache
 * court des referentiels) vivent ici, et nulle part ailleurs.
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

/**
 * Un jeton est-il memorise sur ce poste ? Permet de ne pas interroger `/me`
 * pour un visiteur anonyme, dont la reponse - 401 - est connue d'avance.
 */
export function hasStoredToken(): boolean {
  return readToken() !== null;
}

export function storeToken(token: string): void {
  // Ce qui a ete lu sous une autre identite ne vaut plus rien.
  clearCache();
  try {
    window.localStorage.setItem(config.tokenStorageKey, token);
  } catch {
    /* sans persistance, la session ne survivra pas au rechargement */
  }
}

export function clearToken(): void {
  clearCache();
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
 * apparence, connecte. Le jeton est donc efface ici - seul endroit qui voit
 * passer toutes les reponses - et l'abonne referme la session.
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
  /**
   * Lectures uniquement : duree, en millisecondes, pendant laquelle la reponse
   * est resservie sans nouvel appel. A reserver a ce qui change rarement
   * (referentiels, listes deroulantes) - jamais a un plan de salle.
   */
  cacheFor?: number;
  /**
   * Ecritures uniquement : chemins dont les lectures memorisees sont perimees
   * par cette ecriture, en plus de la ressource elle-meme (voir `resourceOf`).
   */
  invalidates?: string[];
}

/** Options qu'un service laisse regler a son appelant. */
export type ReadOptions = Pick<RequestOptions, "cacheFor">;

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

// --- Economie de requetes ------------------------------------------------------------

/**
 * Deux mecanismes, tous deux limites aux lectures (GET) :
 *
 *  - **fusion** : deux composants qui demandent la meme chose au meme instant
 *    (cinq coeurs « favori » sur une page de resultats, la liste des villes
 *    dans trois formulaires) partagent une seule requete ;
 *  - **cache court**, sur demande (`cacheFor`) : un referentiel deja lu n'est
 *    pas redemande a chaque ouverture de formulaire.
 *
 * Une ecriture perime ce qui a ete lu sur la meme ressource : apres avoir cree
 * une gare, la liste des gares est relue, jamais resservie.
 */
const cache = new Map<string, { value: unknown; expiresAt: number }>();
const inFlight = new Map<string, Promise<unknown>>();

/**
 * Incremente a chaque invalidation : une lecture partie avant une ecriture ne
 * doit pas venir remplir le cache apres elle avec une reponse deja perimee.
 */
let cacheEpoch = 0;

/** `/companies/42/status` -> `/companies` : la ressource dont depend le chemin. */
function resourceOf(path: string): string {
  return `/${path.split("/")[1] ?? ""}`;
}

/** Perime les lectures memorisees dont le chemin commence par l'un des prefixes donnes. */
export function invalidateCache(...prefixes: string[]): void {
  cacheEpoch += 1;

  const urls = prefixes.map((prefix) => `${config.apiUrl}${prefix}`);
  const isStale = (key: string) => urls.some((url) => key.slice(key.indexOf(" ") + 1).startsWith(url));

  for (const key of cache.keys()) if (isStale(key)) cache.delete(key);
  // Les lectures en vol ne sont pas annulees, seulement detachees : la
  // prochaine demande identique repartira vers le serveur.
  for (const key of inFlight.keys()) if (isStale(key)) inFlight.delete(key);
}

function clearCache(): void {
  cacheEpoch += 1;
  cache.clear();
  inFlight.clear();
}

// --- Requetes ---------------------------------------------------------------------

async function send(path: string, options: RequestOptions, accept: string): Promise<Response> {
  // `cacheFor` et `invalidates` sont des consignes pour ce module : elles ne
  // doivent pas atteindre `fetch`.
  const { body, query, headers, cacheFor, invalidates, ...rest } = options;
  void cacheFor;
  void invalidates;

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

async function sendJson<T>(path: string, options: RequestOptions): Promise<T> {
  const response = await send(path, options, "application/json");

  if (response.status === 204) return undefined as T;

  return (await response.json()) as T;
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const isRead = (options.method ?? "GET").toUpperCase() === "GET";

  if (!isRead) {
    try {
      return await sendJson<T>(path, options);
    } finally {
      // Meme en cas de refus : un 409 dit justement que ce que l'ecran
      // croyait savoir n'est plus vrai.
      invalidateCache(resourceOf(path), ...(options.invalidates ?? []));
    }
  }

  // Une lecture annulable appartient a son seul appelant : elle ne se partage pas.
  if (options.signal) return sendJson<T>(path, options);

  // Le jeton fait partie de la cle : la meme URL ne renvoie pas la meme chose
  // a un visiteur anonyme et a un compte connecte.
  const key = `${readToken() ?? ""} ${buildUrl(path, options.query)}`;

  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.value as T;

  const pending = inFlight.get(key);
  if (pending) return pending as Promise<T>;

  const epoch = cacheEpoch;
  const request = sendJson<T>(path, options)
    .then((value) => {
      if (options.cacheFor && epoch === cacheEpoch) {
        cache.set(key, { value, expiresAt: Date.now() + options.cacheFor });
      }
      return value;
    })
    .finally(() => {
      if (inFlight.get(key) === request) inFlight.delete(key);
    });

  inFlight.set(key, request);

  return request;
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

/** Durees de cache usuelles, pour que les services ne dispersent pas de nombres magiques. */
export const CACHE = {
  /** Listes deroulantes d'un formulaire : le temps d'une session de saisie. */
  options: 60_000,
  /** Referentiels publics qui ne bougent qu'a la main d'un administrateur. */
  reference: 10 * 60_000,
  /** Resultats de recherche : assez pour passer d'un jour au voisin sans rappeler l'API. */
  search: 30_000,
} as const;
