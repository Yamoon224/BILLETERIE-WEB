import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { RentalVehicleResults } from "@/features/search/RentalVehicleResults";
import { todayIso } from "@/lib/format";

export const metadata: Metadata = { title: "Vehicules de location disponibles" };

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function RentalVehiclesSearchPage({ searchParams }: PageProps<"/location-auto">) {
  const params = await searchParams;

  const citySlug = first(params.ville);
  if (!citySlug) redirect("/?onglet=location-auto");

  const pickupDate = first(params.prise_en_charge) ?? todayIso(1);
  const returnDate = first(params.retour) ?? todayIso(4);

  return <RentalVehicleResults criteria={{ citySlug, pickupDate, returnDate }} />;
}
