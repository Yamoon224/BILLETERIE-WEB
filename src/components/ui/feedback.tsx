import type { ReactNode } from "react";
import { errorMessage } from "@/lib/api-client";
import { cn } from "@/lib/cn";
import { Button } from "./Button";
import { IconAlert, IconCheckCircle, IconRefresh, IconSearch } from "./icons";

/**
 * Les etats qu'un ecran de donnees doit savoir montrer — chargement, erreur,
 * vide — et le bandeau de message d'un formulaire. Factorises pour se
 * ressembler partout : un voyageur qui reconnait un ecran vide au premier coup
 * d'oeil ne se demande pas si l'application a plante.
 */

export function LoadingState({ label = "Chargement…", className }: { label?: string; className?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn("flex flex-col items-center justify-center gap-3 px-5 py-14 text-sm text-[var(--muted)]", className)}
    >
      <span className="h-7 w-7 animate-spin rounded-full border-2 border-stone-200 border-t-brand-500 dark:border-stone-700 dark:border-t-brand-400" />
      {label}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <span aria-hidden="true" className={cn("block animate-pulse rounded-sm bg-stone-200/70 dark:bg-stone-800", className)} />;
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center px-5 py-12 text-center">
      <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-sm bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
        <IconAlert className="h-5 w-5" />
      </span>
      <p className="max-w-md text-sm font-medium text-rose-700 dark:text-rose-400">
        {errorMessage(error, "Le chargement a echoue.")}
      </p>
      {onRetry ? (
        <Button variant="secondary" size="sm" className="mt-4" onClick={onRetry} icon={<IconRefresh className="h-3.5 w-3.5" />}>
          Reessayer
        </Button>
      ) : null}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  icon,
  action,
}: {
  title: string;
  description?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center px-5 py-14 text-center">
      <span className="grad-brand-soft mb-3 flex h-12 w-12 items-center justify-center rounded-sm text-brand-600 dark:text-brand-400">
        {icon ?? <IconSearch className="h-5 w-5" />}
      </span>
      <p className="text-sm font-semibold text-stone-800 dark:text-stone-100">{title}</p>
      {description ? (
        <p className="mx-auto mt-1.5 max-w-md text-sm leading-relaxed text-[var(--muted)]">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export type AlertTone = "error" | "warning" | "success" | "info";

const ALERT_CLASSES: Record<AlertTone, string> = {
  error: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-300",
  warning: "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/60 dark:text-amber-200",
  success:
    "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300",
  info: "border-brand-200 bg-brand-50 text-brand-800 dark:border-brand-800 dark:bg-brand-900/30 dark:text-brand-200",
};

export function FormAlert({ tone = "error", children, className }: { tone?: AlertTone; children: ReactNode; className?: string }) {
  const Icon = tone === "success" ? IconCheckCircle : IconAlert;

  return (
    <div
      role={tone === "success" || tone === "info" ? "status" : "alert"}
      className={cn("flex items-start gap-2 rounded-sm border px-3 py-2.5 text-sm", ALERT_CLASSES[tone], className)}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
