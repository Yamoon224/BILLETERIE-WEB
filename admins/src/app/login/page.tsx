"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { IconShield } from "@kaara/shared/components/ui/icons";
import { LoginShell, PasswordLoginCard } from "@kaara/shared/features/auth/LoginScreen";
import { belongsHere } from "@/lib/access";

/** Connexion admin : logo verrouille, code 2FA verifie cote API pour les comptes qui l'ont active. */
function AdminLogin() {
  const next = useSearchParams().get("next") ?? undefined;

  return (
    <LoginShell intro="Connexion administrateur - acces interne reserve a l'equipe Kaara.">
      <PasswordLoginCard
        locked
        withTwoFactor
        title="Kaara Admin"
        description="Console interne - acces reserve a l'equipe Kaara"
        identifierLabel="Email interne"
        identifierType="email"
        identifierPlaceholder="prenom.nom@kaara.ci"
        destinationLabel="la Console Admin"
        footer={
          <div className="mt-4 flex items-start gap-2 rounded-xl bg-[var(--surface-muted)] px-3 py-2.5 text-[11px] text-[var(--muted)]">
            <IconShield className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            L&apos;acces admin n&apos;est jamais auto-cree : un compte est ouvert manuellement par un administrateur existant.
          </div>
        }
        target={{
          next,
          allow: belongsHere,
          deniedMessage: "Ce compte n'est pas un compte administrateur : il n'a pas acces a la Console Admin.",
        }}
      />
    </LoginShell>
  );
}

export default function LoginPage() {
  // `useSearchParams` impose une frontiere Suspense pour que la page reste prerendue.
  return (
    <Suspense>
      <AdminLogin />
    </Suspense>
  );
}
