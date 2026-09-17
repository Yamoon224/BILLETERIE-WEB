"use client";

import { useCallback } from "react";
import { IconMapPin, IconUsers } from "@/components/ui/icons";
import { Skeleton } from "@/components/ui";
import { useAsyncData } from "@/hooks/useAsyncData";
import { formatMoney } from "@/lib/format";
import { rentalVehicleService } from "@/services";

const GRADIENTS = [
  "linear-gradient(150deg,#2C3E5C 0%,#1B2A41 100%)",
  "linear-gradient(150deg,#0089b3 0%,#0a5570 100%)",
  "linear-gradient(150deg,#2F9E68 0%,#1F7A4D 100%)",
  "linear-gradient(150deg,#57493c 0%,#241d17 100%)",
];

/** Vehicules de location mis en avant, meme logique que `PopularApartments`. */
export function PopularRentalVehicles() {
  const loader = useCallback(() => rentalVehicleService.search({ is_featured: true, per_page: 4 }), []);
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

  const vehicles = data?.data ?? [];
  if (vehicles.length === 0) return null;

  return (
    <div className="flex gap-3 overflow-x-auto pb-1 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible lg:grid-cols-4">
      {vehicles.map((vehicle, index) => (
        <div
          key={vehicle.id}
          className="relative w-[15rem] shrink-0 overflow-hidden rounded-sm shadow-card sm:w-auto"
          style={{ backgroundImage: GRADIENTS[index % GRADIENTS.length] }}
        >
          <div className="flex h-36 flex-col justify-between p-4 text-white">
            <span className="inline-flex items-center gap-1 self-start rounded-sm bg-black/20 px-2 py-1 text-[11px] font-semibold">
              <IconMapPin className="h-3 w-3" />
              {vehicle.city?.name}
            </span>
            <div>
              <p className="truncate text-sm font-bold">
                {vehicle.brand} {vehicle.model}
              </p>
              <p className="mt-0.5 text-base font-extrabold">
                {formatMoney(vehicle.price_per_day)} <span className="text-xs font-medium text-white/80">/ jour</span>
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-white/85">
                <IconUsers className="h-3.5 w-3.5" />
                {vehicle.seats} places · {vehicle.category_label}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
