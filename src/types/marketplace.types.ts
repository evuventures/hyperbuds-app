import type { Pagination } from "./common.types";
import type { UserReference } from "./collaboration.types";

export interface MarketplacePackage {
  name: string;
  price: number;
  description?: string;
  deliveryTime?: string;
}

export interface MarketplaceFaq {
  question: string;
  answer: string;
}

export interface MarketplaceRating {
  average?: number;
  count?: number;
}

export interface MarketplaceStats {
  views?: number;
  orders?: number;
}

export interface MarketplaceService {
  _id: string;
  seller: UserReference | string;
  title: string;
  description: string;
  price: number;
  currency?: string;
  category: string;
  subcategory?: string;
  tags?: string[];
  images?: string[];
  deliveryTime?: string;
  location?: string;
  isAvailable?: boolean;
  featured?: boolean;
  packages?: MarketplacePackage[];
  requirements?: string[];
  faq?: MarketplaceFaq[];
  rating?: MarketplaceRating;
  stats?: MarketplaceStats;
  createdAt?: string;
  updatedAt?: string;
}

export interface MarketplaceListResponse {
  services: MarketplaceService[];
  pagination: Pagination;
}

export interface CreateServiceRequest {
  title: string;
  description: string;
  price: number;
  currency?: string;
  category: string;
  subcategory?: string;
  tags?: string[];
  images?: string[];
  deliveryTime?: string;
  location?: string;
  isAvailable?: boolean;
  featured?: boolean;
  packages?: MarketplacePackage[];
  requirements?: string[];
  faq?: MarketplaceFaq[];
}

export type UpdateServiceRequest = Partial<CreateServiceRequest>;

export type BookingStatus =
  | "pending"
  | "accepted"
  | "in_progress"
  | "delivered"
  | "completed"
  | "cancelled"
  | "refunded";

export interface BookingDeliverable {
  title?: string;
  url?: string;
  uploadedAt?: string;
}

export interface Booking {
  _id: string;
  serviceId: MarketplaceService | string;
  buyerId: UserReference | string;
  sellerId: UserReference | string;
  status: BookingStatus;
  amount: number;
  currency?: string;
  packageName?: string;
  requirements?: string;
  message?: string;
  scheduledFor?: string;
  dueDate?: string;
  deliverables?: BookingDeliverable[];
  paymentId?: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBookingRequest {
  serviceId: string;
  packageName?: string;
  requirements?: string;
  message?: string;
  scheduledFor?: string;
  dueDate?: string;
}

export interface UpdateBookingStatusRequest {
  status: BookingStatus;
}

export interface BookingListResponse {
  bookings: Booking[];
  pagination: Pagination;
}

export interface ServiceListFilters {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sellerId?: string;
  location?: string;
  featured?: boolean;
  page?: number;
  limit?: number;
  sort?: "recent" | "price_low" | "price_high" | "rating";
}

export interface BookingListFilters {
  role?: "buyer" | "seller";
  page?: number;
  limit?: number;
  status?: BookingStatus;
}
