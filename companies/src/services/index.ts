/**
 * Appels d'API de l'Espace Compagnies.
 *
 * Tout ce qu'un gestionnaire appelle - ses ventes, ses departs, ses lignes -
 * est aussi lu par la Console Admin, sur un perimetre plus large : ces appels
 * viennent donc du socle partage, et le cloisonnement par compagnie est
 * applique par l'API a partir du jeton, jamais par un filtre envoye d'ici.
 */

export * as bookingService from "@kaara/shared/services/booking-service";
export * as networkService from "@kaara/shared/services/network-service";
export * as reportService from "@kaara/shared/services/report-service";
export * as tripService from "@kaara/shared/services/trip-service";
