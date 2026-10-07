import type { Metadata } from "next";
import { TicketLookup } from "@/features/tickets/TicketLookup";

export const metadata: Metadata = { title: "Mes billets" };

export default function MyTicketsPage() {
  return <TicketLookup />;
}
