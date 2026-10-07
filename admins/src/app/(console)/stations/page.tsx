"use client";

import { PageHeader } from "@kaara/shared/components/ui";
import { IconMapPin } from "@kaara/shared/components/ui/icons";
import { RequirePermission } from "@kaara/shared/features/auth/RequirePermission";
import { StationList } from "@kaara/shared/features/network/StationList";

export default function StationsPage() {
  return (
    <RequirePermission permission="network.view">
      <PageHeader icon={<IconMapPin className="h-5 w-5" />} title="Gares" description="Gares routieres et points d'embarquement, propres ou partages." />
      <StationList />
    </RequirePermission>
  );
}
