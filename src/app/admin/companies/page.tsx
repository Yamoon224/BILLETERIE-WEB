"use client";

import { PageHeader } from "@/components/ui";
import { IconBuilding } from "@/components/ui/icons";
import { CompanyValidationList } from "@/features/admin/CompanyValidationList";

export default function AdminCompaniesPage() {
  return (
    <>
      <PageHeader icon={<IconBuilding className="h-5 w-5" />} title="Compagnies" description="Validation et supervision des compagnies partenaires." />
      <CompanyValidationList />
    </>
  );
}
