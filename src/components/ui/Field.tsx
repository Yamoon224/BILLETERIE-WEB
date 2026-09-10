import { useId } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type FieldVariant = "input" | "textarea" | "select";

export interface FieldControlProps {
  id: string;
  className: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}

/**
 * Enveloppe d'un champ : contour unique, libelle flottant, aide, erreurs.
 *
 * Le contour est porte par un `<fieldset>` pose par-dessus le controle ; sa
 * `<legend>` decoupe un vrai trou dans le trait quand le libelle monte. Le
 * controle lui-meme n'a ni bordure ni anneau : une seule ligne dessine le
 * champ, dans tous ses etats. Toute la mecanique vit dans `globals.css`.
 */
export function Field({
  label,
  errors,
  hint,
  required,
  variant = "input",
  className,
  adornment,
  children,
}: {
  label: string;
  errors?: string[];
  hint?: ReactNode;
  required?: boolean;
  variant?: FieldVariant;
  className?: string;
  /** Element place a droite du controle : chevron, oeil, unite. */
  adornment?: ReactNode;
  children: (props: FieldControlProps) => ReactNode;
}) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const hasError = Boolean(errors?.length);

  return (
    <div className={cn("flex w-full flex-col gap-1", className)}>
      <div className={cn("field-shell", variant === "textarea" && "field-shell--textarea")}>
        {children({
          id,
          className: "field-control",
          "aria-invalid": hasError || undefined,
          "aria-describedby": hasError ? errorId : hint ? hintId : undefined,
        })}

        <fieldset aria-hidden="true" className="field-outline">
          <legend>
            <span>
              {label}
              {required ? " *" : null}
            </span>
          </legend>
        </fieldset>

        <label htmlFor={id} className="field-label">
          {label}
          {required ? <span className="ml-0.5 text-rose-500">*</span> : null}
        </label>

        {adornment ? (
          <div className="absolute inset-y-0 right-1.5 z-[2] flex items-center">{adornment}</div>
        ) : null}
      </div>

      {hint && !hasError ? (
        <p id={hintId} className="pl-0.5 text-xs text-[var(--muted)]">
          {hint}
        </p>
      ) : null}

      {hasError ? (
        <p id={errorId} className="pl-0.5 text-xs font-medium text-rose-600 dark:text-rose-400">
          {errors?.join(" ")}
        </p>
      ) : null}
    </div>
  );
}
