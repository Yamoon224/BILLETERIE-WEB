"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { LoginShell, PasswordLoginCard, PinLoginCard } from "@kaara/shared/features/auth/LoginScreen";
import type { LoginTarget } from "@kaara/shared/features/auth/LoginScreen";
import { belongsHere } from "@/lib/access";

/**
 * Connexion de l'Espace Agents : code PIN par defaut, plus rapide a saisir
 * entre deux clients, et mot de passe pour les comptes sans PIN.
 */
function AgentLogin() {
  const next = useSearchParams().get("next") ?? undefined;
  const [mode, setMode] = useState<"pin" | "password">("pin");

  // Sans destination demandee, l'accueil (`/`) aiguille lui-meme : guichet
  // pour qui vend, embarquement pour qui ne fait que controler.
  const target: LoginTarget = {
    next,
    allow: belongsHere,
    deniedMessage: "Ce compte ne peut ni vendre au guichet ni controler a l'embarquement : il n'a pas acces a l'Espace Agents.",
  };

  const switchMode = (
    <button
      type="button"
      onClick={() => setMode(mode === "pin" ? "password" : "pin")}
      className="mt-4 text-center text-xs font-semibold text-brand-600 hover:underline"
    >
      {mode === "pin" ? "Pas de PIN ? Se connecter par mot de passe" : "Se connecter par code PIN"}
    </button>
  );

  return (
    <LoginShell intro="Connexion guichet - identifiant et code PIN, pour une reconnexion rapide entre deux clients.">
      {mode === "pin" ? (
        <PinLoginCard title="Kaara Agent" description="Connexion guichet" destinationLabel="votre guichet" footer={switchMode} target={target} />
      ) : (
        <PasswordLoginCard
          title="Kaara Agent"
          description="Connexion par mot de passe"
          identifierLabel="Identifiant agent"
          identifierPlaceholder="07 XX XX XX XX ou e-mail"
          destinationLabel="votre guichet"
          footer={switchMode}
          target={target}
        />
      )}
    </LoginShell>
  );
}

export default function LoginPage() {
  // `useSearchParams` impose une frontiere Suspense pour que la page reste prerendue.
  return (
    <Suspense>
      <AgentLogin />
    </Suspense>
  );
}
