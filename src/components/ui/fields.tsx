"use client";

import { useState } from "react";
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { Field } from "./Field";
import { IconChevronDown, IconEye, IconEyeOff, IconSearch } from "./icons";

/**
 * Champs prets a l'emploi, tous a libelle flottant.
 *
 * Le placeholder est **obligatoire** dans le type : c'est lui qui alimente
 * `:placeholder-shown`, la pseudo-classe qui fait monter le libelle, et c'est
 * lui qui montre le format attendu (« +225 07 00 00 00 00 ») au moment ou l'on
 * s'apprete a taper. Son oubli se voit a la compilation plutot qu'en recette.
 */

interface CommonFieldProps {
  label: string;
  errors?: string[];
  hint?: ReactNode;
  fieldClassName?: string;
}

export interface TextFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "placeholder">,
    CommonFieldProps {
  placeholder: string;
  adornment?: ReactNode;
}

export function TextField({ label, errors, hint, fieldClassName, required, adornment, className, ...props }: TextFieldProps) {
  return (
    <Field label={label} errors={errors} hint={hint} required={required} className={fieldClassName} adornment={adornment}>
      {(fieldProps) => (
        <input
          {...fieldProps}
          required={required}
          {...props}
          className={cn(fieldProps.className, adornment ? "pr-10" : null, className)}
        />
      )}
    </Field>
  );
}

export interface PasswordFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "type" | "placeholder">,
    CommonFieldProps {
  placeholder: string;
}

export function PasswordField({ label, errors, hint, fieldClassName, required, ...props }: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <Field
      label={label}
      errors={errors}
      hint={hint}
      required={required}
      className={fieldClassName}
      adornment={
        <button
          type="button"
          onClick={() => setIsVisible((visible) => !visible)}
          aria-pressed={isVisible}
          aria-label={isVisible ? "masquer le mot de passe" : "afficher le mot de passe"}
          className="flex h-8 w-8 items-center justify-center rounded-sm text-stone-400 transition-colors hover:text-brand-600"
        >
          {isVisible ? <IconEyeOff /> : <IconEye />}
        </button>
      }
    >
      {(fieldProps) => (
        <input
          {...fieldProps}
          type={isVisible ? "text" : "password"}
          required={required}
          {...props}
          className={cn(fieldProps.className, "pr-11")}
        />
      )}
    </Field>
  );
}

export interface TextareaFieldProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id" | "placeholder">,
    CommonFieldProps {
  placeholder: string;
}

export function TextareaField({ label, errors, hint, fieldClassName, required, rows = 3, ...props }: TextareaFieldProps) {
  return (
    <Field label={label} errors={errors} hint={hint} required={required} variant="textarea" className={fieldClassName}>
      {(fieldProps) => (
        <textarea {...fieldProps} rows={rows} required={required} {...props} className={cn(fieldProps.className, "resize-y")} />
      )}
    </Field>
  );
}

export interface SelectFieldProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "id">, CommonFieldProps {
  children: ReactNode;
}

export function SelectField({ label, errors, hint, fieldClassName, required, children, ...props }: SelectFieldProps) {
  return (
    <Field
      label={label}
      errors={errors}
      hint={hint}
      required={required}
      variant="select"
      className={fieldClassName}
      adornment={<IconChevronDown className="pointer-events-none mr-1.5 h-4 w-4 text-stone-400" />}
    >
      {(fieldProps) => (
        <select
          {...fieldProps}
          required={required}
          {...props}
          className={cn(fieldProps.className, "cursor-pointer appearance-none pr-9")}
        >
          {children}
        </select>
      )}
    </Field>
  );
}

/**
 * Recherche de barre d'outils : le seul champ dont le placeholder reste
 * visible. Un libelle flottant au-dessus d'une loupe n'apporterait rien et
 * volerait de la hauteur au tableau.
 */
export function SearchInput({
  label = "Rechercher",
  className,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { label?: string }) {
  return (
    <div className="relative w-full">
      <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
      <input
        type="search"
        aria-label={label}
        className={cn(
          "w-full rounded-sm border-0 bg-[var(--surface)] py-2.5 pl-9 pr-3 text-sm text-[var(--foreground)]",
          "ring-1 ring-inset ring-[var(--field-border)] transition-shadow placeholder:text-stone-400",
          "focus:outline-none focus:ring-2 focus:ring-brand-500",
          className,
        )}
        {...props}
      />
    </div>
  );
}
