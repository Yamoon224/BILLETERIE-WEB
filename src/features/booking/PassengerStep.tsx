import { useId } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { formatDayCompact, formatTime } from "@/lib/format";
import type { Trip } from "@/types/api";

export interface Traveler {
  lastName: string;
  firstName: string;
}

export const EMPTY_TRAVELER: Traveler = { lastName: "", firstName: "" };

/** Les champs sont muets tant que le voyageur n'a pas tente de continuer. */
const REQUIRED_MESSAGE = "Champ obligatoire.";

/**
 * Champ de la fiche passager : libelle au-dessus, saisie dessous, separes des
 * champs voisins par un simple filet - la fiche se lit comme un formulaire
 * papier, pas comme une pile de champs a contour. Le dernier champ d'un
 * groupe (ou d'une rangee) n'a pas de filet.
 */
function StackedField({
  label,
  error,
  className,
  ...inputProps
}: { label: string; error?: string | null } & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className={cn("group flex-1 border-b border-[#eae3dc] px-3.5 py-2.5 last:border-b-0 dark:border-[var(--hairline)]", className)}>
      <label
        htmlFor={id}
        className="mb-1 block text-[10.5px] text-[#6b7280] transition-colors group-focus-within:text-[var(--field-label-focus)] dark:text-[var(--muted)]"
      >
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className="w-full border-0 bg-transparent p-0 text-sm font-semibold text-[#1b2a41] outline-none placeholder:font-medium placeholder:text-[#c9c2b8] dark:text-[var(--foreground)] dark:placeholder:text-[var(--field-placeholder)]"
        {...inputProps}
      />
      {error ? (
        <p id={errorId} className="mt-1 text-[11px] font-medium text-rose-600 dark:text-rose-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function FormCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-[18px] border border-[#eae3dc] bg-[var(--surface)] p-1.5 dark:border-[var(--hairline)]">
      <h4 className="px-3.5 pb-0.5 pt-3 text-[13px] font-bold text-[#1b2a41] dark:text-[var(--foreground)]">{title}</h4>
      {children}
    </section>
  );
}

/** Rappel du trajet choisi, en tete de l'etape - sur grand ecran, la colonne de droite le porte deja. */
export function RouteRecap({ trip, seats }: { trip: Trip; seats: string[] }) {
  const route = `${trip.itinerary?.origin_city?.name ?? "-"} → ${trip.itinerary?.destination_city?.name ?? "-"}`;
  const seatLabel = `${seats.length > 1 ? "Places" : "Place"} ${seats.join(", ")}`;

  return (
    <div className="rounded-2xl border border-[#eae3dc] bg-[var(--surface)] px-[15px] py-[13px] dark:border-[var(--hairline)] lg:hidden">
      <p className="text-sm font-bold text-[#1b2a41] dark:text-[var(--foreground)]">{route}</p>
      <p className="mt-0.5 text-[11.5px] text-[#6b7280] dark:text-[var(--muted)]">
        {trip.company?.name} · {formatDayCompact(trip.departs_at)}, {formatTime(trip.departs_at)} · {seatLabel}
      </p>
    </div>
  );
}

interface PassengerStepProps {
  seats: string[];
  /** Un voyageur par place, dans l'ordre des places : le nom suit la position, pas le siege, pour survivre a un changement de siege. */
  travelers: Traveler[];
  onTravelerChange: (index: number, traveler: Traveler) => void;
  phone: string;
  onPhoneChange: (phone: string) => void;
  idNumber: string;
  onIdNumberChange: (idNumber: string) => void;
  /** Vrai apres une tentative de validation : c'est seulement alors que les champs vides sont signales. */
  showErrors: boolean;
}

/**
 * Etape « Informations du passager » : une fiche par place. Le premier
 * passager est aussi celui qui recoit le billet (telephone) ; les suivants ne
 * donnent que leur nom.
 */
export function PassengerStep({
  seats,
  travelers,
  onTravelerChange,
  phone,
  onPhoneChange,
  idNumber,
  onIdNumberChange,
  showErrors,
}: PassengerStepProps) {
  const required = (value: string) => (showErrors && value.trim() === "" ? REQUIRED_MESSAGE : null);

  return (
    <>
      {seats.map((seat, index) => {
        const traveler = travelers[index] ?? EMPTY_TRAVELER;
        const isFirst = index === 0;

        return (
          <FormCard key={seat} title={isFirst ? "Informations du passager" : `Passager ${index + 1} · place ${seat}`}>
            <StackedField
              label="Nom"
              placeholder="Kouassi"
              value={traveler.lastName}
              onChange={(event) => onTravelerChange(index, { ...traveler, lastName: event.target.value })}
              error={isFirst ? required(traveler.lastName) : null}
              autoComplete={isFirst ? "family-name" : "off"}
            />
            <StackedField
              label="Prénom"
              placeholder="Aïcha"
              value={traveler.firstName}
              onChange={(event) => onTravelerChange(index, { ...traveler, firstName: event.target.value })}
              error={isFirst ? required(traveler.firstName) : null}
              autoComplete={isFirst ? "given-name" : "off"}
            />
            {isFirst ? (
              <div className="flex">
                <StackedField
                  label="Téléphone"
                  type="tel"
                  inputMode="tel"
                  placeholder="07 XX XX XX XX"
                  value={phone}
                  onChange={(event) => onPhoneChange(event.target.value)}
                  error={required(phone)}
                  autoComplete="tel"
                />
                <StackedField
                  label="Pièce d'identité (optionnel)"
                  placeholder="N° CNI"
                  value={idNumber}
                  onChange={(event) => onIdNumberChange(event.target.value)}
                  autoComplete="off"
                />
              </div>
            ) : null}
          </FormCard>
        );
      })}

      <p className="rounded-[14px] border border-[#b9e9f5] bg-[#e3f7fc] px-3.5 py-3 text-[11.5px] leading-[1.4] text-[#0089b3] dark:border-brand-800 dark:bg-brand-900/30 dark:text-brand-300">
        📩 Votre billet et le QR code d&apos;embarquement seront envoyés par SMS à ce numéro, même sans connexion internet.
      </p>
    </>
  );
}
