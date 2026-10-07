"use client";

import { BackOfficeShell } from "@kaara/shared/components/layout/BackOfficeShell";
import { SpaceGuard } from "@kaara/shared/features/auth/SpaceGuard";
import { MANAGE_NAV_ITEMS, MANAGE_PROFILE } from "@/components/layout/company-nav-config";
import { belongsHere, SPACE_LABEL } from "@/lib/access";

/**
 * Gestion avancee d'une compagnie : departs, referentiel, comptes, journal.
 * Le logo ramene a l'accueil de l'espace (les trois onglets du quotidien).
 */
export default function ManageLayout({ children }: { children: React.ReactNode }) {
  return (
    <SpaceGuard allow={belongsHere} spaceLabel={SPACE_LABEL}>
      <BackOfficeShell items={MANAGE_NAV_ITEMS} homeHref="/" profileHref={MANAGE_PROFILE}>
        {children}
      </BackOfficeShell>
    </SpaceGuard>
  );
}
