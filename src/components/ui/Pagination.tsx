"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";
import { IconChevronDown, IconChevronLeft, IconChevronRight } from "./icons";

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export const PER_PAGE_OPTIONS = [15, 25, 50, 100];

/**
 * Pagination en trois zones, toujours dans le meme ordre : taille de page,
 * deplacement, decompte affiche. Chaque zone repond a une question differente.
 */
export function Pagination({
  meta,
  onPageChange,
  onPerPageChange,
}: {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  onPerPageChange?: (perPage: number) => void;
}) {
  const selectId = useId();

  const from = meta.total === 0 ? 0 : (meta.current_page - 1) * meta.per_page + 1;
  const to = Math.min(meta.current_page * meta.per_page, meta.total);

  const options = PER_PAGE_OPTIONS.includes(meta.per_page)
    ? PER_PAGE_OPTIONS
    : [...PER_PAGE_OPTIONS, meta.per_page].sort((a, b) => a - b);

  const pageButton = cn(
    "inline-flex h-8 items-center gap-1 rounded-sm px-2.5 text-xs font-semibold transition-all",
    "grad-brand text-white shadow-sm hover:grad-brand-hover active:translate-y-px",
    "disabled:cursor-not-allowed disabled:bg-none disabled:bg-stone-200 disabled:text-stone-400 disabled:shadow-none",
    "dark:disabled:bg-stone-800 dark:disabled:text-stone-500",
  );

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-col gap-3 border-t border-[var(--hairline)] px-4 py-3 text-xs sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-center gap-2">
        <label htmlFor={selectId} className="text-[var(--muted)]">
          Lignes
        </label>
        <div className="relative">
          <select
            id={selectId}
            value={meta.per_page}
            disabled={!onPerPageChange}
            onChange={(event) => onPerPageChange?.(Number(event.target.value))}
            className="appearance-none rounded-sm bg-[var(--surface)] py-1.5 pl-2.5 pr-7 text-xs font-semibold tabular-nums ring-1 ring-inset ring-[var(--field-border)] focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <IconChevronDown className="pointer-events-none absolute right-1.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
        </div>
      </div>

      <div className="flex items-center justify-center gap-1.5">
        <button
          type="button"
          className={pageButton}
          disabled={meta.current_page <= 1}
          onClick={() => onPageChange(meta.current_page - 1)}
          aria-label="Page precedente"
        >
          <IconChevronLeft className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Precedent</span>
        </button>
        <span aria-live="polite" className="min-w-16 text-center font-bold tabular-nums">
          {meta.current_page} / {meta.last_page}
        </span>
        <button
          type="button"
          className={pageButton}
          disabled={meta.current_page >= meta.last_page}
          onClick={() => onPageChange(meta.current_page + 1)}
          aria-label="Page suivante"
        >
          <span className="hidden sm:inline">Suivant</span>
          <IconChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <p className="text-center tabular-nums text-[var(--muted)] sm:text-right">
        {from}–{to} sur {meta.total}
      </p>
    </nav>
  );
}
