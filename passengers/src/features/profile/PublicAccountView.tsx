"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, LinkButton, LoadingState } from "@kaara/shared/components/ui";
import { IconLogout, IconUser } from "@kaara/shared/components/ui/icons";
import { useAuth } from "@kaara/shared/features/auth/AuthContext";
import { ProfileView } from "@kaara/shared/features/profile/ProfileView";

/**
 * Page compte du site voyageur : identite, mot de passe, theme,
 * deconnexion. Reutilise `ProfileView`, deja generique pour tout compte
 * connecte - l'espace back-office n'en est qu'un des deux points d'entree.
 */
export function PublicAccountView() {
  const { user, isInitialising, logout } = useAuth();
  const router = useRouter();
  const [isLeaving, setIsLeaving] = useState(false);

  async function disconnect() {
    setIsLeaving(true);
    await logout().catch(() => undefined);
    router.replace("/");
  }

  if (isInitialising) return <LoadingState label="Verification de la session…" className="min-h-[50dvh]" />;

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center sm:px-6">
        <IconUser className="mx-auto h-10 w-10 text-brand-500" />
        <h1 className="mt-4 text-xl font-extrabold tracking-tight">Votre compte</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Connectez-vous pour gerer vos informations et vos preferences d&apos;affichage.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <LinkButton href="/login?next=/profile">Se connecter</LinkButton>
          <LinkButton href="/register" variant="secondary">
            Creer un compte
          </LinkButton>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6 sm:py-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Mon compte</h1>
          <span aria-hidden="true" className="grad-brand mt-3 block h-[3px] w-16 rounded-full" />
        </div>
        <Button variant="ghost" onClick={disconnect} isLoading={isLeaving} icon={<IconLogout className="h-4 w-4" />}>
          Deconnexion
        </Button>
      </div>

      <ProfileView />
    </div>
  );
}
