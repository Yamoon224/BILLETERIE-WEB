import type { Metadata } from "next";
import { BookingFlow } from "@/features/booking/BookingFlow";

export const metadata: Metadata = { title: "Reservation" };

export default async function ReservationPage({ params, searchParams }: PageProps<"/reservation/[tripId]">) {
  const { tripId } = await params;
  const query = await searchParams;

  const raw = Array.isArray(query.voyageurs) ? query.voyageurs[0] : query.voyageurs;
  const passengers = Math.min(10, Math.max(1, Number(raw) || 1));

  return <BookingFlow tripId={tripId} passengers={passengers} />;
}
