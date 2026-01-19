'use client';

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { marketplaceApi } from "@/lib/api/marketplace.api";
import { 
  CheckCircle2, 
  ArrowLeft, 
  Clock, 
  Package, 
  HelpCircle, 
  MapPin, 
  ShieldCheck,
  Settings,
  Trash2
} from "lucide-react";
import Image from "next/image";
import { BookingModal } from "@/components/marketplace/BookingFlow/BookingModal";
import { useAuth } from "@/hooks/auth/useAuth"; // Assuming you have an auth hook

export const ServiceDetailsPage = () => {
  const router = useRouter();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { user } = useAuth(); // Get the logged-in user
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["service", id],
    queryFn: () => marketplaceApi.getService(id as string),
    enabled: !!id
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: () => marketplaceApi.deleteService(id as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      router.push("/marketplace");
    },
    onError: () => alert("Failed to delete service. Only the owner can perform this action.")
  });

  if (isLoading) return (
    <div className="p-20 text-center uppercase font-black tracking-widest animate-pulse">
      Syncing Service Data...
    </div>
  );
  
  if (!data?.service) return (
    <div className="p-20 text-center font-bold uppercase">Service not found</div>
  );

  const { service } = data;

  // Check if current user is the owner
  const isOwner = user?.id === service.seller?._id || user?.id === service.seller;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">

        {/* Top Navigation & Management Bar */}
        <div className="flex justify-between items-center">
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-2 text-zinc-500 font-black uppercase text-[10px] tracking-widest hover:text-pink-600 transition"
          >
            <ArrowLeft size={16} /> Back to Marketplace
          </button>

          {/* Seller Management Tools */}
          {isOwner && (
            <div className="flex gap-4">
              <button 
                onClick={() => router.push(`/marketplace/services/${id}/edit`)}
                className="flex items-center gap-2 px-6 py-2.5 bg-zinc-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-pink-600 transition shadow-lg"
              >
                <Settings size={14} /> Edit Listing
              </button>
              <button 
                onClick={() => { if(confirm("Permanently delete this service?")) deleteMutation.mutate() }}
                className="flex items-center gap-2 px-4 py-2.5 border-2 border-red-500 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* LEFT: Content & Info */}
          <div className="lg:col-span-2 space-y-10">
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                <span className="px-4 py-1.5 bg-pink-100 text-pink-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                  {service.category}
                </span>
                {service.featured && (
                  <span className="px-4 py-1.5 bg-amber-100 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-1">
                    <ShieldCheck size={12} /> Featured
                  </span>
                )}
              </div>

              <h1 className="text-5xl md:text-7xl font-black leading-[0.85] uppercase tracking-tighter italic">
                {service.title}
              </h1>
              
              <p className="text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-3xl border-l-4 border-pink-500 pl-6 py-2">
                {service.description}
              </p>
            </div>

            {/* Gallery */}
            {service.images && service.images.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {service.images.map((img: string, i: number) => (
                  <div key={i} className="relative aspect-video rounded-[2rem] overflow-hidden border-2 border-zinc-900 shadow-sm">
                    <Image fill src={img} alt="Service showcase" className="object-cover" />
                  </div>
                ))}
              </div>
            )}

            {/* Technical Details: Packages & Requirements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {service.packages?.length > 0 && (
                <div className="p-8 bg-white dark:bg-zinc-900 rounded-[2.5rem] border-2 border-zinc-100 dark:border-zinc-800">
                  <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 mb-6">
                    <Package size={18} className="text-pink-500" /> Packages
                  </h3>
                  <div className="space-y-4">
                    {service.packages.map((pkg: any, i: number) => (
                      <div key={i} className="group p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl hover:bg-pink-50 transition-colors">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-black uppercase italic text-xs tracking-tight">{pkg.name}</span>
                          <span className="text-pink-600 font-black italic">${pkg.price}</span>
                        </div>
                        <p className="text-[11px] text-zinc-500 font-medium leading-tight">{pkg.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {service.requirements?.length > 0 && (
                <div className="p-8 bg-white dark:bg-zinc-900 rounded-[2.5rem] border-2 border-zinc-100 dark:border-zinc-800">
                  <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 mb-6">
                    <CheckCircle2 size={18} className="text-pink-500" /> Key Requirements
                  </h3>
                  <ul className="space-y-3">
                    {service.requirements.map((req: string, i: number) => (
                      <li key={i} className="flex gap-3 text-xs font-bold text-zinc-600 dark:text-zinc-400">
                        <div className="h-1.5 w-1.5 bg-pink-500 rounded-full mt-1.5 shrink-0" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Booking Action Card */}
          <div className="lg:col-start-3">
            <div className="sticky top-8 p-8 bg-white dark:bg-zinc-900 border-4 border-zinc-900 dark:border-zinc-700 rounded-[3rem] shadow-[15px_15px_0px_0px_rgba(219,39,119,0.3)] space-y-8">
              
              <div className="space-y-1">
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Base Rate</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-6xl font-black italic tracking-tighter">${service.price}</span>
                  <span className="font-black uppercase text-xs text-zinc-400 italic">USD</span>
                </div>
              </div>

              <div className="space-y-4">
                {/* Prevent sellers from booking their own service */}
                {!isOwner ? (
                  <button
                    onClick={() => setIsBookingModalOpen(true)}
                    className="w-full py-6 bg-pink-600 hover:bg-black text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl shadow-pink-500/20 flex items-center justify-center gap-3"
                  >
                    Confirm Booking
                  </button>
                ) : (
                  <div className="p-6 bg-zinc-50 dark:bg-zinc-800 rounded-2xl border-2 border-dashed border-zinc-200 text-center">
                    <p className="text-[10px] font-black uppercase text-zinc-400">This is your listing</p>
                  </div>
                )}
                
                <div className="flex flex-col gap-3 py-6 border-y-2 border-dashed border-zinc-100 dark:border-zinc-800">
                  <div className="flex justify-between text-[10px] font-black uppercase">
                    <span className="text-zinc-400 flex items-center gap-1"><Clock size={12}/> Est. Delivery</span>
                    <span>{service.deliveryTime || "TBD"}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-black uppercase">
                    <span className="text-zinc-400 flex items-center gap-1"><MapPin size={12}/> Work Location</span>
                    <span>{service.location || "Remote"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <BookingModal 
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        serviceId={service._id}
        serviceTitle={service.title}
      />
    </div>
  );
};

export default ServiceDetailsPage;