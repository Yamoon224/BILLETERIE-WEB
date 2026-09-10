import { apiFetch } from "@/lib/api-client";
import type { City, Company, Itinerary, ListParams, Paginated, Single, Station, Vehicle, VehicleClass } from "@/types/api";

type ActiveFilter = { is_active?: boolean };

export interface VehicleInput {
  company_id?: string;
  registration: string;
  model?: string | null;
  class: VehicleClass;
  seat_capacity: number;
  seats_per_row: number;
  is_active?: boolean;
}

export interface ItineraryInput {
  company_id?: string;
  origin_city_id: string;
  destination_city_id: string;
  distance_km?: number | null;
  duration_minutes: number;
  base_price: number;
  is_active?: boolean;
}

export interface StationInput {
  city_id: string;
  company_id?: string | null;
  name: string;
  address?: string | null;
  phone?: string | null;
  is_active?: boolean;
}

export interface CompanyInput {
  code: string;
  name: string;
  legal_name?: string | null;
  phone?: string | null;
  email?: string | null;
  commission_per_mille?: number | null;
  is_active?: boolean;
}

export interface CityInput {
  name: string;
  region?: string | null;
  is_active?: boolean;
}

// --- Compagnies ------------------------------------------------------------------------

export function listCompanies(params: ListParams & ActiveFilter = {}): Promise<Paginated<Company>> {
  return apiFetch<Paginated<Company>>("/companies", { query: { ...params } });
}

export async function createCompany(input: CompanyInput): Promise<Company> {
  return (await apiFetch<Single<Company>>("/companies", { method: "POST", body: input })).data;
}

export async function updateCompany(id: string, input: Partial<CompanyInput>): Promise<Company> {
  return (await apiFetch<Single<Company>>(`/companies/${id}`, { method: "PATCH", body: input })).data;
}

// --- Villes ------------------------------------------------------------------------------

export function listCities(params: ListParams & ActiveFilter = {}): Promise<Paginated<City>> {
  return apiFetch<Paginated<City>>("/cities", { query: { ...params } });
}

export async function createCity(input: CityInput): Promise<City> {
  return (await apiFetch<Single<City>>("/cities", { method: "POST", body: input })).data;
}

export async function updateCity(slug: string, input: Partial<CityInput>): Promise<City> {
  return (await apiFetch<Single<City>>(`/cities/${slug}`, { method: "PATCH", body: input })).data;
}

export async function deleteCity(slug: string): Promise<void> {
  await apiFetch(`/cities/${slug}`, { method: "DELETE" });
}

// --- Gares ---------------------------------------------------------------------------------

export function listStations(params: ListParams & ActiveFilter & { city_id?: string } = {}): Promise<Paginated<Station>> {
  return apiFetch<Paginated<Station>>("/stations", { query: { ...params } });
}

export async function createStation(input: StationInput): Promise<Station> {
  return (await apiFetch<Single<Station>>("/stations", { method: "POST", body: input })).data;
}

export async function updateStation(id: string, input: Partial<StationInput>): Promise<Station> {
  return (await apiFetch<Single<Station>>(`/stations/${id}`, { method: "PATCH", body: input })).data;
}

export async function deleteStation(id: string): Promise<void> {
  await apiFetch(`/stations/${id}`, { method: "DELETE" });
}

// --- Vehicules -----------------------------------------------------------------------------

export function listVehicles(params: ListParams & ActiveFilter & { class?: VehicleClass | "" } = {}): Promise<Paginated<Vehicle>> {
  return apiFetch<Paginated<Vehicle>>("/vehicles", { query: { ...params } });
}

export async function createVehicle(input: VehicleInput): Promise<Vehicle> {
  return (await apiFetch<Single<Vehicle>>("/vehicles", { method: "POST", body: input })).data;
}

export async function updateVehicle(id: string, input: Partial<VehicleInput>): Promise<Vehicle> {
  return (await apiFetch<Single<Vehicle>>(`/vehicles/${id}`, { method: "PATCH", body: input })).data;
}

export async function deleteVehicle(id: string): Promise<void> {
  await apiFetch(`/vehicles/${id}`, { method: "DELETE" });
}

// --- Itineraires -----------------------------------------------------------------------------

export function listItineraries(params: ListParams & ActiveFilter = {}): Promise<Paginated<Itinerary>> {
  return apiFetch<Paginated<Itinerary>>("/itineraries", { query: { ...params } });
}

export async function createItinerary(input: ItineraryInput): Promise<Itinerary> {
  return (await apiFetch<Single<Itinerary>>("/itineraries", { method: "POST", body: input })).data;
}

export async function updateItinerary(id: string, input: Partial<ItineraryInput>): Promise<Itinerary> {
  return (await apiFetch<Single<Itinerary>>(`/itineraries/${id}`, { method: "PATCH", body: input })).data;
}

export async function deleteItinerary(id: string): Promise<void> {
  await apiFetch(`/itineraries/${id}`, { method: "DELETE" });
}
