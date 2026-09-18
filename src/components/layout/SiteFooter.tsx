"use client";

import { IconFacebook, IconGithub, IconInstagram } from "@/components/ui/icons";
import { useInfoModal } from "@/features/info-modal/InfoModalProvider";
import { HELP_LINKS, PARTNER_LINKS, TRAVELER_LINKS } from "./menuLinks";
import type { MenuInfoItem } from "./menuLinks";

const FOOTER_SECTIONS: Array<{ heading: string; links: MenuInfoItem[] }> = [
  { heading: "Voyageurs", links: TRAVELER_LINKS },
  { heading: "Partenaires", links: PARTNER_LINKS },
  { heading: "Aide", links: HELP_LINKS },
];

const SOCIAL_LINKS = [
  { href: "#", label: "Facebook", icon: <IconFacebook className="h-4 w-4" /> },
  { href: "#", label: "GitHub", icon: <IconGithub className="h-4 w-4" /> },
  { href: "#", label: "Instagram", icon: <IconInstagram className="h-4 w-4" /> },
];

/**
 * Pied de page voyageur : fond sombre fixe, independant du theme clair/sombre
 * de reste du site - c'est un socle marketing, pas une surface applicative.
 *
 * Les liens "Voyageurs" / "Partenaires" / "Aide" partagent leur contenu avec
 * les memes categories du tiroir de navigation (menuLinks.ts) : une
 * fonctionnalite annoncee mais pas encore en ligne ouvre le meme popup
 * d'information ici comme la-bas.
 */
export function SiteFooter() {
  const { openInfo } = useInfoModal();

  return (
    <footer className="no-print mt-16 bg-[#0e1a3a] pb-20 text-stone-300 md:pb-0">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <span className="text-2xl font-extrabold tracking-tight text-white">
          Ka<span className="text-brand-300">ara</span>
        </span>

        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          {FOOTER_SECTIONS.map((section) => (
            <div key={section.heading}>
              <p className="text-base font-bold text-white">{section.heading}</p>
              <ul className="mt-3 space-y-2.5 text-sm">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <button
                      type="button"
                      onClick={() => openInfo(link.title, link.text)}
                      className="text-stone-400 hover:text-brand-300"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-white/10 pt-8">
          <p className="text-base font-bold text-white">Suivez-nous</p>
          <div className="mt-4 flex gap-3">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                {social.icon}
              </a>
            ))}
          </div>
          <p className="mt-6 text-xs text-stone-500">© 2026 Kaara - Mobilité &amp; tourisme en Côte d&apos;Ivoire</p>
        </div>
      </div>
    </footer>
  );
}
