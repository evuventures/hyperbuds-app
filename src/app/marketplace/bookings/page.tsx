"use client";

import React, { useState } from "react";
import { useBookings, useUpdateBookingStatus } from "@/hooks/features/useMarketplace";
import { BookingCard } from "@/components/marketplace/BookingCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DashboardLayout from "@/components/layout/Dashboard/Dashboard";
import { Calendar, AlertCircle } from "lucide-react";
import type { BookingListFilters, BookingStatus } from "@/types/marketplace.types";

const STATUS_OPTIONS: { value: BookingStatus | "all"; label: string }[] = [
  { value: "all", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "in_progress", label: "In Progress" },
  { value: "delivered", label: "Delivered" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "refunded", label: "Refunded" },
];

export default function MyBookingsPage() {
  const [activeTab, setActiveTab] = useState<"buyer" | "seller">("buyer");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">("all");

  const buyerFilters: BookingListFilters = {
    role: "buyer",
    status: statusFilter !== "all" ? statusFilter : undefined,
    page: 1,
    limit: 50,
  };

  const sellerFilters: BookingListFilters = {
    role: "seller",
    status: statusFilter !== "all" ? statusFilter : undefined,
    page: 1,
    limit: 50,
  };

  const {
    data: buyerData,
    isLoading: buyerLoading,
    error: buyerError,
  } = useBookings(activeTab === "buyer" ? buyerFilters : undefined);

  const {
    data: sellerData,
    isLoading: sellerLoading,
    error: sellerError,
  } = useBookings(activeTab === "seller" ? sellerFilters : undefined);

  const updateBookingStatus = useUpdateBookingStatus();

  const handleStatusUpdate = async (bookingId: string, status: BookingStatus) => {
    try {
      await updateBookingStatus.mutateAsync({ bookingId, status });
    } catch (error) {
      console.error("Status update failed:", error);
    }
  };

  const currentData = activeTab === "buyer" ? buyerData : sellerData;
  const currentLoading = activeTab === "buyer" ? buyerLoading : sellerLoading;
  const currentError = activeTab === "buyer" ? buyerError : sellerError;
  const bookings = currentData?.bookings || [];

  return (
    <DashboardLayout>
      <div className="min-h-full bg-gradient-to-br from-gray-50 via-white to-purple-50/10 dark:from-gray-900 dark:via-gray-900 dark:to-purple-900/10">
        <div className="p-4 pb-16 lg:p-6 lg:pb-34">
          <div className="mx-auto max-w-7xl space-y-6">
            {/* Header */}
            <div className="flex gap-3 items-center">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-md">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">
                  My Bookings
                </h1>
                <p className="text-xs text-gray-500 sm:text-sm dark:text-gray-400">
                  Track orders and fulfillment
                </p>
              </div>
            </div>

            {/* Tabs and Filters */}
            <div className="flex items-center justify-between gap-4">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "buyer" | "seller")}>
                <TabsList>
                  <TabsTrigger value="buyer">As Buyer</TabsTrigger>
                  <TabsTrigger value="seller">As Seller</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex items-center gap-2">
                <Select
                  value={statusFilter}
                  onValueChange={(value) => setStatusFilter(value as BookingStatus | "all")}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Loading State */}
            {currentLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-64 w-full" />
                  </div>
                ))}
              </div>
            )}

            {/* Error State */}
            {currentError && (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
                <p className="text-destructive">
                  {currentError instanceof Error
                    ? currentError.message
                    : "Failed to load bookings"}
                </p>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="mt-4"
                >
                  Retry
                </Button>
              </div>
            )}

            {/* Empty State */}
            {!currentLoading && !currentError && bookings.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">
                  No Bookings {activeTab === "buyer" ? "as Buyer" : "as Seller"}
                </h2>
                <p className="text-muted-foreground">
                  {activeTab === "buyer"
                    ? "You haven't booked any services yet."
                    : "You don't have any service bookings yet."}
                </p>
              </div>
            )}

            {/* Bookings Grid */}
            {!currentLoading && !currentError && bookings.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {bookings.map((booking) => (
                    <BookingCard
                      key={booking._id}
                      booking={booking}
                      role={activeTab}
                      onStatusUpdate={handleStatusUpdate}
                    />
                  ))}
                </div>

                {/* Summary Stats */}
                {currentData && (
                  <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Summary</h3>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Total</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{bookings.length}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Pending</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {bookings.filter((b) => b.status === "pending").length}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">In Progress</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {bookings.filter((b) => b.status === "in_progress").length}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Completed</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {bookings.filter((b) => b.status === "completed").length}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
