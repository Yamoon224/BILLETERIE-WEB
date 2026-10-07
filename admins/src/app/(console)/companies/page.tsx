"use client";

import { PageHeader } from "@kaara/shared/components/ui";
import { IconBuilding } from "@kaara/shared/components/ui/icons";
import { CompanyValidationList } from "@/features/admin/CompanyValidationList";

export default function AdminCompaniesPage() {
  return (
    <>
      <PageHeader icon={<IconBuilding className="h-5 w-5" />} title="Compagnies" description="Validation et supervision des compagnies partenaires." />
      <CompanyValidationList />
    </>
  );
}
