'use client';

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { marketplaceApi } from "@/lib/api/marketplace.api";
import { X, ChevronRight, Loader2 } from "lucide-react";

export const BookingsList = () => {
  const queryClient = useQueryClient();
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  // 1. Fetch Bookings
  const { data, isLoading } = useQuery({
    queryKey: ["bookings", role],
    queryFn: () => marketplaceApi.listBookings({ role, limit: 20 }),
  });

  // 2. Status Update Mutation
  const updateMutation = useMutation({
    mutationFn: (newStatus: string) => 
      marketplaceApi.updateBookingStatus(selectedBooking?._id, { status: newStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      setSelectedBooking(null); // Close modal on success
    },
  });

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      {/* Role Toggle */}
      <div className="flex gap-8 border-b border-zinc-100 dark:border-zinc-800 mb-8 pb-2">
        {['buyer', 'seller'].map((r) => (
          <button
            key={r}
            onClick={() => setRole(r as 'buyer' | 'seller')}
            className={`text-[11px] font-black uppercase tracking-widest pb-2 transition-all ${
              role === r ? 'text-black border-b-2 border-black' : 'text-zinc-400'
            }`}
          >
            {r === 'buyer' ? 'My Purchases' : 'My Sales'}
          </button>
        ))}
      </div>

      {/* Transactions List */}
      <div className="space-y-1">
        {isLoading ? (
          <p className="text-center py-20 text-[10px] font-bold uppercase animate-pulse">Syncing...</p>
        ) : (
          data?.bookings.map((booking: any) => (
            <div 
              key={booking._id}
              onClick={() => setSelectedBooking(booking)}
              className="group flex items-center justify-between py-4 px-4 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-xl cursor-pointer transition-all"
            >
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase text-pink-500 tracking-tighter">
                  {booking.status}
                </span>
                <span className="text-sm font-bold">{booking.serviceId?.title || `Order #${booking._id.slice(-6)}`}</span>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-sm font-black">${booking.amount}</span>
                <ChevronRight size={16} className="text-zinc-300" />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detail & Status Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-[2rem] p-8 border border-zinc-200 dark:border-zinc-800 shadow-xl">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-lg font-black uppercase italic italic">Order Details</h2>
              <button onClick={() => setSelectedBooking(null)}><X size={20}/></button>
            </div>

            <div className="space-y-4 mb-8">
              <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-xl">
                <p className="text-[9px] font-bold text-zinc-400 uppercase mb-1">Requirements</p>
                <p className="text-xs italic">"{selectedBooking.requirements || "No requirements provided."}"</p>
              </div>
            </div>

            {/* Dropdown Status Selector */}
            <div className="space-y-2">
              <p className="text-[9px] font-bold text-zinc-400 uppercase">Update Status</p>
              <select 
                defaultValue={selectedBooking.status}
                onChange={(e) => updateMutation.mutate(e.target.value)}
                disabled={updateMutation.isPending}
                className="w-full p-4 bg-white dark:bg-zinc-800 border-2 border-black rounded-xl font-bold text-xs outline-none focus:ring-2 ring-pink-500"
              >
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="in_progress">In Progress</option>
                <option value="delivered">Delivered</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              {updateMutation.isPending && <Loader2 className="w-4 h-4 animate-spin text-pink-500 mt-2" />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default BookingsList;