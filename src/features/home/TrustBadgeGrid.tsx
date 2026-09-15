import type { ReactNode } from "react";

export interface TrustBadge {
  icon: ReactNode;
  title: string;
}

/**
 * Rangee de badges de confiance, en cartes compactes.
 *
 * Distincte de la rangee d'arguments en tete de page (`PROMISES`) : celle-ci
 * ferme la page, juste avant les affiches publicitaires — le dernier rappel
 * avant que le voyageur ne quitte l'accueil.
 */
export function TrustBadgeGrid({ badges }: { badges: TrustBadge[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {badges.map((badge) => (
        <div
          key={badge.title}
          className="flex items-center gap-3 rounded-sm border border-[var(--hairline)] bg-[var(--surface)] p-3.5 shadow-card"
        >
          <span className="grad-brand-soft flex h-9 w-9 shrink-0 items-center justify-center rounded-sm text-brand-600 dark:text-brand-400">
            {badge.icon}
          </span>
          <span className="text-xs font-bold leading-snug sm:text-sm">{badge.title}</span>
        </div>
      ))}
    </div>
  );
}
