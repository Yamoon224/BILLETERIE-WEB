"use client";

import type { ReactNode } from "react";
import { Card, EmptyState, LinkButton } from "@/components/ui";
import { IconLock } from "@/components/ui/icons";
import { homeFor, useAuth } from "./AuthContext";

/**
 * Garde d'ecran par permission.
 *
 * Elle ne protege rien : l'API refuse de toute facon. Elle evite a un agent
 * qui suit un lien partage d'atterrir sur un ecran vide rempli d'erreurs 403,
 * et lui dit ou aller a la place.
 */
export function RequirePermission({ permission, children }: { permission: string; children: ReactNode }) {
  const { user, can } = useAuth();

  if (!user) return null;

  if (!can(permission)) {
    return (
      <Card>
        <EmptyState
          icon={<IconLock className="h-5 w-5" />}
          title="Acces reserve"
          description="Votre role ne donne pas acces a cet ecran. Contactez votre gestionnaire si vous pensez que c'est une erreur."
          action={<LinkButton href={homeFor(user)} variant="secondary">Retour a mon espace</LinkButton>}
        />
      </Card>
    );
  }

  return <>{children}</>;
}
