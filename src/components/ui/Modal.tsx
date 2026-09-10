"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { TitleRule } from "./Card";
import { IconClose } from "./icons";

/**
 * Boite de dialogue basee sur <dialog> natif : le navigateur fournit deja le
 * piegeage du focus, la fermeture par Echap et le fond inerte.
 *
 * Sur mobile, la boite occupe toute la largeur et se colle au bas de l'ecran :
 * le pouce atteint les boutons du pied, et le clavier virtuel ne pousse plus le
 * formulaire hors du cadre. A partir de `sm`, elle est centree. Coins
 * rounded-sm dans les deux cas.
 */
export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  const widthClass = {
    sm: "sm:w-[min(28rem,calc(100vw-2rem))]",
    md: "sm:w-[min(38rem,calc(100vw-2rem))]",
    lg: "sm:w-[min(52rem,calc(100vw-2rem))]",
    xl: "sm:w-[min(68rem,calc(100vw-2rem))]",
  }[size];

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onCancel={onClose}
      aria-label={title}
      className={cn(
        "fixed inset-x-0 bottom-0 top-auto m-0 max-h-[92dvh] w-full max-w-none",
        "sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-h-[calc(100dvh-2rem)]",
        widthClass,
        "flex-col overflow-hidden rounded-sm border border-[var(--hairline)] bg-[var(--surface)] p-0",
        "text-[var(--foreground)] shadow-card backdrop:bg-stone-950/55 backdrop:backdrop-blur-sm",
        "open:flex open:animate-fade-rise",
      )}
    >
      <div className="flex shrink-0 items-start gap-3 border-b border-[var(--hairline)] px-4 py-4 sm:px-5">
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-bold tracking-tight">{title}</h2>
          <TitleRule />
          {description ? <p className="mt-2 text-sm text-[var(--muted)]">{description}</p> : null}
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="-mr-1 -mt-1 shrink-0 rounded-sm p-2 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700 focus-visible:outline-2 focus-visible:outline-brand-500 dark:hover:bg-stone-800 dark:hover:text-stone-200"
        >
          <IconClose className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">{children}</div>

      {footer ? (
        // Sous `sm`, les boutons passent en colonne inversee : l'action
        // principale se retrouve en haut de la pile, sous le pouce.
        <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-[var(--hairline)] px-4 py-3 sm:flex-row sm:items-center sm:justify-end sm:px-5 [&>button]:w-full sm:[&>button]:w-auto">
          {footer}
        </div>
      ) : null}
      <span aria-hidden="true" className="grad-brand block h-[3px] w-full shrink-0" />
    </dialog>
  );
}
