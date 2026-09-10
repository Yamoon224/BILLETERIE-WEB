"use client";

import { useCallback, useState } from "react";
import { Badge, Button, Card, CardBody, ErrorState, FormAlert, LinkButton, LoadingState } from "@/components/ui";
import { IconCheckCircle, IconPrinter, IconRefresh, IconSearch } from "@/components/ui/icons";
import { useAsyncData } from "@/hooks/useAsyncData";
import { ApiError } from "@/lib/api-client";
import { formatDateTime, formatMoney } from "@/lib/format";
import { BOOKING_TONE } from "@/lib/labels";
import { bookingService } from "@/services";
import type { Booking } from "@/types/api";
import { PaymentPanel } from "./PaymentPanel";
import { TicketCard } from "./TicketCard";

/**
 * Page d'une reservation, retrouvee par sa reference.
 *
 * Elle joue trois roles selon l'etat : ecran de paiement tant que la
 * reservation attend, billet electronique une fois payee, et explication
 * claire si elle a expire ou ete annulee. C'est aussi la page vers laquelle
 * pointe le lien du SMS.
 */
export function BookingView({ reference }: { reference: string }) {
  const loader = useCallback(() => bookingService.findByReference(reference), [reference]);
  const { data, isLoading, error, reload } = useAsyncData(loader);
  const [paid, setPaid] = useState<Booking | null>(null);

  if (isLoading) return <LoadingState label="Recherche de votre reservation…" className="py-24" />;

  if (error) {
    const notFound = error instanceof ApiError && error.status === 404;

    return (
      <div className="mx-auto max-w-xl px-4 py-12">
        <Card>
          {notFound ? (
            <CardBody className="py-10 text-center">
              <p className="text-lg font-bold">Reservation introuvable</p>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Verifiez la reference recue par SMS (elle commence par « RES- »).
              </p>
              <LinkButton href="/mes-billets" variant="secondary" className="mt-5" icon={<IconSearch className="h-4 w-4" />}>
                Saisir une autre reference
              </LinkButton>
            </CardBody>
          ) : (
            <ErrorState error={error} onRetry={reload} />
          )}
        </Card>
      </div>
    );
  }

  const booking = paid ?? data;
  if (!booking) return null;

  const trip = booking.trip!;
  const isPayable = booking.status === "pending" && !booking.is_hold_expired;
  const tickets = booking.tickets ?? [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
      <header className="no-print mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Reservation</p>
          <h1 className="mt-1 font-mono text-2xl font-extrabold tracking-tight">{booking.reference}</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {booking.seats_count} place{booking.seats_count > 1 ? "s" : ""} · {formatMoney(booking.total_amount)} · creee le{" "}
            {formatDateTime(booking.created_at)}
          </p>
        </div>
        <Badge tone={BOOKING_TONE[booking.status]} className="text-sm">
          {booking.is_hold_expired ? "Delai depasse" : booking.status_label}
        </Badge>
      </header>

      {paid ? (
        <FormAlert tone="success" className="no-print mb-6">
          <strong>Paiement confirme.</strong> Votre billet a ete envoye par SMS au {booking.customer_phone}. Vous pouvez aussi le
          presenter depuis cette page.
        </FormAlert>
      ) : null}

      {isPayable ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
          <PaymentPanel booking={booking} onPaid={setPaid} />
          <Card>
            <CardBody className="space-y-3 text-sm">
              <p className="font-bold">Places reservees</p>
              <ul className="space-y-2">
                {tickets.map((ticket) => (
                  <li key={ticket.id} className="flex justify-between gap-2">
                    <span className="truncate">{ticket.passenger_name}</span>
                    <span className="font-extrabold text-brand-700 dark:text-brand-400">{ticket.seat_number}</span>
                  </li>
                ))}
              </ul>
              <Button variant="ghost" size="sm" onClick={reload} icon={<IconRefresh className="h-3.5 w-3.5" />}>
                Actualiser le statut
              </Button>
            </CardBody>
          </Card>
        </div>
      ) : null}

      {booking.status === "pending" && booking.is_hold_expired ? (
        <Card>
          <CardBody className="py-10 text-center">
            <p className="text-lg font-bold">Le delai de paiement est ecoule</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-[var(--muted)]">
              Les places n&apos;ont pas ete payees a temps et ont ete remises en vente. Aucun montant n&apos;a ete debite.
            </p>
            <LinkButton href="/" className="mt-5">
              Refaire une recherche
            </LinkButton>
          </CardBody>
        </Card>
      ) : null}

      {booking.status === "cancelled" || booking.status === "expired" || booking.status === "refunded" ? (
        <FormAlert tone="warning">
          Cette reservation est {booking.status_label.toLowerCase()}
          {booking.cancellation_reason ? ` : ${booking.cancellation_reason}` : "."}
        </FormAlert>
      ) : null}

      {booking.status === "confirmed" ? (
        <section aria-label="Vos billets">
          <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-lg font-extrabold">
              <IconCheckCircle className="h-5 w-5 text-[var(--color-flag-green)]" />
              Vos billets
            </h2>
            <Button variant="secondary" size="sm" onClick={() => window.print()} icon={<IconPrinter className="h-3.5 w-3.5" />}>
              Imprimer
            </Button>
          </div>
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} trip={trip} price={trip.price} />
            ))}
          </div>
          <p className="no-print mt-4 text-center text-xs text-[var(--muted)]">
            Presentez le QR code a l&apos;agent avant de monter. Chaque billet n&apos;est valable qu&apos;une seule fois.
          </p>
        </section>
      ) : null}
    </div>
  );
}
