"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import type { FormEvent } from "react";
import { Badge, Button, Card, CardBody, CardHeader, EmptyState, LoadingState, TextField } from "@/components/ui";
import { IconArrowRight, IconSearch, IconTicket } from "@/components/ui/icons";
import { useAuth } from "@/features/auth/AuthContext";
import { useAsyncData } from "@/hooks/useAsyncData";
import { formatDayShort, formatMoney, formatTime } from "@/lib/format";
import { BOOKING_TONE } from "@/lib/labels";
import { bookingService } from "@/services";

/**
 * Retrouver un billet : par reference pour tout le monde, et par liste pour un
 * voyageur connecte. La reference suffit — un achat sans compte doit rester
 * consultable, c'est le cas le plus frequent.
 */
export function TicketLookup() {
  const router = useRouter();
  const { user, isInitialising } = useAuth();
  const [reference, setReference] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    const value = reference.trim().toUpperCase().replace(/\s+/g, "");
    if (value) router.push(`/billets/${encodeURIComponent(value)}`);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6 sm:py-12">
      <div className="text-center">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Mes billets</h1>
        <span aria-hidden="true" className="grad-brand mx-auto mt-3 block h-[3px] w-16 rounded-full" />
      </div>

      <Card>
        <CardHeader
          icon={<IconSearch className="h-4 w-4" />}
          title="Retrouver une reservation"
          description="Saisissez la reference recue par SMS au moment de l'achat."
        />
        <CardBody>
          <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <TextField
              label="Reference"
              placeholder="RES-K7M3XZ"
              value={reference}
              onChange={(event) => setReference(event.target.value)}
              autoCapitalize="characters"
              fieldClassName="flex-1"
              required
            />
            <Button type="submit" size="lg" className="sm:mt-1.5" icon={<IconArrowRight className="h-4 w-4" />}>
              Afficher
            </Button>
          </form>
        </CardBody>
      </Card>

      {isInitialising ? null : user ? (
        <MyBookings />
      ) : (
        <p className="text-center text-sm text-[var(--muted)]">
          <Link href="/connexion?next=/mes-billets" className="font-semibold text-brand-600">
            Connectez-vous
          </Link>{" "}
          pour retrouver toutes vos reservations sans saisir de reference.
        </p>
      )}
    </div>
  );
}

function MyBookings() {
  const loader = useCallback(() => bookingService.mine({ per_page: 20 }), []);
  const { data, isLoading } = useAsyncData(loader);

  return (
    <Card>
      <CardHeader icon={<IconTicket className="h-4 w-4" />} title="Mes reservations" />
      {isLoading ? <LoadingState /> : null}
      {data && data.data.length === 0 ? (
        <EmptyState title="Aucune reservation pour le moment" description="Vos prochains voyages apparaitront ici." />
      ) : null}
      {data && data.data.length > 0 ? (
        <ul className="divide-y divide-[var(--hairline)]">
          {data.data.map((booking) => (
            <li key={booking.id}>
              <Link
                href={`/billets/${booking.reference}`}
                className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-brand-50/60 sm:px-5 dark:hover:bg-stone-800/50"
              >
                <div className="min-w-0">
                  <p className="font-semibold">
                    {booking.trip?.itinerary?.origin_city?.name} → {booking.trip?.itinerary?.destination_city?.name}
                  </p>
                  <p className="text-xs capitalize text-[var(--muted)]">
                    {formatDayShort(booking.trip?.departs_at)} · {formatTime(booking.trip?.departs_at)} · {booking.reference}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="text-sm font-bold tabular-nums">{formatMoney(booking.total_amount)}</span>
                  <Badge tone={BOOKING_TONE[booking.status]}>{booking.status_label}</Badge>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </Card>
  );
}
