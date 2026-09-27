"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent, InputHTMLAttributes, ReactNode } from "react";
import { Button, FormAlert } from "@/components/ui";
import { IconBuilding, IconBus, IconCheckCircle, IconLock, IconPhone, IconShield } from "@/components/ui/icons";
import { ApiError, errorMessage } from "@/lib/api-client";
import { cn } from "@/lib/cn";
import { homeFor, useAuth } from "./AuthContext";

type Role = "public" | "partner" | "company" | "admin";

const ROLES: Array<{ id: Role; label: string; icon: ReactNode }> = [
  { id: "public", label: "Grand public", icon: <IconPhone /> },
  { id: "partner", label: "Partenaire", icon: <IconBuilding /> },
  { id: "company", label: "Compagnie", icon: <IconBus /> },
  { id: "admin", label: "Admin", icon: <IconShield /> },
];

const ROLE_INTROS: Record<Role, string> = {
  public: "Connexion voyageur : numero de telephone ou e-mail, au choix.",
  partner: "Connexion partenaire - residences meublees et location de vehicules.",
  company: "Connexion compagnie - gestion des lignes, horaires et reservations.",
  admin: "Connexion administrateur - acces interne reserve a l'equipe Kaara.",
};

/**
 * Point d'entree unique de connexion, aiguille visuellement par profil.
 *
 * Les quatre profils partagent le meme mecanisme cote API (identifiant -
 * e-mail ou telephone - et mot de passe) : ce qui change ici, c'est la
 * presentation et le champ mis en avant, pas l'authentification elle-meme.
 */
export function LoginScreen({ next }: { next?: string }) {
  const { hasExpired } = useAuth();
  const [role, setRole] = useState<Role>("public");

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-10 sm:py-14">
      {hasExpired ? (
        <FormAlert tone="warning" className="mb-6 w-full max-w-md">
          Votre session a expire. Reconnectez-vous pour continuer.
        </FormAlert>
      ) : null}

      <div className="mb-6 flex flex-wrap justify-center gap-1.5 rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] p-1.5 shadow-card">
        {ROLES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setRole(item.id)}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold whitespace-nowrap transition-colors",
              role === item.id ? "bg-[#0e1a3a] text-white" : "text-[var(--muted)] hover:text-[var(--foreground)]",
            )}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>

      <p className="mb-7 max-w-md text-center text-sm text-[var(--muted)]">{ROLE_INTROS[role]}</p>

      {role === "public" ? <PublicLogin next={next} /> : null}
      {role === "partner" ? (
        <RoleLoginCard
          title="Espace Partenaires"
          description="Gerez vos annonces et vos reservations"
          identifierLabel="Email professionnel"
          identifierType="email"
          identifierPlaceholder="contact@residences-assinie.ci"
          destinationLabel="l'Espace Partenaires"
          footer="Pas encore partenaire ? Devenir partenaire"
          next={next}
        />
      ) : null}
      {role === "company" ? (
        <RoleLoginCard
          title="Espace Compagnies"
          description="Suivez vos ventes et gerez vos lignes"
          identifierLabel="Identifiant compagnie ou email"
          identifierType="text"
          identifierPlaceholder="STC ou contact@stc-express.ci"
          destinationLabel="l'Espace Compagnies"
          footer="Votre compagnie n'est pas encore inscrite ? Nous contacter"
          next={next}
        />
      ) : null}
      {role === "admin" ? <AdminLogin next={next} /> : null}
    </div>
  );
}

/**
 * Soumission partagee par les quatre profils : un seul point de connexion
 * cote API, distingue seulement par ce que l'utilisateur a tape (e-mail ou
 * telephone).
 */
