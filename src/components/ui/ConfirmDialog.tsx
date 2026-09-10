"use client";

import type { ReactNode } from "react";
import { errorMessage } from "@/lib/api-client";
import { Button } from "./Button";
import { FormAlert } from "./feedback";
import { Modal } from "./Modal";

/**
 * Confirmation d'une action irreversible : annuler une reservation, un depart.
 * Le refus metier (409) s'affiche ici plutot que de disparaitre — c'est souvent
 * la reponse la plus utile de l'ecran.
 */
export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  children,
  confirmLabel = "Confirmer",
  variant = "danger",
  isPending = false,
  error,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: ReactNode;
  confirmLabel?: string;
  variant?: "danger" | "primary";
  isPending?: boolean;
  error?: unknown;
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isPending}>
            Retour
          </Button>
          <Button variant={variant} isLoading={isPending} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="text-sm text-stone-600 dark:text-stone-300">{children}</div>
        {error ? <FormAlert>{errorMessage(error, "L'action a echoue.")}</FormAlert> : null}
      </div>
    </Modal>
  );
}
