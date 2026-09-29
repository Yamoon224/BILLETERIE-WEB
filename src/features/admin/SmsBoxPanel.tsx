"use client";

import { useCallback, useState } from "react";
import type { FormEvent } from "react";
import { Badge, Button, Card, CardHeader, ErrorState, FormAlert, LoadingState, Modal, StatCard, TextField } from "@/components/ui";
import { IconCash, IconCheckCircle, IconClock, IconWallet } from "@/components/ui/icons";
import { useAsyncData } from "@/hooks/useAsyncData";
import { useMutation } from "@/hooks/useMutation";
import { errorMessage } from "@/lib/api-client";
import { cn } from "@/lib/cn";
import { formatDateTime, formatMoney, formatNumber, formatPercent } from "@/lib/format";
import { smsService } from "@/services";
import type { SimCard } from "@/types/api";

/**
 * Solde de reference pour la jauge visuelle des cartes SIM.
 *
 * Purement decoratif - il n'existe aucun plafond metier a un solde de carte
 * SIM - mais une barre pleine ou vide sans reperer sur rien ne dit rien a
 * l'oeil ; ce plafond donne un repere stable d'une carte a l'autre.
 */
const BALANCE_GAUGE_MAX = 10_000;

const STATUS_TONE_BY_OPERATOR: Record<string, string> = {
  orange: "from-[#FF8A3D] to-[#CC5500]",
  mtn: "from-[#FFDE59] to-[#B38F00]",
  moov: "from-[#4FC3F7] to-[#0072BC]",
};

export function SmsBoxPanel() {
  const [rechargingSim, setRechargingSim] = useState<SimCard | null>(null);
  const loader = useCallback(() => smsService.overview(), []);
  const { data, isLoading, error, reload } = useAsyncData(loader);

  if (isLoading && !data) return <LoadingState label="Chargement du SMS Box…" />;
  if (error && !data) return <ErrorState error={error} onRetry={reload} />;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="SMS envoyes aujourd'hui" value={formatNumber(data.stats.sent_today)} tone="brand" icon={<IconCheckCircle className="h-5 w-5" />} />
        <StatCard label="Taux de delivrance" value={formatPercent(data.stats.delivery_rate / 100)} icon={<IconWallet className="h-5 w-5" />} />
        <StatCard label="En file d'attente" value={formatNumber(data.stats.queued)} tone={data.stats.queued > 0 ? "warning" : "neutral"} icon={<IconClock className="h-5 w-5" />} />
      </div>

      <Card>
        <CardHeader title="Etat des cartes SIM" />
        <div className="grid gap-4 p-4 sm:grid-cols-3 sm:p-5">
          {data.sim_cards.map((sim) => (
            <div key={sim.id} className={cn("rounded-2xl bg-gradient-to-br p-4 text-white shadow-card", STATUS_TONE_BY_OPERATOR[sim.operator] ?? "from-stone-600 to-stone-800")}>
              <p className="mb-3 font-extrabold tracking-tight">{sim.operator_label}</p>
              <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-white/35">
                <div className="h-full rounded-full bg-white" style={{ width: `${Math.min(100, (sim.balance / BALANCE_GAUGE_MAX) * 100)}%` }} />
              </div>
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10.5px] font-bold">
                  {sim.is_low_balance ? "⚠ Credit bas" : "✓ Active"} — {formatMoney(sim.balance)}
                </p>
                <button type="button" onClick={() => setRechargingSim(sim)} className="text-[10.5px] font-bold underline decoration-white/50 underline-offset-2 hover:decoration-white">
                  Recharger
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader title="File d'envoi recente" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="grad-brand text-white">
              <tr>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider">Destinataire</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider">Operateur</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider">Reference</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider">Statut</th>
              </tr>
            </thead>
            <tbody>
              {data.recent_queue.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-sm text-[var(--muted)]">
                    Aucun envoi pour le moment.
                  </td>
                </tr>
              ) : (
                data.recent_queue.map((item) => (
                  <tr key={item.id} className="border-b border-[var(--hairline)] last:border-0 even:bg-[var(--surface-muted)]/50">
                    <td className="px-4 py-3">{item.recipient}</td>
                    <td className="px-4 py-3">{item.operator ?? "—"}</td>
                    <td className="px-4 py-3 font-mono text-xs">{item.reference}</td>
                    <td className="px-4 py-3">
                      <Badge tone={item.status === "sent" ? "success" : item.status === "failed" ? "danger" : "warning"}>{item.status_label}</Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {data.recent_queue.length > 0 ? (
          <p className="border-t border-[var(--hairline)] px-4 py-2 text-xs text-[var(--muted)] sm:px-5">
            Dernier envoi : {formatDateTime(data.recent_queue[0]?.created_at)}
          </p>
        ) : null}
      </Card>

      {rechargingSim ? (
        <RechargeDialog
          sim={rechargingSim}
          onClose={() => setRechargingSim(null)}
          onSaved={() => {
            setRechargingSim(null);
            reload();
          }}
        />
      ) : null}
    </div>
  );
}

function RechargeDialog({ sim, onClose, onSaved }: { sim: SimCard; onClose: () => void; onSaved: () => void }) {
  const [balance, setBalance] = useState(String(sim.balance));
  const save = useMutation((value: number) => smsService.updateSimCard(sim.id, { balance: value }));

  async function submit(event: FormEvent) {
    event.preventDefault();
    const result = await save.run(Number(balance));
    if (result) onSaved();
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={`Recharger la carte ${sim.operator_label}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" form="sim-recharge-form" isLoading={save.isPending}>
            Enregistrer
          </Button>
        </>
      }
    >
      <form id="sim-recharge-form" onSubmit={submit} className="grid gap-4">
        <TextField
          label="Nouveau solde (FCFA)"
          type="number"
          min={0}
          placeholder="10000"
          value={balance}
          onChange={(event) => setBalance(event.target.value)}
          errors={save.fieldErrors.balance}
          adornment={<IconCash className="h-4 w-4 text-stone-400" />}
          required
        />
        {save.error && !Object.keys(save.fieldErrors).length ? <FormAlert>{errorMessage(save.error)}</FormAlert> : null}
      </form>
    </Modal>
  );
}
