import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ApartmentResults } from "@/features/search/ApartmentResults";
import { todayIso } from "@/lib/format";

export const metadata: Metadata = { title: "Appartements disponibles" };

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ApartmentsSearchPage({ searchParams }: PageProps<"/appartements">) {
  const params = await searchParams;

  const citySlug = first(params.ville);
  if (!citySlug) redirect("/?onglet=appartements");

  const guests = Math.min(16, Math.max(1, Number(first(params.voyageurs)) || 2));
  const checkIn = first(params.arrivee) ?? todayIso(7);
  const checkOut = first(params.depart) ?? todayIso(9);

  return <ApartmentResults criteria={{ citySlug, checkIn, checkOut, guests }} />;
}
