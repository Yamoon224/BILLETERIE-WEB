"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent, InputHTMLAttributes, ReactNode } from "react";
import { Button, FormAlert } from "@kaara/shared/components/ui";
import { IconCheckCircle, IconLock } from "@kaara/shared/components/ui/icons";
import { ApiError, errorMessage } from "@kaara/shared/lib/api-client";
import { cn } from "@kaara/shared/lib/cn";
import type { AuthenticatedUser } from "@kaara/shared/types/api";
import { useAuth } from "./AuthContext";

/**
 * Briques des pages de connexion.
 *
 * Chaque espace (voyageurs, compagnies, agents, admins, partenaires) vit sur
 * son propre sous-domaine et porte sa propre page de connexion : le jeton est
 * memorise par origine, une session ouverte ici n'existe pas ailleurs. Tous
 * partagent le meme mecanisme cote API (identifiant et mot de passe, ou code
 * PIN au guichet) ; ce qui change d'un espace a l'autre, c'est la carte
 * presentee et les comptes qu'il accueille.
 */

export interface LoginTarget {
  /** Destination demandee avant la connexion (`?next=`), si elle est interne. */
  next?: string;
  /** Ecran d'arrivee par defaut de cet espace. */
  home?: string;
  /**
   * Le compte a-t-il sa place dans cet espace ? Un compte refuse est aussitot
   * deconnecte : le laisser entrer l'amenerait sur des ecrans que l'API lui
   * refusera un par un.
   */
  allow?: (user: AuthenticatedUser) => boolean;
  /** Message affiche a un compte qui s'est trompe d'espace. */
  deniedMessage?: string;
}

const DEFAULT_DENIED = "Ce compte n'a pas acces a cet espace. Connectez-vous depuis l'espace qui correspond a votre profil.";

/** Seuls les chemins internes sont suivis : `//exemple.com` sortirait du site. */
function destination({ next, home = "/" }: LoginTarget): string {
  return next?.startsWith("/") && !next.startsWith("//") ? next : home;
}

/** Deroule commun aux deux modes de connexion : etat, controle d'espace, redirection. */
function useSubmit(target: LoginTarget, messageFields: string[]) {
  const router = useRouter();
  const { logout } = useAuth();
  const [isPending, setIsPending] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [error, setError] = useState<unknown>(null);

  async function run(authenticate: () => Promise<AuthenticatedUser>) {
    setIsPending(true);
    setError(null);

    try {
      const user = await authenticate();

      if (target.allow && !target.allow(user)) {
        await logout().catch(() => undefined);
        throw new Error(target.deniedMessage ?? DEFAULT_DENIED);
      }

      setSucceeded(true);
      // Laisse voir la confirmation avant de quitter l'ecran, plutot qu'une
      // redirection instantanee qui donnerait l'impression d'un saut brutal.
      window.setTimeout(() => router.replace(destination(target)), 1100);
    } catch (caught) {
      setError(caught);
      setIsPending(false);
    }
  }

  const fieldMessage =
    error instanceof ApiError ? messageFields.map((field) => error.fieldErrors[field]?.[0]).find(Boolean) : undefined;
  const message = fieldMessage ?? (error ? errorMessage(error) : null);

  return { run, isPending, succeeded, message };
}

/** Connexion par identifiant (e-mail, telephone ou code compagnie) et mot de passe. */
export function useLoginSubmit(target: LoginTarget) {
  const { login } = useAuth();
  const { run, ...state } = useSubmit(target, ["login", "code"]);

  return { ...state, submit: (identifier: string, password: string, code?: string) => run(() => login(identifier, password, code)) };
}

/** Connexion par code PIN, symetrique de `useLoginSubmit` : meme ecran de succes, meme redirection. */
export function usePinLoginSubmit(target: LoginTarget) {
  const { loginWithPin } = useAuth();
  const { run, ...state } = useSubmit(target, ["login", "pin"]);

  return { ...state, submit: (identifier: string, pin: string) => run(() => loginWithPin(identifier, pin)) };
}

/** Cadre d'une page de connexion : avertissement de session expiree, texte d'introduction, carte. */
export function LoginShell({ intro, children }: { intro?: string; children: ReactNode }) {
  const { hasExpired } = useAuth();

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-10 sm:py-14">
      {hasExpired ? (
        <FormAlert tone="warning" className="mb-6 w-full max-w-md">
          Votre session a expire. Reconnectez-vous pour continuer.
        </FormAlert>
      ) : null}

      {intro ? <p className="mb-7 max-w-md text-center text-sm text-[var(--muted)]">{intro}</p> : null}

      {children}
    </div>
  );
}

/** Carte commune a toutes les connexions : pastille, titre, sous-titre, puis le formulaire. */
export function LoginCard({
  title,
  description,
  locked = false,
  children,
}: {
  title: string;
  description: ReactNode;
  /** Pastille navy a cadenas plutot que le degrade de marque : acces interne. */
  locked?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="w-full max-w-md overflow-hidden rounded-[22px] bg-[var(--surface)] shadow-card">
      <div className="flex flex-col items-center px-8 pt-8">
        {locked ? (
          <span className="mb-4 flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-[#0e1a3a] text-white">
            <IconLock className="h-5 w-5" />
          </span>
        ) : (
          <span aria-hidden="true" className="grad-brand mb-4 h-[52px] w-[52px] rounded-2xl" />
        )}
        <h2 className="text-center font-extrabold tracking-tight text-[var(--foreground)]">{title}</h2>
        <p className="mb-1 mt-1 text-center text-xs text-[var(--muted)]">{description}</p>
      </div>

      <div className="px-8 pb-8 pt-2">{children}</div>
    </div>
  );
}

