"use client";

import { PageHeader } from "@kaara/shared/components/ui";
import { IconRoute } from "@kaara/shared/components/ui/icons";
import { RequirePermission } from "@kaara/shared/features/auth/RequirePermission";
import { ItineraryList } from "@kaara/shared/features/network/ItineraryList";

export default function ItinerariesPage() {
  return (
    <RequirePermission permission="network.view">
      <PageHeader icon={<IconRoute className="h-5 w-5" />} title="Itineraires" description="Les liaisons exploitees et leur tarif de reference." />
      <ItineraryList />
    </RequirePermission>
  );
}
