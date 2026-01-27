import { apiClient } from "./client";
import type {
  MarketplaceService,
  MarketplaceListResponse,
  CreateServiceRequest,
  UpdateServiceRequest,
  Booking,
  CreateBookingRequest,
  UpdateBookingStatusRequest,
  BookingListResponse,
  ServiceListFilters,
  BookingListFilters,
} from "@/types/marketplace.types";

export const marketplaceApi = {
  listServices: async (
    filters: ServiceListFilters = {}
  ): Promise<MarketplaceListResponse> => {
    const params = new URLSearchParams();
    if (filters.q) params.set("q", filters.q);
    if (filters.category) params.set("category", filters.category);
    if (filters.minPrice !== undefined) params.set("minPrice", filters.minPrice.toString());
    if (filters.maxPrice !== undefined) params.set("maxPrice", filters.maxPrice.toString());
    if (filters.sellerId) params.set("sellerId", filters.sellerId);
    if (filters.location) params.set("location", filters.location);
    if (filters.featured !== undefined) params.set("featured", String(filters.featured));
    if (filters.page) params.set("page", filters.page.toString());
    if (filters.limit) params.set("limit", filters.limit.toString());
    if (filters.sort) params.set("sort", filters.sort);

    const response = await apiClient.get(`/marketplace/services?${params.toString()}`);
    return response.data;
  },

  getServicesBySellerId: async (
    sellerId: string,
    extraFilters: Omit<ServiceListFilters, "sellerId"> = {}
  ): Promise<MarketplaceListResponse> => {
    return marketplaceApi.listServices({ ...extraFilters, sellerId });
  },

  

  getService: async (serviceId: string): Promise<{ service: MarketplaceService }> => {
    const response = await apiClient.get(`/marketplace/services/${serviceId}`);
    return response.data;
  },

  createService: async (
    data: CreateServiceRequest
  ): Promise<{ service: MarketplaceService }> => {
    const response = await apiClient.post("/marketplace/services", data);
    return response.data;
  },

  updateService: async (
    serviceId: string,
    data: UpdateServiceRequest
  ): Promise<{ service: MarketplaceService }> => {
    const response = await apiClient.put(`/marketplace/services/${serviceId}`, data);
    return response.data;
  },

  deleteService: async (serviceId: string): Promise<{ service: MarketplaceService }> => {
    const response = await apiClient.delete(`/marketplace/services/${serviceId}`);
    return response.data;
  },

  createBooking: async (
    data: CreateBookingRequest
  ): Promise<{ booking: Booking }> => {
    const response = await apiClient.post("/marketplace/bookings", data);
    return response.data;
  },

  listBookings: async (filters: BookingListFilters = {}): Promise<BookingListResponse> => {
    const params = new URLSearchParams();
    if (filters.role) params.set("role", filters.role);
    if (filters.page) params.set("page", filters.page.toString());
    if (filters.limit) params.set("limit", filters.limit.toString());
    if (filters.status) params.set("status", filters.status);

    const response = await apiClient.get(`/marketplace/bookings?${params.toString()}`);
    return response.data;
  },

  updateBookingStatus: async (
    bookingId: string,
    data: UpdateBookingStatusRequest
  ): Promise<{ booking: Booking }> => {
    const response = await apiClient.put(`/marketplace/bookings/${bookingId}/status`, data);
    return response.data;
  },
};

export default marketplaceApi;
