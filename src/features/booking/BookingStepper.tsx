import { IconArrowLeft } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

const STEPS = [
  { key: "recherche", label: "Recherche" },
  { key: "siege", label: "Siege" },
  { key: "passager", label: "Passager" },
  { key: "paiement", label: "Paiement" },
  { key: "billet", label: "Billet" },
] as const;

export type BookingStep = (typeof STEPS)[number]["key"];

/**
 * Fil d'etapes du tunnel de reservation - repere le voyageur d'un ecran a
 * l'autre (recherche, siege, passager, paiement, billet), meme quand deux
 * etapes vivent sur la meme page (siege/passager) et deux autres sur une page
 * distincte (paiement/billet, qui exigent une reservation deja creee cote
 * API). Seule l'etape en cours est mise en avant, comme un fil d'ariane.
 */
export function BookingStepper({
  current,
  onBack,
  backLabel = "Retour",
}: {
  current: BookingStep;
  onBack?: () => void;
  backLabel?: string;
}) {
  return (
    <div className="no-print mb-5 flex items-center gap-3">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          aria-label={backLabel}
          title={backLabel}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--hairline)] bg-[var(--surface-muted)] text-[var(--foreground)] transition-colors hover:border-brand-300"
        >
          <IconArrowLeft className="h-4 w-4" />
        </button>
      ) : null}

      <nav aria-label="Etapes de la reservation" className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold">
        {STEPS.map((step, index) => (
          <span key={step.key} className="flex items-center gap-1.5">
            {index > 0 ? <span className="text-[var(--field-border)]">{"›"}</span> : null}
            <span className={cn(step.key === current ? "text-[var(--foreground)]" : "text-[var(--muted)]")}>{step.label}</span>
          </span>
        ))}
      </nav>
    </div>
  );
}
