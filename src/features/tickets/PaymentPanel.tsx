"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Button, Card, CardBody, CardHeader, FormAlert, TextField } from "@/components/ui";
import { IconClock, IconLock, IconWallet } from "@/components/ui/icons";
import { useMutation } from "@/hooks/useMutation";
import { errorMessage } from "@/lib/api-client";
import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/format";
import { MOBILE_MONEY_PROVIDERS } from "@/lib/labels";
import { bookingService } from "@/services";
import type { Booking, MobileMoneyProvider } from "@/types/api";

function useCountdown(expiresAt: string | null): number {
  const compute = useCallback(
    () => (expiresAt ? Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)) : 0),
    [expiresAt],
  );

  const [seconds, setSeconds] = useState(compute);

  useEffect(() => {
    const timer = window.setInterval(() => setSeconds(compute()), 1000);

    return () => window.clearInterval(timer);
  }, [compute]);

  return seconds;
}

/**
 * Paiement mobile money d'une reservation en attente.
 *
 * Le compte a rebours est affiche en permanence : les places ne sont bloquees
 * que quinze minutes, et un voyageur qui le decouvre au moment de valider son
 * debit a perdu sa place. Quand il atteint zero, le bouton se desactive plutot
 * que de laisser tenter un paiement que l'API refusera.
 */
export function PaymentPanel({ booking, onPaid }: { booking: Booking; onPaid: (booking: Booking) => void }) {
  const [provider, setProvider] = useState<MobileMoneyProvider>("orange_money");
  const [msisdn, setMsisdn] = useState(booking.customer_phone);
  const [failure, setFailure] = useState<string | null>(null);

  const remaining = useCountdown(booking.expires_at);
  const isExpired = remaining === 0;

  const payAction = useCallback(
    (input: { provider: MobileMoneyProvider; msisdn: string }) =>
      bookingService.payWithMobileMoney(booking.id, input.provider, input.msisdn),
    [booking.id],
  );
  const payment = useMutation(payAction);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setFailure(null);

    const result = await payment.run({ provider, msisdn: msisdn.trim() });
    if (!result) return;

    if (result.payment.status === "succeeded") {
      onPaid(result.booking);
    } else if (result.payment.status === "failed") {
      setFailure(result.payment.failure_reason ?? "Le paiement a ete refuse par l'operateur.");
    } else {
      setFailure("Validez le debit sur votre telephone, puis actualisez cette page.");
    }
  }

  const minutes = Math.floor(remaining / 60);
  const seconds = String(remaining % 60).padStart(2, "0");
  const selected = MOBILE_MONEY_PROVIDERS.find((item) => item.value === provider);

  return (
    <Card>
      <CardHeader
        icon={<IconWallet className="h-4 w-4" />}
        title="Payer par mobile money"
        description={`Montant a regler : ${formatMoney(booking.total_amount)}`}
        actions={
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-sm font-bold tabular-nums",
              remaining < 120 ? "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300" : "bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300",
            )}
            aria-live="polite"
          >
            <IconClock className="h-4 w-4" />
            {minutes}:{seconds}
          </span>
        }
      />
      <CardBody>
        <form onSubmit={submit} noValidate className="space-y-5">
          <fieldset>
            <legend className="mb-3 text-sm font-semibold">Votre operateur</legend>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {MOBILE_MONEY_PROVIDERS.map((item) => {
                const isActive = item.value === provider;

                return (
                  <label
                    key={item.value}
                    className={cn(
                      "relative flex cursor-pointer flex-col items-center gap-2 rounded-sm border p-3 text-center text-xs font-bold transition-all",
                      isActive
                        ? "border-brand-500 bg-brand-50 shadow-card dark:bg-brand-900/20"
                        : "border-[var(--hairline)] bg-[var(--surface)] hover:border-brand-300",
                    )}
                  >
                    <input
                      type="radio"
                      name="provider"
                      value={item.value}
                      checked={isActive}
                      onChange={() => setProvider(item.value)}
                      className="sr-only"
                    />
                    <span className="h-8 w-8 rounded-full ring-2 ring-white dark:ring-stone-900" style={{ backgroundColor: item.swatch }} />
                    {item.label}
                  </label>
                );
              })}
            </div>
          </fieldset>

          <TextField
            label="Numero a debiter"
            type="tel"
            inputMode="tel"
            placeholder="+225 07 00 00 00 00"
            value={msisdn}
            onChange={(event) => setMsisdn(event.target.value)}
            errors={payment.fieldErrors.payer_msisdn}
            hint={`Une demande de validation arrivera sur ce numero (${selected?.ussd}).`}
            required
          />

          {isExpired ? (
            <FormAlert tone="warning">Le delai de paiement est ecoule : les places ont ete remises en vente.</FormAlert>
          ) : null}
          {failure ? <FormAlert>{failure}</FormAlert> : null}
          {payment.error ? <FormAlert>{errorMessage(payment.error)}</FormAlert> : null}

          <Button type="submit" size="lg" className="w-full" isLoading={payment.isPending} disabled={isExpired}>
            Payer {formatMoney(booking.total_amount)}
          </Button>

          <p className="flex items-center justify-center gap-1.5 text-xs text-[var(--muted)]">
            <IconLock className="h-3.5 w-3.5" /> Paiement securise par notre agregateur. Aucune donnee bancaire n&apos;est conservee.
          </p>
        </form>
      </CardBody>
    </Card>
  );
}
