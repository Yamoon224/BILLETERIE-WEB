"use client";

import { useState } from "react";
import { SpaceGuard } from "@kaara/shared/features/auth/SpaceGuard";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminTopbar } from "@/components/layout/AdminTopbar";
import { AdminPendingCountsProvider, useAdminPendingCounts } from "@/features/admin/useAdminPendingCounts";
import { belongsHere, SPACE_LABEL } from "@/lib/access";

/**
 * Coquille de la Console Admin, reservee au role `platform_admin`.
 *
 * Les compteurs de fiches en attente ne sont charges qu'une fois la session
 * verifiee : le fournisseur vit sous la garde, pas au-dessus, pour ne jamais
 * interroger l'API au nom d'un visiteur qui sera renvoye a la connexion.
 */
export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  return (
    <SpaceGuard allow={belongsHere} spaceLabel={SPACE_LABEL}>
      <AdminPendingCountsProvider>
        <ConsoleShell>{children}</ConsoleShell>
      </AdminPendingCountsProvider>
    </SpaceGuard>
  );
}

function ConsoleShell({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pendingCounts = useAdminPendingCounts();

  return (
    <div className="flex min-h-dvh">
      <AdminSidebar isMobileOpen={isMobileOpen} onCloseMobile={() => setIsMobileOpen(false)} pendingCounts={pendingCounts} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar onOpenNavigation={() => setIsMobileOpen(true)} />
        <main className="animate-fade-rise mx-auto w-full max-w-[96rem] flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
