"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { LoginShell, PasswordLoginCard } from "@kaara/shared/features/auth/LoginScreen";
import { belongsHere } from "@/lib/access";

function CompanyLogin() {
  const next = useSearchParams().get("next") ?? undefined;

  return (
    <LoginShell intro="Connexion compagnie - gestion des lignes, horaires et reservations.">
      <PasswordLoginCard
        title="Espace Compagnies"
        description="Suivez vos ventes et gerez vos lignes"
        identifierLabel="Identifiant compagnie ou email"
        identifierPlaceholder="STC ou contact@stc-express.ci"
        destinationLabel="l'Espace Compagnies"
        footer={
          <p className="mt-4 text-center text-xs text-[var(--muted)]">Votre compagnie n&apos;est pas encore inscrite ? Nous contacter</p>
        }
        target={{
          next,
          allow: belongsHere,
          deniedMessage: "Ce compte n'est pas un compte de gestionnaire de compagnie : il n'a pas acces a l'Espace Compagnies.",
        }}
      />
    </LoginShell>
  );
}

export default function LoginPage() {
  // `useSearchParams` impose une frontiere Suspense pour que la page reste prerendue.
  return (
    <Suspense>
      <CompanyLogin />
    </Suspense>
  );
}
