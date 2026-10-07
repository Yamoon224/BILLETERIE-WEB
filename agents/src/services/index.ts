/**
 * Appels d'API de l'Espace Agents : vente au guichet, synchronisation des
 * ventes hors ligne, cloture de caisse et controle a l'embarquement.
 *
 * Ce sont les seules fonctions de ce projet autorisees a connaitre les URL de
 * l'API. Les lectures de departs et de plans de salle sont communes a d'autres
 * espaces et viennent du socle partage.
 */

export * as tripService from "@kaara/shared/services/trip-service";
export * as bookingService from "./booking-service";
export * as ticketService from "./ticket-service";
export * as reportService from "./report-service";
