"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import { Button, FormAlert, PasswordField, TextField } from "@/components/ui";
import { ApiError, errorMessage } from "@/lib/api-client";
import { homeFor, useAuth } from "./AuthContext";

/**
 * Connexion commune a tous les profils : voyageur, agent, gestionnaire,
 * administrateur. L'ecran d'arrivee depend du profil (voir `homeFor`), sauf si
 * une page de destination a ete demandee.
 */
export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const { login, hasExpired } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<unknown>(null);
  const [isPending, setIsPending] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setIsPending(true);
    setError(null);

    try {
      const user = await login(email.trim(), password);
      // Seul un chemin interne est accepte : une redirection vers un domaine
      // tiers transformerait la page de connexion en relais d'hameconnage.
      router.replace(next?.startsWith("/") && !next.startsWith("//") ? next : homeFor(user));
    } catch (caught) {
      setError(caught);
      setIsPending(false);
    }
  }

  const fieldErrors = error instanceof ApiError ? error.fieldErrors : {};

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      {hasExpired ? (
        <FormAlert tone="warning">Votre session a expire. Reconnectez-vous pour continuer.</FormAlert>
      ) : null}

      <TextField
        label="Adresse e-mail"
        type="email"
        placeholder="vous@exemple.ci"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        autoComplete="email"
        errors={fieldErrors.email}
        required
        autoFocus
      />
      <PasswordField
        label="Mot de passe"
        placeholder="Votre mot de passe"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        autoComplete="current-password"
        errors={fieldErrors.password}
        required
      />

      {error && !(error instanceof ApiError && error.status === 422) ? <FormAlert>{errorMessage(error)}</FormAlert> : null}

      <Button type="submit" size="lg" className="w-full" isLoading={isPending}>
        Se connecter
      </Button>

      <p className="text-center text-sm text-[var(--muted)]">
        Pas encore de compte ?{" "}
        <Link href="/inscription" className="font-semibold text-brand-600">
          Creer un compte voyageur
        </Link>
      </p>
    </form>
  );
}
