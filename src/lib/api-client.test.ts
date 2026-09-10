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

  it("ne declenche rien sur un 401 sans jeton : c'est une visite anonyme", async () => {
    const listener = vi.fn();
    const unsubscribe = onUnauthenticated(listener);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(401, { message: "Non authentifie", error_code: "unauthenticated" })));

    await apiFetch("/me").catch(() => undefined);

    expect(listener).not.toHaveBeenCalled();
    unsubscribe();
  });
});
