import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

/**
 * L'orange de marque n'apparait qu'en degrade diagonal sur l'action principale :
 * c'est ce qui la rend reconnaissable d'un ecran a l'autre, du tunnel de
 * reservation au guichet.
 */
const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "grad-brand text-white shadow-sm hover:grad-brand-hover hover:shadow-md active:translate-y-px",
  secondary:
    "bg-[var(--surface)] text-stone-700 ring-1 ring-inset ring-stone-300 hover:bg-brand-50 hover:text-brand-700 hover:ring-brand-300 dark:text-stone-200 dark:ring-stone-600 dark:hover:bg-stone-800 dark:hover:text-brand-300 dark:hover:ring-brand-700",
  danger:
    "bg-rose-600 text-white shadow-sm hover:bg-rose-700 active:translate-y-px disabled:hover:bg-rose-600",
  ghost:
    "text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:text-stone-50",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "h-8 gap-1.5 px-3 text-xs",
  md: "h-10 gap-2 px-4 text-sm",
  // Cible tactile de 48 px : c'est la taille du bouton de validation d'un
  // paiement, tape au pouce sur un telephone tenu d'une main.
  lg: "h-12 gap-2 px-6 text-base",
  icon: "h-9 w-9",
};

/**
 * Habillage partage par le bouton et par le lien qui doit lui ressembler. Un
 * lien de navigation reste un `<a>` — clic milieu, ouverture en onglet —, il
 * reprend seulement ces classes.
 */
export function buttonClasses({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}): string {
  return cn(
    "inline-flex items-center justify-center rounded-sm font-semibold whitespace-nowrap select-none",
    "transition-all duration-150",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
    "disabled:cursor-not-allowed disabled:opacity-55 disabled:shadow-none disabled:active:translate-y-0",
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    className,
  );
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Etat d'attente : empeche la double soumission d'un paiement. */
  isLoading?: boolean;
  icon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", isLoading = false, icon, children, className, disabled, type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      className={buttonClasses({ variant, size, className })}
      {...props}
    >
      {isLoading ? <Spinner /> : icon}
      {children}
    </button>
  );
});

export function Spinner({ className }: { className?: string }) {
  return (
    <svg className={cn("h-4 w-4 animate-spin", className)} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
    </svg>
  );
}
