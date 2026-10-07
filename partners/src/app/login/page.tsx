"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { LoginShell, PasswordLoginCard } from "@kaara/shared/features/auth/LoginScreen";
import { belongsHere } from "@/lib/access";

function PartnerLogin() {
  const next = useSearchParams().get("next") ?? undefined;

  return (
    <LoginShell intro="Connexion partenaire - residences meublees et location de vehicules.">
      <PasswordLoginCard
        title="Espace Partenaires"
        description="Gerez vos annonces et vos reservations"
        identifierLabel="Email professionnel"
        identifierType="email"
        identifierPlaceholder="contact@residences-assinie.ci"
        destinationLabel="l'Espace Partenaires"
        footer={<p className="mt-4 text-center text-xs text-[var(--muted)]">Pas encore partenaire ? Devenir partenaire</p>}
        target={{
          next,
          allow: belongsHere,
          deniedMessage: "Ce compte n'est pas un compte partenaire : il n'a pas acces a l'Espace Partenaires.",
        }}
      />
    </LoginShell>
  );
}

export default function LoginPage() {
  // `useSearchParams` impose une frontiere Suspense pour que la page reste prerendue.
  return (
    <Suspense>
      <PartnerLogin />
    </Suspense>
  );
}
