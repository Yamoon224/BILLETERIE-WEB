"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { COMPANY_NAV_ITEMS } from "@/components/layout/company-nav-config";
import { Button, LoadingState } from "@/components/ui";
import { IconLogout } from "@/components/ui/icons";
import { homeFor, useAuth } from "@/features/auth/AuthContext";
import { cn } from "@/lib/cn";

/**
 * Coquille de l'Espace Compagnies : bandeau navy surmonte d'onglets clairs,
 * distincts de la sidebar du back-office general (dashboard/layout.tsx) -
 * reservee au role `company_manager`, c'est l'ecran d'ouverture de journee
 * d'un gestionnaire, pas une console d'exploitation complete.
 */
export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  const { user, isInitialising, hasRole, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isLeaving, setIsLeaving] = useState(false);

  const isCompanyManager = Boolean(user && hasRole("company_manager"));

  useEffect(() => {
    if (isInitialising) return;
    if (user === null) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    else if (!isCompanyManager) router.replace(homeFor(user));
  }, [isInitialising, user, isCompanyManager, router, pathname]);

  async function leave() {
    setIsLeaving(true);
    await logout().catch(() => undefined);
    router.replace("/login");
  }

  if (isInitialising) return <LoadingState label="Verification de la session…" className="min-h-dvh" />;
  if (!user || !isCompanyManager) return null;

  return (
    <div className="min-h-dvh bg-[var(--canvas)]">
      <header>
        <div className="bg-[#0e1a3a]">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
            <Link href="/company" className="rounded-sm">
              <Logo size="sm" tone="brand" onDark />
            </Link>
            <div className="flex items-center gap-3">
              <span className="hidden text-xs font-semibold text-white/60 sm:inline">{user.company?.name}</span>
              <Link href="/dashboard" className="text-xs font-semibold text-white/70 hover:text-white">
                Gestion avancee
              </Link>
              <Button variant="ghost" size="sm" onClick={leave} isLoading={isLeaving} icon={<IconLogout className="h-4 w-4 text-white/70" />} className="text-white/70 hover:bg-white/10 hover:text-white">
                <span className="hidden sm:inline">Deconnexion</span>
              </Button>
            </div>
          </div>
        </div>
        <nav aria-label="Espace Compagnies" className="border-b border-[var(--hairline)] bg-[var(--surface)]">
        <div className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4 sm:px-6">
          {COMPANY_NAV_ITEMS.map((item) => {
            const isActive = item.href === "/company" ? pathname === "/company" : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "whitespace-nowrap border-b-[3px] bg-transparent px-3 py-3 text-sm font-bold transition-colors",
                  isActive ? "border-brand-500 text-[var(--foreground)]" : "border-transparent text-[var(--muted)] hover:text-[var(--foreground)]",
                )}
              >
                {item.label}
              </Link>
            );
          })}
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
