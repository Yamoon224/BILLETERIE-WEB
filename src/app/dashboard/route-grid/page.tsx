"use client";

import { PageHeader } from "@/components/ui";
import { IconRoute } from "@/components/ui/icons";
import { RequirePermission } from "@/features/auth/RequirePermission";
import { RouteGridList } from "@/features/network/RouteGridList";

export default function RouteGridPage() {
  return (
    <RequirePermission permission="platform.manage">
      <PageHeader
        icon={<IconRoute className="h-5 w-5" />}
        title="Grille des trajets"
        description="Informations affichees pour les liaisons pas encore reservables en ligne."
      />
      <RouteGridList />
    </RequirePermission>
  );
}
