"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo, LogoMark } from "@/components/brand/Logo";
import { Avatar } from "@/components/ui";
import { IconClose } from "@/components/ui/icons";
import { useAuth } from "@/features/auth/AuthContext";
import { cn } from "@/lib/cn";
import { ROLE_LABEL } from "@/lib/labels";
import { findNavItem, NAV_ITEMS } from "./nav-config";

/**
 * Barre laterale de l'espace connecte, reductible.
 *
 * Reduite, elle ne garde que les icones : sur un tableau de reservations, les
 * douze rem rendus a la zone de travail changent la lisibilite. Le libelle
 * reste accessible au survol et aux lecteurs d'ecran. Sous `md`, elle devient
 * un tiroir.
 */
export function Sidebar({
  isCollapsed,
  isMobileOpen,
  onCloseMobile,
}: {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  const pathname = usePathname();
  const { user, can } = useAuth();

  const visible = NAV_ITEMS.filter((item) => can(item.permission));
  const current = findNavItem(pathname);
  const groups = [...new Set(visible.map((item) => item.group))];

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
        aria-label="Navigation de l'espace"
        className={cn(
          "no-print fixed inset-y-0 left-0 z-40 flex h-dvh flex-col border-r border-[var(--hairline)] bg-[var(--surface)]",
          "transition-[width,transform] duration-200 ease-out md:sticky md:top-0 md:z-10 md:translate-x-0",
          isCollapsed ? "w-[4.5rem]" : "w-[16.5rem]",
          isMobileOpen ? "translate-x-0 shadow-card" : "-translate-x-full",
        )}
      >
        <div
          className={cn(
            "flex h-16 shrink-0 items-center border-b border-[var(--hairline)] px-3",
            isCollapsed ? "justify-center" : "justify-between",
          )}
        >
          <Link href="/" onClick={onCloseMobile} className="rounded-sm" aria-label="Retour au site">
            {isCollapsed ? <LogoMark size="sm" /> : <Logo size="sm" />}
          </Link>
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Fermer la navigation"
            className="rounded-sm p-2 text-stone-400 hover:bg-stone-100 md:hidden dark:hover:bg-stone-800"
          >
            <IconClose />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2.5">
          {groups.map((group) => (
            <div key={group} className="mb-3">
              <p
                className={cn(
                  "px-3 pb-1.5 pt-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]",
                  isCollapsed && "sr-only",
                )}
              >
                {group}
              </p>
              <ul className="flex flex-col gap-0.5">
                {visible
                  .filter((item) => item.group === group)
                  .map((item) => {
                    const isActive = current?.href === item.href;
                    const Icon = item.icon;

                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={onCloseMobile}
                          aria-current={isActive ? "page" : undefined}
                          title={isCollapsed ? item.label : undefined}
                          className={cn(
                            "group relative flex items-center rounded-sm text-sm transition-colors",
                            isCollapsed ? "justify-center py-2.5" : "gap-3 px-3 py-2.5",
                            isActive
                              ? "grad-brand-soft font-bold text-brand-700 dark:text-brand-300"
                              : "font-medium text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800/70 dark:hover:text-stone-100",
                          )}
                        >
                          {isActive ? (
                            <span aria-hidden="true" className="grad-brand absolute inset-y-1 left-0 w-[3px] rounded-full" />
                          ) : null}
                          <Icon
                            className={cn(
                              "h-[18px] w-[18px] shrink-0 transition-transform",
                              isActive ? "text-brand-600 dark:text-brand-400" : "group-hover:scale-110",
                            )}
                          />
                          <span className={cn("truncate", isCollapsed && "sr-only")}>{item.label}</span>
                        </Link>
                      </li>
                    );
                  })}
              </ul>
            </div>
          ))}
        </div>

        {user ? (
          <Link
            href="/espace/profil"
            onClick={onCloseMobile}
            title={isCollapsed ? "Mon profil" : undefined}
            className={cn(
              "flex shrink-0 items-center border-t border-[var(--hairline)] p-3 transition-colors hover:bg-stone-50 dark:hover:bg-stone-800/50",
              isCollapsed ? "justify-center" : "gap-3",
            )}
          >
            <Avatar name={user.name} size="sm" />
            <span className={cn("min-w-0", isCollapsed && "sr-only")}>
              <span className="block truncate text-sm font-semibold">{user.name}</span>
              <span className="block truncate text-xs text-[var(--muted)]">
                {user.company?.name ?? ROLE_LABEL[user.roles[0] ?? ""] ?? "Mon profil"}
              </span>
            </span>
          </Link>
        ) : null}
      </nav>
    </>
  );
}
