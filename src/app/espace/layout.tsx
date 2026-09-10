"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { LoadingState } from "@/components/ui";
import { useAuth } from "@/features/auth/AuthContext";
import { usePreference } from "@/hooks/usePreference";

const COLLAPSE_KEY = "billetterie_sidebar_collapsed";

/**
 * Coquille de l'espace connecte.
 *
 * La redirection attend la fin de la verification de session : rediriger
 * pendant l'initialisation renverrait vers la connexion a chaque rechargement,
 * meme avec un jeton valide. Un voyageur connecte n'a rien a faire ici : il est
 * renvoye vers ses billets.
 */
export default function SpaceLayout({ children }: { children: React.ReactNode }) {
  const { user, isInitialising } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = usePreference(COLLAPSE_KEY, "0");
  const isCollapsed = collapsed === "1";

  const toggleCollapse = useCallback(() => setCollapsed(isCollapsed ? "0" : "1"), [isCollapsed, setCollapsed]);

  const isBackOffice = Boolean(user && user.roles.some((role) => role !== "passenger"));

  useEffect(() => {
    if (isInitialising) return;
    if (user === null) router.replace(`/connexion?next=${encodeURIComponent(pathname)}`);
    else if (!isBackOffice) router.replace("/mes-billets");
  }, [isInitialising, user, isBackOffice, router, pathname]);

  if (isInitialising) return <LoadingState label="Verification de la session…" className="min-h-dvh" />;
  if (!user || !isBackOffice) return null;

  return (
    <div className="flex min-h-dvh">
      <Sidebar isCollapsed={isCollapsed} isMobileOpen={isMobileOpen} onCloseMobile={() => setIsMobileOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onOpenNavigation={() => setIsMobileOpen(true)} onToggleSidebar={toggleCollapse} />
        <main className="animate-fade-rise mx-auto w-full max-w-[96rem] flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
