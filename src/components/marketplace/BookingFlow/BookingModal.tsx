'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { marketplaceApi } from "@/lib/api/marketplace.api";
import { CreateBookingRequest } from "@/types/marketplace.types";
import { X, Send, AlertCircle, Calendar, MessageSquare, Loader2 } from "lucide-react";

interface BookingModalProps {
  serviceId: string;
  serviceTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export const BookingModal = ({ serviceId, isOpen, onClose }: BookingModalProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<Partial<CreateBookingRequest>>({
    message: "",
    requirements: "",
    packageName: "Standard",
  });

  const mutation = useMutation({
    mutationFn: (data: CreateBookingRequest) => marketplaceApi.createBooking(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      onClose();
      router.push('/marketplace/bookings');
    },
    onError: (error: ApiError) => {
      alert(error?.response?.data?.message || "Failed to create booking. You cannot book your own service.");
    }
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const requestData: CreateBookingRequest = {
      serviceId,
      message: formData.message || "I'm interested in this service",
      requirements: formData.requirements || "No specific requirements provided",
      packageName: formData.packageName || "Standard",
    };
    
    mutation.mutate(requestData);
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 md:p-6 bg-white/60 dark:bg-zinc-950/60 backdrop-blur-sm transition-colors duration-300">
      {/* FIX: Added max-h-[90vh] and overflow-y-auto to allow scrolling on mobile 
          Added w-full to ensure it fills small screens 
      */}
      <div className="bg-white dark:bg-gray-900 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl animate-in fade-in zoom-in duration-200 no-scrollbar">
        
        {/* Modal Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 z-10 p-8 pb-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-start">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Book now</h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
          >
            <X size={20} className="text-zinc-500" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-8 pt-6 space-y-4">
          <div className="space-y-4">
            
            {/* Message Field */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs uppercase text-gray-500 dark:text-gray-200">
                <MessageSquare size={14} className="text-purple-500" /> Message to Creator
              </label>
              <textarea 
                required
                className="w-full p-5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-500 rounded-2xl outline-none transition-all min-h-30 text-sm font-medium text-gray-700 dark:text-gray-100 placeholder:text-gray-400"
                placeholder="Explain what you need..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              />
            </div>

            {/* Requirements Field */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs uppercase text-gray-500 dark:text-gray-200">
                <Calendar size={14} className="text-blue-500" /> Specific Requirements
              </label>
              <textarea 
                className="w-full p-5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-500 rounded-2xl outline-none transition-all min-h-25 text-sm font-medium text-gray-700 dark:text-gray-100 placeholder:text-gray-400"
                placeholder="List technical specs, colors, or file formats..."
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              />
            </div>
          </div>

          {/* Warning Note */}
          <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
            <AlertCircle size={18} className="text-purple-500 shrink-0 mt-0.5" />
            <p className="text-xs text-gray-500 dark:text-gray-200">
              By clicking send, you agree to start a formal transaction. 
              Payment is processed once the creator <span className="text-gray-900 dark:text-white font-bold">accepts</span> your request.
            </p>
          </div>

          {/* Action Button */}
          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full py-4 bg-linear-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white rounded-xl uppercase text-xs transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 shadow-lg shadow-purple-500/20"
          >
            {mutation.isPending ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <Send size={18} /> Submit Booking Request
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};