"use client";

import { PageHeader } from "@kaara/shared/components/ui";
import { IconTicket } from "@kaara/shared/components/ui/icons";
import { RequirePermission } from "@kaara/shared/features/auth/RequirePermission";
import { BookingList } from "@kaara/shared/features/bookings/BookingList";

export default function BookingsPage() {
  return (
    <RequirePermission permission="bookings.view">
      <PageHeader icon={<IconTicket className="h-5 w-5" />} title="Reservations" description="Ventes en ligne et au guichet, avec leurs billets et leurs encaissements." />
      <BookingList />
    </RequirePermission>
  );
}
