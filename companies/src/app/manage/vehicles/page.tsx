"use client";

import { PageHeader } from "@kaara/shared/components/ui";
import { IconBus } from "@kaara/shared/components/ui/icons";
import { RequirePermission } from "@kaara/shared/features/auth/RequirePermission";
import { VehicleList } from "@kaara/shared/features/network/VehicleList";

export default function VehiclesPage() {
  return (
    <RequirePermission permission="network.view">
      <PageHeader icon={<IconBus className="h-5 w-5" />} title="Vehicules" description="Le parc de la compagnie, sa capacite et son plan de salle." />
      <VehicleList />
    </RequirePermission>
  );
}
