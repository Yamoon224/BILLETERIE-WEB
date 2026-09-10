import { describe, expect, it } from "vitest";
import { formatDuration, formatMoney, formatPercent } from "./format";

/** Intl utilise des espaces insecables fines : on les normalise pour comparer. */
const plain = (value: string) => value.replace(/[  ]/g, " ");

describe("formatMoney", () => {
  it("affiche les francs CFA sans decimale", () => {
    expect(plain(formatMoney(7000))).toBe("7 000 F CFA");
    expect(plain(formatMoney(1250500))).toBe("1 250 500 F CFA");
  });

  it("n'invente pas de centimes sur un montant entier", () => {
    expect(formatMoney(175)).not.toContain(",");
  });
});

describe("formatDuration", () => {
  it("exprime les durees en heures et minutes", () => {
    expect(formatDuration(330)).toBe("5 h 30");
    expect(formatDuration(300)).toBe("5 h");
    expect(formatDuration(45)).toBe("45 min");
    expect(formatDuration(null)).toBe("—");
  });
});

describe("formatPercent", () => {
  it("arrondit le taux de remplissage", () => {
    expect(plain(formatPercent(0.05))).toBe("5 %");
  });
});
