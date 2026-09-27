"use client";

import { PageHeader } from "@/components/ui";
import { IconBus } from "@/components/ui/icons";
import { RequirePermission } from "@/features/auth/RequirePermission";
import { VehicleList } from "@/features/network/VehicleList";

export default function VehiclesPage() {
  return (
    <RequirePermission permission="network.view">
      <PageHeader icon={<IconBus className="h-5 w-5" />} title="Vehicules" description="Le parc de la compagnie, sa capacite et son plan de salle." />
      <VehicleList />
    </RequirePermission>
  );
}
