import { ApiError, apiFetch } from "@/lib/api-client";
import type { ScanResult, Single } from "@/types/api";

export interface ValidateTicketInput {
  code: string;
  trip_id?: string | null;
  station_id?: string | null;
  client_reference?: string | null;
}

/**
 * Scan d'un billet.
 *
 * Un refus (409, 404, 422) n'est pas une erreur technique : l'API renvoie le
 * verdict dans le corps. On le relit donc depuis l'erreur plutot que de le
 * laisser remonter comme une exception — l'agent doit voir « billet deja
 * utilise a 06:12 », pas « erreur 409 ».
 */
export async function validate(input: ValidateTicketInput): Promise<ScanResult> {
  try {
    return (await apiFetch<Single<ScanResult>>("/tickets/validate", { method: "POST", body: input })).data;
  } catch (error) {
    const verdict = (error as ApiError | undefined)?.body as unknown as { data?: ScanResult } | null;

    if (error instanceof ApiError && verdict?.data?.outcome) {
      return verdict.data;
    }

    throw error;
  }
}
