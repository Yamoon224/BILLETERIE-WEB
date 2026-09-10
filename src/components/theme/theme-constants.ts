/**
 * Constantes du theme, isolees dans un module **sans** directive client.
 *
 * Le script anti-clignotement est rendu par le layout serveur et a besoin de
 * la vraie cle de stockage. Les valeurs exportees par un module « use client »
 * ne sont, cote serveur, que des references : les partager depuis un module
 * neutre garantit une seule definition.
 */
export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "billetterie_theme";

/** Sans choix explicite, l'interface suit le reglage de l'appareil. */
export const DEFAULT_THEME: Theme = "system";

export const DARK_MEDIA_QUERY = "(prefers-color-scheme: dark)";

export function isTheme(value: string): value is Theme {
  return value === "light" || value === "dark" || value === "system";
}
