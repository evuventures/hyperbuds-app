'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { marketplaceApi } from "@/lib/api/marketplace.api";
import { CreateBookingRequest } from "@/types/marketplace.types";
import { X, Send, AlertCircle, Calendar, MessageSquare } from "lucide-react";

interface BookingModalProps {
  serviceId: string;
  serviceTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export const BookingModal = ({ serviceId, serviceTitle, isOpen, onClose }: BookingModalProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<Partial<CreateBookingRequest>>({
    message: "",
    requirements: "",
    packageName: "Standard", // Defaulting based on your schema
  });

  const mutation = useMutation({
    mutationFn: (data: CreateBookingRequest) => marketplaceApi.createBooking(data),
    onSuccess: () => {
      // 1. Invalidate bookings list so the new one shows up immediately
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      // 2. Close modal
      onClose();
      // 3. Redirect to the Bookings tab on the marketplace page
      router.push('/marketplace/bookings');
    },
    onError: (error: any) => {
      alert(error?.response?.data?.message || "Failed to create booking. You cannot book your own service.");
    }
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Construct request body based on your Swagger schema
    const requestData: CreateBookingRequest = {
      serviceId,
      message: formData.message || "I'm interested in this service",
      requirements: formData.requirements || "No specific requirements provided",
      packageName: formData.packageName,
      // Optional: scheduledFor and dueDate can be added if your form expands
    };
    
    mutation.mutate(requestData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-xl rounded-[3rem] border-4 border-zinc-900 overflow-hidden shadow-[30px_30px_0px_0px_rgba(219,39,119,0.3)] animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="p-8 border-b-4 border-zinc-900 flex justify-between items-start bg-pink-50 dark:bg-zinc-800">
          <div className="space-y-1">
            <h2 className="text-3xl font-black uppercase italic tracking-tighter leading-none">Initialize Order</h2>
            <p className="text-[10px] font-black text-pink-600 uppercase tracking-[0.2em]">{serviceTitle}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white dark:hover:bg-zinc-700 rounded-full border-2 border-zinc-900 transition active:scale-90">
            <X size={20} className="text-zinc-900 dark:text-white" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          <div className="grid gap-6">
            
            {/* Message Field */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                <MessageSquare size={14} className="text-pink-500" /> Message to Creator
              </label>
              <textarea 
                required
                className="w-full p-5 bg-zinc-100 dark:bg-zinc-800 border-2 border-transparent focus:border-zinc-900 dark:focus:border-pink-500 rounded-3xl outline-none transition min-h-[120px] text-sm font-bold"
                placeholder="Explain what you need..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              />
            </div>

            {/* Requirements Field */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                <Calendar size={14} className="text-pink-500" /> Specific Requirements
              </label>
              <textarea 
                className="w-full p-5 bg-zinc-100 dark:bg-zinc-800 border-2 border-transparent focus:border-zinc-900 dark:focus:border-pink-500 rounded-3xl outline-none transition min-h-[100px] text-sm font-bold"
                placeholder="List technical specs, colors, or file formats..."
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              />
            </div>
          </div>

          {/* Warning Note */}
          <div className="flex items-start gap-4 p-5 bg-zinc-900 text-white rounded-[2rem]">
            <AlertCircle size={20} className="text-pink-500 shrink-0 mt-1" />
            <p className="text-[10px] font-bold uppercase leading-relaxed text-zinc-400">
              By clicking send, you agree to start a formal transaction. 
              Payment will be processed once the creator <span className="text-white">accepts</span> your request.
            </p>
          </div>

          {/* Action Button */}
          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full py-6 bg-pink-600 hover:bg-black text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl shadow-pink-500/20"
          >
            {mutation.isPending ? (
              <span className="animate-pulse">Processing...</span>
            ) : (
              <>
                <Send size={20} /> Submit Booking Request
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
