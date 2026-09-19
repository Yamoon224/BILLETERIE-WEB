"use client";

import Link from "next/link";
import { APARTMENTS_INFO, RENTAL_AUTO_INFO } from "@/components/layout/menuLinks";
import type { MenuInfoItem } from "@/components/layout/menuLinks";
import { useInfoModal } from "@/features/info-modal/InfoModalProvider";
import { cn } from "@/lib/cn";

export type Pillar = "bus" | "appartements" | "location-auto";

type PillarDef =
  | { key: "bus"; label: string; icon: string; href: string }
  | { key: "appartements" | "location-auto"; label: string; icon: string; info: MenuInfoItem };

const PILLARS: PillarDef[] = [
  { key: "bus", label: "Bus", icon: "🚍", href: "/" },
  { key: "appartements", label: "Appartements", icon: "🏢", info: APARTMENTS_INFO },
  { key: "location-auto", label: "Location auto", icon: "🚘", info: RENTAL_AUTO_INFO },
];

const TAB_CLASS = "relative flex flex-col items-center gap-2 rounded-2xl border px-2 py-3 text-center transition-colors";

/**
 * Les 3 piliers de la plateforme, en tabs.
 *
 * Seul Bus est un lien : changer d'onglet change d'URL (`/`), ce qui rend la
 * vue partageable et rejouable apres un rechargement - meme logique que
 * `TripSearchForm.searchHref`.
 *
 * Appartements et Location auto n'ont pas encore de contenu a montrer (pas de
 * recherche, pas de reservation en ligne) : leur tab ne navigue donc pas, il
 * ouvre juste le meme popup d'information que le tiroir de menu et laisse la
 * page sur le contenu Bus.
 */
export function PillarTabs({ active }: { active: Pillar }) {
  const { openInfo } = useInfoModal();

  return (
    <div role="tablist" aria-label="Choisir un service" className="grid grid-cols-3 gap-2 sm:gap-3">
      {PILLARS.map((pillar) => {
        const isActive = pillar.key === active;

        const content = (
          <>
            {isActive ? (
              <span className="absolute -right-1.5 -top-1.5 rounded-full bg-fuchsia px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                Actif
              </span>
            ) : null}
            <span
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-2xl text-xl transition-colors",
                isActive ? "bg-brand-400 shadow-md" : "bg-[var(--surface-muted)]",
              )}
              aria-hidden="true"
            >
              {pillar.icon}
            </span>
            <span className="text-xs font-bold text-stone-900 dark:text-stone-50">{pillar.label}</span>
          </>
        );

        const tabClassName = cn(
          TAB_CLASS,
          isActive
            ? "border-transparent bg-brand-50 dark:bg-transparent"
            : "border-[var(--hairline)] bg-[var(--surface)] hover:border-brand-300 dark:border-transparent dark:bg-transparent",
        );

        if (pillar.key === "bus") {
          return (
            <Link key={pillar.key} href={pillar.href} role="tab" aria-selected={isActive} className={tabClassName}>
              {content}
            </Link>
          );
        }

        return (
          <button
            key={pillar.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => openInfo(pillar.info.title, pillar.info.text)}
            className={tabClassName}
          >
            {content}
          </button>
        );
      })}
    </div>
  );
}
