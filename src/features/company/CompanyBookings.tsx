"use client";

import { useCallback } from "react";
import { Badge, Card, ErrorState, LoadingState } from "@/components/ui";
import { useAsyncData } from "@/hooks/useAsyncData";
import { formatTime, todayIso } from "@/lib/format";
import { bookingService } from "@/services";

/** Reservations passees aujourd'hui, tous canaux confondus (en ligne et au guichet). */
export function CompanyBookings() {
  const loader = useCallback(
    () => bookingService.list({ from: todayIso(), to: todayIso(), per_page: 100, sort: "created_at", direction: "desc" }),
    [],
  );
  const { data, isLoading, error, reload } = useAsyncData(loader);

  if (isLoading && !data) return <LoadingState label="Chargement des reservations…" />;
  if (error && !data) return <ErrorState error={error} onRetry={reload} />;
  if (!data) return null;

  return (
    <Card>
      <div className="border-b border-[var(--hairline)] px-4 py-3.5 sm:px-5">
        <p className="text-sm font-bold tracking-tight">Reservations du jour</p>
      </div>
      {data.data.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-[var(--muted)]">Aucune reservation aujourd&apos;hui pour le moment.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-[var(--muted)]">
              <tr>
                <th className="px-4 py-2.5 sm:px-5">Passager</th>
                <th className="px-4 py-2.5">Depart</th>
                <th className="px-4 py-2.5">Places</th>
                <th className="px-4 py-2.5 sm:px-5">Paiement</th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((booking) => (
                <tr key={booking.id} className="border-t border-[var(--hairline)]">
                  <td className="px-4 py-2.5 font-semibold sm:px-5">{booking.customer_name}</td>
                  <td className="px-4 py-2.5">{booking.trip ? formatTime(booking.trip.departs_at) : "-"}</td>
                  <td className="px-4 py-2.5 tabular-nums">{booking.seats_count}</td>
                  <td className="px-4 py-2.5 sm:px-5">
                    {booking.payments?.[0] ? (
                      <Badge tone={booking.payments[0].status === "succeeded" ? "success" : "warning"}>{booking.payments[0].method_label}</Badge>
                    ) : (
                      <Badge tone="neutral">En attente</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
