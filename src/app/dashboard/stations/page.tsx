"use client";

import { PageHeader } from "@/components/ui";
import { IconMapPin } from "@/components/ui/icons";
import { RequirePermission } from "@/features/auth/RequirePermission";
import { StationList } from "@/features/network/StationList";

export default function StationsPage() {
  return (
    <RequirePermission permission="network.view">
      <PageHeader icon={<IconMapPin className="h-5 w-5" />} title="Gares" description="Gares routieres et points d'embarquement, propres ou partages." />
      <StationList />
    </RequirePermission>
  );
}
