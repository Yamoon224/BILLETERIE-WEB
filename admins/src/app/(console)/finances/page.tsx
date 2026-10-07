"use client";

import { PageHeader } from "@kaara/shared/components/ui";
import { IconWallet } from "@kaara/shared/components/ui/icons";
import { FinanceDashboard } from "@/features/admin/FinanceDashboard";

export default function AdminFinancesPage() {
  return (
    <>
      <PageHeader icon={<IconWallet className="h-5 w-5" />} title="Finances" description="Commissions Kaara et repartition des revenus." />
      <FinanceDashboard />
    </>
  );
}
