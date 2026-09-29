"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { LoadingState } from "@/components/ui";
import { homeFor, useAuth } from "@/features/auth/AuthContext";

/**
 * Coquille du guichet tablette : aucun chrome partage (pas de sidebar, pas de
 * topbar) - un agent en gare n'a besoin que de la vente, rien d'autre ne doit
 * lui disputer l'ecran ni le pouce.
 */
export default function CounterLayout({ children }: { children: React.ReactNode }) {
  const { user, isInitialising, can } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const allowed = Boolean(user && can("sales.create"));

  useEffect(() => {
    if (isInitialising) return;
    if (user === null) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    else if (!allowed) router.replace(homeFor(user));
  }, [isInitialising, user, allowed, router, pathname]);

  if (isInitialising) return <LoadingState label="Verification de la session…" className="min-h-dvh" />;
  if (!user || !allowed) return null;

  return <>{children}</>;
}
