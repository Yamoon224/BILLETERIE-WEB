"use client";

import { useCallback, useState } from "react";
import type { ReactNode } from "react";
import { usePreference } from "@kaara/shared/hooks/usePreference";
import type { NavItem } from "./nav-config";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

const COLLAPSE_KEY = "billetterie_sidebar_collapsed";

/**
 * Coquille des ecrans d'exploitation : barre laterale reductible, en-tete,
 * zone de travail. Commune a l'Espace Compagnies et a l'Espace Agents, qui ne
 * different que par leurs entrees de navigation.
 */
export function BackOfficeShell({
  items,
  homeHref,
  profileHref,
  children,
}: {
  items: NavItem[];
  homeHref: string;
  profileHref: string;
  children: ReactNode;
}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = usePreference(COLLAPSE_KEY, "0");
  const isCollapsed = collapsed === "1";

  const toggleCollapse = useCallback(() => setCollapsed(isCollapsed ? "0" : "1"), [isCollapsed, setCollapsed]);

  return (
    <div className="flex min-h-dvh">
      <Sidebar
        items={items}
        homeHref={homeHref}
        profileHref={profileHref}
        isCollapsed={isCollapsed}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar items={items} onOpenNavigation={() => setIsMobileOpen(true)} onToggleSidebar={toggleCollapse} />
        <main className="animate-fade-rise mx-auto w-full max-w-[96rem] flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
