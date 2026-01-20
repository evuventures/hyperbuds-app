// src/hooks/features/useMarketplace.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { marketplaceApi } from '@/lib/api/marketplace.api';
import { useToast } from '../ui/useToast';
import type {
  MarketplaceService,
  MarketplaceListResponse,
  CreateServiceRequest,
  UpdateServiceRequest,
  Booking,
  BookingListResponse,
  CreateBookingRequest,
  UpdateBookingStatusRequest,
  ServiceListFilters,
  BookingListFilters,
} from '@/types/marketplace.types';

// Query keys structure - defined to avoid circular reference
const allKey = ['marketplace'] as const;

export const marketplaceKeys = {
  all: allKey,
  services: {
    all: [...allKey, 'services'] as const,
    lists: () => [...allKey, 'services', 'list'] as const,
    list: (filters?: ServiceListFilters) => [...allKey, 'services', 'list', filters] as const,
    detail: (id: string) => [...allKey, 'services', 'detail', id] as const,
  },
  bookings: {
    all: [...allKey, 'bookings'] as const,
    lists: () => [...allKey, 'bookings', 'list'] as const,
    list: (filters?: BookingListFilters) => [...allKey, 'bookings', 'list', filters] as const,
    detail: (id: string) => [...allKey, 'bookings', 'detail', id] as const,
  },
};

/**
 * Hook to fetch list of services
 * GET /marketplace/services
 */
