"use client";

import { PageHeader } from "@kaara/shared/components/ui";
import { IconScan } from "@kaara/shared/components/ui/icons";
import { RequirePermission } from "@kaara/shared/features/auth/RequirePermission";
import { BoardingControl } from "@/features/boarding/BoardingControl";

export default function BoardingPage() {
  return (
    <RequirePermission permission="tickets.validate">
      <PageHeader
        icon={<IconScan className="h-5 w-5" />}
        title="Embarquement"
        description="Scannez les billets a la porte du car. Un billet deja utilise est refuse, en ligne comme hors ligne."
      />
      <BoardingControl />
    </RequirePermission>
  );
}
