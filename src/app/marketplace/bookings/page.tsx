'use client';

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { marketplaceApi } from "@/lib/api/marketplace.api";
import { X, ChevronRight, Loader2, ShoppingBag, Package, Search, Store } from "lucide-react";
import DashboardLayout from "@/components/layout/Dashboard/Dashboard";
import Link from "next/link";
import { Booking, BookingStatus, MarketplaceService } from "@/types/marketplace.types";

export const BookingsList = () => {
  const queryClient = useQueryClient();
  
  
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  
  const { data, isLoading } = useQuery({
    queryKey: ["bookings", role],
    queryFn: () => marketplaceApi.listBookings({ 
      role,    
      limit: 20 
    }),
  });

  
  const updateMutation = useMutation({
    mutationFn: (newStatus: string) => 
      marketplaceApi.updateBookingStatus(selectedBooking?._id || "", { 
        status: newStatus as BookingStatus 
      }),
    onSuccess: () => {
      // Refresh the list immediately after a change
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      setSelectedBooking(null);
    },
  });

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-zinc-100 transition-colors duration-300">
        <div className="max-w-6xl mx-auto py-12 px-6 space-y-10">
          
          {/* NAVIGATION BAR */}

          <div className="flex justify-end">
             <div className="flex items-center gap-2 p-1.5 ">
              <Link href="/marketplace" className="flex items-center gap-2 px-5 py-2.5 rounded-xl  border border-gray-200 dark:text-white dark:border-gray-500  font-bold text-sm text-gray-500 hover:text-purple-600 transition-all">
                <Search size={14} /> Explore
              </Link>
              <Link href="/marketplace/services" className="flex items-center gap-2 px-5 py-2.5 rounded-xl  border border-gray-200 dark:text-white dark:border-gray-500  font-bold text-sm text-gray-500 hover:text-purple-600 transition-all">
                <Store size={14} /> My Services
              </Link>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">Bookings</h1>
            <p className=" text-gray-400 text-xs">Registry of all marketplace transactions</p>
          </div>

          {/* ROLE TOGGLE - The core filter mechanism */}
          <div className="flex gap-4 p-1.5 border border-gray-200 dark:border-gray-800 rounded-2xl w-fit bg-gray-50/50 dark:bg-gray-900/50 shadow-sm">
            {['buyer', 'seller'].map((r) => (
              <button
                key={r}
                onClick={() => setRole(r as 'buyer' | 'seller')}
                className={`px-10 py-3 rounded-xl text-sm transition-all ${
                  role === r 
                  ? "bg-linear-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/20" 
                  : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {r === 'buyer' ? 'My Purchases' : 'My Sales'}
              </button>
            ))}
          </div>

          {/* DATA PRESENTATION */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="py-24 text-center flex flex-col items-center gap-4">
                <Loader2 className="animate-spin text-purple-500" size={32} />
                <p className="text-sm text-gray-400">Syncing Registry...</p>
              </div>
            ) : !data?.bookings?.length ? (
              <div className="py-32 text-center border border-dashed border-zinc-200 dark:border-gray-800 rounded-[2.5rem] bg-zinc-50/30 dark:bg-zinc-900/10">
                {role === 'buyer' ? <ShoppingBag className="mx-auto text-zinc-200 mb-4" size={48}/> : <Package className="mx-auto text-zinc-200 mb-4" size={48}/>}
                <p className="text-sm text-gray-400">No {role} history recorded</p>
              </div>
            ) : (
              data.bookings.map((booking: Booking) => {
                const service = booking.serviceId as unknown as MarketplaceService;
                return (
                  <div 
                    key={booking._id}
                    onClick={() => setSelectedBooking(booking)}
                    className="group flex items-center justify-between p-7 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl hover:border-purple-500/50 transition-all cursor-pointer shadow-sm hover:shadow-md"
                  >
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs px-2 py-0.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded w-fit">
                        {booking.status.replace('_', ' ')}
                      </span>
                      <span className="text-xl font-bold uppercase">
                        {service?.title || `Order #${booking._id.slice(-6)}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className="text-xs  uppercase text-gray-400 mb-0.5">Total</p>
                        <span className="font-bold text-2xl ">${booking.amount}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 group-hover:bg-linear-to-r group-hover:from-purple-500 group-hover:to-blue-500 group-hover:text-white transition-all">
                        <ChevronRight size={20} />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* ORDER DETAIL MODAL */}
          {selectedBooking && (
            <div className="fixed inset-0 z-100 flex items-center justify-center bg-white/60 dark:bg-zinc-950/60 backdrop-blur-md p-4">
               <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-[2.5rem] border border-gray-200 dark:border-gray-800 shadow-2xl p-10">
                <div className="flex justify-between items-start mb-10">
                  <div className="space-y-1">
                    <h2 className="text-3xl font-bold ">Order Profile</h2>
                  {/* <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">ID: {selectedBooking._id}</p>*/}
                  </div>
                  <button onClick={() => setSelectedBooking(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"><X size={24}/></button>
                </div>

                <div className="space-y-8">
                  <div className="bg-zinc-50 dark:bg-zinc-800/50 p-7 rounded-xl border border-zinc-100 dark:border-zinc-800">
                    <p className="text-base font-bold text-gray-400 mb-3">Client Requirements</p>
                    <p className="text-sm font-medium ">{selectedBooking.requirements || "No specific instructions provided."}</p>
                  </div>

                  <div className="space-y-4">
                    <p className="text-base font-bold text-gray-400  ml-1">Update Progress</p>
                    <select 
                      defaultValue={selectedBooking.status}
                      onChange={(e) => updateMutation.mutate(e.target.value)}
                      disabled={updateMutation.isPending || role === 'buyer'}
                      className={`w-full p-5 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-xs  outline-none appearance-none ${role === 'buyer' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer ring-purple-500/10 focus:ring-4 transition-all'}`}
                    >
                      <option value="pending">Pending Review</option>
                      <option value="accepted">Accepted</option>
                      <option value="in_progress">In Progress</option>
                      <option value="delivered">Delivered</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    {role === 'buyer' && (
                      <p className="text-xs text-zinc-400  text-center ">Status updates are reserved for the service provider.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BookingsList;