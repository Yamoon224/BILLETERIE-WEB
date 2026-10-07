"use client";

import Link from "next/link";
import { useState } from "react";
import type { FormEvent } from "react";
import { Button, FormAlert } from "@kaara/shared/components/ui";
import { AuthInput, LoginCard, LoginShell, SuccessPanel, useLoginSubmit } from "@kaara/shared/features/auth/LoginScreen";
import { cn } from "@kaara/shared/lib/cn";
import type { AuthenticatedUser } from "@kaara/shared/types/api";

/**
 * Le site voyageur n'ouvre de session qu'aux comptes voyageurs. Compagnies,
 * agents, partenaires et administrateurs ont chacun leur espace, sur son
 * propre sous-domaine : une session ouverte ici ne les y connecterait pas.
 */
const isPassenger = (user: AuthenticatedUser) => user.roles.includes("passenger");

/** Connexion voyageur : numero de telephone ou e-mail, au choix. */
export function PassengerLogin({ next }: { next?: string }) {
  const [mode, setMode] = useState<"phone" | "email">("phone");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const { submit, isPending, succeeded, message } = useLoginSubmit({
    next,
    home: "/my-tickets",
    allow: isPassenger,
    deniedMessage:
      "Ce compte est un compte professionnel. Connectez-vous depuis votre espace : compagnie, agent, partenaire ou administration.",
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    submit(identifier.trim(), password);
  }

  return (
    <LoginShell intro="Connexion voyageur : numero de telephone ou e-mail, au choix.">
      <LoginCard title="Se connecter" description="Accedez a vos reservations et billets Kaara">
        {succeeded ? (
          <SuccessPanel destinationLabel="vos billets" />
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col">
            <div className="mb-4 flex w-full rounded-xl bg-[var(--surface-muted)] p-1">
              {(["phone", "email"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setMode(option)}
                  className={cn(
                    "flex-1 rounded-lg py-2 text-xs font-bold transition-colors",
                    mode === option ? "bg-[var(--surface)] text-[var(--foreground)] shadow-sm" : "text-[var(--muted)]",
                  )}
                >
                  {option === "phone" ? "Telephone" : "Email"}
                </button>
              ))}
            </div>

            <AuthInput
              label={mode === "phone" ? "Numero de telephone" : "Adresse e-mail"}
              type={mode === "phone" ? "tel" : "email"}
              inputMode={mode === "phone" ? "tel" : "email"}
              placeholder={mode === "phone" ? "07 XX XX XX XX" : "vous@exemple.ci"}
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              autoComplete={mode === "phone" ? "tel" : "email"}
              required
            />
            <AuthInput
              label="Mot de passe"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />

            <span className="mb-4 -mt-2 text-right text-xs font-semibold text-brand-600">Mot de passe oublie ?</span>

            {message ? <FormAlert className="mb-3">{message}</FormAlert> : null}

            <Button type="submit" size="lg" className="w-full" isLoading={isPending}>
              Se connecter
            </Button>

            <div className="my-4 flex w-full items-center gap-2.5 text-[11px] text-stone-400">
              <span className="h-px flex-1 bg-[var(--hairline)]" />
              ou
              <span className="h-px flex-1 bg-[var(--hairline)]" />
            </div>

            <Link
              href="/register"
              className="w-full rounded-xl border border-[var(--hairline)] bg-[var(--surface)] py-3 text-center text-sm font-bold text-[var(--foreground)] transition-colors hover:border-brand-300"
            >
              Creer un compte
            </Link>
          </form>
        )}
      </LoginCard>
    </LoginShell>
  );
}
