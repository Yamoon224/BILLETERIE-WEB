"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Logo } from "@kaara/shared/components/brand/Logo";
import { Button } from "@kaara/shared/components/ui";
import { IconLogout } from "@kaara/shared/components/ui/icons";
import { useAuth } from "@kaara/shared/features/auth/AuthContext";
import { SpaceGuard } from "@kaara/shared/features/auth/SpaceGuard";
import { cn } from "@kaara/shared/lib/cn";
import { belongsHere, SPACE_LABEL } from "@/lib/access";

const TABS = [
  { href: "/", label: "Mes annonces" },
  { href: "/profile", label: "Mon profil" },
];

/**
 * Coquille de l'Espace Partenaires : meme bandeau navy a onglets que l'Espace
 * Compagnies - deux ecrans, pas de barre laterale.
 */
export default function PartnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <SpaceGuard allow={belongsHere} spaceLabel={SPACE_LABEL}>
      <PartnerShell>{children}</PartnerShell>
    </SpaceGuard>
  );
}

function PartnerShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isLeaving, setIsLeaving] = useState(false);

  async function leave() {
    setIsLeaving(true);
    await logout().catch(() => undefined);
    router.replace("/login");
  }

  return (
    <div className="min-h-dvh bg-[var(--canvas)]">
      <header>
        <div className="bg-[#0e1a3a]">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
            <Link href="/" className="rounded-sm">
              <Logo size="sm" tone="brand" onDark />
            </Link>
            <div className="flex items-center gap-3">
              <span className="hidden text-xs font-semibold text-white/60 sm:inline">{user?.name}</span>
              <Button variant="ghost" size="sm" onClick={leave} isLoading={isLeaving} icon={<IconLogout className="h-4 w-4 text-white/70" />} className="text-white/70 hover:bg-white/10 hover:text-white">
                <span className="hidden sm:inline">Deconnexion</span>
              </Button>
            </div>
          </div>
        </div>
        <nav aria-label="Espace Partenaires" className="border-b border-[var(--hairline)] bg-[var(--surface)]">
          <div className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4 sm:px-6">
            {TABS.map((tab) => {
              const isActive = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);

              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={cn(
                    "whitespace-nowrap border-b-[3px] bg-transparent px-3 py-3 text-sm font-bold transition-colors",
                    isActive ? "border-brand-500 text-[var(--foreground)]" : "border-transparent text-[var(--muted)] hover:text-[var(--foreground)]",
                  )}
                >
                  {tab.label}
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
