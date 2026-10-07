"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Button, Card, EmptyState, LoadingState } from "@kaara/shared/components/ui";
import { IconLock } from "@kaara/shared/components/ui/icons";
import type { AuthenticatedUser } from "@kaara/shared/types/api";
import { useAuth } from "./AuthContext";

/**
 * Garde d'un espace connecte.
 *
 * La redirection attend la fin de la verification de session : rediriger
 * pendant l'initialisation renverrait vers la connexion a chaque rechargement,
 * meme avec un jeton valide.
 *
 * Elle ne protege rien : l'API refuse de toute facon. Elle evite a un compte
 * qui n'a pas sa place ici - un voyageur sur l'espace d'une compagnie -
 * d'atterrir sur des ecrans vides remplis d'erreurs 403, et lui dit pourquoi.
 * Chaque espace vivant sur son propre sous-domaine, il n'y a pas d'ecran ou
 * le renvoyer : il se deconnecte et rejoint le sien.
 */
export function SpaceGuard({
  allow,
  spaceLabel,
  children,
}: {
  allow: (user: AuthenticatedUser) => boolean;
  /** Nom de l'espace, tel qu'il se lit apres « acces a » : « l'Espace Compagnies ». */
  spaceLabel: string;
  children: ReactNode;
}) {
  const { user, isInitialising, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (!isInitialising && user === null) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [isInitialising, user, router, pathname]);

  async function leave() {
    setIsLeaving(true);
    await logout().catch(() => undefined);
    router.replace("/login");
  }

  if (isInitialising) return <LoadingState label="Verification de la session…" className="min-h-dvh" />;
  if (!user) return null;

  if (!allow(user)) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-lg items-center px-4">
        <Card className="w-full">
          <EmptyState
            icon={<IconLock className="h-5 w-5" />}
            title="Acces reserve"
            description={`Le compte ${user.email} n'a pas acces a ${spaceLabel}. Deconnectez-vous, puis utilisez l'espace qui correspond a votre profil.`}
            action={
              <Button variant="secondary" onClick={leave} isLoading={isLeaving}>
                Se deconnecter
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
