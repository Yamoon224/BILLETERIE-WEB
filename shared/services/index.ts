/**
 * Appels d'API communs a plusieurs espaces, un module par domaine backend.
 *
 * Seuls y figurent les endpoints appeles par des ecrans partages. Ce qui ne
 * sert qu'a un espace - la recherche publique, la vente au guichet, la
 * validation des partenaires - vit dans le dossier `src/services` de cet
 * espace : chaque projet n'embarque et ne connait que les URL qu'il appelle.
 */

export * as authService from "./auth-service";
export * as tripService from "./trip-service";
export * as bookingService from "./booking-service";
export * as networkService from "./network-service";
export * as reportService from "./report-service";
export * as userService from "./user-service";
export * as apartmentService from "./apartment-service";
export * as rentalVehicleService from "./rental-vehicle-service";
