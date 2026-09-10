"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Badge, Button, Card, CardBody, CardHeader, EmptyState, FormAlert, SelectField, TextField } from "@/components/ui";
import { IconAlert, IconBan, IconCheckCircle, IconQrCode, IconRefresh, IconScan, IconWifiOff } from "@/components/ui/icons";
import { useAsyncData } from "@/hooks/useAsyncData";
import { useOfflineQueue } from "@/hooks/useOfflineQueue";
import { NetworkError, errorMessage } from "@/lib/api-client";
import { cn } from "@/lib/cn";
import { formatDateTime, formatTime, todayIso } from "@/lib/format";
import {
  cachedManifest,
  cachedTrips,
  cacheManifest,
  cacheTrips,
  enqueueScan,
  newClientReference,
  queuedScans,
  ticketCodeFromScan,
} from "@/lib/offline-store";
import { bookingService, ticketService, tripService } from "@/services";
import type { ScanResult, Ticket, Trip } from "@/types/api";

/** Departs du jour a controler : en ligne si possible, sinon depuis le cache du poste. */
async function loadBoardableTrips(): Promise<Trip[]> {
  try {
    const page = await tripService.list({ from: todayIso(), to: todayIso(1), per_page: 100, sort: "departs_at", direction: "asc" });
    const boardable = page.data.filter((trip) => trip.status === "scheduled" || trip.status === "boarding");
    cacheTrips(boardable);
    return boardable;
  } catch {
    return cachedTrips().trips;
  }
}

type Verdict =
  | { source: "online"; result: ScanResult }
  | { source: "offline"; accepted: boolean; label: string; ticket: Ticket | null };

interface BarcodeDetectorLike {
  detect(source: HTMLVideoElement): Promise<Array<{ rawValue: string }>>;
}

/**
 * Controle a l'embarquement.
 *
 * Deux modes, une seule regle : **un billet deja scanne est refuse**.
 *
 * - En ligne, le verdict vient du serveur, qui decide sous verrou de ligne
 *   (voir TicketValidationService) et verifie la signature du QR.
 * - Hors ligne, le verdict vient de la liste d'embarquement mise en cache et
 *   du journal local des scans : un code absent de la liste, annule, deja
 *   embarque ou deja scanne sur ce poste est refuse. Les scans acceptes sont
 *   rejoues au serveur au retour du reseau, avec leur reference client.
 *
 * La lecture camera utilise l'API BarcodeDetector quand le navigateur la
 * propose (Chrome sur Android) ; sinon, et toujours en secours, le code
 * imprime sous le QR se saisit a la main.
 */
