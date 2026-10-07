/**
 * Appels d'API de la Console Admin : tout ce que seul le role
 * `platform_admin` peut faire (validation des compagnies et des annonces,
 * villes, grille des trajets, SMS Box, promotions, finances), ajoute aux
 * lectures communes du socle partage.
 *
 * Ce sont les seules fonctions de ce projet autorisees a connaitre les URL de
 * l'API.
 */

export * as reportService from "@kaara/shared/services/report-service";
export * as userService from "@kaara/shared/services/user-service";
export * as networkService from "./network-service";
export * as apartmentService from "./apartment-service";
export * as rentalVehicleService from "./rental-vehicle-service";
export * as routeGridService from "./route-grid-service";
export * as smsService from "./sms-service";
export * as promotionService from "./promotion-service";
export * as financeService from "./finance-service";
