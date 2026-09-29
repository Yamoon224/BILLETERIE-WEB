"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import { Button, FormAlert, LoadingState, Modal, TextField } from "@/components/ui";
import { IconCash, IconCheckCircle, IconPrinter, IconRefresh, IconWifiOff } from "@/components/ui/icons";
import { useAuth } from "@/features/auth/AuthContext";
import { SeatPicker } from "@/features/booking/SeatPicker";
import { errorMessage } from "@/lib/api-client";
import { cn } from "@/lib/cn";
import { formatMoney, formatTime } from "@/lib/format";
import { MOBILE_MONEY_PROVIDERS } from "@/lib/labels";
import type { MobileMoneyProvider, Trip } from "@/types/api";
import { CashierClosing } from "./CashierClosing";
import { tripLabel, useCounterSale } from "./useCounterSale";

/**
 * Guichet en mode tablette : meme vente qu'au comptoir du dashboard
 * (`CounterSale`, meme hook `useCounterSale`), presentee pour un usage debout,
 * a l'ecran tactile, dans une file d'attente - cibles larges, un seul geste
 * par etape, recu plein ecran entre deux clients.
 */
export function TabletCounter() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [view, setView] = useState<"pos" | "caisse">("pos");
  const [isLeaving, setIsLeaving] = useState(false);
  const sale = useCounterSale();

  async function leave() {
    setIsLeaving(true);
    await logout().catch(() => undefined);
    router.replace("/login");
  }

  return (
    <div className="min-h-dvh bg-[#EDEAE4] p-4">
      <div className="mx-auto flex max-w-5xl flex-col overflow-hidden rounded-2xl bg-[var(--surface)] shadow-card">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--hairline)] px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-brand-500" />
            <div>
              <p className="text-[14.5px] font-extrabold tracking-tight">{user?.station?.name ?? "Guichet"}</p>
              <p className="text-[11px] text-[var(--muted)]">Agent : {user?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <SyncBadge queue={sale.queue} />
            <Button variant="ghost" size="sm" onClick={leave} isLoading={isLeaving}>
              Deconnexion
            </Button>
          </div>
        </header>

        {view === "pos" ? (
          <PosView sale={sale} onOpenCaisse={() => setView("caisse")} />
        ) : (
          <CashierClosing onBack={() => setView("pos")} />
        )}
      </div>
    </div>
  );
}

function SyncBadge({ queue }: { queue: ReturnType<typeof useCounterSale>["queue"] }) {
  const pending = queue.sales.length;

  if (!queue.isOnline) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-sm bg-fuchsia-100 px-3 py-1.5 text-xs font-bold text-fuchsia-800 dark:bg-fuchsia-950 dark:text-fuchsia-200">
        <IconWifiOff className="h-3.5 w-3.5" />
        {pending > 0 ? `${pending} vente${pending > 1 ? "s" : ""} en attente (hors ligne)` : "Hors ligne"}
      </span>
    );
  }

  if (pending > 0) {
    return (
      <button
        type="button"
        onClick={() => void queue.synchronise()}
        disabled={queue.isSyncing}
        className="inline-flex items-center gap-1.5 rounded-sm bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-800 transition-colors hover:bg-amber-200 dark:bg-amber-950 dark:text-amber-200"
      >
        <IconRefresh className={cn("h-3.5 w-3.5", queue.isSyncing && "animate-spin")} />
        {pending} vente{pending > 1 ? "s" : ""} a synchroniser
      </button>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-sm bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
      <IconCheckCircle className="h-3.5 w-3.5" />
      Synchronise
    </span>
  );
}

