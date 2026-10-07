/**
 * Appels d'API du site voyageur : le parcours public (recherche, reservation,
 * paiement, billet) et le compte du voyageur connecte.
 *
 * Ce sont les seules fonctions de ce projet autorisees a connaitre les URL de
 * l'API. Rien ici ne touche au back-office : ces endpoints-la ne sont meme pas
 * embarques dans le site public.
 */

export * as tripService from "./trip-service";
export * as bookingService from "./booking-service";
export * as favoriteService from "./favorite-service";
export * as routeGridService from "./route-grid-service";
export * as apartmentService from "./apartment-service";
export * as rentalVehicleService from "./rental-vehicle-service";
