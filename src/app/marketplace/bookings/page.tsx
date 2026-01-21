"use client";

import React, { useState, useMemo } from "react";
import { useBookings, useUpdateBookingStatus } from "@/hooks/features/useMarketplace";
import { BookingCard } from "@/components/marketplace/BookingCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DashboardLayout from "@/components/layout/Dashboard/Dashboard";
import { Calendar, AlertCircle, ArrowLeft, Archive } from "lucide-react";
import { useRouter } from "next/navigation";
import type { BookingListFilters, BookingStatus } from "@/types/marketplace.types";
import { useBookingArchive } from "@/hooks/features/useBookingArchive";

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
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"buyer" | "seller">("buyer");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">("all");
  const [showArchived, setShowArchived] = useState(false);
  const { isArchived, archivedCount, archiveVersion, getArchivedBookings } = useBookingArchive();

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

  // Filter out cancelled bookings from the display unless user specifically filters for "cancelled"
  // This ensures cancelled bookings are removed from the page after cancellation
  const allBookings = currentData?.bookings || [];
  const statusFilteredBookings = statusFilter === "cancelled"
    ? allBookings.filter((booking) => booking.status === "cancelled")
    : allBookings.filter((booking) => booking.status !== "cancelled");

  // Get archived bookings Set and convert to array for dependency tracking
  // This ensures React detects changes when archive state updates
  // Call getArchivedBookings() inside useMemo to always get the latest Set
  const archivedIdsArray = useMemo(() => {
    const archivedSet = getArchivedBookings();
    return Array.from(archivedSet).sort();
  }, [getArchivedBookings, archiveVersion]);

  // Filter archived bookings based on showArchived toggle
  // When showArchived is true: show ONLY archived bookings
  // When showArchived is false: show ONLY non-archived bookings
  // Use archivedIdsArray directly to avoid stale closure issues
  const bookings = useMemo(() => {
    return showArchived
      ? statusFilteredBookings.filter((booking) => archivedIdsArray.includes(booking._id))
      : statusFilteredBookings.filter((booking) => !archivedIdsArray.includes(booking._id));
  }, [statusFilteredBookings, showArchived, archivedIdsArray, archiveVersion]);

  return (
    <DashboardLayout>
      <div className="min-h-full bg-gradient-to-br from-gray-50 via-white to-purple-50/10 dark:from-gray-900 dark:via-gray-900 dark:to-purple-900/10">
        <div className="p-4 pb-16 lg:p-6 lg:pb-34">
          <div className="mx-auto max-w-7xl space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="font-medium text-gray-900 bg-white border-2 border-gray-300 shadow-sm cursor-pointer dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-purple-500 dark:hover:border-purple-400"
              >
                <ArrowLeft className="mr-2 w-4 h-4" />
                Back
              </Button>
              <div className="flex gap-3 items-center flex-1">
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
            </div>

            {/* Tabs and Filters */}
            <div className="flex items-center justify-between gap-4">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "buyer" | "seller")}>
                <TabsList className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700">
                  <TabsTrigger
                    value="buyer"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white text-gray-700 dark:text-gray-300 font-medium cursor-pointer"
                  >
                    As Buyer
                  </TabsTrigger>
                  <TabsTrigger
                    value="seller"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white text-gray-700 dark:text-gray-300 font-medium cursor-pointer"
                  >
                    As Seller
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex items-center gap-3">
                {/* Show Archived Toggle */}
                {archivedCount > 0 && (
                  <Button
                    variant={showArchived ? "default" : "outline"}
                    onClick={() => setShowArchived(!showArchived)}
                    className={`flex items-center gap-2 font-medium cursor-pointer ${showArchived
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-2 border-purple-700 dark:border-purple-800 shadow-md"
                      : "bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                  >
                    <Archive className="w-4 h-4" />
                    <span className="hidden sm:inline">Show Archived</span>
                    {archivedCount > 0 && (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${showArchived
                        ? "bg-white/20 text-white"
                        : "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300"
                        }`}>
                        {archivedCount}
                      </span>
                    )}
                  </Button>
                )}

                <Select
                  value={statusFilter}
                  onValueChange={(value) => setStatusFilter(value as BookingStatus | "all")}
                >
                  <SelectTrigger className="w-[180px] bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white font-semibold hover:border-purple-500 dark:hover:border-purple-400 shadow-sm cursor-pointer [&>span]:text-gray-900 [&>span]:dark:text-white [&>span]:font-semibold">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 shadow-xl">
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        className="text-gray-900 dark:text-white hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer font-medium"
                      >
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
                  className="mt-4 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                >
                  Retry
                </Button>
              </div>
            )}

            {/* Empty State */}
            {!currentLoading && !currentError && bookings.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                  No Bookings {activeTab === "buyer" ? "as Buyer" : "as Seller"}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
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
                      isArchived={isArchived(booking._id)}
                    />
                  ))}
                </div>

                {/* Summary Stats */}
                {currentData && (
                  <div className="mt-6 p-6 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-lg">
                    <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Summary</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Total</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">{bookings.length}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                        <p className="text-sm font-semibold text-yellow-700 dark:text-yellow-400 uppercase tracking-wide mb-2">Pending</p>
                        <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-400">
                          {bookings.filter((b) => b.status === "pending").length}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                        <p className="text-sm font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wide mb-2">In Progress</p>
                        <p className="text-3xl font-bold text-blue-700 dark:text-blue-400">
                          {bookings.filter((b) => b.status === "in_progress").length}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                        <p className="text-sm font-semibold text-green-700 dark:text-green-400 uppercase tracking-wide mb-2">Completed</p>
                        <p className="text-3xl font-bold text-green-700 dark:text-green-400">
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
