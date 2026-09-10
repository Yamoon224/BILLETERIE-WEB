"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { Paginated } from "@/types/api";
import { Card, CardHeader } from "./Card";
import { EmptyState, ErrorState, LoadingState } from "./feedback";
import { SearchInput } from "./fields";
import { IconSortAscending, IconSortDescending, IconSortNeutral } from "./icons";
import { Pagination } from "./Pagination";

export type SortDirection = "asc" | "desc";

export interface SortState {
  key: string | null;
  direction: SortDirection;
}

export interface Column<T> {
  key: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  className?: string;
  headerClassName?: string;
  /** Cle de tri envoyee a l'API. Absente, la colonne n'est pas triable. */
  sortKey?: string;
  /** Masque la colonne sur petit ecran : les colonnes secondaires cedent la place. */
  hideOnMobile?: boolean;
}

export interface DataTableProps<T> {
  columns: Array<Column<T>>;
  rows: T[];
  getRowKey: (row: T) => string;
  isLoading?: boolean;
  error?: unknown;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: ReactNode;
  meta?: Paginated<T>["meta"] | null;
  onPageChange?: (page: number) => void;
  onPerPageChange?: (perPage: number) => void;
  search?: { value: string; onChange: (value: string) => void; placeholder?: string };
  sort?: SortState;
  onSortChange?: (sort: SortState) => void;
  toolbar?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
}

/**
 * Tableau de donnees generique : rendu, recherche, tri, pagination et etats de
 * chargement / erreur / vide en une seule implementation.
 *
 * Le tri est **delegue a l'API** : trier ici les quinze lignes affichees
 * donnerait un ordre qui change de sens a chaque page.
 *
 * Le tableau defile horizontalement dans son propre conteneur : la page elle-
 * meme ne part jamais en defilement lateral sur un telephone.
 */
export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  isLoading = false,
  error = null,
  onRetry,
  emptyTitle = "Aucun resultat",
  emptyDescription,
  meta,
  onPageChange,
  onPerPageChange,
  search,
  sort,
  onSortChange,
  toolbar,
  title,
  description,
  icon,
  actions,
}: DataTableProps<T>) {
  const showTable = !isLoading && !error && rows.length > 0;

  function toggleSort(key: string) {
    if (!onSortChange) return;
    const direction: SortDirection = sort?.key === key && sort.direction === "asc" ? "desc" : "asc";
    onSortChange({ key, direction });
  }

  return (
    <Card>
      {title ? <CardHeader title={title} description={description} icon={icon} actions={actions} /> : null}

      {search || toolbar ? (
        <div className="flex flex-col gap-3 border-b border-[var(--hairline)] px-4 py-3 md:flex-row md:items-end md:justify-between">
          {search ? (
            <div className="w-full md:max-w-xs">
              <SearchInput
                value={search.value}
                onChange={(event) => search.onChange(event.target.value)}
                placeholder={search.placeholder ?? "Rechercher…"}
              />
            </div>
          ) : (
            <span className="hidden md:block" />
          )}
          {toolbar ? <div className="flex flex-wrap items-end gap-3 md:justify-end">{toolbar}</div> : null}
        </div>
      ) : null}

      {isLoading ? <LoadingState /> : null}
      {!isLoading && error ? <ErrorState error={error} onRetry={onRetry} /> : null}
      {!isLoading && !error && rows.length === 0 ? <EmptyState title={emptyTitle} description={emptyDescription} /> : null}

      {showTable ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="grad-brand text-white">
              <tr>
                {columns.map((column) => {
                  const canSort = Boolean(onSortChange && column.sortKey);
                  const isSorted = canSort && sort?.key === column.sortKey;

                  return (
                    <th
                      key={column.key}
                      scope="col"
                      aria-sort={isSorted ? (sort?.direction === "asc" ? "ascending" : "descending") : undefined}
                      className={cn(
                        "px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider whitespace-nowrap",
                        column.hideOnMobile && "hidden md:table-cell",
                        column.headerClassName,
                      )}
                    >
                      {canSort ? (
                        <button
                          type="button"
                          onClick={() => toggleSort(column.sortKey!)}
                          className="group inline-flex items-center gap-1.5 uppercase focus-visible:outline-2 focus-visible:outline-white"
                        >
                          {column.header}
                          {isSorted ? (
                            sort?.direction === "asc" ? (
                              <IconSortAscending className="h-3.5 w-3.5" />
                            ) : (
                              <IconSortDescending className="h-3.5 w-3.5" />
                            )
                          ) : (
                            <IconSortNeutral className="h-3.5 w-3.5 text-white/50 group-hover:text-white/90" />
                          )}
                        </button>
                      ) : (
                        column.header
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={getRowKey(row)}
                  className="border-b border-[var(--hairline)] transition-colors last:border-0 even:bg-[var(--surface-muted)]/50 hover:bg-brand-50/70 dark:hover:bg-brand-900/15"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn(
                        "px-4 py-3 align-middle text-stone-700 dark:text-stone-300",
                        column.hideOnMobile && "hidden md:table-cell",
                        column.className,
                      )}
                    >
                      {column.cell(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {meta && onPageChange && meta.total > 0 ? (
        <Pagination meta={meta} onPageChange={onPageChange} onPerPageChange={onPerPageChange} />
      ) : null}
    </Card>
  );
}
