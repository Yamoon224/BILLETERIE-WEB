/* eslint-disable @next/next/no-img-element -- QR code SVG servi par l'API, sans optimisation d'image */
import { Badge } from "@/components/ui";
import { IconMapPin } from "@/components/ui/icons";
import { formatDayShort, formatMoney, formatTime } from "@/lib/format";
import { TICKET_TONE } from "@/lib/labels";
import { bookingService } from "@/services";
import type { Ticket, Trip } from "@/types/api";

/**
 * Billet electronique.
 *
 * Mis en page comme un billet papier — souche detachable comprise — parce que
 * c'est l'objet que le voyageur s'attend a montrer. Le QR est grand et entoure
 * d'une marge blanche meme en theme sombre : un code sur fond noir se lit mal
 * sous la camera d'une tablette de controle.
 */
export function TicketCard({ ticket, trip, price }: { ticket: Ticket; trip: Trip; price: number }) {
  return (
    <article className="overflow-hidden rounded-sm border border-[var(--hairline)] bg-[var(--surface)] shadow-card print:break-inside-avoid print:shadow-none">
      <div className="grad-brand flex items-center justify-between px-4 py-2.5 text-white">
        <span className="text-xs font-bold uppercase tracking-wider">{trip.company?.name}</span>
        <span className="font-mono text-xs font-bold">{ticket.code}</span>
      </div>

      <div className="grid sm:grid-cols-[1fr_auto]">
        <div className="space-y-4 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-2xl font-extrabold tabular-nums">{formatTime(trip.departs_at)}</p>
              <p className="text-sm font-semibold">{trip.itinerary?.origin_city?.name}</p>
            </div>
            <span aria-hidden="true" className="h-px flex-1 border-t-2 border-dashed border-brand-300" />
            <div className="text-right">
              <p className="text-2xl font-extrabold tabular-nums text-[var(--muted)]">{formatTime(trip.arrives_at)}</p>
              <p className="text-sm font-semibold">{trip.itinerary?.destination_city?.name}</p>
            </div>
          </div>

          <dl className="grid grid-cols-3 gap-3 text-sm">
            <div>
              <dt className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Date</dt>
              <dd className="font-semibold capitalize">{formatDayShort(trip.departs_at)}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Place</dt>
              <dd className="text-lg font-extrabold text-brand-700 dark:text-brand-400">{ticket.seat_number ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Prix</dt>
              <dd className="font-semibold tabular-nums">{formatMoney(price)}</dd>
            </div>
          </dl>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Voyageur</p>
            <p className="font-semibold">{ticket.passenger_name}</p>
          </div>

          <p className="flex items-center gap-1 text-xs text-[var(--muted)]">
            <IconMapPin className="h-3 w-3" /> {trip.departure_station?.name}
          </p>
        </div>

        <div className="relative flex flex-col items-center justify-center gap-2 border-t-2 border-dashed border-[var(--hairline)] bg-white p-4 sm:border-l-2 sm:border-t-0">
          {ticket.status === "issued" ? (
            <img
              src={bookingService.ticketQrUrl(ticket.code)}
              alt={`QR code du billet ${ticket.code}`}
              width={180}
              height={180}
              className="h-44 w-44"
            />
          ) : (
            <div className="flex h-44 w-44 items-center justify-center text-center text-sm font-semibold text-stone-500">
              {ticket.status_label}
            </div>
          )}
          <Badge tone={TICKET_TONE[ticket.status]}>{ticket.is_scanned ? "Embarque" : ticket.status_label}</Badge>
        </div>
      </div>
    </article>
  );
}
