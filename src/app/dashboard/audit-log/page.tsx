"use client";

import { PageHeader } from "@/components/ui";
import { IconHistory } from "@/components/ui/icons";
import { RequirePermission } from "@/features/auth/RequirePermission";
import { AuditList } from "@/features/audit/AuditList";

export default function AuditPage() {
  return (
    <RequirePermission permission="audit.view">
      <PageHeader icon={<IconHistory className="h-5 w-5" />} title="Journal d'audit" description="Toutes les modifications, avec leur auteur. Lecture seule." />
      <AuditList />
    </RequirePermission>
  );
}
