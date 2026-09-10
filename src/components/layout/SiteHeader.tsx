"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { LinkButton } from "@/components/ui";
import { IconClose, IconMenu, IconTicket, IconUser } from "@/components/ui/icons";
import { homeFor, useAuth } from "@/features/auth/AuthContext";
import { cn } from "@/lib/cn";

const LINKS = [
  { href: "/", label: "Rechercher un trajet" },
  { href: "/mes-billets", label: "Mes billets" },
];

/**
 * En-tete du site voyageur.
 *
 * Volontairement court : sur un telephone, chaque ligne de l'en-tete est une
 * ligne de moins pour les horaires. Le menu mobile se deplie sous l'en-tete
 * plutot qu'en tiroir lateral, pour rester atteignable au pouce.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="no-print sticky top-0 z-30 border-b border-[var(--hairline)] bg-[var(--surface)]/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="rounded-sm" aria-label="Kaara, accueil">
          <Logo />
        </Link>

        <nav aria-label="Navigation principale" className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href ? "page" : undefined}
              className={cn(
                "rounded-sm px-3 py-2 text-sm font-semibold transition-colors",
                pathname === link.href
                  ? "text-brand-700 dark:text-brand-400"
                  : "text-stone-600 hover:text-stone-900 dark:text-stone-300 dark:hover:text-stone-50",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          {user ? (
            <LinkButton href={homeFor(user)} variant="secondary" size="sm" icon={<IconUser className="h-3.5 w-3.5" />}>
              Mon espace
            </LinkButton>
          ) : (
            <LinkButton href="/connexion" size="sm">
              Se connecter
            </LinkButton>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={isOpen}
          aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
          className="rounded-sm p-2 text-stone-600 hover:bg-stone-100 md:hidden dark:text-stone-300 dark:hover:bg-stone-800"
        >
          {isOpen ? <IconClose className="h-5 w-5" /> : <IconMenu className="h-5 w-5" />}
        </button>
      </div>

      {isOpen ? (
        <div className="animate-fade-rise border-t border-[var(--hairline)] bg-[var(--surface)] px-4 py-4 md:hidden">
          <nav aria-label="Navigation mobile" className="flex flex-col gap-1">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 rounded-sm px-3 py-3 text-sm font-semibold text-stone-700 hover:bg-brand-50 dark:text-stone-200 dark:hover:bg-stone-800"
              >
                <IconTicket className="h-4 w-4 text-brand-600" />
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex items-center justify-between gap-3 border-t border-[var(--hairline)] pt-4">
            <ThemeToggle showLabels />
            {user ? (
              <LinkButton href={homeFor(user)} variant="secondary" size="sm" onClick={() => setIsOpen(false)}>
                Mon espace
              </LinkButton>
            ) : (
              <LinkButton href="/connexion" size="sm" onClick={() => setIsOpen(false)}>
                Se connecter
              </LinkButton>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
