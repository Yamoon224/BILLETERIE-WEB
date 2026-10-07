"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "@kaara/shared/components/theme/ThemeToggle";
import { Button } from "@kaara/shared/components/ui";
import { IconLogout, IconMenu, IconWifiOff } from "@kaara/shared/components/ui/icons";
import { useAuth } from "@kaara/shared/features/auth/AuthContext";
import { useOnlineStatus } from "@kaara/shared/hooks/useOnlineStatus";
import { findAdminNavItem } from "./admin-nav-config";

/** En-tete de la console d'administration : ou l'on est, l'etat du reseau, la deconnexion. */
export function AdminTopbar({ onOpenNavigation }: { onOpenNavigation: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const isOnline = useOnlineStatus();
  const [isLeaving, setIsLeaving] = useState(false);

  const current = findAdminNavItem(pathname);

  async function leave() {
    setIsLeaving(true);
    await logout().catch(() => undefined);
    router.replace("/login");
  }

  return (
    <header className="no-print sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-[var(--hairline)] bg-[var(--surface)]/85 px-4 backdrop-blur-md sm:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          onClick={onOpenNavigation}
          aria-label="Ouvrir la navigation"
          className="rounded-sm p-2 text-stone-500 hover:bg-stone-100 md:hidden dark:hover:bg-stone-800"
        >
          <IconMenu className="h-5 w-5" />
        </button>
        <p className="truncate text-sm font-bold">{current?.label ?? "Console interne"}</p>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {!isOnline ? (
          <span className="inline-flex items-center gap-1.5 rounded-sm bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-900 dark:bg-amber-950 dark:text-amber-200">
            <IconWifiOff className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Hors ligne</span>
          </span>
        ) : null}
        <ThemeToggle className="hidden sm:inline-flex" />
        <Button variant="ghost" size="sm" onClick={leave} isLoading={isLeaving} icon={<IconLogout className="h-4 w-4" />}>
          <span className="hidden sm:inline">Deconnexion</span>
        </Button>
      </div>
    </header>
  );
}
