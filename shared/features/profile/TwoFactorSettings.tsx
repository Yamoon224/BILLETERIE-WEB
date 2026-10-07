"use client";

import QRCode from "qrcode";
import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Badge, Button, Card, CardBody, CardHeader, FormAlert, PasswordField, TextField } from "@kaara/shared/components/ui";
import { IconShield } from "@kaara/shared/components/ui/icons";
import { useMutation } from "@kaara/shared/hooks/useMutation";
import { errorMessage } from "@kaara/shared/lib/api-client";
import { authService } from "@kaara/shared/services";
import type { TwoFactorEnrollment } from "@kaara/shared/services/auth-service";

type Status = "loading" | "disabled" | "enrolling" | "enabled";

/**
 * Reservee au role platform_admin - le backend refuse les autres roles avec un
 * 403 - donc affichee seulement pour eux : inutile de montrer a un agent ou un
 * gestionnaire un bouton qu'il ne pourrait de toute facon pas activer.
 *
 * Le QR code est genere entierement cote client (librairie `qrcode`, aucun
 * appel reseau) : le secret ne quitte jamais la reponse deja recue de l'API
 * pour transiter par un service tiers de generation d'image.
 */
export function TwoFactorSettings() {
  const [status, setStatus] = useState<Status>("loading");
  const [enrollment, setEnrollment] = useState<TwoFactorEnrollment | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [showDisableForm, setShowDisableForm] = useState(false);

  useEffect(() => {
    let active = true;

    authService
      .twoFactorStatus()
      .then((enabled) => {
        if (active) setStatus(enabled ? "enabled" : "disabled");
      })
      .catch(() => {
        if (active) setStatus("disabled");
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!enrollment) return;

    let active = true;

    QRCode.toDataURL(enrollment.otpauth_url, { margin: 1, width: 220 })
      .then((url) => {
        if (active) setQrDataUrl(url);
      })
      .catch(() => {
        if (active) setQrDataUrl(null);
      });

    return () => {
      active = false;
    };
  }, [enrollment]);

  const enableAction = useCallback((): Promise<TwoFactorEnrollment> => authService.enableTwoFactor(), []);
  const enable = useMutation<void, TwoFactorEnrollment>(enableAction);

  const confirmAction = useCallback((value: string) => authService.confirmTwoFactor(value), []);
  const confirm = useMutation(confirmAction);

  const disableAction = useCallback((value: string) => authService.disableTwoFactor(value), []);
  const disable = useMutation(disableAction);

  async function startEnrollment() {
    const result = await enable.run();
    if (result) {
      setEnrollment(result);
      setCode("");
      confirm.reset();
      setStatus("enrolling");
    }
  }

  async function submitConfirm(event: FormEvent) {
    event.preventDefault();
    const result = await confirm.run(code.trim());
    if (result !== null) {
      setStatus("enabled");
      setEnrollment(null);
      setQrDataUrl(null);
      setCode("");
    }
  }

  function cancelEnrollment() {
    setEnrollment(null);
    setQrDataUrl(null);
    setCode("");
    confirm.reset();
    setStatus("disabled");
  }

  async function submitDisable(event: FormEvent) {
    event.preventDefault();
    const result = await disable.run(password);
    if (result !== null) {
      setStatus("disabled");
      setShowDisableForm(false);
      setPassword("");
    }
  }

  if (status === "loading") return null;

  return (
    <Card>
      <CardHeader
        icon={<IconShield className="h-4 w-4" />}
        title="Verification en deux etapes"
        description="Un code genere par une application d'authentification (Google Authenticator, Authy...), en plus du mot de passe."
      />
      <CardBody className="space-y-4">
        {status === "enabled" ? (
          <div className="space-y-4">
            <Badge tone="success">Activee</Badge>

            {!showDisableForm ? (
              <div>
                <Button variant="secondary" onClick={() => setShowDisableForm(true)}>
                  Desactiver
                </Button>
              </div>
            ) : (
              <form onSubmit={submitDisable} className="space-y-3">
                <PasswordField
                  label="Mot de passe actuel"
                  placeholder="Confirmez avec votre mot de passe"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  errors={disable.fieldErrors.password}
                  autoComplete="current-password"
                  required
                />
                {disable.error && !Object.keys(disable.fieldErrors).length ? (
                  <FormAlert>{errorMessage(disable.error)}</FormAlert>
                ) : null}
                <div className="flex gap-2">
                  <Button type="submit" variant="danger" isLoading={disable.isPending}>
                    Confirmer la desactivation
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setShowDisableForm(false);
                      setPassword("");
                      disable.reset();
                    }}
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            )}
          </div>
        ) : status === "enrolling" && enrollment ? (
          <form onSubmit={submitConfirm} className="space-y-4">
            <p className="text-sm text-[var(--muted)]">
              Scannez ce code avec votre application d&apos;authentification, ou saisissez la cle manuellement si vous ne
              pouvez pas scanner.
            </p>

            {qrDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- data: URI genere localement, pas une image distante.
              <img
                src={qrDataUrl}
                alt="QR code d'inscription a la verification en deux etapes"
                width={220}
                height={220}
                className="rounded-sm border border-[var(--hairline)]"
              />
            ) : null}

            <div>
              <p className="mb-1 text-xs font-semibold text-[var(--muted)]">Cle manuelle</p>
              <code className="block break-all rounded-sm bg-[var(--surface-muted)] px-3 py-2 text-sm">
                {enrollment.secret}
              </code>
            </div>

            <TextField
              label="Code a 6 chiffres"
              placeholder="123456"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              errors={confirm.fieldErrors.code}
              required
            />

            {confirm.error && !Object.keys(confirm.fieldErrors).length ? (
              <FormAlert>{errorMessage(confirm.error)}</FormAlert>
            ) : null}

            <div className="flex gap-2">
              <Button type="submit" isLoading={confirm.isPending}>
                Confirmer
              </Button>
              <Button type="button" variant="ghost" onClick={cancelEnrollment}>
                Annuler
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-3">
            <Badge>Desactivee</Badge>
            {enable.error ? <FormAlert>{errorMessage(enable.error)}</FormAlert> : null}
            <div>
              <Button onClick={startEnrollment} isLoading={enable.isPending}>
                Activer la verification en deux etapes
              </Button>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
