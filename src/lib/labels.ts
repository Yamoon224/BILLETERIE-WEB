import type { Tone } from "@/components/ui/Badge";
import type { BookingStatus, MobileMoneyProvider, PaymentStatus, TicketStatus, TripStatus, VehicleClass } from "@/types/api";

/**
 * Correspondance statut metier → tonalite visuelle.
 *
 * Centralisee pour qu'un meme statut ait la meme couleur sur tous les ecrans :
 * « annule » en rouge ici et en gris la, et l'agent ne sait plus lequel croire.
 */

export const BOOKING_TONE: Record<BookingStatus, Tone> = {
  pending: "brand",
  confirmed: "success",
  cancelled: "danger",
  expired: "neutral",
  refunded: "warning",
};

export const TRIP_TONE: Record<TripStatus, Tone> = {
  scheduled: "info",
  boarding: "brand",
  departed: "neutral",
  arrived: "success",
  cancelled: "danger",
};

export const TICKET_TONE: Record<TicketStatus, Tone> = {
  issued: "info",
  used: "success",
  cancelled: "danger",
  refunded: "warning",
};

export const PAYMENT_TONE: Record<PaymentStatus, Tone> = {
  pending: "brand",
  succeeded: "success",
  failed: "danger",
  expired: "neutral",
  refunded: "warning",
};

export const VEHICLE_CLASS_LABEL: Record<VehicleClass, string> = {
  standard: "Standard",
  comfort: "Confort",
  vip: "VIP",
  minibus: "Minibus",
};

/**
 * Operateurs mobile money proposes au voyageur. La couleur est celle que le
 * voyageur associe a son operateur : c'est elle qu'il cherche du regard, bien
 * avant de lire le nom.
 */
export const MOBILE_MONEY_PROVIDERS: Array<{ value: MobileMoneyProvider; label: string; swatch: string; ussd: string }> = [
  { value: "orange_money", label: "Orange Money", swatch: "#ff7900", ussd: "#144#" },
  { value: "mtn_money", label: "MTN MoMo", swatch: "#ffcc00", ussd: "*133#" },
  { value: "moov_money", label: "Moov Money", swatch: "#0066b3", ussd: "*155#" },
  { value: "wave", label: "Wave", swatch: "#1dc3ff", ussd: "Appli Wave" },
];

export const ROLE_LABEL: Record<string, string> = {
  platform_admin: "Administrateur plateforme",
  company_manager: "Gestionnaire de compagnie",
  agent: "Agent de vente",
  passenger: "Voyageur",
};
