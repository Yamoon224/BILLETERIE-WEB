import { Badge, Card } from "@/components/ui";
import { IconChat, IconMapPin, IconPhone, IconUsers } from "@/components/ui/icons";
import { formatMoney } from "@/lib/format";
import type { RentalVehicle } from "@/types/api";

const GRADIENT = "linear-gradient(150deg,#2C3E5C 0%,#1B2A41 100%)";

/** Une fiche vehicule dans la liste de resultats. Meme logique que ApartmentCard. */
export function RentalVehicleCard({ vehicle }: { vehicle: RentalVehicle }) {
  const phone = vehicle.partner?.phone ?? null;
  const whatsapp = vehicle.partner?.whatsapp ?? null;

  return (
    <Card interactive>
      <div className="grid gap-0 sm:grid-cols-[10rem_1fr]">
        <div
          className="relative flex h-32 items-end overflow-hidden p-3 text-white sm:h-auto"
          style={{ backgroundImage: vehicle.cover_photo_url ? undefined : GRADIENT }}
        >
          {vehicle.cover_photo_url ? (
            <img src={vehicle.cover_photo_url} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <span className="relative inline-flex items-center gap-1 rounded-sm bg-black/20 px-2 py-1 text-[11px] font-semibold">
              <IconMapPin className="h-3 w-3" />
              {vehicle.city?.name}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-3 p-4 sm:p-5">
          <div className="min-w-0">
            <p className="text-base font-bold text-stone-900 dark:text-stone-50">
              {vehicle.brand} {vehicle.model}
              {vehicle.year ? <span className="text-[var(--muted)]"> · {vehicle.year}</span> : null}
            </p>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-[var(--muted)]">
              <IconMapPin className="h-3.5 w-3.5" />
              Prise en charge a {vehicle.city?.name}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Badge tone="neutral">{vehicle.category_label}</Badge>
            <Badge tone="neutral">{vehicle.transmission_label}</Badge>
            <Badge tone="neutral">
              <IconUsers className="h-3 w-3" /> {vehicle.seats} places
            </Badge>
            {vehicle.with_driver_available ? <Badge tone="brand">Chauffeur disponible</Badge> : null}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--hairline)] pt-3">
            <p className="text-lg font-extrabold tabular-nums text-brand-700 dark:text-brand-400">
              {formatMoney(vehicle.price_per_day)} <span className="text-xs font-medium text-[var(--muted)]">/ jour</span>
            </p>

            <div className="flex items-center gap-2">
              {phone ? (
                <a
                  href={`tel:${phone}`}
                  className="inline-flex h-9 items-center gap-1.5 rounded-2xl bg-[var(--surface-muted)] px-3 text-xs font-semibold text-stone-700 hover:bg-brand-50 hover:text-brand-700 dark:text-stone-200 dark:hover:bg-stone-800 dark:hover:text-brand-300"
                >
                  <IconPhone className="h-3.5 w-3.5" /> Appeler
                </a>
              ) : null}
              {whatsapp ? (
                <a
                  href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-9 items-center gap-1.5 rounded-2xl bg-[#0e1a3a] px-3 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#16295c]"
                >
                  <IconChat className="h-3.5 w-3.5" /> WhatsApp
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
