import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { Tone } from "./Badge";

const TONE_VALUE: Record<Tone, string> = {
  neutral: "text-stone-900 dark:text-stone-50",
  brand: "text-brand-700 dark:text-brand-400",
  success: "text-emerald-700 dark:text-emerald-400",
  warning: "text-amber-700 dark:text-amber-400",
  danger: "text-rose-700 dark:text-rose-400",
  info: "text-sky-700 dark:text-sky-400",
};

const TONE_ICON: Record<Tone, string> = {
  neutral: "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300",
  brand: "grad-brand-soft text-brand-600 dark:text-brand-400",
  success: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400",
  warning: "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400",
  danger: "bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400",
  info: "bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400",
};

export function StatCard({
  label,
  value,
  hint,
  tone = "neutral",
  icon,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: Tone;
  icon?: ReactNode;
}) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-sm border border-[var(--hairline)] bg-[var(--surface)] shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
      <div className="flex flex-1 items-start justify-between gap-3 px-4 py-4 sm:px-5">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">{label}</p>
          <p className={cn("mt-2 text-xl font-extrabold tabular-nums tracking-tight", TONE_VALUE[tone])}>{value}</p>
          {hint ? <p className="mt-1.5 text-xs leading-relaxed text-[var(--muted)]">{hint}</p> : null}
        </div>
        {icon ? (
          <span
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-sm transition-transform duration-200 group-hover:scale-105",
              TONE_ICON[tone],
            )}
          >
            {icon}
          </span>
        ) : null}
      </div>
      <span aria-hidden="true" className="grad-brand h-[3px] w-full" />
    </div>
  );
}
