"use client";

import { PageHeader } from "@/components/ui";
import { IconTicket } from "@/components/ui/icons";
import { RequirePermission } from "@/features/auth/RequirePermission";
import { BookingList } from "@/features/bookings/BookingList";

export default function BookingsPage() {
  return (
    <RequirePermission permission="bookings.view">
      <PageHeader icon={<IconTicket className="h-5 w-5" />} title="Reservations" description="Ventes en ligne et au guichet, avec leurs billets et leurs encaissements." />
      <BookingList />
    </RequirePermission>
  );
}
