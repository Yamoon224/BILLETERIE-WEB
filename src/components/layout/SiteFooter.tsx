import Link from "next/link";
import { IconFacebook, IconGithub, IconInstagram } from "@/components/ui/icons";

const FOOTER_SECTIONS = [
  {
    heading: "Voyageurs",
    links: [
      { href: "#", label: "Chèques cadeaux" },
      { href: "#", label: "Programme de fidélité" },
      { href: "#", label: "Guide des destinations" },
    ],
  },
  {
    heading: "Partenaires",
    links: [
      { href: "#", label: "Devenir partenaire" },
      { href: "#", label: "Ajouter votre compagnie ou résidence" },
      { href: "#", label: "Publicité sur Kaara" },
      { href: "#", label: "Programme d'affiliation" },
    ],
  },
  {
    heading: "Aide",
    links: [
      { href: "#", label: "Centre d'aide" },
      { href: "#", label: "Nous contacter" },
    ],
  },
];

const SOCIAL_LINKS = [
  { href: "#", label: "Facebook", icon: <IconFacebook className="h-4 w-4" /> },
  { href: "#", label: "GitHub", icon: <IconGithub className="h-4 w-4" /> },
  { href: "#", label: "Instagram", icon: <IconInstagram className="h-4 w-4" /> },
];

/**
 * Pied de page voyageur : fond sombre fixe, independant du theme clair/sombre
 * de reste du site — c'est un socle marketing, pas une surface applicative.
 */
export function SiteFooter() {
  return (
    <footer className="no-print mt-16 bg-[#0f1d24] pb-20 text-stone-300 md:pb-0">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <span className="text-2xl font-extrabold tracking-tight text-white">
          Ka<span className="grad-brand-text">ara</span>
        </span>

        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          {FOOTER_SECTIONS.map((section) => (
            <div key={section.heading}>
              <p className="text-base font-bold text-white">{section.heading}</p>
              <ul className="mt-3 space-y-2.5 text-sm">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-stone-400 hover:text-brand-300">
                      {link.label}
                    </Link>
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
        </div>
      </div>

      <div className="flex h-1">
        <span className="bg-[var(--color-flag-orange)]" style={{ width: "55%" }} />
        <span className="bg-[var(--color-flag-green)]" style={{ width: "45%" }} />
      </div>
    </footer>
  );
}