export const useServices = (filters?: ServiceListFilters) => {
  return useQuery<MarketplaceListResponse>({
    queryKey: marketplaceKeys.services.list(filters),
    queryFn: () => marketplaceApi.listServices(filters || {}),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

/**
 * Hook to fetch a single service by ID
 * GET /marketplace/services/{serviceId}
 */
export const useService = (serviceId: string | null) => {
  return useQuery<{ service: MarketplaceService }>({
    queryKey: marketplaceKeys.services.detail(serviceId || ''),
    queryFn: () => {
      if (!serviceId) throw new Error('Service ID is required');
      return marketplaceApi.getService(serviceId);
    },
    enabled: !!serviceId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

/**
 * Hook to create a new service
 * POST /marketplace/services
 */
export const useCreateService = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<{ service: MarketplaceService }, Error, CreateServiceRequest>({
    mutationFn: (data: CreateServiceRequest) => marketplaceApi.createService(data),
    onSuccess: (data) => {
      // Invalidate service lists to refetch
      queryClient.invalidateQueries({ queryKey: marketplaceKeys.services.lists() });
      // Add the new service to cache
      queryClient.setQueryData(marketplaceKeys.services.detail(data.service._id), data);

      toast({
        title: 'Service created successfully',
        description: 'Your service has been published to the marketplace',
        variant: 'success',
        duration: 3000,
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to create service',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
        duration: 5000,
      });
    },
  });
};

/**
 * Hook to update an existing service
 * PUT /marketplace/services/{serviceId}
 */
export const useUpdateService = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<
    { service: MarketplaceService },
    Error,
    { serviceId: string; data: UpdateServiceRequest }
  >({
    mutationFn: ({ serviceId, data }) => marketplaceApi.updateService(serviceId, data),
    onSuccess: (data, variables) => {
      // Update the service in cache
      queryClient.setQueryData(marketplaceKeys.services.detail(variables.serviceId), data);
      // Invalidate service lists to refetch
      queryClient.invalidateQueries({ queryKey: marketplaceKeys.services.lists() });

      toast({
        title: 'Service updated successfully',
        description: 'Your service has been updated',
        variant: 'success',
        duration: 3000,
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to update service',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
        duration: 5000,
      });
    },
  });
};

/**
 * Hook to delete a service
 * DELETE /marketplace/services/{serviceId}
 */
export const useDeleteService = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<{ service: MarketplaceService }, Error, string>({
    mutationFn: (serviceId: string) => marketplaceApi.deleteService(serviceId),
    onSuccess: (data, serviceId) => {
      // Remove the service from cache
      queryClient.removeQueries({ queryKey: marketplaceKeys.services.detail(serviceId) });
      // Invalidate service lists to refetch
      queryClient.invalidateQueries({ queryKey: marketplaceKeys.services.lists() });

      toast({
        title: 'Service deleted successfully',
        description: 'Your service has been removed from the marketplace',
        variant: 'success',
        duration: 3000,
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to delete service',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
        duration: 5000,
      });
    },
  });
};

/**
 * Hook to fetch list of bookings
 * GET /marketplace/bookings
 */
export const useBookings = (filters?: BookingListFilters) => {
  return useQuery<BookingListResponse>({
    queryKey: marketplaceKeys.bookings.list(filters),
    queryFn: () => marketplaceApi.listBookings(filters || {}),
    staleTime: 2 * 60 * 1000, // 2 minutes - bookings change more frequently
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

/**
 * Hook to create a new booking
 * POST /marketplace/bookings
 */
export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<{ booking: Booking }, Error, CreateBookingRequest>({
    mutationFn: (data: CreateBookingRequest) => marketplaceApi.createBooking(data),
    onSuccess: (data) => {
      // Invalidate booking lists to refetch
      queryClient.invalidateQueries({ queryKey: marketplaceKeys.bookings.lists() });
      // Add the new booking to cache
      queryClient.setQueryData(marketplaceKeys.bookings.detail(data.booking._id), data);
      // Invalidate the service to update stats
      if (typeof data.booking.serviceId === 'object' && data.booking.serviceId._id) {
        queryClient.invalidateQueries({
          queryKey: marketplaceKeys.services.detail(data.booking.serviceId._id),
        });
      } else if (typeof data.booking.serviceId === 'string') {
        queryClient.invalidateQueries({
          queryKey: marketplaceKeys.services.detail(data.booking.serviceId),
        });
      }

      toast({
        title: 'Booking created successfully',
        description: 'Your booking request has been submitted',
        variant: 'success',
        duration: 3000,
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to create booking',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
        duration: 5000,
      });
    },
  });
};

/**
 * Hook to update booking status
 * PUT /marketplace/bookings/{bookingId}/status
 */
export const useUpdateBookingStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<
    { booking: Booking },
    Error,
    { bookingId: string; status: UpdateBookingStatusRequest['status'] }
  >({
    mutationFn: ({ bookingId, status }) =>
      marketplaceApi.updateBookingStatus(bookingId, { status }),
    onSuccess: (data, variables) => {
      // Update the booking in cache
      queryClient.setQueryData(marketplaceKeys.bookings.detail(variables.bookingId), data);
      
      // If booking is cancelled, optimistically remove it from all booking lists
      if (variables.status === 'cancelled') {
        // Remove cancelled booking from all booking list queries
        queryClient.setQueriesData<BookingListResponse>(
          { queryKey: marketplaceKeys.bookings.lists() },
          (oldData) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              bookings: oldData.bookings.filter((b) => b._id !== variables.bookingId),
            };
          }
        );
      } else {
        // For other status updates, just invalidate to refetch
        queryClient.invalidateQueries({ queryKey: marketplaceKeys.bookings.lists() });
      }
      
      // Invalidate the service to update stats
      if (typeof data.booking.serviceId === 'object' && data.booking.serviceId._id) {
        queryClient.invalidateQueries({
          queryKey: marketplaceKeys.services.detail(data.booking.serviceId._id),
        });
      } else if (typeof data.booking.serviceId === 'string') {
        queryClient.invalidateQueries({
          queryKey: marketplaceKeys.services.detail(data.booking.serviceId),
        });
      }

      const statusMessages: Record<string, string> = {
        accepted: 'Booking accepted',
        cancelled: 'Booking cancelled and removed from list',
        completed: 'Booking completed',
        in_progress: 'Booking marked as in progress',
        delivered: 'Booking delivered',
        refunded: 'Booking refunded',
      };

      toast({
        title: statusMessages[data.booking.status] || 'Booking status updated',
        description: variables.status === 'cancelled' 
          ? 'The booking has been cancelled and removed from your list'
          : 'The booking status has been updated',
        variant: 'success',
        duration: 3000,
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to update booking status',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
        duration: 5000,
      });
    },
  });
};

export default useServices;
