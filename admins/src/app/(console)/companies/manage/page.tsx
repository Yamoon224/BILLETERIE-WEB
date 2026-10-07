"use client";

import { PageHeader } from "@kaara/shared/components/ui";
import { IconBuilding } from "@kaara/shared/components/ui/icons";
import { RequirePermission } from "@kaara/shared/features/auth/RequirePermission";
import { CompanyList } from "@kaara/shared/features/network/CompanyList";

export default function CompaniesPage() {
  return (
    <RequirePermission permission="network.view">
      <PageHeader icon={<IconBuilding className="h-5 w-5" />} title="Compagnies" description="Compagnies partenaires et taux de commission." />
      <CompanyList />
    </RequirePermission>
  );
}
