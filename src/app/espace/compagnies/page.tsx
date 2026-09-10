"use client";

import { PageHeader } from "@/components/ui";
import { IconBuilding } from "@/components/ui/icons";
import { RequirePermission } from "@/features/auth/RequirePermission";
import { CompanyList } from "@/features/network/CompanyList";

export default function CompaniesPage() {
  return (
    <RequirePermission permission="network.view">
      <PageHeader icon={<IconBuilding className="h-5 w-5" />} title="Compagnies" description="Compagnies partenaires et taux de commission." />
      <CompanyList />
    </RequirePermission>
  );
}
