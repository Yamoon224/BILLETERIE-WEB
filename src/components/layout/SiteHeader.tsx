"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo, LogoMark } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Avatar, LinkButton } from "@/components/ui";
import { IconChevronDown, IconClose, IconHeart, IconMenu, IconTicket, IconUser } from "@/components/ui/icons";
import { homeFor, useAuth } from "@/features/auth/AuthContext";
import { useInfoModal } from "@/features/info-modal/InfoModalProvider";
import { cn } from "@/lib/cn";
import { HELP_LINKS, PARTNER_LINKS, SERVICE_LINKS, TRAVELER_LINKS } from "./menuLinks";
import type { MenuItem } from "./menuLinks";

const MENU_LINKS = [
  { href: "/", label: "Rechercher un trajet", icon: <IconTicket className="h-4 w-4" /> },
  { href: "/mes-billets", label: "Mes billets", icon: <IconTicket className="h-4 w-4" /> },
];

const NAV_CATEGORIES: Array<{ id: string; heading: string; items: MenuItem[] }> = [
  { id: "services", heading: "Nos services", items: SERVICE_LINKS },
  { id: "voyageurs", heading: "Voyageurs", items: TRAVELER_LINKS },
  { id: "partenaires", heading: "Partenaires", items: PARTNER_LINKS },
  { id: "aide", heading: "Aide", items: HELP_LINKS },
];

/** "Actif" en cyan pour ce qui est vraiment reservable en ligne, "Bientôt" en gris pour le reste. */
function MenuBadge({ badge }: { badge?: string }) {
  if (!badge) return null;
  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold",
        badge === "Actif" ? "bg-brand-400 text-white" : "bg-stone-200 text-stone-500 dark:bg-stone-700 dark:text-stone-300",
      )}
    >
      {badge}
    </span>
  );
}

/** Une section repliable du tiroir : toutes ouvertes par defaut, comme le reste du menu tient sur un seul ecran. */
function NavCategory({
  heading,
  items,
  isOpen,
  onToggle,
  onNavigate,
}: {
  heading: string;
  items: MenuItem[];
  isOpen: boolean;
  onToggle: () => void;
  onNavigate: () => void;
}) {
  const { openInfo } = useInfoModal();

  return (
    <div className="border-b border-[var(--hairline)] py-1">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm font-bold text-[var(--foreground)]"
      >
        {heading}
        <IconChevronDown className={cn("h-3.5 w-3.5 text-[var(--muted)] transition-transform", isOpen ? "rotate-180" : "")} />
      </button>

      {isOpen ? (
        <ul className="flex flex-col gap-0.5 pb-2">
          {items.map((item) =>
            item.kind === "link" ? (
              <li key={item.label}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className="flex items-center justify-between gap-2 rounded-sm px-3 py-2 text-sm text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
                >
                  {item.label}
                  <MenuBadge badge={item.badge} />
                </Link>
              </li>
            ) : (
              <li key={item.label}>
                <button
                  type="button"
                  onClick={() => openInfo(item.title, item.text)}
                  className="flex w-full items-center justify-between gap-2 rounded-sm px-3 py-2 text-left text-sm text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
                >
                  {item.label}
                  <MenuBadge badge={item.badge} />
                </button>
              </li>
            ),
          )}
        </ul>
      ) : null}
    </div>
  );
}

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
  const [openCategories, setOpenCategories] = useState<string[]>(NAV_CATEGORIES.map((category) => category.id));

  function closeMenu() {
    setIsMenuOpen(false);
  }

  function toggleCategory(id: string) {
    setOpenCategories((current) =>
      current.includes(id) ? current.filter((openId) => openId !== id) : [...current, id],
    );
  }

  return (
    <>
      <header className="no-print sticky top-0 z-30 border-b border-[var(--hairline)] bg-[var(--surface)]/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link href="/" className="rounded-sm" aria-label="Kaara, accueil">
            <Logo tone="brand" />
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/favoris"
              aria-label="Mes favoris"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-stone-500 ring-1 ring-inset ring-stone-200 hover:bg-stone-100 dark:text-stone-300 dark:ring-stone-700 dark:hover:bg-stone-800"
            >
              <IconHeart className="h-4 w-4" />
            </Link>

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
              <Link
                href="/connexion"
                className="inline-flex h-8 items-center justify-center whitespace-nowrap rounded-full bg-brand-400 px-3 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-brand-500 active:translate-y-px sm:px-4"
              >
                Se connecter
              </Link>
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
        <span aria-hidden="true" className="grad-brand block h-1 w-full" />
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

          <div className="mt-3 border-t border-[var(--hairline)]">
            {NAV_CATEGORIES.map((category) => (
              <NavCategory
                key={category.id}
                heading={category.heading}
                items={category.items}
                isOpen={openCategories.includes(category.id)}
                onToggle={() => toggleCategory(category.id)}
                onNavigate={closeMenu}
              />
            ))}
          </div>

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
