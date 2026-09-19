import { describe, expect, it } from "vitest";
import { isPilotLine } from "./pilot-line";

describe("isPilotLine", () => {
  it("reconnait la ligne pilote dans les deux sens", () => {
    expect(isPilotLine("bonoua", "treichville")).toBe(true);
    expect(isPilotLine("treichville", "bonoua")).toBe(true);
  });

  it("refuse toute autre liaison, meme partageant une ville avec la ligne pilote", () => {
    expect(isPilotLine("abidjan", "bouake")).toBe(false);
    expect(isPilotLine("bonoua", "abidjan")).toBe(false);
    expect(isPilotLine("bonoua", "bonoua")).toBe(false);
  });
});
