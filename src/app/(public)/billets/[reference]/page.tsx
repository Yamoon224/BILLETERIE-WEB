import type { Metadata } from "next";
import { BookingView } from "@/features/tickets/BookingView";

export const metadata: Metadata = {
  title: "Mon billet",
  // Une page de billet porte des donnees nominatives : elle n'a rien a faire
  // dans un moteur de recherche, meme si sa reference est imprevisible.
  robots: { index: false, follow: false },
};

export default async function TicketPage({ params }: PageProps<"/billets/[reference]">) {
  const { reference } = await params;

  return <BookingView reference={decodeURIComponent(reference)} />;
}
