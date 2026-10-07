"use client";

import { PageHeader } from "@kaara/shared/components/ui";
import { IconHistory } from "@kaara/shared/components/ui/icons";
import { RequirePermission } from "@kaara/shared/features/auth/RequirePermission";
import { AuditList } from "@kaara/shared/features/audit/AuditList";

export default function AuditPage() {
  return (
    <RequirePermission permission="audit.view">
      <PageHeader icon={<IconHistory className="h-5 w-5" />} title="Journal d'audit" description="Toutes les modifications, avec leur auteur. Lecture seule." />
      <AuditList />
    </RequirePermission>
  );
}
