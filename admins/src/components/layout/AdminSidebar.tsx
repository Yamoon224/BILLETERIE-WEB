"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@kaara/shared/components/brand/Logo";
import { IconClose } from "@kaara/shared/components/ui/icons";
import { useAuth } from "@kaara/shared/features/auth/AuthContext";
import { cn } from "@kaara/shared/lib/cn";
import { ROLE_LABEL } from "@kaara/shared/lib/labels";
import { ADMIN_NAV_GROUPS, ADMIN_NAV_ITEMS, COMPANIES_HREF, findAdminNavItem, PARTNERS_HREF, PROFILE_HREF } from "./admin-nav-config";

/**
 * Barre laterale de la Console Admin : navy uni, fidele a la maquette,
 * distincte de la barre claire des espaces compagnie et agent. Aucun repli :
 * la liste defile dans la barre plutot que de se reduire a des icones.
 */
export function AdminSidebar({
  isMobileOpen,
  onCloseMobile,
  pendingCounts,
}: {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  pendingCounts: { companies: number; partners: number };
}) {
  const pathname = usePathname();
  const { user } = useAuth();
  const current = findAdminNavItem(pathname);

  const badgeFor: Record<string, number | undefined> = {
    [COMPANIES_HREF]: pendingCounts.companies || undefined,
    [PARTNERS_HREF]: pendingCounts.partners || undefined,
  };

  return (
    <>
      {isMobileOpen ? (
        <button
          type="button"
          aria-label="Fermer la navigation"
          onClick={onCloseMobile}
          className="fixed inset-0 z-30 bg-stone-950/50 backdrop-blur-sm md:hidden"
        />
      ) : null}

      <nav
        aria-label="Navigation de la console d'administration"
        className={cn(
          "no-print fixed inset-y-0 left-0 z-40 flex h-dvh w-[16.5rem] flex-col bg-[#0e1a3a]",
          "transition-transform duration-200 ease-out md:sticky md:top-0 md:z-10 md:translate-x-0",
          isMobileOpen ? "translate-x-0 shadow-card" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-4">
          <Link href="/" onClick={onCloseMobile} className="rounded-sm">
            <Logo size="sm" tone="brand" onDark />
          </Link>
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Fermer la navigation"
            className="rounded-sm p-2 text-white/60 hover:bg-white/10 md:hidden"
          >
            <IconClose />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2.5">
          {ADMIN_NAV_GROUPS.map((group) => (
            <div key={group} className="mb-2">
              <p className="px-1.5 pb-1 pt-2 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-white/40">{group}</p>
              <ul className="flex flex-col gap-0.5">
                {ADMIN_NAV_ITEMS.filter((item) => item.group === group).map((item) => {
                  const isActive = current?.href === item.href;
                  const Icon = item.icon;
                  const badge = badgeFor[item.href];

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onCloseMobile}
                        aria-current={isActive ? "page" : undefined}
                        className={cn(
                          "flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-semibold transition-colors",
                          isActive ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white",
                        )}
                      >
                        <Icon className="h-[18px] w-[18px] shrink-0" />
                        <span className="truncate">{item.label}</span>
                        {badge ? (
                          <span className="ml-auto rounded-sm bg-fuchsia-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                            {badge}
                          </span>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {user ? (
          <div className="shrink-0 border-t border-white/10 p-3">
            <Link href={PROFILE_HREF} onClick={onCloseMobile} className="block rounded-sm bg-white/[0.06] p-3 transition-colors hover:bg-white/10">
              <p className="truncate text-[12.5px] font-bold text-white">{user.name}</p>
              <p className="truncate text-[10.5px] text-white/50">{ROLE_LABEL[user.roles[0] ?? ""] ?? "Administrateur"}</p>
            </Link>
          </div>
        ) : null}
      </nav>
    </>
  );
}
