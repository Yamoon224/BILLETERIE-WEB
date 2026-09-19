"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconCalendar, IconHeart, IconSearch, IconUser } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

const TABS = [
  { href: "/", label: "Recherche", icon: IconSearch },
  { href: "/mes-billets", label: "Reservations", icon: IconCalendar },
  { href: "/favoris", label: "Favoris", icon: IconHeart },
  { href: "/profil", label: "Profil", icon: IconUser },
];

/**
 * Navigation basse, mobile uniquement.
 *
 * Masquee pendant le tunnel de reservation : cet ecran porte deja sa propre
 * barre collee en bas (le recapitulatif de prix et le bouton « Reserver »),
 * et les deux superposees se disputeraient le pouce au pire moment.
 */
export function BottomNav() {
  const pathname = usePathname();

  if (pathname.startsWith("/reservation")) return null;

  return (
    <nav
      aria-label="Navigation principale"
      className="no-print fixed inset-x-0 bottom-0 z-30 flex border-t border-[var(--hairline)] bg-[var(--surface)] md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {TABS.map((tab) => {
        const isActive =
          tab.href === "/" ? pathname === "/" || pathname.startsWith("/recherche") : pathname.startsWith(tab.href);
        const Icon = tab.icon;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-semibold transition-colors",
              isActive ? "text-brand-600 dark:text-brand-400" : "text-stone-400 dark:text-stone-500",
            )}
          >
            <Icon className="h-5 w-5" />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
