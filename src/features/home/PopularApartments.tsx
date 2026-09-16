"use client";

import { useCallback } from "react";
import { IconMapPin, IconUsers } from "@/components/ui/icons";
import { Skeleton } from "@/components/ui";
import { useAsyncData } from "@/hooks/useAsyncData";
import { formatMoney } from "@/lib/format";
import { apartmentService } from "@/services";

const GRADIENTS = [
  "linear-gradient(150deg,#2F9E68 0%,#1F7A4D 100%)",
  "linear-gradient(150deg,#1cbbe8 0%,#00a6d6 55%,#036d8f 100%)",
  "linear-gradient(150deg,#3a2f27 0%,#211a15 100%)",
  "linear-gradient(150deg,#0086b0 0%,#0a5570 100%)",
];

/**
 * Appartements mis en avant : donnee reelle (`is_featured=true`), pas un
 * decor. Silencieuse en cas d'echec ou de catalogue vide — c'est une section
 * de decouverte, pas un parcours critique, et une erreur affichee ici
 * inquieterait pour rien un voyageur venu chercher un bus.
 */
export function PopularApartments() {
  const loader = useCallback(() => apartmentService.search({ is_featured: true, per_page: 4 }), []);
  const { data, isLoading } = useAsyncData(loader);

  if (isLoading) {
    return (
      <div className="flex gap-3 overflow-x-auto pb-1 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible lg:grid-cols-4">
        {[0, 1, 2, 3].map((index) => (
          <Skeleton key={index} className="h-36 w-[15rem] shrink-0 rounded-sm sm:w-auto" />
        ))}
      </div>
    );
  }

  const apartments = data?.data ?? [];
  if (apartments.length === 0) return null;

  return (
    <div className="flex gap-3 overflow-x-auto pb-1 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible lg:grid-cols-4">
      {apartments.map((apartment, index) => (
        <div
          key={apartment.id}
          className="relative w-[15rem] shrink-0 overflow-hidden rounded-sm shadow-card sm:w-auto"
          style={{ backgroundImage: GRADIENTS[index % GRADIENTS.length] }}
        >
          <div className="flex h-36 flex-col justify-between p-4 text-white">
            <span className="inline-flex items-center gap-1 self-start rounded-sm bg-black/20 px-2 py-1 text-[11px] font-semibold">
              <IconMapPin className="h-3 w-3" />
              {apartment.neighborhood ?? apartment.city?.name}
            </span>
            <div>
              <p className="truncate text-sm font-bold">{apartment.title}</p>
              <p className="mt-0.5 text-base font-extrabold">
                {formatMoney(apartment.price_per_night)} <span className="text-xs font-medium text-white/80">/ nuit</span>
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-white/85">
                <IconUsers className="h-3.5 w-3.5" />
                Jusqu&apos;a {apartment.capacity} personnes
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
