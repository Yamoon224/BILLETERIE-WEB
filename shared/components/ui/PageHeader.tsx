import type { ReactNode } from "react";
import { TitleRule } from "./Card";

export function PageHeader({
  title,
  description,
  actions,
  icon,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div className="flex min-w-0 items-start gap-3">
        {icon ? (
          <span className="grad-brand flex h-11 w-11 shrink-0 items-center justify-center rounded-sm text-white shadow-card">
            {icon}
          </span>
        ) : null}
        <div className="min-w-0">
          <h1 className="text-xl font-extrabold tracking-tight text-stone-900 sm:text-2xl dark:text-stone-50">{title}</h1>
          <TitleRule className="w-16" />
          {description ? <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">{description}</p> : null}
        </div>
      </div>
      {actions ? <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">{actions}</div> : null}
    </header>
  );
}
