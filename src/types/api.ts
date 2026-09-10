/**
 * Types du contrat d'API, alignes sur `backend/resources/openapi/openapi.yaml`.
 *
 * Ecrits a la main plutot que generes : le frontend ne consomme qu'une partie
 * du contrat. En contrepartie, les unions de statuts reprennent exactement les
 * enums PHP — toute divergence se voit a la compilation.
 */

// --- Enveloppes ---------------------------------------------------------------

export interface Paginated<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface Single<T> {
  data: T;
}

export interface ListParams {
  page?: number;
  per_page?: number;
  search?: string;
  sort?: string;
  direction?: "asc" | "desc";
}

// --- Statuts --------------------------------------------------------------------

export type TripStatus = "scheduled" | "boarding" | "departed" | "arrived" | "cancelled";
export type BookingStatus = "pending" | "confirmed" | "cancelled" | "expired" | "refunded";
export type BookingChannel = "online" | "counter" | "offline_counter";
export type TicketStatus = "issued" | "used" | "cancelled" | "refunded";
export type PaymentMethod = "cash" | "mobile_money" | "card";
export type PaymentStatus = "pending" | "succeeded" | "failed" | "expired" | "refunded";
export type MobileMoneyProvider = "orange_money" | "mtn_money" | "moov_money" | "wave";
export type VehicleClass = "standard" | "comfort" | "vip" | "minibus";
export type ScanOutcome =
  | "accepted"
  | "already_used"
  | "wrong_trip"
  | "not_found"
  | "invalid_signature"
  | "cancelled"
  | "trip_cancelled"
  | "outside_boarding_window";

export type RoleName = "platform_admin" | "company_manager" | "agent" | "passenger";

// --- Comptes ----------------------------------------------------------------------

export interface CompanyRef {
  id: string;
  code: string;
  name: string;
}

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  is_active: boolean;
  company?: CompanyRef | null;
  company_id: string | null;
  roles: RoleName[];
  permissions: string[];
  last_login_at: string | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  is_active: boolean;
  roles?: RoleName[];
  company?: CompanyRef | null;
  company_id: string | null;
  last_login_at: string | null;
  created_at: string | null;
}

export interface Role {
  name: RoleName;
  permissions: string[];
}

// --- Reseau -------------------------------------------------------------------------

export interface CityRef {
  id: string;
  name: string;
  slug: string;
}

export interface City extends CityRef {
  region: string | null;
  is_active: boolean;
  stations_count?: number;
  created_at: string | null;
}

export interface Company extends CompanyRef {
  legal_name: string | null;
  phone: string | null;
  email: string | null;
  logo_path: string | null;
  commission_per_mille: number | null;
  effective_commission_per_mille: number;
  is_active: boolean;
  vehicles_count?: number;
  itineraries_count?: number;
  stations_count?: number;
  trips_count?: number;
  created_at: string | null;
}

export interface Station {
  id: string;
  name: string;
  address: string | null;
  latitude: string | null;
  longitude: string | null;
  phone: string | null;
  is_active: boolean;
  is_shared: boolean;
  city?: CityRef;
  city_id: string;
  company?: CompanyRef | null;
  company_id: string | null;
  created_at: string | null;
}

export interface SeatRow {
  row: number;
  seats: string[];
  aisle_after: number;
}

export interface Vehicle {
  id: string;
  registration: string;
  model: string | null;
  class: VehicleClass;
  class_label: string;
  seat_capacity: number;
  seats_per_row: number;
  seat_rows: SeatRow[];
  is_active: boolean;
  trips_count?: number;
  company?: CompanyRef;
  company_id: string;
  created_at: string | null;
}

export interface Itinerary {
  id: string;
  distance_km: number | null;
  duration_minutes: number;
  base_price: number;
  currency: string;
  is_active: boolean;
  trips_count?: number;
  origin_city?: CityRef;
  destination_city?: CityRef;
  origin_city_id: string;
  destination_city_id: string;
  company?: CompanyRef;
  company_id: string;
  created_at: string | null;
}

// --- Departs ----------------------------------------------------------------------------

