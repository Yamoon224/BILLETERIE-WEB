import type { ReactNode, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { IconChevronDown } from "./icons";

/**
 * Filtre compact de barre d'outils, au-dessus d'un tableau.
 *
 * Pas de libelle flottant ici : dans une barre de filtres, la premiere option
 * (« Tous les statuts ») dit deja ce que filtre le champ, et un libelle au-dessus
 * volerait de la hauteur a la liste.
 */
export function ToolbarSelect({
  label,
  children,
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string; children: ReactNode }) {
  return (
    <div className={cn("relative", className)}>
      <select
        aria-label={label}
        className="h-10 w-full appearance-none rounded-sm bg-[var(--surface)] pl-3 pr-8 text-sm font-medium ring-1 ring-inset ring-[var(--field-border)] focus:outline-none focus:ring-2 focus:ring-brand-500"
        {...props}
      >
        {children}
      </select>
      <IconChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
    </div>
  );
}
