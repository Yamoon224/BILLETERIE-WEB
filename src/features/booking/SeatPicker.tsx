"use client";

import { cn } from "@/lib/cn";
import type { SeatMap } from "@/types/api";

/**
 * Plan de salle interactif.
 *
 * Chaque place est un vrai bouton : navigable au clavier, annonce par les
 * lecteurs d'ecran (« place 12A, libre »). Le couloir est dessine a la position
 * rendue par l'API — le frontend ne reimplemente aucune regle de plan.
 *
 * Quand le nombre de places choisies atteint le nombre de voyageurs, un nouveau
 * clic remplace la plus ancienne selection plutot que d'etre refuse : le
 * voyageur qui change d'avis n'a pas a deselectionner d'abord.
 */
export function SeatPicker({
  seatMap,
  selected,
  max,
  onChange,
}: {
  seatMap: SeatMap;
  selected: string[];
  max: number;
  onChange: (seats: string[]) => void;
}) {
  function toggle(seat: string) {
    if (selected.includes(seat)) {
      onChange(selected.filter((value) => value !== seat));
      return;
    }

    onChange(selected.length >= max ? [...selected.slice(1), seat] : [...selected, seat]);
  }

  return (
    <div>
      <ul className="mb-4 flex flex-wrap items-center gap-4 text-xs text-[var(--muted)]" aria-label="Legende">
        <li className="flex items-center gap-2">
          <span className="h-4 w-4 rounded-sm border border-[var(--field-border)] bg-[var(--surface)]" /> Libre
        </li>
        <li className="flex items-center gap-2">
          <span className="grad-brand h-4 w-4 rounded-sm" /> Votre choix
        </li>
        <li className="flex items-center gap-2">
          <span className="h-4 w-4 rounded-sm bg-stone-300 dark:bg-stone-700" /> Occupee
        </li>
      </ul>

      <div className="overflow-x-auto">
        <div className="mx-auto w-max rounded-sm border border-[var(--hairline)] bg-[var(--surface-muted)] p-4 sm:p-5">
          {/* Avant du vehicule : le voyageur s'oriente d'abord par rapport au
              chauffeur, pas par rapport a une numerotation abstraite. */}
          <div className="mb-4 flex items-center justify-between border-b border-dashed border-[var(--field-border)] pb-3 text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
            <span>Avant</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[var(--field-border)]" aria-label="Chauffeur">
              <span className="h-2 w-2 rounded-full bg-[var(--field-border)]" />
            </span>
          </div>

          <div className="flex flex-col gap-2" role="group" aria-label="Plan de salle">
            {seatMap.rows.map((row) => (
              <div key={row.row} className="flex items-center gap-2">
                <span className="w-5 text-right text-[11px] font-semibold tabular-nums text-[var(--muted)]">{row.row}</span>
                {row.seats.map((seat, index) => {
                  const isSelected = selected.includes(seat.number);

                  return (
                    <div key={seat.number} className={cn("flex", index === row.aisle_after && "ml-5")}>
                      <button
                        type="button"
                        disabled={seat.is_taken}
                        onClick={() => toggle(seat.number)}
                        aria-pressed={isSelected}
                        aria-label={`Place ${seat.number}, ${seat.is_taken ? "occupee" : isSelected ? "selectionnee" : "libre"}`}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-sm text-[11px] font-bold transition-all sm:h-11 sm:w-11",
                          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
                          seat.is_taken
                            ? "cursor-not-allowed bg-stone-300 text-stone-500 dark:bg-stone-700 dark:text-stone-500"
                            : isSelected
                              ? "grad-brand scale-105 text-white shadow-card"
                              : "border border-[var(--field-border)] bg-[var(--surface)] text-stone-700 hover:border-brand-400 hover:text-brand-700 dark:text-stone-200",
                        )}
                      >
                        {seat.number}
                      </button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
