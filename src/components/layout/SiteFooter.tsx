import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

export function SiteFooter() {
  return (
    <footer className="no-print mt-16 border-t border-[var(--hairline)] bg-[var(--surface)]">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <Logo tagline />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-[var(--muted)]">
            Reservez votre place, payez par mobile money et recevez votre billet par SMS. Presentez simplement
            le QR code a l&apos;embarquement.
          </p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Voyageurs</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/" className="hover:text-brand-600">
                Rechercher un trajet
              </Link>
            </li>
            <li>
              <Link href="/mes-billets" className="hover:text-brand-600">
                Retrouver mon billet
              </Link>
            </li>
            <li>
              <Link href="/inscription" className="hover:text-brand-600">
                Creer un compte
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Professionnels</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/connexion" className="hover:text-brand-600">
                Espace compagnies et guichets
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="flex h-1">
        <span className="flex-1 bg-brand-500" />
        <span className="flex-1 bg-white dark:bg-stone-200" />
        <span className="flex-1 bg-[var(--color-flag-green)]" />
      </div>
    </footer>
  );
}
