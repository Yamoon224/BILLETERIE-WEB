"use client";

import Link from "next/link";
import { useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Avatar, LinkButton } from "@/components/ui";
import { IconChevronDown, IconHeart, IconMenu, IconUser } from "@/components/ui/icons";
import { homeFor, useAuth } from "@/features/auth/AuthContext";
import { useInfoModal } from "@/features/info-modal/InfoModalProvider";
import { cn } from "@/lib/cn";
import { HELP_LINKS, PARTNER_LINKS, SERVICE_LINKS, TRAVELER_LINKS } from "./menuLinks";
import type { MenuItem } from "./menuLinks";

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
        badge === "Actif" ? "bg-brand-400 text-white" : "bg-white/12 text-white/60",
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
    <div className="border-b border-white/10 py-1">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm font-bold text-white"
      >
        {heading}
        <IconChevronDown className={cn("h-3.5 w-3.5 text-white/50 transition-transform", isOpen ? "rotate-180" : "")} />
      </button>

      {isOpen ? (
        <ul className="flex flex-col gap-0.5 pb-2">
          {items.map((item) =>
            item.kind === "link" ? (
              <li key={item.label}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className="flex items-center justify-between gap-2 rounded-sm px-3 py-2 text-sm text-white/70 hover:bg-white/10"
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
                  className="flex w-full items-center justify-between gap-2 rounded-sm px-3 py-2 text-left text-sm text-white/70 hover:bg-white/10"
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
              onClick={() => setIsMenuOpen((open) => !open)}
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

      {/* Tiroir lateral : theme, mes billets, compte - tout ce qui n'est pas
          l'action principale de l'en-tete.
          Demarre sous l'en-tete (top-[69px] = hauteur de la barre + son
          filet degrade + sa bordure) plutot qu'en haut de l'ecran : le logo,
          le coeur et « Se connecter » restent visibles et cliquables meme
          menu ouvert. */}
      {isMenuOpen ? (
        <button
          type="button"
          aria-label="Fermer le menu"
          onClick={closeMenu}
          className="fixed inset-x-0 top-[69px] bottom-0 z-40 bg-stone-950/50"
        />
      ) : null}

      <aside
        aria-label="Menu"
        className={cn(
          "fixed right-0 top-[69px] bottom-0 z-40 flex w-[85vw] max-w-xs flex-col bg-[#0e1a3a] shadow-card",
          "transition-transform duration-200 ease-out",
          isMenuOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="shrink-0 px-5 pb-2 pt-6">
          <span className="text-[28px] font-extrabold leading-none tracking-tight text-white">
            Ka<span className="text-brand-300">ara</span>
          </span>
        </div>

        <nav aria-label="Navigation" className="flex-1 overflow-y-auto p-3">
          <div>
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

          <div className="mt-5 border-t border-white/10 pt-5">
            <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-white/50">Apparence</p>
            <div className="px-3">
              <ThemeToggle showLabels />
            </div>
          </div>
        </nav>

        <div className="shrink-0 border-t border-white/10 p-3">
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
