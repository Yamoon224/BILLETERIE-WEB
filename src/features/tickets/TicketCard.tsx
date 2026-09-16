/* eslint-disable @next/next/no-img-element -- QR code SVG servi par l'API, sans optimisation d'image */
import { Badge } from "@/components/ui";
import { formatDayShort, formatMoney, formatTime } from "@/lib/format";
import { TICKET_TONE } from "@/lib/labels";
import { bookingService } from "@/services";
import type { Ticket, Trip } from "@/types/api";

/**
 * Billet electronique.
 *
 * Le QR est grand et entoure d'une marge blanche meme en theme sombre : un
 * code sur fond noir se lit mal sous la camera d'une tablette de controle.
 *
 * `amount` est le montant a afficher en « Total paye » : le total de la
 * reservation pour un seul billet (garantie remboursement incluse), le prix
 * de ce seul siege pour une reservation a plusieurs voyageurs — additionner
 * le total de la famille sur chacun de ses billets induirait en erreur.
 */
export function TicketCard({ ticket, trip, amount }: { ticket: Ticket; trip: Trip; amount: number }) {
  const showStatus = ticket.status !== "issued" || ticket.is_scanned;

  return (
    <article className="overflow-hidden rounded-sm border border-[var(--hairline)] bg-[var(--surface)] shadow-card print:break-inside-avoid print:shadow-none">
      <div className="grad-brand flex items-center justify-between px-4 py-2.5 text-white">
        <span className="text-sm font-bold">
          {trip.itinerary?.origin_city?.name} → {trip.itinerary?.destination_city?.name}
        </span>
        <span className="font-mono text-[11px] font-bold opacity-80">Ref. {ticket.code}</span>
      </div>

      <div className="flex items-center gap-4 p-4 sm:p-5">
        {ticket.status === "issued" ? (
          <img
            src={bookingService.ticketQrUrl(ticket.code)}
            alt={`QR code du billet ${ticket.code}`}
            width={180}
            height={180}
            className="h-24 w-24 shrink-0 rounded-sm border border-[var(--hairline)] bg-white p-1.5"
          />
        ) : (
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-sm border border-[var(--hairline)] bg-white p-1.5 text-center text-[11px] font-semibold text-stone-500">
            {ticket.status_label}
          </div>
        )}

        <dl className="min-w-0 space-y-1.5 text-sm">
          <div>
            <dt className="inline text-[var(--muted)]">Compagnie : </dt>
            <dd className="inline font-bold">{trip.company?.name}</dd>
          </div>
          <div>
            <dt className="inline text-[var(--muted)]">Depart : </dt>
            <dd className="inline font-bold capitalize">
              {formatDayShort(trip.departs_at)}, {formatTime(trip.departs_at)}
            </dd>
          </div>
          <div>
            <dt className="inline text-[var(--muted)]">Place : </dt>
            <dd className="inline font-bold">N° {ticket.seat_number ?? "—"}</dd>
          </div>
          <div>
            <dt className="inline text-[var(--muted)]">Total paye : </dt>
            <dd className="inline font-bold">{formatMoney(amount)}</dd>
          </div>
          {showStatus ? (
            <div className="pt-1">
              <Badge tone={TICKET_TONE[ticket.status]}>{ticket.is_scanned ? "Embarque" : ticket.status_label}</Badge>
            </div>
          ) : null}
        </dl>
      </div>
    </article>
  );
}
