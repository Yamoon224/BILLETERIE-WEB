"use client";

import { cn } from "@kaara/shared/lib/cn";

/**
 * Interrupteur booleen (actif/suspendu). Distinct d'une case a cocher : la
 * bascule a un effet immediat (elle publie ou suspend une offre, une carte
 * SIM), la ou une case attend une soumission de formulaire.
 */
export function Toggle({
  checked,
  onChange,
  label,
  disabled = false,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-150",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
        checked ? "grad-brand" : "bg-stone-300 dark:bg-stone-700",
        disabled && "cursor-not-allowed opacity-55",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow transition-transform duration-150",
          checked ? "translate-x-[22px]" : "translate-x-1",
        )}
      />
    </button>
  );
}
