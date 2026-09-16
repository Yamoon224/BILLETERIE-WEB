"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo, LogoMark } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Avatar, LinkButton } from "@/components/ui";
import { IconClose, IconMenu, IconTicket, IconUser } from "@/components/ui/icons";
import { homeFor, useAuth } from "@/features/auth/AuthContext";
import { cn } from "@/lib/cn";

const MENU_LINKS = [
  { href: "/", label: "Rechercher un trajet", icon: <IconTicket className="h-4 w-4" /> },
  { href: "/mes-billets", label: "Mes billets", icon: <IconTicket className="h-4 w-4" /> },
];

/**
 * En-tete du site voyageur : logo, connexion, menu. Rien d'autre.
 *
 * Chaque lien de plus dans cette barre est un lien de moins de large pour le
 * titre en dessous, sur un telephone tenu d'une main. Tout le secondaire
 * (theme, mes billets, compte) vit donc dans le tiroir lateral ouvert par le
 * bouton burger, jamais ici.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function closeMenu() {
    setIsMenuOpen(false);
  }

  return (
    <>
      <header className="no-print sticky top-0 z-30 border-b border-[var(--hairline)] bg-[var(--surface)]/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link href="/" className="rounded-sm" aria-label="Kaara, accueil">
            <Logo />
          </Link>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <LinkButton
                  href={homeFor(user)}
                  variant="secondary"
                  size="sm"
                  icon={<IconUser className="h-3.5 w-3.5" />}
                  className="hidden sm:inline-flex"
                >
                  Mon espace
                </LinkButton>
                <Link
                  href={homeFor(user)}
                  aria-label="Mon espace"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full sm:hidden"
                >
                  <Avatar name={user.name} size="sm" />
                </Link>
              </>
            ) : (
              <>
                <LinkButton href="/connexion" size="sm" className="hidden sm:inline-flex">
                  Se connecter
                </LinkButton>
                <Link
                  href="/connexion"
                  aria-label="Se connecter"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full text-stone-600 hover:bg-stone-100 sm:hidden dark:text-stone-300 dark:hover:bg-stone-800"
                >
                  <IconUser className="h-5 w-5" />
                </Link>
              </>
            )}

            <button
              type="button"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Ouvrir le menu"
              aria-haspopup="true"
              aria-expanded={isMenuOpen}
              className="inline-flex h-9 w-9 items-center justify-center rounded-sm text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
            >
              <IconMenu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Tiroir lateral : theme, mes billets, compte — tout ce qui n'est pas
          l'action principale de l'en-tete. */}
      {isMenuOpen ? (
        <button
          type="button"
          aria-label="Fermer le menu"
          onClick={closeMenu}
          className="fixed inset-0 z-40 bg-stone-950/50 backdrop-blur-sm"
        />
      ) : null}

      <aside
        aria-label="Menu"
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex h-dvh w-[85vw] max-w-xs flex-col bg-[var(--surface)] shadow-card",
          "transition-transform duration-200 ease-out",
          isMenuOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-[var(--hairline)] px-4">
          <LogoMark size="sm" />
          <button
            type="button"
            onClick={closeMenu}
            aria-label="Fermer le menu"
            className="rounded-sm p-2 text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            <IconClose className="h-5 w-5" />
          </button>
        </div>

        <nav aria-label="Navigation" className="flex-1 overflow-y-auto p-3">
          <ul className="flex flex-col gap-0.5">
            {MENU_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={closeMenu}
                  aria-current={pathname === link.href ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-sm px-3 py-3 text-sm font-semibold transition-colors",
                    pathname === link.href
                      ? "grad-brand-soft text-brand-700 dark:text-brand-300"
                      : "text-stone-700 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800",
                  )}
                >
                  <span className="text-brand-600 dark:text-brand-400">{link.icon}</span>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-5 border-t border-[var(--hairline)] pt-5">
            <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
              Apparence
            </p>
            <div className="px-3">
              <ThemeToggle showLabels />
            </div>
          </div>
        </nav>

        <div className="shrink-0 border-t border-[var(--hairline)] p-3">
          {user ? (
            <LinkButton
              href={homeFor(user)}
              variant="secondary"
              className="w-full"
              icon={<IconUser className="h-4 w-4" />}
              onClick={closeMenu}
            >
              Mon espace
            </LinkButton>
          ) : (
            <div className="flex flex-col gap-2">
              <LinkButton href="/connexion" className="w-full" onClick={closeMenu}>
                Se connecter
              </LinkButton>
              <LinkButton href="/inscription" variant="secondary" className="w-full" onClick={closeMenu}>
                Creer un compte
              </LinkButton>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
