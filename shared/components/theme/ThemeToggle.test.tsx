import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ThemeProvider } from "./ThemeProvider";
import { THEME_STORAGE_KEY } from "./theme-constants";
import { ThemeToggle } from "./ThemeToggle";

describe("ThemeToggle", () => {
  it("propose les trois modes, systeme par defaut", () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    );

    expect(screen.getAllByRole("radio")).toHaveLength(3);
    expect(screen.getByRole("radio", { name: "Systeme" })).toHaveAttribute("aria-checked", "true");
  });

  it("applique et memorise un choix explicite", async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    );

    await user.click(screen.getByRole("radio", { name: "Sombre" }));

    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
    expect(screen.getByRole("radio", { name: "Sombre" })).toHaveAttribute("aria-checked", "true");

    await user.click(screen.getByRole("radio", { name: "Clair" }));

    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });
});
