"use client";

import { useCallback, useState } from "react";
import { Badge, Button, ConfirmDialog, DataTable, LoadingState, Modal, TextareaField } from "@/components/ui";
import type { Column } from "@/components/ui";
import { IconDownload } from "@/components/ui/icons";
import { ToolbarSelect } from "@/components/ui/Toolbar";
import { useAuth } from "@/features/auth/AuthContext";
import { useAsyncData } from "@/hooks/useAsyncData";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useMutation } from "@/hooks/useMutation";
import { usePaginatedData } from "@/hooks/usePaginatedData";
import { useSort } from "@/hooks/useSort";
import { formatDateTime, formatDayShort, formatMoney, formatTime } from "@/lib/format";
import { BOOKING_TONE, PAYMENT_TONE, TICKET_TONE } from "@/lib/labels";
import { bookingService, reportService } from "@/services";
import type { Booking, BookingChannel, BookingStatus } from "@/types/api";

export function BookingList() {
  const { can } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<BookingStatus | "">("");
  const [channel, setChannel] = useState<BookingChannel | "">("");
  const [openedId, setOpenedId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const debounced = useDebouncedValue(search);
  const { sort, setSort, sortParams } = useSort();

  const fetcher = useCallback(
    (page: number, perPage: number) =>
      bookingService.list({ page, per_page: perPage, search: debounced || undefined, status, channel, ...sortParams }),
    [debounced, status, channel, sortParams],
  );
  const list = usePaginatedData(fetcher);

  const columns: Array<Column<Booking>> = [
    {
      key: "reference",
      header: "Reference",
      sortKey: "reference",
      cell: (booking) => (
        <button type="button" onClick={() => setOpenedId(booking.id)} className="font-mono text-sm font-bold text-brand-700 hover:underline dark:text-brand-400">
          {booking.reference}
        </button>
      ),
    },
    {
      key: "customer",
      header: "Client",
      sortKey: "customer",
      cell: (booking) => (
        <div>
          <p className="font-semibold">{booking.customer_name}</p>
          <p className="text-xs text-[var(--muted)]">{booking.customer_phone}</p>
        </div>
      ),
    },
    {
      key: "trip",
      header: "Depart",
      sortKey: "departs_at",
      hideOnMobile: true,
      cell: (booking) => (
        <div className="text-sm">
          <p>
            {booking.trip?.itinerary?.origin_city?.name} → {booking.trip?.itinerary?.destination_city?.name}
          </p>
          <p className="text-xs capitalize text-[var(--muted)]">
            {formatDayShort(booking.trip?.departs_at)} · {formatTime(booking.trip?.departs_at)}
          </p>
        </div>
      ),
    },
    { key: "channel", header: "Canal", sortKey: "channel", hideOnMobile: true, cell: (booking) => <span className="text-sm">{booking.channel_label}</span> },
    {
      key: "amount",
      header: "Montant",
      sortKey: "amount",
      headerClassName: "text-right",
      className: "text-right tabular-nums font-semibold",
      cell: (booking) => formatMoney(booking.total_amount),
    },
    { key: "status", header: "Statut", sortKey: "status", cell: (booking) => <Badge tone={BOOKING_TONE[booking.status]}>{booking.status_label}</Badge> },
  ];

  async function exportCsv() {
    setIsExporting(true);
    try {
      await reportService.exportBookings();
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <>
      <DataTable
        columns={columns}
        rows={list.items}
        getRowKey={(booking) => booking.id}
        isLoading={list.isLoading}
        error={list.error}
        onRetry={list.reload}
        meta={list.meta}
        onPageChange={list.setPage}
        onPerPageChange={list.setPerPage}
        sort={sort}
        onSortChange={setSort}
        search={{ value: search, onChange: setSearch, placeholder: "Reference, nom ou telephone…" }}
        emptyTitle="Aucune reservation"
        toolbar={
          <>
            <ToolbarSelect label="Statut" value={status} onChange={(event) => setStatus(event.target.value as BookingStatus | "")}>
              <option value="">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="confirmed">Confirmees</option>
              <option value="cancelled">Annulees</option>
              <option value="expired">Expirees</option>
            </ToolbarSelect>
            <ToolbarSelect label="Canal" value={channel} onChange={(event) => setChannel(event.target.value as BookingChannel | "")}>
              <option value="">Tous les canaux</option>
              <option value="online">En ligne</option>
              <option value="counter">Guichet</option>
              <option value="offline_counter">Guichet hors ligne</option>
            </ToolbarSelect>
            {can("reports.view") ? (
              <Button variant="secondary" onClick={exportCsv} isLoading={isExporting} icon={<IconDownload className="h-4 w-4" />}>
                Exporter
              </Button>
            ) : null}
          </>
        }
      />

      {openedId ? (
        <BookingDetailDialog
          bookingId={openedId}
          onClose={() => setOpenedId(null)}
          onChanged={() => {
            list.reload();
          }}
        />
      ) : null}
    </>
  );
}

function BookingDetailDialog({ bookingId, onClose, onChanged }: { bookingId: string; onClose: () => void; onChanged: () => void }) {
  const loader = useCallback(() => bookingService.find(bookingId), [bookingId]);
  const { data: booking, isLoading, reload } = useAsyncData(loader);
  const [isCancelling, setIsCancelling] = useState(false);
  const [reason, setReason] = useState("");

  const cancelAction = useCallback((input: { reason: string }) => bookingService.cancel(bookingId, input.reason), [bookingId]);
  const cancellation = useMutation(cancelAction);

  const canCancel = booking && (booking.status === "pending" || booking.status === "confirmed") && !booking.tickets?.some((ticket) => ticket.is_scanned);

  return (
    <>
      <Modal
        isOpen
        onClose={onClose}
        title={booking ? `Reservation ${booking.reference}` : "Reservation"}
        size="lg"
        footer={
          canCancel ? (
            <>
              <Button variant="secondary" onClick={onClose}>
                Fermer
              </Button>
              <Button variant="danger" onClick={() => setIsCancelling(true)}>
                Annuler la reservation
              </Button>
            </>
          ) : undefined
        }
      >
        {isLoading || !booking ? (
          <LoadingState />
        ) : (
          <div className="space-y-5 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={BOOKING_TONE[booking.status]}>{booking.status_label}</Badge>
              <Badge>{booking.channel_label}</Badge>
              {booking.sold_by ? <span className="text-[var(--muted)]">Vendu par {booking.sold_by.name}</span> : null}
            </div>

            <dl className="grid gap-3 sm:grid-cols-3">
              <div>
                <dt className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Client</dt>
                <dd className="font-semibold">{booking.customer_name}</dd>
                <dd className="text-[var(--muted)]">{booking.customer_phone}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Montant</dt>
                <dd className="text-lg font-extrabold">{formatMoney(booking.total_amount)}</dd>
                <dd className="text-[var(--muted)]">
                  Commission {formatMoney(booking.commission_amount)} · net {formatMoney(booking.net_amount)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Vente</dt>
                <dd>{formatDateTime(booking.sold_offline_at ?? booking.created_at)}</dd>
                {booking.synced_at ? <dd className="text-[var(--muted)]">Synchronisee {formatDateTime(booking.synced_at)}</dd> : null}
              </div>
            </dl>

            <section>
              <h3 className="mb-2 font-bold">Billets</h3>
              <ul className="divide-y divide-[var(--hairline)] rounded-sm border border-[var(--hairline)]">
                {booking.tickets?.map((ticket) => (
                  <li key={ticket.id} className="flex items-center justify-between gap-3 px-3 py-2">
                    <span>
                      <span className="font-extrabold text-brand-700 dark:text-brand-400">{ticket.seat_number ?? "—"}</span> · {ticket.passenger_name}
                      <span className="ml-2 font-mono text-xs text-[var(--muted)]">{ticket.code}</span>
                    </span>
                    <Badge tone={TICKET_TONE[ticket.status]}>{ticket.is_scanned ? `Embarque ${formatTime(ticket.scanned_at)}` : ticket.status_label}</Badge>
                  </li>
                ))}
              </ul>
            </section>

            {booking.payments && booking.payments.length > 0 ? (
              <section>
                <h3 className="mb-2 font-bold">Encaissements</h3>
                <ul className="divide-y divide-[var(--hairline)] rounded-sm border border-[var(--hairline)]">
                  {booking.payments.map((payment) => (
                    <li key={payment.id} className="flex items-center justify-between gap-3 px-3 py-2">
                      <span>
                        {payment.method_label}
                        {payment.provider_label ? ` · ${payment.provider_label}` : ""} · {formatMoney(payment.amount)}
                      </span>
                      <Badge tone={PAYMENT_TONE[payment.status]}>{payment.status_label}</Badge>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={isCancelling}
        onClose={() => setIsCancelling(false)}
        onConfirm={async () => {
          if (await cancellation.run({ reason })) {
            setIsCancelling(false);
            reload();
            onChanged();
          }
        }}
        title="Annuler la reservation"
        confirmLabel="Annuler"
        isPending={cancellation.isPending}
        error={cancellation.error}
      >
        <p className="mb-4">Les places sont immediatement remises en vente. Le remboursement eventuel se traite depuis les encaissements.</p>
        <TextareaField label="Motif" placeholder="Desistement du voyageur…" value={reason} onChange={(event) => setReason(event.target.value)} />
      </ConfirmDialog>
    </>
  );
}
