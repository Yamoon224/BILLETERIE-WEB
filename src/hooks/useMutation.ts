"use client";

import { useCallback, useState } from "react";
import { ApiError } from "@/lib/api-client";

export interface MutationState<TInput, TResult> {
  run: (input: TInput) => Promise<TResult | null>;
  isPending: boolean;
  error: unknown;
  /** Erreurs de validation par champ, pretes a etre affichees. */
  fieldErrors: Record<string, string[]>;
  reset: () => void;
}

/**
 * Action ecrivante (reservation, paiement, vente) avec son etat.
 *
 * `run` ne rejette pas : il renvoie `null` en cas d'echec et expose l'erreur
 * via l'etat. Les formulaires n'ont donc pas a entourer chaque soumission d'un
 * try/catch recopie d'ecran en ecran.
 */
export function useMutation<TInput, TResult>(
  action: (input: TInput) => Promise<TResult>,
): MutationState<TInput, TResult> {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const run = useCallback(
    async (input: TInput): Promise<TResult | null> => {
      setIsPending(true);
      setError(null);
      try {
        return await action(input);
      } catch (caught) {
        setError(caught);
        return null;
      } finally {
        setIsPending(false);
      }
    },
    [action],
  );

  const reset = useCallback(() => setError(null), []);

  return {
    run,
    isPending,
    error,
    fieldErrors: error instanceof ApiError ? error.fieldErrors : {},
    reset,
  };
}
