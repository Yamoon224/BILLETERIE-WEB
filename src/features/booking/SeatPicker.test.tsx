import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import type { SeatMap } from "@/types/api";
import { SeatPicker } from "./SeatPicker";

const seatMap = {
  capacity: 4,
  taken: 1,
  available: 3,
  rows: [
    {
      row: 1,
      aisle_after: 2,
      seats: [
        { number: "1A", is_taken: false },
        { number: "1B", is_taken: true },
        { number: "1C", is_taken: false },
        { number: "1D", is_taken: false },
      ],
    },
  ],
} as unknown as SeatMap;

function Harness({ max }: { max: number }) {
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <>
      <SeatPicker seatMap={seatMap} selected={selected} max={max} onChange={setSelected} />
      <output data-testid="selection">{selected.join(",")}</output>
    </>
  );
}

describe("SeatPicker", () => {
  it("empeche de choisir une place deja prise", () => {
    render(<Harness max={2} />);

    expect(screen.getByRole("button", { name: /Place 1B, occupee/ })).toBeDisabled();
  });

  it("selectionne et deselectionne une place libre", async () => {
    const user = userEvent.setup();
    render(<Harness max={2} />);

    await user.click(screen.getByRole("button", { name: /Place 1A/ }));
    expect(screen.getByTestId("selection")).toHaveTextContent("1A");
    expect(screen.getByRole("button", { name: /Place 1A, selectionnee/ })).toHaveAttribute("aria-pressed", "true");

    await user.click(screen.getByRole("button", { name: /Place 1A/ }));
    expect(screen.getByTestId("selection")).toHaveTextContent("");
  });

  /** Changer d'avis ne doit pas obliger a deselectionner d'abord. */
  it("remplace la plus ancienne selection une fois le nombre de voyageurs atteint", async () => {
    const user = userEvent.setup();
    render(<Harness max={2} />);

    await user.click(screen.getByRole("button", { name: /Place 1A/ }));
    await user.click(screen.getByRole("button", { name: /Place 1C/ }));
    await user.click(screen.getByRole("button", { name: /Place 1D/ }));

    expect(screen.getByTestId("selection")).toHaveTextContent("1C,1D");
  });
});
