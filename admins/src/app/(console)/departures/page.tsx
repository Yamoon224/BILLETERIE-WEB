"use client";

import { PageHeader } from "@kaara/shared/components/ui";
import { IconCalendar } from "@kaara/shared/components/ui/icons";
import { RequirePermission } from "@kaara/shared/features/auth/RequirePermission";
import { TripList } from "@kaara/shared/features/trips/TripList";

export default function TripsPage() {
  return (
    <RequirePermission permission="trips.view">
      <PageHeader icon={<IconCalendar className="h-5 w-5" />} title="Departs" description="Programmez les horaires, ouvrez l'embarquement et suivez chaque depart jusqu'a l'arrivee." />
      <TripList />
    </RequirePermission>
  );
}
