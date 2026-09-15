/**
 * Services d'acces a l'API, un module par domaine backend.
 *
 * Ce sont les seules fonctions autorisees a connaitre les URL de l'API. Les
 * composants appellent ces services ; ils ne construisent jamais de chemin
 * eux-memes. Renommer un endpoint se regle donc dans un seul fichier.
 */

export * as authService from "./auth-service";
export * as tripService from "./trip-service";
export * as bookingService from "./booking-service";
export * as favoriteService from "./favorite-service";
export * as ticketService from "./ticket-service";
export * as networkService from "./network-service";
export * as reportService from "./report-service";
export * as userService from "./user-service";
export * as apartmentService from "./apartment-service";
export * as rentalVehicleService from "./rental-vehicle-service";
