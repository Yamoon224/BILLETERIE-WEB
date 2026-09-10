"use client";

import { useCallback, useState } from "react";
import { Badge, DataTable } from "@/components/ui";
import type { Column } from "@/components/ui";
import { ToolbarSelect } from "@/components/ui/Toolbar";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { usePaginatedData } from "@/hooks/usePaginatedData";
import { formatDateTime } from "@/lib/format";
import { userService } from "@/services";
import type { AuditLog } from "@/types/api";

const EVENT_TONE: Record<string, "success" | "info" | "danger" | "neutral"> = {
  created: "success",
  updated: "info",
  deleted: "danger",
};

/** Resume lisible d'un changement : champ, ancienne valeur, nouvelle valeur. */
function changes(log: AuditLog): string {
  const after = log.properties.attributes ?? {};
  const before = log.properties.old ?? {};

  return Object.keys(after)
    .slice(0, 4)
    .map((key) => (key in before ? `${key} : ${String(before[key])} → ${String(after[key])}` : `${key} : ${String(after[key])}`))
    .join(" · ");
}

/** Journal d'audit, en lecture seule — aucune action d'ecriture n'existe. */
export function AuditList() {
  const [search, setSearch] = useState("");
  const [event, setEvent] = useState("");
  const debounced = useDebouncedValue(search);

  const fetcher = useCallback(
    (page: number, perPage: number) => userService.auditLogs({ page, per_page: perPage, search: debounced || undefined, event: event || undefined }),
    [debounced, event],
  );
  const list = usePaginatedData(fetcher);

  const columns: Array<Column<AuditLog>> = [
    { key: "date", header: "Date", cell: (log) => <span className="whitespace-nowrap text-sm tabular-nums">{formatDateTime(log.created_at)}</span> },
    { key: "event", header: "Evenement", cell: (log) => <Badge tone={EVENT_TONE[log.event ?? ""] ?? "neutral"}>{log.event_label}</Badge> },
    { key: "subject", header: "Objet", cell: (log) => <span className="font-semibold">{log.subject_label}</span> },
    { key: "causer", header: "Auteur", cell: (log) => log.causer_label },
    { key: "changes", header: "Changements", hideOnMobile: true, cell: (log) => <span className="block max-w-xl truncate font-mono text-xs text-[var(--muted)]">{changes(log) || "—"}</span> },
  ];

  return (
    <DataTable
      columns={columns}
      rows={list.items}
      getRowKey={(log) => log.id}
      isLoading={list.isLoading}
      error={list.error}
      onRetry={list.reload}
      meta={list.meta}
      onPageChange={list.setPage}
      onPerPageChange={list.setPerPage}
      search={{ value: search, onChange: setSearch, placeholder: "Rechercher dans le journal…" }}
      emptyTitle="Journal vide"
      toolbar={
        <ToolbarSelect label="Evenement" value={event} onChange={(e) => setEvent(e.target.value)}>
          <option value="">Tous les evenements</option>
          <option value="created">Creations</option>
          <option value="updated">Modifications</option>
          <option value="deleted">Suppressions</option>
        </ToolbarSelect>
      }
    />
  );
}
