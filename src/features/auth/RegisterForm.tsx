"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import { Button, FormAlert, PasswordField, TextField } from "@/components/ui";
import { ApiError, errorMessage } from "@/lib/api-client";
import { useAuth } from "./AuthContext";

/**
 * Inscription d'un voyageur. Le role n'est jamais choisi ici : il est impose
 * par l'API, et un compte de back-office se cree depuis l'espace
 * d'administration.
 */
export function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();

  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", password_confirmation: "" });
  const [error, setError] = useState<unknown>(null);
  const [isPending, setIsPending] = useState(false);

  function update(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setIsPending(true);
    setError(null);

    try {
      await register({ ...form, phone: form.phone.trim() || undefined });
      router.replace("/mes-billets");
    } catch (caught) {
      setError(caught);
      setIsPending(false);
    }
  }

  const fieldErrors = error instanceof ApiError ? error.fieldErrors : {};

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <TextField
        label="Nom complet"
        placeholder="Awa Kone"
        value={form.name}
        onChange={(event) => update("name", event.target.value)}
        autoComplete="name"
        errors={fieldErrors.name}
        required
      />
      <TextField
        label="Adresse e-mail"
        type="email"
        placeholder="vous@exemple.ci"
        value={form.email}
        onChange={(event) => update("email", event.target.value)}
        autoComplete="email"
        errors={fieldErrors.email}
        required
      />
      <TextField
        label="Telephone"
        type="tel"
        inputMode="tel"
        placeholder="+225 07 00 00 00 00"
        value={form.phone}
        onChange={(event) => update("phone", event.target.value)}
        autoComplete="tel"
        errors={fieldErrors.phone}
        hint="Vos billets arrivent par SMS sur ce numero."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <PasswordField
          label="Mot de passe"
          placeholder="8 caracteres minimum"
          value={form.password}
          onChange={(event) => update("password", event.target.value)}
          autoComplete="new-password"
          errors={fieldErrors.password}
          required
        />
        <PasswordField
          label="Confirmation"
          placeholder="Retapez le mot de passe"
          value={form.password_confirmation}
          onChange={(event) => update("password_confirmation", event.target.value)}
          autoComplete="new-password"
          required
        />
      </div>

      {error && !(error instanceof ApiError && error.status === 422) ? <FormAlert>{errorMessage(error)}</FormAlert> : null}

      <Button type="submit" size="lg" className="w-full" isLoading={isPending}>
        Creer mon compte
      </Button>

      <p className="text-center text-sm text-[var(--muted)]">
        Deja inscrit ?{" "}
        <Link href="/connexion" className="font-semibold text-brand-600">
          Se connecter
        </Link>
      </p>
    </form>
  );
}
