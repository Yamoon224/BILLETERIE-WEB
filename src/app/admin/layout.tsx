"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminTopbar } from "@/components/layout/AdminTopbar";
import { LoadingState } from "@/components/ui";
import { homeFor, useAuth } from "@/features/auth/AuthContext";
import { useAdminPendingCounts } from "@/features/admin/useAdminPendingCounts";

/**
 * Coquille de la console d'administration.
 *
 * Reservee au role `platform_admin`, contrairement au reste du back-office
 * (dashboard/layout.tsx) qui accueille tout compte non-voyageur : la
 * supervision globale - compagnies, partenaires, finances de la plateforme -
 * n'a rien a faire dans les mains d'un gestionnaire ou d'un agent, meme en
 * lecture.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isInitialising, hasRole } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pendingCounts = useAdminPendingCounts();

  const isPlatformAdmin = Boolean(user && hasRole("platform_admin"));

  useEffect(() => {
    if (isInitialising) return;
    if (user === null) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    else if (!isPlatformAdmin) router.replace(homeFor(user));
  }, [isInitialising, user, isPlatformAdmin, router, pathname]);

  if (isInitialising) return <LoadingState label="Verification de la session…" className="min-h-dvh" />;
  if (!user || !isPlatformAdmin) return null;

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
