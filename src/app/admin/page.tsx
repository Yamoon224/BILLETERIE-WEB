"use client";

import { PageHeader } from "@/components/ui";
import { IconDashboard } from "@/components/ui/icons";
import { AdminOverview } from "@/features/admin/AdminOverview";

export default function AdminOverviewPage() {
  return (
    <>
      <PageHeader icon={<IconDashboard className="h-5 w-5" />} title="Vue d'ensemble" description="Toutes compagnies confondues." />
      <AdminOverview />
    </>
  );
}
