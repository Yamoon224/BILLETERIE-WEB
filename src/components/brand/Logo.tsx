import { cn } from "@/lib/cn";

/**
 * Marque « Kaara » — « voyage » en langue baoule approchee, courte et facile a
 * dire au guichet.
 *
 * Le pictogramme reprend deux bandes inclinees en route, orange et vert -
 * heritage du drapeau ivoirien, sans le blanc. Il reste lisible reduit a
 * 32 px dans la barre laterale repliee.
 */
export function LogoMark({ size = "md", className }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const dimension = { sm: "h-8 w-8", md: "h-9 w-9", lg: "h-12 w-12" }[size];

  return (
    <span
      aria-hidden="true"
      className={cn("grad-logo relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-sm shadow-card", dimension, className)}
    >
      <svg viewBox="0 0 32 32" className="h-[70%] w-[70%]" fill="none">
        <path d="M13 26 20 6h4l-7 20Z" fill="#009e60" />
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
