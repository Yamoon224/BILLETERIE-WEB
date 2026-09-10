import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SearchResults } from "@/features/search/SearchResults";
import { todayIso } from "@/lib/format";

export const metadata: Metadata = { title: "Departs disponibles" };

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Les criteres sont lus cote serveur et transmis au composant client : la page
 * reste partageable par URL, et le client n'a pas a attendre l'hydratation pour
 * savoir quoi chercher.
 */
export default async function SearchPage({ searchParams }: PageProps<"/recherche">) {
  const params = await searchParams;

  const origin = first(params.depart);
  const destination = first(params.arrivee);

  if (!origin || !destination) redirect("/");

  const passengers = Math.min(10, Math.max(1, Number(first(params.voyageurs)) || 1));
  const date = first(params.date) ?? todayIso(1);

  return <SearchResults criteria={{ origin, destination, date, passengers }} />;
}
