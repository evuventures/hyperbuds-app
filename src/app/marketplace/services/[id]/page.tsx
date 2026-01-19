'use client';

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { marketplaceApi } from "@/lib/api/marketplace.api";
import { 
  CheckCircle2, 
  ArrowLeft, 
  Clock, 
  Tag, 
  Package, 
  HelpCircle, 
  MapPin, 
  ShieldCheck 
} from "lucide-react";
import Image from "next/image";
import { BookingModal } from "@/components/marketplace/BookingFlow/BookingModal"; // Ensure this file exists in the same folder

export const ServiceDetailsPage = () => {
  const router = useRouter();
  const { id } = useParams(); // Fixed for Next.js 13+
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["service", id],
    queryFn: () => marketplaceApi.getService(id as string),
    enabled: !!id
  });

  if (isLoading) return (
    <div className="p-20 text-center uppercase font-black tracking-widest animate-pulse">
      Syncing Service Data...
    </div>
  );
  
  if (!data?.service) return (
    <div className="p-20 text-center font-bold uppercase">
      Service not found
    </div>
  );

  const { service } = data;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">

        {/* Navigation */}
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-2 text-zinc-500 font-black uppercase text-[10px] tracking-widest hover:text-pink-600 transition"
        >
          <ArrowLeft size={16} /> Back to Marketplace
        </button>

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
                {service.images.map((img, i) => (
                  <div key={i} className="relative aspect-video rounded-[2rem] overflow-hidden border-2 border-zinc-900 shadow-sm">
                    <Image
                      fill
                      src={img} 
                      alt="Service showcase" 
                      className="object-cover" 
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Technical Details: Packages & Requirements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {service.packages && service.packages.length > 0 && (
                <div className="p-8 bg-white dark:bg-zinc-900 rounded-[2.5rem] border-2 border-zinc-100 dark:border-zinc-800">
                  <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 mb-6">
                    <Package size={18} className="text-pink-500" /> Packages
                  </h3>
                  <div className="space-y-4">
                    {service.packages.map((pkg, i) => (
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

              {service.requirements && service.requirements.length > 0 && (
                <div className="p-8 bg-white dark:bg-zinc-900 rounded-[2.5rem] border-2 border-zinc-100 dark:border-zinc-800">
                  <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 mb-6">
                    <CheckCircle2 size={18} className="text-pink-500" /> Key Requirements
                  </h3>
                  <ul className="space-y-3">
                    {service.requirements.map((req, i) => (
                      <li key={i} className="flex gap-3 text-xs font-bold text-zinc-600 dark:text-zinc-400">
                        <div className="h-1.5 w-1.5 bg-pink-500 rounded-full mt-1.5 shrink-0" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* FAQ Section */}
            {service.faq && service.faq.length > 0 && (
              <div className="p-10 bg-zinc-900 text-white rounded-[3rem] space-y-8">
                <h3 className="text-2xl font-black uppercase italic tracking-tight flex items-center gap-3">
                  <HelpCircle size={24} className="text-pink-500" /> Common Questions
                </h3>
                <div className="grid gap-6">
                  {service.faq.map((item, i) => (
                    <div key={i} className="space-y-2 border-b border-zinc-800 pb-6 last:border-0">
                      <p className="font-black uppercase text-pink-500 text-xs tracking-widest">{item.question}</p>
                      <p className="text-zinc-400 text-sm leading-relaxed">{item.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Booking Action Card */}
          <div className="lg:col-start-3">
            <div className="sticky top-8 p-8 bg-white dark:bg-zinc-900 border-4 border-zinc-900 dark:border-zinc-700 rounded-[3rem] shadow-[15px_15px_0px_0px_rgba(219,39,119,0.3)] space-y-8">
              
              <div className="space-y-1">
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Base Rate</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-6xl font-black italic tracking-tighter">
                    ${service.price}
                  </span>
                  <span className="font-black uppercase text-xs text-zinc-400 italic">USD</span>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => setIsBookingModalOpen(true)}
                  className="w-full py-6 bg-pink-600 hover:bg-black text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl shadow-pink-500/20 flex items-center justify-center gap-3"
                >
                  Confirm Booking
                </button>
                
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

              <div className="text-center">
                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest leading-tight">
                  Secure Checkout Guaranteed. <br/> Your funds are held safely in escrow.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* The Requirements Modal */}
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