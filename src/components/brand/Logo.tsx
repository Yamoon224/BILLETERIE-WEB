import { cn } from "@/lib/cn";

/**
 * Marque « Kaara » — « voyage » en langue baoule approchee, courte et facile a
 * dire au guichet.
 *
 * Le pictogramme reprend les trois bandes du drapeau ivoirien, inclinees en
 * route : orange, blanc, vert. Il reste lisible reduit a 32 px dans la barre
 * laterale repliee.
 */
export function LogoMark({ size = "md", className }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const dimension = { sm: "h-8 w-8", md: "h-9 w-9", lg: "h-12 w-12" }[size];

  return (
    <span
      aria-hidden="true"
      className={cn("grad-brand relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-sm shadow-card", dimension, className)}
    >
      <svg viewBox="0 0 32 32" className="h-[70%] w-[70%]" fill="none">
        <path d="M6 26 13 6h4L10 26Z" fill="#fff" />
        <path d="M13 26 20 6h4l-7 20Z" fill="#fff" opacity="0.55" />
        <path d="M20 26 26 9v17Z" fill="#009e60" />
      </svg>
    </span>
  );
}

export function Logo({ size = "md", className, tagline = false }: { size?: "sm" | "md" | "lg"; className?: string; tagline?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark size={size} />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-extrabold tracking-tight text-stone-900 dark:text-stone-50",
            size === "lg" ? "text-2xl" : "text-lg",
          )}
        >
          Kaa<span className="grad-brand-text">ra</span>
        </span>
        {tagline ? (
          <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            Billetterie interurbaine
          </span>
        ) : null}
      </span>
    </span>
  );
}
