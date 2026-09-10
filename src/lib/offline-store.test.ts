import { describe, expect, it } from "vitest";
import {
  enqueueSale,
  newClientReference,
  queuedSales,
  removeQueuedSales,
  ticketCodeFromScan,
  toOfflineSale,
} from "./offline-store";
import type { QueuedSale } from "./offline-store";

function sale(reference: string): QueuedSale {
  return {
    client_reference: reference,
    sold_at: "2026-09-10T08:00:00.000Z",
    trip_id: "trip-1",
    customer_name: "Yao Kouassi",
    customer_phone: "+2250500000001",
    passengers: [{ seat_number: "1A", name: "Yao Kouassi" }],
    payment_method: "cash",
    total_amount: 7000,
    trip_label: "06:00 · Abidjan → Bouake",
  };
}

describe("ticketCodeFromScan", () => {
  it("extrait le code du contenu d'un QR code", () => {
    expect(ticketCodeFromScan("B1|BIL-K7M3XZ|DEP-260910-A7X2QW|1A|1789000000|1|abcdef")).toBe("BIL-K7M3XZ");
  });

  it("normalise un code saisi a la main", () => {
    expect(ticketCodeFromScan("  bil-k7m 3xz ")).toBe("BIL-K7M3XZ");
  });
});

describe("file des ventes hors ligne", () => {
  it("conserve les ventes et ne retire que celles synchronisees", () => {
    enqueueSale(sale("VENTE-A"));
    enqueueSale(sale("VENTE-B"));

    removeQueuedSales(["VENTE-A"]);

    expect(queuedSales().map((item) => item.client_reference)).toEqual(["VENTE-B"]);
  });

  it("n'envoie pas a l'API les champs d'affichage du recu local", () => {
    const payload = toOfflineSale(sale("VENTE-C"));

    expect(payload).not.toHaveProperty("total_amount");
    expect(payload).not.toHaveProperty("trip_label");
    expect(payload.client_reference).toBe("VENTE-C");
  });

  it("attribue une reference unique a chaque geste", () => {
    const references = new Set(Array.from({ length: 200 }, () => newClientReference("VENTE")));

    expect(references.size).toBe(200);
  });
});