function PosView({ sale, onOpenCaisse }: { sale: ReturnType<typeof useCounterSale>; onOpenCaisse: () => void }) {
  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    void sale.submit();
  }

  return (
    <div className="flex flex-col md:flex-row">
      <aside className="shrink-0 border-b border-[var(--hairline)] p-4 md:w-64 md:border-b-0 md:border-r">
        {sale.isLoadingTrips ? (
          <LoadingState label="Chargement des departs…" className="py-6" />
        ) : sale.trips.length === 0 ? (
          <p className="py-6 text-center text-sm text-[var(--muted)]">Aucun depart ouvert a la vente.</p>
        ) : (
          <div className="space-y-2.5">
            {sale.trips.map((trip) => (
              <DepartureCard key={trip.id} trip={trip} isActive={trip.id === sale.tripId} onSelect={() => sale.selectTrip(trip.id)} />
            ))}
          </div>
        )}
      </aside>

      <div className="min-w-0 flex-1 p-4 sm:p-5">
        {!sale.tripId ? (
          <p className="py-10 text-center text-sm text-[var(--muted)]">Choisissez un depart a gauche pour commencer la vente.</p>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
            <div>
              <p className="mb-2.5 text-sm font-bold tracking-tight">1. Choisir un siege</p>
              {sale.isLoadingSeatMap && !sale.seatMap ? (
                <LoadingState label="Chargement du plan de salle…" />
              ) : sale.seatMap ? (
                <SeatPicker seatMap={sale.seatMap} selected={sale.seats} max={4} onChange={sale.setSeats} />
              ) : (
                <p className="text-sm text-[var(--muted)]">Plan de salle indisponible hors ligne pour ce depart.</p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm font-bold tracking-tight">2. Passager</p>
              <div className="grid grid-cols-2 gap-2.5">
                <TextField label="Nom" placeholder="Kouassi Aicha" value={sale.customerName} onChange={(event) => sale.setCustomerName(event.target.value)} required />
                <TextField label="Telephone" type="tel" placeholder="07 XX XX XX XX" value={sale.customerPhone} onChange={(event) => sale.setCustomerPhone(event.target.value)} required />
              </div>

              <p className="text-sm font-bold tracking-tight">3. Paiement</p>
              <div className="flex flex-wrap gap-2">
                <PaymentChip
                  label="Especes"
                  active={sale.method === "cash"}
                  onClick={() => sale.setMethod("cash")}
                />
                {sale.queue.isOnline
                  ? MOBILE_MONEY_PROVIDERS.map((item) => (
                      <PaymentChip
                        key={item.value}
                        label={item.label}
                        active={sale.method === "mobile_money" && sale.provider === item.value}
                        onClick={() => {
                          sale.setMethod("mobile_money");
                          sale.setProvider(item.value as MobileMoneyProvider);
                        }}
                      />
                    ))
                  : null}
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] px-4 py-3.5">
                <div>
                  <p className="text-2xl font-extrabold tracking-tight">{formatMoney(sale.total)}</p>
                  <p className="text-[10.5px] text-[var(--muted)]">
                    Siege {sale.seats.length ? sale.seats.join(", ") : "-"} · {sale.method === "cash" ? "Especes" : MOBILE_MONEY_PROVIDERS.find((item) => item.value === sale.provider)?.label}
                  </p>
                </div>
                <Button
                  type="submit"
                  size="lg"
                  variant="brand"
                  icon={<IconCash className="h-4 w-4" />}
                  isLoading={sale.isSubmitting}
                  disabled={!sale.selectedTrip || sale.seats.length === 0 || !sale.customerName.trim() || !sale.customerPhone.trim()}
                >
                  {sale.queue.isOnline ? "Encaisser et imprimer" : "Enregistrer hors ligne"}
                </Button>
              </div>

              {sale.error ? <FormAlert>{errorMessage(sale.error)}</FormAlert> : null}
            </form>
          </div>
        )}

        <button type="button" onClick={onOpenCaisse} className="mt-6 block text-center text-xs font-bold text-brand-600 hover:underline">
          Voir la cloture de caisse →
        </button>
      </div>

      {sale.receipt ? <ReceiptModal receipt={sale.receipt} onClose={() => sale.setReceipt(null)} /> : null}
    </div>
  );
}

function DepartureCard({ trip, isActive, onSelect }: { trip: Trip; isActive: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full rounded-2xl border px-3.5 py-3 text-left transition-all",
        isActive ? "border-[#0e1a3a] bg-[var(--surface)] shadow-sm ring-1 ring-[#0e1a3a]" : "border-[var(--hairline)] bg-[var(--surface-muted)] hover:border-brand-300",
      )}
    >
      <p className="text-xs font-bold text-[var(--foreground)]">{trip.company?.name ?? tripLabel(trip)}</p>
      <p className="mt-0.5 text-xl font-extrabold tracking-tight">{formatTime(trip.departs_at)}</p>
      {trip.seats_available !== null ? (
        <p className="mt-0.5 text-[10px] font-semibold text-rose-600">{trip.seats_available} places restantes</p>
      ) : null}
    </button>
  );
}

function PaymentChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-2xl border px-4 py-2.5 text-xs font-bold transition-colors",
        active ? "border-[#0e1a3a] bg-[#0e1a3a] text-white" : "border-[var(--hairline)] text-[var(--foreground)] hover:border-brand-300",
      )}
    >
      {label}
    </button>
  );
}

function ReceiptModal({ receipt, onClose }: { receipt: NonNullable<ReturnType<typeof useCounterSale>["receipt"]>; onClose: () => void }) {
  return (
    <Modal isOpen onClose={onClose} title={receipt.kind === "online" ? "Billet enregistre" : "Vente enregistree hors ligne"} size="sm">
      <div className="flex flex-col items-center py-2 text-center">
        <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-brand-500 text-white">
          <IconCheckCircle className="h-5 w-5" />
        </span>
        {receipt.kind === "online" ? (
          <>
            <p className="text-sm text-[var(--muted)]">Connecte a l&apos;impression du navigateur</p>
            <div className="mt-4 w-full space-y-1.5 text-left text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Reference</span>
                <b>{receipt.booking.reference}</b>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Siege</span>
                <b>{receipt.booking.tickets?.map((ticket) => ticket.seat_number).join(", ")}</b>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Montant</span>
                <b>{formatMoney(receipt.booking.total_amount)}</b>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="mt-4 w-full"
              icon={<IconPrinter className="h-3.5 w-3.5" />}
              onClick={() => window.open(`/tickets/${receipt.booking.reference}`, "_blank", "noopener")}
            >
              Imprimer le billet
            </Button>
          </>
        ) : (
          <>
            <p className="text-sm text-[var(--muted)]">A synchroniser des le retour du reseau</p>
            <div className="mt-4 w-full space-y-1.5 text-left text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Trajet</span>
                <b>{receipt.tripLabel}</b>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Siege</span>
                <b>{receipt.seats.join(", ")}</b>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Montant</span>
                <b>{formatMoney(receipt.total)}</b>
              </div>
            </div>
          </>
        )}
        <Button className="mt-3 w-full" onClick={onClose}>
          Vente suivante
        </Button>
      </div>
    </Modal>
  );
}