export function BoardingControl() {
  const queue = useOfflineQueue();

  const { data: tripsData } = useAsyncData(loadBoardableTrips);
  const trips = tripsData ?? [];
  const [tripId, setTripId] = useState("");

  const manifestLoader = useCallback(async (): Promise<{ savedAt: string; tickets: Ticket[] } | null> => {
    if (!tripId) return null;
    try {
      const tickets = await bookingService.manifest(tripId);
      cacheManifest(tripId, tickets);
      return { savedAt: new Date().toISOString(), tickets };
    } catch {
      return cachedManifest(tripId);
    }
  }, [tripId]);
  const { data: manifest, reload: reloadManifest } = useAsyncData(manifestLoader);
  const [manual, setManual] = useState("");
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const boardedCount = useMemo(() => {
    const local = new Set(queue.scans.filter((scan) => scan.trip_id === tripId).map((scan) => scan.code));
    return (manifest?.tickets ?? []).filter((ticket) => ticket.is_scanned || local.has(ticket.code)).length;
  }, [manifest, tripId, queue.scans]);

  function selectTrip(id: string) {
    setTripId(id);
    setVerdict(null);
  }

  const activeTickets = (manifest?.tickets ?? []).filter((ticket) => ticket.seat_number !== null);

  const check = useCallback(
    async (scanned: string) => {
      if (!tripId || !scanned.trim()) return;

      setIsChecking(true);
      setError(null);
      const clientReference = newClientReference("SCAN");

      try {
        const result = await ticketService.validate({ code: scanned, trip_id: tripId, client_reference: clientReference });
        setVerdict({ source: "online", result });
        if (result.accepted) reloadManifest();
      } catch (caught) {
        if (!(caught instanceof NetworkError)) {
          setError(errorMessage(caught));
          return;
        }

        // --- Verdict local ------------------------------------------------------
        const code = ticketCodeFromScan(scanned);
        const ticket = manifest?.tickets.find((item) => item.code === code) ?? null;
        const alreadyLocal = queuedScans().some((scan) => scan.code === code);

        if (!ticket) {
          setVerdict({ source: "offline", accepted: false, label: "Billet absent de la liste de ce depart", ticket: null });
        } else if (ticket.is_scanned || alreadyLocal) {
          setVerdict({ source: "offline", accepted: false, label: "Billet deja utilise", ticket });
        } else if (ticket.status !== "issued") {
          setVerdict({ source: "offline", accepted: false, label: ticket.status_label, ticket });
        } else {
          enqueueScan({ client_reference: clientReference, code, trip_id: tripId, scanned_at: new Date().toISOString() });
          setVerdict({ source: "offline", accepted: true, label: "Embarquement autorise (hors ligne)", ticket });
        }
      } finally {
        setIsChecking(false);
        setManual("");
      }
    },
    [tripId, manifest, reloadManifest],
  );

  function submitManual(event: FormEvent) {
    event.preventDefault();
    void check(manual);
  }

  const selectedTrip = trips.find((trip) => trip.id === tripId);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
      <div className="space-y-6">
        <Card>
          <CardBody className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
            <SelectField label="Depart controle" value={tripId} onChange={(event) => selectTrip(event.target.value)}>
              <option value="">Choisir le car devant lequel vous vous trouvez</option>
              {trips.map((trip) => (
                <option key={trip.id} value={trip.id}>
                  {formatTime(trip.departs_at)} · {trip.itinerary?.origin_city?.name} → {trip.itinerary?.destination_city?.name} ·{" "}
                  {trip.vehicle?.registration}
                </option>
              ))}
            </SelectField>
            <Button variant="secondary" onClick={reloadManifest} disabled={!tripId} icon={<IconRefresh className="h-4 w-4" />}>
              Liste
            </Button>
          </CardBody>
        </Card>

        {!tripId ? (
          <Card>
            <EmptyState
              icon={<IconScan className="h-5 w-5" />}
              title="Choisissez un depart"
              description="La liste d'embarquement est chargee et gardee sur ce poste : le controle continue meme si le reseau coupe."
            />
          </Card>
        ) : (
          <>
            <VerdictPanel verdict={verdict} isChecking={isChecking} />

            <Card>
              <CardHeader icon={<IconQrCode className="h-4 w-4" />} title="Scanner un billet" />
              <CardBody className="space-y-4">
                <CameraScanner onDetected={check} disabled={isChecking} />
                <form onSubmit={submitManual} className="flex flex-col gap-3 sm:flex-row sm:items-start">
                  <TextField
                    label="Code du billet"
                    placeholder="BIL-K7M3XZ"
                    value={manual}
                    onChange={(event) => setManual(event.target.value)}
                    autoCapitalize="characters"
                    hint="Saisie manuelle si le QR code est illisible."
                    fieldClassName="flex-1"
                  />
                  <Button type="submit" size="lg" className="sm:mt-1.5" isLoading={isChecking} disabled={!manual.trim()}>
                    Controler
                  </Button>
                </form>
                {error ? <FormAlert>{error}</FormAlert> : null}
              </CardBody>
            </Card>
          </>
        )}
      </div>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        {selectedTrip ? (
          <Card>
            <CardBody className="space-y-3">
              <p className="text-sm font-bold">
                {formatTime(selectedTrip.departs_at)} · {selectedTrip.itinerary?.origin_city?.name} →{" "}
                {selectedTrip.itinerary?.destination_city?.name}
              </p>
              <div>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-extrabold tabular-nums">{boardedCount}</span>
                  <span className="text-sm text-[var(--muted)]">sur {activeTickets.length} billets</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--surface-muted)]">
                  <div
                    className="grad-brand h-full rounded-full transition-all"
                    style={{ width: `${activeTickets.length ? (boardedCount / activeTickets.length) * 100 : 0}%` }}
                  />
                </div>
              </div>
              {manifest ? <p className="text-xs text-[var(--muted)]">Liste mise a jour le {formatDateTime(manifest.savedAt)}</p> : null}
            </CardBody>
          </Card>
        ) : null}

        {queue.scans.length > 0 || !queue.isOnline ? (
          <Card>
            <CardHeader
              icon={<IconWifiOff className="h-4 w-4" />}
              title="Controles hors ligne"
              description={`${queue.scans.length} scan${queue.scans.length > 1 ? "s" : ""} a synchroniser.`}
              actions={
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => void queue.synchronise()}
                  isLoading={queue.isSyncing}
                  disabled={!queue.isOnline || queue.scans.length === 0}
                >
                  Envoyer
                </Button>
              }
            />
            {queue.rejectedScans.length > 0 ? (
              <CardBody>
                <FormAlert tone="warning">
                  Refuses par le serveur :
                  <ul className="mt-1 list-disc pl-4">
                    {queue.rejectedScans.map((item) => (
                      <li key={item.code}>
                        {item.code} — {item.reason}
                      </li>
                    ))}
                  </ul>
                </FormAlert>
              </CardBody>
            ) : null}
          </Card>
        ) : null}
      </aside>
    </div>
  );
}

