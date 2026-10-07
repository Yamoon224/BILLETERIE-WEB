"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@kaara/shared/features/auth/AuthContext";
import { SpaceGuard } from "@kaara/shared/features/auth/SpaceGuard";
import { belongsHere, canSell, homeFor, SPACE_LABEL } from "@/lib/access";

/**
 * Coquille du guichet tablette : aucun chrome partage (pas de sidebar, pas de
 * topbar) - un agent en gare n'a besoin que de la vente, rien d'autre ne doit
 * lui disputer l'ecran ni le pouce.
 */
export default function TabletLayout({ children }: { children: React.ReactNode }) {
  return (
    <SpaceGuard allow={belongsHere} spaceLabel={SPACE_LABEL}>
      <SellersOnly>{children}</SellersOnly>
    </SpaceGuard>
  );
}

/** Un compte qui ne fait que controler les billets n'a rien a vendre : il rejoint l'embarquement. */
function SellersOnly({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const allowed = Boolean(user && canSell(user));

  useEffect(() => {
    if (user && !allowed) router.replace(homeFor(user));
  }, [user, allowed, router]);

  return allowed ? <>{children}</> : null;
}
