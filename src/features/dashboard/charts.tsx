"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { formatDayShort, formatMoney, formatNumber, formatPercent, formatTime } from "@/lib/format";

/**
 * Graphiques du tableau de bord, en SVG et CSS, sans librairie.
 *
 * Regles appliquees (voir la methode de visualisation du projet) :
 * - marques fines, extremite arrondie cote donnee, carree cote ligne de base ;
 * - grille en trait fin, pleine, en retrait ;
 * - aucune valeur sur chaque barre : l'axe, le survol et le tableau portent le
 *   detail, le graphique porte la forme ;
 * - chaque valeur reste accessible sans survol (legende chiffree ou tableau) ;
 * - le texte ne prend jamais la couleur de la serie : une pastille la porte.
 */

// --- Recette quotidienne : colonnes, une seule serie ------------------------------

function niceMax(value: number): number {
  if (value <= 0) return 1000;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 2.5, 5, 10].find((factor) => factor * magnitude >= value / 4) ?? 10;

  return Math.ceil(value / (step * magnitude)) * step * magnitude;
}

function compact(amount: number): string {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} M`;
  if (amount >= 1_000) return `${(amount / 1_000).toLocaleString("fr-FR", { maximumFractionDigits: 0 })} k`;

  return String(amount);
}

export function RevenueColumns({ data }: { data: Array<{ date: string; amount: number; tickets: number }> }) {
  const [active, setActive] = useState<number | null>(null);
  const [showTable, setShowTable] = useState(false);

  if (data.length === 0) {
    return <p className="py-10 text-center text-sm text-[var(--muted)]">Aucune vente sur la periode.</p>;
  }

  const max = niceMax(Math.max(...data.map((day) => day.amount)));
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => Math.round(max * ratio));
  const height = 200;
  const barWidth = Math.max(4, Math.min(24, Math.floor(560 / data.length) - 4));
  const current = active !== null ? data[active] : null;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-xs text-[var(--muted)]" aria-live="polite">
          {current ? (
            <>
              <span className="font-bold text-[var(--foreground)]">{formatMoney(current.amount)}</span> · {current.tickets} billets ·{" "}
              <span className="capitalize">{formatDayShort(`${current.date}T12:00:00`)}</span>
            </>
          ) : (
            "Survolez une colonne pour le detail du jour."
          )}
        </p>
        <button type="button" onClick={() => setShowTable((value) => !value)} className="text-xs font-semibold text-brand-700 hover:underline dark:text-brand-400">
          {showTable ? "Voir le graphique" : "Voir le tableau"}
        </button>
      </div>

      {showTable ? (
        <div className="max-h-64 overflow-auto rounded-sm border border-[var(--hairline)]">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-[var(--surface-muted)] text-left text-xs uppercase tracking-wider text-[var(--muted)]">
              <tr>
                <th className="px-3 py-2">Jour</th>
                <th className="px-3 py-2 text-right">Billets</th>
                <th className="px-3 py-2 text-right">Recette</th>
              </tr>
            </thead>
            <tbody>
              {data.map((day) => (
                <tr key={day.date} className="border-t border-[var(--hairline)]">
                  <td className="px-3 py-1.5 capitalize">{formatDayShort(`${day.date}T12:00:00`)}</td>
                  <td className="px-3 py-1.5 text-right tabular-nums">{day.tickets}</td>
                  <td className="px-3 py-1.5 text-right tabular-nums">{formatMoney(day.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex gap-2">
          {/* Axe des montants : graduations arrondies, alignees par chiffres tabulaires. */}
          <div className="relative w-10 shrink-0 text-right text-[10px] tabular-nums text-[var(--muted)]" style={{ height }}>
            {ticks.map((tick) => (
              <span key={tick} className="absolute right-0 -translate-y-1/2" style={{ bottom: `${(tick / max) * 100}%`, transform: "translateY(50%)" }}>
                {compact(tick)}
              </span>
            ))}
          </div>

          <div className="min-w-0 flex-1 overflow-x-auto">
            <div className="relative" style={{ height, minWidth: data.length * (barWidth + 4) }}>
              {ticks.map((tick) => (
                <span
                  key={tick}
                  aria-hidden="true"
                  className="absolute inset-x-0 h-px"
                  style={{ bottom: `${(tick / max) * 100}%`, background: tick === 0 ? "var(--chart-axis)" : "var(--chart-grid)" }}
                />
              ))}

              <div className="absolute inset-0 flex items-end justify-between gap-1" role="list" aria-label="Recette par jour">
                {data.map((day, index) => (
                  <button
                    key={day.date}
                    type="button"
                    role="listitem"
                    aria-label={`${formatDayShort(`${day.date}T12:00:00`)} : ${formatMoney(day.amount)}`}
                    onPointerEnter={() => setActive(index)}
                    onPointerLeave={() => setActive(null)}
                    onFocus={() => setActive(index)}
                    onBlur={() => setActive(null)}
                    // Zone de survol sur toute la hauteur : on vise un jour, pas
                    // une colonne de quelques pixels.
                    className="group flex h-full flex-1 items-end justify-center focus-visible:outline-2 focus-visible:outline-brand-500"
                  >
                    <span
                      className={cn("block rounded-t-[4px] transition-opacity", active !== null && active !== index && "opacity-45")}
                      style={{
                        width: barWidth,
                        height: `${Math.max(day.amount > 0 ? 2 : 0, (day.amount / max) * 100)}%`,
                        background: "var(--series-1)",
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-2 flex justify-between text-[10px] capitalize text-[var(--muted)]">
              <span>{formatDayShort(`${data[0].date}T12:00:00`)}</span>
              {data.length > 2 ? <span>{formatDayShort(`${data[Math.floor(data.length / 2)].date}T12:00:00`)}</span> : null}
              <span>{formatDayShort(`${data[data.length - 1].date}T12:00:00`)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Part de chaque categorie : barre empilee a 100 % + legende chiffree -----------

export interface ShareItem {
  key: string;
  label: string;
  amount: number;
  count: number;
  countLabel: string;
  /** Variable CSS de la serie, fixee par l'entite et non par le rang. */
  color: string;
}

export function ShareBar({ items, total }: { items: ShareItem[]; total: number }) {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div>
      {total > 0 ? (
        // Un espace de 2 px en couleur de surface separe les segments : pas de
        // bordure dessinee autour des marques.
        <div className="flex h-6 w-full gap-[2px] overflow-hidden rounded-[4px]" role="img" aria-label="Repartition des montants">
          {items
            .filter((item) => item.amount > 0)
            .map((item) => (
              <span
                key={item.key}
                title={`${item.label} : ${formatMoney(item.amount)}`}
                onPointerEnter={() => setActive(item.key)}
                onPointerLeave={() => setActive(null)}
                className={cn("h-full transition-opacity", active !== null && active !== item.key && "opacity-40")}
                style={{ width: `${(item.amount / total) * 100}%`, background: item.color }}
              />
            ))}
        </div>
      ) : (
        <div className="h-6 w-full rounded-[4px] bg-[var(--surface-muted)]" aria-label="Aucun montant sur la periode" />
      )}

      {/* Legende chiffree : elle porte l'identite et la valeur, et sert de
          canal de secours pour la teinte aqua, sous 3:1 sur fond clair. */}
      <ul className="mt-4 divide-y divide-[var(--hairline)]">
        {items.map((item) => (
          <li
            key={item.key}
            onPointerEnter={() => setActive(item.key)}
            onPointerLeave={() => setActive(null)}
            className="flex items-center justify-between gap-3 py-2 text-sm"
          >
            <span className="flex min-w-0 items-center gap-2">
              <span aria-hidden="true" className="h-3 w-3 shrink-0 rounded-[3px]" style={{ background: item.color }} />
              <span className="truncate">{item.label}</span>
              <span className="text-xs text-[var(--muted)]">
                {formatNumber(item.count)} {item.countLabel}
              </span>
            </span>
            <span className="flex shrink-0 items-baseline gap-2">
              <span className="font-bold tabular-nums">{formatMoney(item.amount)}</span>
              <span className="w-10 text-right text-xs tabular-nums text-[var(--muted)]">
                {total > 0 ? formatPercent(item.amount / total) : "—"}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// --- Taux de remplissage : jauges, piste dans la meme rampe --------------------------

export function OccupancyMeters({
  trips,
}: {
  trips: Array<{ trip_id: string; reference: string; departs_at: string; origin: string; destination: string; capacity: number; sold: number; occupancy_rate: number }>;
}) {
  if (trips.length === 0) {
    return <p className="py-10 text-center text-sm text-[var(--muted)]">Aucun depart sur la periode.</p>;
  }

  return (
    <ul className="space-y-3.5">
      {trips.map((trip) => (
        <li key={trip.trip_id}>
          <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 truncate">
              <span className="font-semibold">
                {trip.origin} → {trip.destination}
              </span>
              <span className="ml-2 text-xs capitalize text-[var(--muted)]">
                {formatDayShort(trip.departs_at)} {formatTime(trip.departs_at)}
              </span>
            </span>
            <span className="shrink-0 text-xs tabular-nums text-[var(--muted)]">
              <span className="font-bold text-[var(--foreground)]">{formatPercent(trip.occupancy_rate)}</span> · {trip.sold}/{trip.capacity}
            </span>
          </div>
          <div
            className="h-2 overflow-hidden rounded-full"
            style={{ background: "var(--meter-track)" }}
            role="meter"
            aria-valuemin={0}
            aria-valuemax={trip.capacity}
            aria-valuenow={trip.sold}
            aria-label={`Remplissage ${trip.origin} vers ${trip.destination}`}
          >
            <div className="h-full rounded-full" style={{ width: `${Math.min(100, trip.occupancy_rate * 100)}%`, background: "var(--series-1)" }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
