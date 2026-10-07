"use client";

import { PageHeader } from "@kaara/shared/components/ui";
import { IconHome } from "@kaara/shared/components/ui/icons";
import { PartnerValidationList } from "@/features/admin/PartnerValidationList";

export default function AdminPartnersPage() {
  return (
    <>
      <PageHeader icon={<IconHome className="h-5 w-5" />} title="Partenaires" description="Residences meublees et location de vehicules - validation des annonces." />
      <PartnerValidationList />
    </>
  );
}
