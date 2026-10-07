"use client";

import { BackOfficeShell } from "@kaara/shared/components/layout/BackOfficeShell";
import { navItems } from "@kaara/shared/components/layout/nav-config";
import { SpaceGuard } from "@kaara/shared/features/auth/SpaceGuard";
import { belongsHere, DESK, SPACE_LABEL } from "@/lib/access";

/**
 * Un agent voit ce qui sert a sa journee, pas la console d'une compagnie :
 * quatre entrees, filtrees encore par ses permissions.
 */
const DESK_NAV_ITEMS = navItems({
  counter: DESK.counter,
  boarding: DESK.boarding,
  bookings: DESK.bookings,
  departures: DESK.departures,
});

/** Poste complet de l'agent : la vente et le controle, avec le suivi des reservations et des departs. */
export default function DeskLayout({ children }: { children: React.ReactNode }) {
  return (
    <SpaceGuard allow={belongsHere} spaceLabel={SPACE_LABEL}>
      <BackOfficeShell items={DESK_NAV_ITEMS} homeHref="/" profileHref={DESK.profile}>
        {children}
      </BackOfficeShell>
    </SpaceGuard>
  );
}
