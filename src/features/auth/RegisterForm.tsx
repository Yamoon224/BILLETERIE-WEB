"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import { Button, FormAlert } from "@/components/ui";
import { ApiError, errorMessage } from "@/lib/api-client";
import { useAuth } from "./AuthContext";
import { AuthInput, SuccessPanel } from "./LoginScreen";

/**
 * Inscription d'un voyageur. Le role n'est jamais choisi ici : il est impose
 * par l'API, et un compte de back-office se cree depuis l'espace
 * d'administration.
 *
 * Meme carte que la page de connexion (`LoginScreen`) : les deux ecrans se
 * cotoient via leurs liens reciproques, un changement de style de l'un a
 * l'autre se remarquerait immediatement.
 */
export function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();

  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", password_confirmation: "" });
  const [error, setError] = useState<unknown>(null);
  const [isPending, setIsPending] = useState(false);
  const [succeeded, setSucceeded] = useState(false);

  function update(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setIsPending(true);
    setError(null);

    try {
      await register({ ...form, phone: form.phone.trim() || undefined });
      setSucceeded(true);
      // Laisse voir la confirmation avant de quitter l'ecran, comme pour la connexion.
      window.setTimeout(() => router.replace("/my-tickets"), 1100);
    } catch (caught) {
      setError(caught);
      setIsPending(false);
    }
  }

  const fieldErrors = error instanceof ApiError ? error.fieldErrors : {};
  const message =
    Object.values(fieldErrors)[0]?.[0] ??
    (error && !(error instanceof ApiError && error.status === 422) ? errorMessage(error) : null);

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-10 sm:py-14">
      <div className="w-full max-w-md overflow-hidden rounded-[22px] bg-[var(--surface)] shadow-card">
        <div className="flex flex-col items-center px-8 pt-8">
          <span aria-hidden="true" className="grad-brand mb-4 h-[52px] w-[52px] rounded-2xl" />
          <h2 className="text-center font-extrabold tracking-tight text-[var(--foreground)]">Creer un compte</h2>
          <p className="mb-1 mt-1 text-center text-xs text-[var(--muted)]">
            Retrouvez tous vos billets au meme endroit
          </p>
        </div>

        <div className="px-8 pb-8 pt-2">
          {succeeded ? (
            <SuccessPanel title="Compte cree" destinationLabel="vos billets" />
          ) : (
            <form onSubmit={submit} className="flex flex-col">
              <AuthInput
                label="Nom complet"
                placeholder="Awa Kone"
                value={form.name}
                onChange={(event) => update("name", event.target.value)}
                autoComplete="name"
                required
              />
              <AuthInput
                label="Adresse e-mail"
                type="email"
                placeholder="vous@exemple.ci"
                value={form.email}
                onChange={(event) => update("email", event.target.value)}
                autoComplete="email"
                required
              />
              <AuthInput
                label="Telephone"
                type="tel"
                inputMode="tel"
                placeholder="+225 07 00 00 00 00"
                value={form.phone}
                onChange={(event) => update("phone", event.target.value)}
                autoComplete="tel"
              />
              <p className="mb-3.5 -mt-2 text-xs text-[var(--muted)]">Vos billets arrivent par SMS sur ce numero.</p>

              <AuthInput
                label="Mot de passe"
                type="password"
                placeholder="8 caracteres minimum"
                value={form.password}
                onChange={(event) => update("password", event.target.value)}
                autoComplete="new-password"
                required
              />
              <AuthInput
                label="Confirmation du mot de passe"
                type="password"
                placeholder="Retapez le mot de passe"
                value={form.password_confirmation}
                onChange={(event) => update("password_confirmation", event.target.value)}
                autoComplete="new-password"
                required
              />

              {message ? <FormAlert className="mb-3">{message}</FormAlert> : null}

              <Button type="submit" size="lg" className="w-full" isLoading={isPending}>
                Creer mon compte
              </Button>

              <p className="mt-4 text-center text-xs text-[var(--muted)]">
                Deja inscrit ?{" "}
                <Link href="/login" className="font-semibold text-brand-600">
                  Se connecter
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
