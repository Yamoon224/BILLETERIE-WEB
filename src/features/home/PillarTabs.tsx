import Link from "next/link";
import type { ReactNode } from "react";
import { IconBus, IconCar, IconHome } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

export type Pillar = "bus" | "appartements" | "location-auto";

const PILLARS: Array<{ key: Pillar; label: string; icon: ReactNode; href: string }> = [
  { key: "bus", label: "Bus", icon: <IconBus className="h-5 w-5" />, href: "/" },
  { key: "appartements", label: "Appartements", icon: <IconHome className="h-5 w-5" />, href: "/?onglet=appartements" },
  { key: "location-auto", label: "Location auto", icon: <IconCar className="h-5 w-5" />, href: "/?onglet=location-auto" },
];

/**
 * Les 3 piliers de la plateforme, en tabs.
 *
 * Un lien, pas un etat client : changer d'onglet change d'URL (`/`,
 * `/?onglet=appartements`…), ce qui rend chaque vue partageable et rejouable
 * apres un rechargement — meme logique que `TripSearchForm.searchHref`.
 */
export function PillarTabs({ active }: { active: Pillar }) {
  return (
    <div role="tablist" aria-label="Choisir un service" className="grid grid-cols-3 gap-2 sm:gap-3">
      {PILLARS.map((pillar) => {
        const isActive = pillar.key === active;

        return (
          <Link
            key={pillar.key}
            href={pillar.href}
            role="tab"
            aria-selected={isActive}
            className={cn(
              "relative flex flex-col items-center gap-2 rounded-2xl border px-2 py-3 text-center transition-colors",
              isActive
                ? "border-transparent bg-brand-50 dark:bg-brand-500/10"
                : "border-[var(--hairline)] bg-[var(--surface)] hover:border-brand-300",
            )}
          >
            {isActive ? (
              <span className="absolute -right-1.5 -top-1.5 rounded-full bg-fuchsia px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                Actif
              </span>
            ) : null}
            <span
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-2xl transition-colors",
                isActive ? "bg-brand-400 text-white shadow-md" : "bg-[var(--surface-muted)] text-stone-500 dark:text-stone-400",
              )}
            >
              {pillar.icon}
            </span>
            <span className="text-xs font-bold text-stone-900 dark:text-stone-50">{pillar.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
