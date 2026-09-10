import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Carte : coins rounded-sm, ombre franche, lisere orange en pied.
 *
 * Le lisere est un enfant de flux, pas un calque : il ne recouvre jamais la
 * derniere ligne d'un tableau ni une barre de pagination.
 */
export function Card({
  children,
  className,
  accent = true,
  interactive = false,
}: {
  children: ReactNode;
  className?: string;
  accent?: boolean;
  /** Survol accentue, pour une carte cliquable (resultat de recherche). */
  interactive?: boolean;
}) {
  return (
    <section
      className={cn(
        "flex flex-col overflow-hidden rounded-sm border border-[var(--hairline)] bg-[var(--surface)] shadow-card",
        interactive && "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
      {accent ? <span aria-hidden="true" className="grad-brand h-[3px] w-full shrink-0" /> : null}
    </section>
  );
}

/** Trait de marque intercale entre un titre et son sous-titre. */
export function TitleRule({ className }: { className?: string }) {
  return <span aria-hidden="true" className={cn("grad-brand mt-2 block h-[3px] w-10 rounded-full", className)} />;
}

export function CardHeader({
  title,
  description,
  actions,
  icon,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--hairline)] px-4 py-4 sm:px-5">
      <div className="flex min-w-0 items-start gap-3">
        {icon ? (
          <span className="grad-brand-soft mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-sm text-brand-600 ring-1 ring-brand-500/20 dark:text-brand-400">
            {icon}
          </span>
        ) : null}
        <div className="min-w-0">
          <h2 className="text-sm font-bold tracking-tight text-stone-900 dark:text-stone-50">{title}</h2>
          <TitleRule />
          {description ? <p className="mt-2 text-sm text-[var(--muted)]">{description}</p> : null}
        </div>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}

export function CardBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("px-4 py-4 sm:px-5", className)}>{children}</div>;
}

export function CardFooter({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-end gap-2 border-t border-[var(--hairline)] px-4 py-3 sm:px-5",
        className,
      )}
    >
      {children}
    </div>
  );
}