export interface Trip {
  id: string;
  reference: string;
  departs_at: string;
  arrives_at: string | null;
  price: number;
  currency: string;
  seat_capacity: number;
  seats_per_row: number;
  status: TripStatus;
  status_label: string;
  accepts_bookings: boolean;
  cancellation_reason: string | null;
  cancelled_at: string | null;
  seats_taken: number | null;
  seats_available: number | null;
  itinerary?: {
    id: string;
    duration_minutes: number;
    distance_km: number | null;
    origin_city: CityRef | null;
    destination_city: CityRef | null;
  };
  itinerary_id: string;
  vehicle?: {
    id: string;
    registration: string;
    model: string | null;
    class: VehicleClass;
    class_label: string;
  };
  vehicle_id: string;
  departure_station?: { id: string; name: string; address: string | null };
  arrival_station?: { id: string; name: string; address: string | null };
  departure_station_id: string;
  arrival_station_id: string;
  company?: CompanyRef & { logo_path: string | null };
  company_id: string;
  created_at: string | null;
}

export interface SeatMap {
  rows: Array<{
    row: number;
    aisle_after: number;
    seats: Array<{ number: string; is_taken: boolean }>;
  }>;
  capacity: number;
  taken: number;
  available: number;
  trip: Trip;
}

// --- Vente ------------------------------------------------------------------------------

export interface Ticket {
  id: string;
  code: string;
  seat_number: string | null;
  is_seat_released: boolean;
  passenger_name: string;
  passenger_phone: string | null;
  status: TicketStatus;
  status_label: string;
  is_scanned: boolean;
  scanned_at: string | null;
  scanned_by?: { id: string; name: string } | null;
  booking_id: string;
  booking?: { id: string; reference: string; customer_phone: string };
  trip_id: string;
  created_at: string | null;
}

export interface Payment {
  id: string;
  reference: string;
  booking_id: string;
  method: PaymentMethod;
  method_label: string;
  provider: MobileMoneyProvider | null;
  provider_label: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  status_label: string;
  is_settled: boolean;
  external_reference: string | null;
  payer_msisdn: string | null;
  failure_reason: string | null;
  paid_at: string | null;
  failed_at: string | null;
  refunded_at: string | null;
  collected_by?: { id: string; name: string } | null;
  created_at: string | null;
}

export interface Booking {
  id: string;
  reference: string;
  status: BookingStatus;
  status_label: string;
  channel: BookingChannel;
  channel_label: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  seats_count: number;
  total_amount: number;
  currency: string;
  commission_amount: number;
  commission_per_mille: number;
  net_amount: number;
  expires_at: string | null;
  is_hold_expired: boolean;
  confirmed_at: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  sold_offline_at: string | null;
  synced_at: string | null;
  client_reference: string | null;
  notes: string | null;
  trip?: Trip;
  trip_id: string;
  company?: CompanyRef;
  company_id: string;
  sold_by?: { id: string; name: string } | null;
  tickets?: Ticket[];
  tickets_count?: number;
  payments?: Payment[];
  created_at: string | null;
}

export interface PassengerInput {
  seat_number: string;
  name: string;
  phone?: string | null;
}

export interface ScanResult {
  accepted: boolean;
  outcome: ScanOutcome;
  outcome_label: string;
  is_suspicious: boolean;
  is_replay: boolean;
  previously_scanned_at: string | null;
  ticket: Ticket | null;
}

// --- Suivi d'activite ---------------------------------------------------------------------

export interface DashboardOverview {
  period: { from: string; to: string };
  currency: string;
  summary: {
    bookings: number;
    tickets: number;
    gross_revenue: number;
    commission: number;
    net_revenue: number;
    average_basket: number;
    cancelled_bookings: number;
    expired_bookings: number;
  };
  revenue_by_payment_method: Array<{ method: PaymentMethod; label: string; count: number; amount: number }>;
  sales_by_channel: Array<{ channel: BookingChannel; label: string; bookings: number; tickets: number; amount: number }>;
  daily_revenue: Array<{ date: string; bookings: number; tickets: number; amount: number }>;
  occupancy: Array<{
    trip_id: string;
    reference: string;
    departs_at: string;
    origin: string;
    destination: string;
    capacity: number;
    sold: number;
    occupancy_rate: number;
    revenue: number;
  }>;
  sales_by_agent: Array<{ user_id: string; name: string; bookings: number; tickets: number; amount: number }>;
}

export interface AuditLog {
  id: string;
  log_name: string | null;
  description: string;
  event: string | null;
  event_label: string;
  subject_type: string | null;
  subject_label: string;
  subject_id: string | null;
  causer: { id: string; name: string } | null;
  causer_label: string;
  properties: { attributes?: Record<string, unknown>; old?: Record<string, unknown> };
  created_at: string | null;
}
