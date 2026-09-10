"use client";

import { PageHeader } from "@/components/ui";
import { IconRoute } from "@/components/ui/icons";
import { RequirePermission } from "@/features/auth/RequirePermission";
import { ItineraryList } from "@/features/network/ItineraryList";

export default function ItinerariesPage() {
  return (
    <RequirePermission permission="network.view">
      <PageHeader icon={<IconRoute className="h-5 w-5" />} title="Itineraires" description="Les liaisons exploitees et leur tarif de reference." />
      <ItineraryList />
    </RequirePermission>
  );
}
