import { cn } from "@/lib/cn";

/**
 * Marque « Kaara » — « voyage » en langue baoule approchee, courte et facile a
 * dire au guichet.
 *
 * Le pictogramme est un simple carre partage en diagonale, orange et vert -
 * heritage du drapeau ivoirien, sans le blanc. Il reste lisible reduit a
 * 32 px dans la barre laterale repliee.
 */
export function LogoMark({
  size = "md",
  tone = "flag",
  className,
}: {
  size?: "sm" | "md" | "lg";
  tone?: "flag" | "brand";
  className?: string;
}) {
  const dimension = { sm: "h-8 w-8", md: "h-9 w-9", lg: "h-12 w-12" }[size];
  const gradient = tone === "brand" ? "grad-brand" : "grad-logo";

  return <span aria-hidden="true" className={cn(gradient, "inline-block shrink-0 rounded-sm shadow-card", dimension, className)} />;
}

export function Logo({
  size = "md",
  tone = "flag",
  className,
  tagline = false,
}: {
  size?: "sm" | "md" | "lg";
  tone?: "flag" | "brand";
  className?: string;
  tagline?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark size={size} tone={tone} />
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