/** Champ partage par tous les formulaires d'authentification (connexion et inscription). */
export function AuthInput({ label, className, ...props }: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="mb-3.5 block w-full">
      <span className="mb-1.5 block text-xs font-semibold text-[var(--muted)]">{label}</span>
      <input
        {...props}
        className={cn(
          "w-full rounded-xl border border-[var(--hairline)] bg-[var(--surface)] px-3.5 py-3 text-sm text-[var(--foreground)]",
          "outline-none transition-colors placeholder:text-stone-400 focus:border-brand-500",
          className,
        )}
      />
    </label>
  );
}

export function SuccessPanel({ destinationLabel, title = "Connexion reussie" }: { destinationLabel: string; title?: string }) {
  return (
    <div className="flex flex-col items-center py-6 text-center">
      <span className="mb-3.5 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-flag-green text-white">
        <IconCheckCircle className="h-6 w-6" />
      </span>
      <p className="font-extrabold tracking-tight text-[var(--foreground)]">{title}</p>
      <p className="mt-1 text-sm text-[var(--muted)]">Redirection vers {destinationLabel}…</p>
    </div>
  );
}

/**
 * Connexion par identifiant et mot de passe d'un espace professionnel.
 *
 * `withTwoFactor` ajoute le champ de code de verification : ignore cote API
 * pour un compte qui n'a pas active la 2FA, il ne bloque donc jamais un
 * administrateur qui n'a pas encore configure son application d'authentification.
 */
export function PasswordLoginCard({
  title,
  description,
  identifierLabel,
  identifierType = "text",
  identifierPlaceholder,
  destinationLabel,
  footer,
  locked = false,
  withTwoFactor = false,
  target,
}: {
  title: string;
  description: ReactNode;
  identifierLabel: string;
  identifierType?: string;
  identifierPlaceholder: string;
  destinationLabel: string;
  footer?: ReactNode;
  locked?: boolean;
  withTwoFactor?: boolean;
  target: LoginTarget;
}) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const { submit, isPending, succeeded, message } = useLoginSubmit(target);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    submit(identifier.trim(), password, withTwoFactor ? code.trim() || undefined : undefined);
  }

  return (
    <LoginCard title={title} description={description} locked={locked}>
      {succeeded ? (
        <SuccessPanel destinationLabel={destinationLabel} />
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col">
          <AuthInput
            label={identifierLabel}
            type={identifierType}
            placeholder={identifierPlaceholder}
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            autoComplete="username"
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
          {withTwoFactor ? (
            <AuthInput
              label="Code de verification (2FA)"
              type="text"
              inputMode="numeric"
              placeholder="• • • • • •"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              autoComplete="one-time-code"
            />
          ) : (
            <span className="mb-4 -mt-2 text-right text-xs font-semibold text-brand-600">Mot de passe oublie ?</span>
          )}

          {message ? <FormAlert className="mb-3">{message}</FormAlert> : null}

          <Button type="submit" size="lg" className="w-full" isLoading={isPending}>
            Se connecter
          </Button>

          {footer}
        </form>
      )}
    </LoginCard>
  );
}

/**
 * Connexion guichet : identifiant (telephone ou e-mail, deja connu de
 * l'agent) et code PIN a quatre chiffres, plus rapide a saisir entre deux
 * clients qu'un mot de passe. Reservee cote API aux comptes agents porteurs
 * d'un PIN (voir AuthService::attemptWithPin).
 */
export function PinLoginCard({
  title,
  description,
  destinationLabel,
  footer,
  target,
}: {
  title: string;
  description: ReactNode;
  destinationLabel: string;
  footer?: ReactNode;
  target: LoginTarget;
}) {
  const [identifier, setIdentifier] = useState("");
  const [pin, setPin] = useState("");
  const { submit, isPending, succeeded, message } = usePinLoginSubmit(target);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    submit(identifier.trim(), pin.trim());
  }

  return (
    <LoginCard title={title} description={description}>
      {succeeded ? (
        <SuccessPanel destinationLabel={destinationLabel} />
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col">
          <AuthInput
            label="Identifiant agent"
            type="text"
            placeholder="07 XX XX XX XX ou e-mail"
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            autoComplete="username"
            required
          />
          <AuthInput
            label="Code PIN"
            type="password"
            inputMode="numeric"
            pattern="\d{4}"
            maxLength={4}
            placeholder="••••"
            value={pin}
            onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 4))}
            autoComplete="off"
            required
          />

          {message ? <FormAlert className="mb-3">{message}</FormAlert> : null}

          <Button type="submit" size="lg" className="w-full" isLoading={isPending} disabled={pin.length !== 4}>
            Se connecter
          </Button>

          {footer}
        </form>
      )}
    </LoginCard>
  );
}
