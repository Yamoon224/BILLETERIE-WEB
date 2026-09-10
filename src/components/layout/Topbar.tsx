"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Button } from "@/components/ui";
import { IconLogout, IconMenu, IconPanelLeft, IconWifiOff } from "@/components/ui/icons";
import { useAuth } from "@/features/auth/AuthContext";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { findNavItem } from "./nav-config";

/**
 * En-tete de l'espace : ou l'on est, l'etat du reseau, le theme, la
 * deconnexion. L'indicateur hors ligne est ici plutot que sur le seul ecran de
 * guichet : un agent qui passe a l'embarquement doit savoir, avant de scanner,
 * que ses controles seront enregistres localement.
 */
export function Topbar({ onOpenNavigation, onToggleSidebar }: { onOpenNavigation: () => void; onToggleSidebar: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const isOnline = useOnlineStatus();
  const [isLeaving, setIsLeaving] = useState(false);

  const current = findNavItem(pathname);

  async function leave() {
    setIsLeaving(true);
    await logout().catch(() => undefined);
    router.replace("/connexion");
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
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Replier ou deplier la barre laterale"
          className="hidden rounded-sm p-2 text-stone-500 hover:bg-stone-100 md:inline-flex dark:hover:bg-stone-800"
        >
          <IconPanelLeft className="h-5 w-5" />
        </button>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">{current?.label ?? "Mon profil"}</p>
          <p className="hidden truncate text-xs text-[var(--muted)] sm:block">
            {current?.description ?? "Compte et preferences d'affichage"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {!isOnline ? (
          <span className="inline-flex items-center gap-1.5 rounded-sm bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-900 dark:bg-amber-950 dark:text-amber-200">
            <IconWifiOff className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Hors ligne</span>
          </span>
        ) : null}
        <Link href="/" className="hidden text-xs font-semibold text-[var(--muted)] hover:text-brand-600 lg:inline">
          Site voyageur
        </Link>
        <ThemeToggle className="hidden sm:inline-flex" />
        <Button variant="ghost" size="sm" onClick={leave} isLoading={isLeaving} icon={<IconLogout className="h-4 w-4" />}>
          <span className="hidden sm:inline">Deconnexion</span>
        </Button>
      </div>
    </header>
  );
}
