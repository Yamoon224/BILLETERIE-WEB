"use client";

import { PageHeader } from "@/components/ui";
import { IconCalendar } from "@/components/ui/icons";
import { RequirePermission } from "@/features/auth/RequirePermission";
import { TripList } from "@/features/trips/TripList";

export default function TripsPage() {
  return (
    <RequirePermission permission="trips.view">
      <PageHeader icon={<IconCalendar className="h-5 w-5" />} title="Departs" description="Programmez les horaires, ouvrez l'embarquement et suivez chaque depart jusqu'a l'arrivee." />
      <TripList />
    </RequirePermission>
  );
}
