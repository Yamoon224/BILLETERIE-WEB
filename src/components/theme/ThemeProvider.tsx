"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import { usePreference } from "@/hooks/usePreference";
import { DARK_MEDIA_QUERY, DEFAULT_THEME, THEME_STORAGE_KEY, isTheme } from "./theme-constants";
import type { ResolvedTheme, Theme } from "./theme-constants";

export type { ResolvedTheme, Theme } from "./theme-constants";

/**
 * Trois modes, pas deux.
 *
 * « Systeme » n'est pas un troisieme habillage : c'est l'absence de choix, qui
 * suit le reglage de l'appareil et reagit en direct si l'utilisateur bascule
 * son telephone en mode sombre pendant que l'application est ouverte.
 * « Clair » et « Sombre » sont des choix explicites qui priment sur le systeme
 * et survivent au rechargement.
 */
interface ThemeContextValue {
  theme: Theme;
  /** Ce qui est reellement affiche, une fois « systeme » resolu. */
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function subscribeToSystemTheme(onChange: () => void): () => void {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return () => {};

  const media = window.matchMedia(DARK_MEDIA_QUERY);
  media.addEventListener("change", onChange);

  return () => media.removeEventListener("change", onChange);
}

function getSystemIsDark(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;

  return window.matchMedia(DARK_MEDIA_QUERY).matches;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [storedTheme, storeTheme] = usePreference(THEME_STORAGE_KEY, DEFAULT_THEME);
  const systemIsDark = useSyncExternalStore(subscribeToSystemTheme, getSystemIsDark, () => false);

  const theme = isTheme(storedTheme) ? storedTheme : DEFAULT_THEME;
  const resolvedTheme: ResolvedTheme = theme === "system" ? (systemIsDark ? "dark" : "light") : theme;

  // Seul effet du provider : refleter l'etat React sur le DOM.
  useEffect(() => {
    document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
    document.documentElement.dataset.theme = resolvedTheme;
  }, [resolvedTheme]);

  const setTheme = useCallback((next: Theme) => storeTheme(next), [storeTheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (context === null) {
    throw new Error("useTheme doit etre utilise a l'interieur d'un ThemeProvider.");
  }

  return context;
}
