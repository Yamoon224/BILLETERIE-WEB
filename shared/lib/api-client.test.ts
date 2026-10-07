import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, NetworkError, apiFetch, buildUrl, onUnauthenticated, storeToken } from "./api-client";
import { config } from "./config";

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("buildUrl", () => {
  it("ignore les parametres vides et encode les booleens", () => {
    expect(buildUrl("/trips/search", { origin: "abidjan", destination: "", only_available: true, page: null })).toBe(
      `${config.apiUrl}/trips/search?origin=abidjan&only_available=1`,
    );
  });
});

describe("apiFetch", () => {
  it("envoie le jeton et renvoie le corps JSON", async () => {
    storeToken("1|secret");
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, { data: { ok: true } }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(apiFetch("/me")).resolves.toEqual({ data: { ok: true } });

    const headers = fetchMock.mock.calls[0][1].headers as Headers;
    expect(headers.get("Authorization")).toBe("Bearer 1|secret");
  });

  it("traduit un refus metier en ApiError portant son code applicatif", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse(409, { message: "La place 3A n'est plus disponible.", error_code: "seat_unavailable", context: { seats: ["3A"] } })),
    );

    const error = await apiFetch("/bookings", { method: "POST", body: {} }).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).code).toBe("seat_unavailable");
    expect((error as ApiError).status).toBe(409);
  });

  /** C'est ce qui fait basculer une vente de guichet en file hors ligne. */
  it("distingue l'absence de reseau d'un refus du serveur", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

    await expect(apiFetch("/counter-sales", { method: "POST", body: {} })).rejects.toBeInstanceOf(NetworkError);
  });

  it("referme la session quand un jeton envoye est refuse", async () => {
    storeToken("1|expire");
    const listener = vi.fn();
    const unsubscribe = onUnauthenticated(listener);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(401, { message: "Non authentifie", error_code: "unauthenticated" })));

    await apiFetch("/me").catch(() => undefined);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(window.localStorage.getItem(config.tokenStorageKey)).toBeNull();
    unsubscribe();
  });

  /** Cinq coeurs « favori » sur une page de resultats ne doivent couter qu'un appel. */
  it("fusionne les lectures identiques lancees au meme instant", async () => {
    const fetchMock = vi.fn().mockImplementation(async () => jsonResponse(200, { data: ["bonoua"] }));
    vi.stubGlobal("fetch", fetchMock);

    const [first, second] = await Promise.all([apiFetch("/cities/options"), apiFetch("/cities/options")]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(first).toEqual(second);

    // Une fois la reponse arrivee, rien n'est retenu sans `cacheFor`.
    await apiFetch("/cities/options");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("ressert une lecture memorisee, puis la relit apres une ecriture sur la meme ressource", async () => {
    const fetchMock = vi.fn().mockImplementation(async () => jsonResponse(200, { data: [] }));
    vi.stubGlobal("fetch", fetchMock);

    await apiFetch("/stations", { query: { per_page: 100 }, cacheFor: 60_000 });
    await apiFetch("/stations", { query: { per_page: 100 }, cacheFor: 60_000 });
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // D'autres parametres sont une autre question : pas de reponse partagee.
    await apiFetch("/stations", { query: { per_page: 15 }, cacheFor: 60_000 });
    expect(fetchMock).toHaveBeenCalledTimes(2);

    await apiFetch("/stations", { method: "POST", body: { name: "Gare de Bonoua" } });
    await apiFetch("/stations", { query: { per_page: 100 }, cacheFor: 60_000 });
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it("perime aussi les chemins declares par l'ecriture", async () => {
    storeToken("1|secret");
    const fetchMock = vi.fn().mockImplementation(async () => jsonResponse(200, { data: [] }));
    vi.stubGlobal("fetch", fetchMock);

    await apiFetch("/me/favorites", { cacheFor: 60_000 });
    await apiFetch("/favorites", { method: "POST", body: {}, invalidates: ["/me/favorites"] });
    await apiFetch("/me/favorites", { cacheFor: 60_000 });

    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("ne ressert pas a un compte ce qui a ete lu sous une autre identite", async () => {
    const fetchMock = vi.fn().mockImplementation(async () => jsonResponse(200, { data: [] }));
    vi.stubGlobal("fetch", fetchMock);

    await apiFetch("/trips/search", { cacheFor: 60_000 });
    storeToken("1|secret");
    await apiFetch("/trips/search", { cacheFor: 60_000 });

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("ne declenche rien sur un 401 sans jeton : c'est une visite anonyme", async () => {
    const listener = vi.fn();
    const unsubscribe = onUnauthenticated(listener);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(401, { message: "Non authentifie", error_code: "unauthenticated" })));

    await apiFetch("/me").catch(() => undefined);

    expect(listener).not.toHaveBeenCalled();
    unsubscribe();
  });
});
