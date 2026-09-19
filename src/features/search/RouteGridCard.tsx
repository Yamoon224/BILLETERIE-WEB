import { Card } from "@/components/ui";
import { IconClock } from "@/components/ui/icons";
import { formatDuration, formatMoney } from "@/lib/format";
import type { RouteGridEntry } from "@/types/api";

/**
 * Une ligne de la grille des trajets, pour une liaison pas encore reservable.
 *
 * Meme ordre de lecture que `TripCard` (compagnie, horaires, prix) pour que le
 * voyageur retrouve ses reperes ; seul le bouton change : il est inactif, et le
 * prix est annonce comme indicatif.
 */
export function RouteGridCard({ entry }: { entry: RouteGridEntry }) {
  const facts = [
    entry.duration_minutes ? `Duree ${formatDuration(entry.duration_minutes)}` : null,
    entry.distance_km ? `${entry.distance_km} km` : null,
  ].filter((fact): fact is string => fact !== null);

  return (
    <Card accent={false}>
      <div className="p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-base font-bold text-stone-900 dark:text-stone-50">
            {entry.company_name ?? "Compagnie a confirmer"}
          </span>
          <span className="text-xs font-semibold text-[var(--muted)]">A titre informatif</span>
        </div>

        {facts.length > 0 ? <p className="mt-1.5 text-sm text-[var(--muted)]">{facts.join(" · ")}</p> : null}

        {entry.departure_times.length > 0 ? (
          <div className="mt-3">
            <p className="mb-1.5 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--muted)]">
              <IconClock className="h-3.5 w-3.5" />
              Departs habituels
            </p>
            <ul className="flex flex-wrap gap-2">
              {entry.departure_times.map((time) => (
                <li
                  key={time}
                  className="rounded-full border border-[var(--hairline)] bg-[var(--surface-muted)] px-3 py-1 text-sm font-bold tabular-nums text-stone-900 dark:text-stone-50"
                >
                  {time}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {entry.notes ? <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{entry.notes}</p> : null}

        <div className="mt-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-xl font-extrabold tabular-nums text-stone-900 dark:text-stone-50">{formatMoney(entry.price)}</p>
            <p className="mt-0.5 text-xs font-semibold text-[var(--muted)]">Prix indicatif, sous reserve de confirmation</p>
          </div>

          <button
            type="button"
            disabled
            className="inline-flex h-11 shrink-0 cursor-not-allowed items-center justify-center rounded-full bg-stone-200 px-5 text-sm font-bold text-stone-500 dark:bg-stone-800 dark:text-stone-400"
          >
            Bientôt disponible
          </button>
        </div>
      </div>
    </Card>
  );
}
