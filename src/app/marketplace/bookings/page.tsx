'use client';

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { marketplaceApi } from "@/lib/api/marketplace.api";
import { X, ChevronRight, Loader2, ShoppingBag, Package, Search, Store, AlertCircle, Layers } from "lucide-react";
import DashboardLayout from "@/components/layout/Dashboard/Dashboard";
import Link from "next/link";
import { Booking, BookingStatus, MarketplaceService } from "@/types/marketplace.types";

export const BookingsList = () => {
  const queryClient = useQueryClient();
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["bookings", role],
    queryFn: () =>
      marketplaceApi.listBookings({
        role,
        limit: 20,
      }),
  });

  const updateMutation = useMutation({
    mutationFn: (newStatus: string) =>
      marketplaceApi.updateBookingStatus(selectedBooking?._id || "", {
        status: newStatus as BookingStatus,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      setSelectedBooking(null);
    },
  });

  const allowedStatuses =
    role === "seller"
      ? [
          { value: "pending", label: "Pending Review" },
          { value: "accepted", label: "Accepted" },
          { value: "in_progress", label: "In Progress" },
          { value: "delivered", label: "Delivered" },
          { value: "cancelled", label: "Cancelled" },
        ]
      : [
          { value: "pending", label: "Pending Review" },
          { value: "completed", label: "Mark Completed" },
          { value: "cancelled", label: "Cancel Booking" },
        ];

  return (
    <DashboardLayout>
      <section
        aria-label="Marketplace bookings pipeline"
        className="min-h-screen bg-slate-50/60 px-4 py-6 pb-20 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100 sm:px-6 lg:py-8"
      >
        <div className="mx-auto max-w-6xl space-y-6">
          {/* Linear Command Header */}
          <header className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/60 dark:text-indigo-300">
                    <Layers className="h-3 w-3" /> Order Pipeline
                  </span>
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
                  Bookings
                </h1>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  Track service orders, requirements, and delivery status transitions.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/marketplace"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  <Search size={14} /> Explore
                </Link>
                <Link
                  href="/marketplace/services"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  <Store size={14} /> Services
                </Link>
              </div>
            </div>

            {/* Role Toggle */}
            <div className="mt-5 flex gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
              {(["buyer", "seller"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  aria-pressed={role === r}
                  onClick={() => setRole(r)}
                  className={`rounded-xl px-5 py-2 text-xs font-semibold transition ${
                    role === r
                      ? "bg-indigo-600 text-white"
                      : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                  }`}
                >
                  {r === "buyer" ? "Purchases" : "Sales"}
                </button>
              ))}
            </div>
          </header>

          {/* Bookings List */}
          <div className="space-y-3">
            {isLoading ? (
              <div
                role="status"
                className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white py-20 dark:border-slate-800 dark:bg-slate-900"
              >
                <Loader2 className="animate-spin text-indigo-600" size={28} />
                <p className="text-xs text-slate-500">Loading bookings…</p>
              </div>
            ) : !data?.bookings?.length ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center dark:border-slate-800 dark:bg-slate-900">
                {role === "buyer" ? (
                  <ShoppingBag className="mx-auto mb-3 text-slate-400" size={32} />
                ) : (
                  <Package className="mx-auto mb-3 text-slate-400" size={32} />
                )}
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  No {role} history found
                </p>
              </div>
            ) : (
              data.bookings.map((booking: Booking, idx: number) => {
                const service = booking.serviceId as unknown as MarketplaceService;
                return (
                  <div
                    key={booking._id}
                    onClick={() => setSelectedBooking(booking)}
                    className="group flex cursor-pointer flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 transition hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900 md:flex-row md:items-center"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          ORD-{String(idx + 1).padStart(2, "0")}
                        </span>
                        <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold capitalize text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                          {booking.status.replace("_", " ")}
                        </span>
                      </div>
                      <h2 className="text-base font-bold text-slate-900 dark:text-white">
                        {service?.title || `Order #${booking._id.slice(-6)}`}
                      </h2>
                    </div>

                    <div className="flex items-center justify-between gap-6 border-t border-slate-100 pt-3 md:border-t-0 md:pt-0">
                      <div className="text-left md:text-right">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                          Total Amount
                        </p>
                        <span className="text-lg font-bold text-slate-900 dark:text-white">
                          {booking.currency || "USD"} {Number(booking.amount || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-600 transition group-hover:border-indigo-600 group-hover:bg-indigo-600 group-hover:text-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        <ChevronRight size={18} />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {selectedBooking && (
            <div
              role="dialog"
              aria-label="Order details"
              className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
            >
              <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-5 flex items-start justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Order Details</h2>
                    <p className="text-xs text-slate-500">Status tracking &amp; fulfillment</p>
                  </div>
                  <button
                    type="button"
                    aria-label="Close order details"
                    onClick={() => setSelectedBooking(null)}
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-5">
                  <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                    <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      <ShoppingBag size={13} /> Client Requirements
                    </p>
                    <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-200">
                      {selectedBooking.requirements || "No specific instructions provided."}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                      Update Order Status
                      <select
                        defaultValue={selectedBooking.status}
                        onChange={(e) => updateMutation.mutate(e.target.value)}
                        disabled={updateMutation.isPending}
                        className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                      >
                        {allowedStatuses.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <div className="flex items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50/70 p-3 text-xs text-indigo-800 dark:border-indigo-900/50 dark:bg-indigo-950/30 dark:text-indigo-200">
                      <AlertCircle size={14} className="shrink-0 text-indigo-600 dark:text-indigo-400" />
                      <span>
                        {role === "seller"
                          ? "Sellers can accept, start, or deliver orders."
                          : "Buyers can confirm completion or cancel pending orders."}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </DashboardLayout>
  );
};

export default BookingsList;