/**
 * Verdict en grand, lisible a un metre : l'agent regarde le voyageur, pas
 * l'ecran. Vert pour monter, rouge pour refuser, et le motif en toutes lettres.
 */
function VerdictPanel({ verdict, isChecking }: { verdict: Verdict | null; isChecking: boolean }) {
  if (isChecking) {
    return (
      <div className="flex h-40 items-center justify-center rounded-sm border border-[var(--hairline)] bg-[var(--surface)] text-sm text-[var(--muted)]">
        Verification…
      </div>
    );
  }

  if (!verdict) {
    return (
      <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-sm border-2 border-dashed border-[var(--hairline)] text-sm text-[var(--muted)]">
        <IconScan className="h-8 w-8" />
        Presentez un billet
      </div>
    );
  }

  const accepted = verdict.source === "online" ? verdict.result.accepted : verdict.accepted;
  const label = verdict.source === "online" ? verdict.result.outcome_label : verdict.label;
  const ticket = verdict.source === "online" ? verdict.result.ticket : verdict.ticket;
  const suspicious = verdict.source === "online" && verdict.result.is_suspicious;
  const Icon = accepted ? IconCheckCircle : suspicious ? IconAlert : IconBan;

  return (
    <div
      role="status"
      aria-live="assertive"
      className={cn(
        "animate-fade-rise flex flex-col items-center gap-3 rounded-sm p-6 text-center text-white shadow-card sm:flex-row sm:text-left",
        accepted ? "bg-[var(--color-flag-green)]" : "bg-rose-600",
      )}
    >
      <Icon className="h-14 w-14 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-2xl font-extrabold">{label}</p>
        {ticket ? (
          <p className="mt-1 text-lg">
            Place <strong>{ticket.seat_number ?? "—"}</strong> · {ticket.passenger_name}
          </p>
        ) : null}
        {verdict.source === "online" && verdict.result.previously_scanned_at ? (
          <p className="mt-1 text-sm opacity-90">Premier passage le {formatDateTime(verdict.result.previously_scanned_at)}</p>
        ) : null}
      </div>
      {verdict.source === "offline" ? <Badge tone="warning">Hors ligne</Badge> : null}
    </div>
  );
}

function CameraScanner({ onDetected, disabled }: { onDetected: (value: string) => void; disabled: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const lastValue = useRef<{ value: string; at: number } | null>(null);

  const supported = typeof window !== "undefined" && "BarcodeDetector" in window;

  useEffect(() => {
    if (!isActive) return;

    let stream: MediaStream | null = null;
    let frame = 0;
    let cancelled = false;

    const Detector = (window as unknown as { BarcodeDetector: new (options: { formats: string[] }) => BarcodeDetectorLike }).BarcodeDetector;
    const detector = new Detector({ formats: ["qr_code"] });

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then((media) => {
        if (cancelled) return media.getTracks().forEach((track) => track.stop());
        stream = media;
        if (videoRef.current) {
          videoRef.current.srcObject = media;
          void videoRef.current.play();
        }

        const tick = async () => {
          if (cancelled || !videoRef.current) return;
          try {
            const codes = await detector.detect(videoRef.current);
            const value = codes[0]?.rawValue;
            const now = Date.now();
            // Le meme QR reste devant la camera plusieurs secondes : on ignore
            // les lectures repetees, sinon le second passage serait compte
            // comme une tentative de reutilisation.
            if (value && (!lastValue.current || lastValue.current.value !== value || now - lastValue.current.at > 4000)) {
              lastValue.current = { value, at: now };
              onDetected(value);
            }
          } catch {
            /* image illisible : on reessaie a la trame suivante */
          }
          frame = window.setTimeout(() => void tick(), 350);
        };

        void tick();
      })
      .catch(() => setMessage("Camera inaccessible. Autorisez-la dans le navigateur ou saisissez le code."));

    return () => {
      cancelled = true;
      window.clearTimeout(frame);
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [isActive, onDetected]);

  if (!supported) {
    return <p className="text-sm text-[var(--muted)]">Lecture camera non disponible sur ce navigateur : utilisez la saisie du code.</p>;
  }

  return (
    <div className="space-y-2">
      {isActive ? (
        <div className="relative overflow-hidden rounded-sm bg-black">
          <video ref={videoRef} className="aspect-video w-full object-cover" muted playsInline />
          <div className="pointer-events-none absolute inset-8 rounded-sm border-2 border-brand-400/80" />
        </div>
      ) : null}
      <Button
        variant={isActive ? "secondary" : "primary"}
        onClick={() => setIsActive((value) => !value)}
        disabled={disabled && !isActive}
        icon={<IconScan className="h-4 w-4" />}
        className="w-full"
      >
        {isActive ? "Arreter la camera" : "Scanner avec la camera"}
      </Button>
      {message ? <p className="text-xs text-rose-600">{message}</p> : null}
    </div>
  );
}
