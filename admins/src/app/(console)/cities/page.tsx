"use client";

import { PageHeader } from "@kaara/shared/components/ui";
import { IconCity } from "@kaara/shared/components/ui/icons";
import { RequirePermission } from "@kaara/shared/features/auth/RequirePermission";
import { CityList } from "@/features/network/CityList";

export default function CitiesPage() {
  return (
    <RequirePermission permission="platform.manage">
      <PageHeader icon={<IconCity className="h-5 w-5" />} title="Villes" description="Referentiel commun a toutes les compagnies." />
      <CityList />
    </RequirePermission>
  );
}