function useLoginSubmit(next: string | undefined) {
  const router = useRouter();
  const { login } = useAuth();
  const [isPending, setIsPending] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [error, setError] = useState<unknown>(null);

  async function submit(identifier: string, password: string, code?: string) {
    setIsPending(true);
    setError(null);

    try {
      const user = await login(identifier, password, code);
      setSucceeded(true);
      // Laisse voir la confirmation avant de quitter l'ecran, plutot qu'une
      // redirection instantanee qui donnerait l'impression d'un saut brutal.
      window.setTimeout(() => {
        router.replace(next?.startsWith("/") && !next.startsWith("//") ? next : homeFor(user));
      }, 1100);
    } catch (caught) {
      setError(caught);
      setIsPending(false);
    }
  }

  const message =
    error instanceof ApiError
      ? (error.fieldErrors.login?.[0] ?? error.fieldErrors.code?.[0] ?? errorMessage(error))
      : error
        ? errorMessage(error)
        : null;

  return { submit, isPending, succeeded, message };
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

/** Connexion voyageur : meme carte que les autres profils, avec une bascule telephone / e-mail. */
function PublicLogin({ next }: { next?: string }) {
  const [mode, setMode] = useState<"phone" | "email">("phone");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const { submit, isPending, succeeded, message } = useLoginSubmit(next);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    submit(identifier.trim(), password);
  }

  return (
    <div className="w-full max-w-md overflow-hidden rounded-[22px] bg-[var(--surface)] shadow-card">
      <div className="flex flex-col items-center px-8 pt-8">
        <span aria-hidden="true" className="grad-brand mb-4 h-[52px] w-[52px] rounded-2xl" />
        <h2 className="text-center font-extrabold tracking-tight text-[var(--foreground)]">Se connecter</h2>
        <p className="mb-1 mt-1 text-center text-xs text-[var(--muted)]">Accedez a vos reservations et billets Kaara</p>
      </div>

      <div className="px-8 pb-8 pt-2">
        {succeeded ? (
          <SuccessPanel destinationLabel="l'accueil Kaara" />
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
      </div>
    </div>
  );
}

/** Connexion partenaire / compagnie : meme carte, champ d'identifiant different. */
function RoleLoginCard({
  title,
  description,
  identifierLabel,
  identifierType,
  identifierPlaceholder,
  destinationLabel,
  footer,
  next,
}: {
  title: string;
  description: string;
  identifierLabel: string;
  identifierType: string;
  identifierPlaceholder: string;
  destinationLabel: string;
  footer: string;
  next?: string;
}) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const { submit, isPending, succeeded, message } = useLoginSubmit(next);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    submit(identifier.trim(), password);
  }

  return (
    <div className="w-full max-w-md overflow-hidden rounded-[22px] bg-[var(--surface)] shadow-card">
      <div className="flex flex-col items-center px-8 pt-8">
        <span aria-hidden="true" className="grad-brand mb-4 h-[52px] w-[52px] rounded-2xl" />
        <h2 className="text-center font-extrabold tracking-tight text-[var(--foreground)]">{title}</h2>
        <p className="mb-1 mt-1 text-center text-xs text-[var(--muted)]">{description}</p>
      </div>

      <div className="px-8 pb-8 pt-2">
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

            <span className="mb-4 -mt-2 text-right text-xs font-semibold text-brand-600">Mot de passe oublie ?</span>

            {message ? <FormAlert className="mb-3">{message}</FormAlert> : null}

            <Button type="submit" size="lg" className="w-full" isLoading={isPending}>
              Se connecter
            </Button>

            <p className="mt-4 text-center text-xs text-[var(--muted)]">{footer}</p>
          </form>
        )}
      </div>
    </div>
  );
}

/** Connexion admin : logo verrouille, code 2FA verifie cote API pour les comptes qui l'ont active. */
function AdminLogin({ next }: { next?: string }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const { submit, isPending, succeeded, message } = useLoginSubmit(next);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    submit(identifier.trim(), password, code.trim() || undefined);
  }

  return (
    <div className="w-full max-w-md overflow-hidden rounded-[22px] bg-[var(--surface)] shadow-card">
      <div className="flex flex-col items-center px-8 pt-8">
        <span className="mb-4 flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-[#0e1a3a] text-white">
          <IconLock className="h-5 w-5" />
        </span>
        <h2 className="text-center font-extrabold tracking-tight text-[var(--foreground)]">Kaara Admin</h2>
        <p className="mb-1 mt-1 text-center text-xs text-[var(--muted)]">Console interne - acces reserve a l&apos;equipe Kaara</p>
      </div>

      <div className="px-8 pb-8 pt-2">
        {succeeded ? (
          <SuccessPanel destinationLabel="la Console Admin" />
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col">
            <AuthInput
              label="Email interne"
              type="email"
              placeholder="prenom.nom@kaara.ci"
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
            {/* Ignore cote API pour un compte qui n'a pas active la 2FA : ce champ ne bloque donc jamais un admin qui n'a pas encore configure son application d'authentification. */}
            <AuthInput
              label="Code de verification (2FA)"
              type="text"
              inputMode="numeric"
              placeholder="• • • • • •"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              autoComplete="one-time-code"
            />

            {message ? <FormAlert className="mb-3">{message}</FormAlert> : null}

            <Button type="submit" size="lg" className="w-full" isLoading={isPending}>
              Se connecter
            </Button>

            <div className="mt-4 flex items-start gap-2 rounded-xl bg-[var(--surface-muted)] px-3 py-2.5 text-[11px] text-[var(--muted)]">
              <IconShield className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              L&apos;acces admin n&apos;est jamais auto-cree : un compte est ouvert manuellement par un administrateur existant.
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
