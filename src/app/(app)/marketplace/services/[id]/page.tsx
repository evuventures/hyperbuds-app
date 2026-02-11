'use client';

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery} from "@tanstack/react-query";
import { marketplaceApi } from "@/lib/api/marketplace.api";
import { 
  ArrowLeft, 
  Clock, 
  MapPin, 
  Settings,
  Loader2,
  HelpCircle,
  ChevronDown,
  Package,
  ClipboardList
} from "lucide-react";
import Image from "next/image";
import { BookingModal } from "@/components/marketplace/BookingFlow/BookingModal";
import { useAuth } from "@/hooks/auth/useAuth"; 
import { MarketplacePackage, MarketplaceFaq } from "@/types/marketplace.types";

export const ServiceDetailsPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  
  const { loading: isAuthLoading } = useAuth(); 
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const { data, isLoading: isServiceLoading, isError } = useQuery({
    queryKey: ["service", id],
    queryFn: () => marketplaceApi.getService(id),
    enabled: !!id,
  });

  

  if (isServiceLoading || isAuthLoading) return (
    <div className="flex h-screen items-center justify-center bg-white dark:bg-gray-950">
      <Loader2 className="animate-spin text-purple-500" size={32} />
    </div>
  );
  
  if (isError || !data?.service) return (
    <div className="h-screen flex items-center justify-center flex-col gap-4 bg-white dark:bg-gray-950">
      <p className="font-bold text-xl text-zinc-400">Service Not Found</p>
      <button onClick={() => router.push("/marketplace")} className="text-purple-600 dark:text-purple-400 font-medium">
        Return to Market
      </button>
    </div>
  );

  const service = data.service;
  
  const packages = service.packages ?? [];
  const faq = service.faq ?? [];
  const requirements = service.requirements ?? [];
  const images = service.images ?? [];

  return (
    <>
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300 pb-30">
        <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">

          {/* Navigation Bar */}
          <div className="flex justify-between items-center">
            <button 
              onClick={() => router.push("/marketplace")} 
              className="flex items-center gap-2 text-gray-400 dark:text-gray-200 text-sm hover:text-purple-600 dark:hover:text-purple-400 transition"
            >
              <ArrowLeft size={16} /> Back
            </button>

            <div className="flex items-center gap-3">
            
                <div className="flex gap-3">
                  <button 
                    onClick={() => router.push(`/marketplace/services/${id}/edit`)}
                    className="flex items-center text-black dark:text-gray-200  text-sm  transition shadow-lg"
                  >
                    <Settings size={20} /> 
                  </button>
                 
                </div>
            
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <div className="lg:col-span-2 space-y-12">
              
              <div className="space-y-6">
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border dark:border-gray-600 rounded-md text-xs uppercase">
                    {service.category}
                  </span>
                </div>

                <h1 className="text-2xl md:text-4xl font-bold uppercase">
                  {service.title}
                </h1>
                <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl">
                  {service.description}
                </p>
              </div>

              {/* Gallery */}
              {images.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {images.map((img: string, i: number) => (
                    <div key={i} className="relative aspect-video rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900">
                      <Image fill src={img} alt="Showcase" className="object-cover" />
                    </div>
                  ))}
                </div>
              )}

              {/* Tiered Packages - Fixed "possibly undefined" and rounded-4xl */}
              {packages.length > 0 && (
                <div className="space-y-6 pt-4">
                  <h3 className="text-lg text-gray-500 dark:text-gray-200 flex items-center gap-2">
                    <Package size={16} className="text-purple-500 " /> Packages
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {packages.map((pkg: MarketplacePackage, i: number) => (
                      <div key={i} className="p-6 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl space-y-3">
                        <div className="flex justify-between items-start">
                          <span className=" text-lg  text-purple-600">{pkg.name}</span>
                          <span className=" text-xl ">{pkg.price}</span>
                        </div>
                        <p className="text-base text-gray-500 dark:text-gray-400 ">{pkg.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* FAQ Section */}
              {faq.length > 0 && (
                <div className="space-y-6">
                  <h3 className="text-lg  text-gray-500 dark:text-gray-200 flex items-center gap-2">
                    <HelpCircle size={16} className="text-purple-500" />FAQ
                  </h3>
                  <div className="divide-y divide-gray-100 dark:divide-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-white dark:bg-gray-900 shadow-sm">
                    {faq.map((item: MarketplaceFaq, i: number) => (
                      <details key={i} className="group p-6">
                        <summary className="flex justify-between items-center font-semibold text-base text-gray-600 dark:text-gray-300 cursor-pointer list-none outline-none">
                          {item.question}
                          <ChevronDown size={16} className="group-open:rotate-180 transition-transform text-gray-400" />
                        </summary>
                        <p className="mt-4 text-base text-gray-500 dark:text-gray-400  pl-4 border-l-2 border-purple-500/20">
                          {item.answer}
                        </p>
                      </details>
                    ))}
                  </div>
                </div>
              )}

              {/* Requirements Section - Fixed "possibly undefined" */}
              {requirements.length > 0 && (
                <div className="space-y-6">
                  <h3 className="text-lg text-gray-500 dark:text-gray-200 flex items-center gap-2">
                    <ClipboardList size={16} className="text-purple-500" /> Requirements
                  </h3>
                  <div className="space-y-3">
                    {requirements.map((req: string, i: number) => (
                      <div key={i} className="flex gap-4 items-start p-5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl">
                        <span className="flex-none w-6 h-6 rounded-full bg-gray-500 text-white flex items-center justify-center text-[10px] font-bold mt-0.5">{i + 1}</span>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{req}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Card */}
            <div className="lg:col-start-3">
              <div className="sticky top-8 mt-8 lg:mt-0 px-4 md:px-10 p-10 border border-gray-200 dark:border-gray-800 rounded-[2.5rem] space-y-8 bg-white dark:bg-gray-900 shadow-xl shadow-zinc-200/50 dark:shadow-none">
                <div className="space-y-2 text-center md:text-left">
                  <span className="text-xs text-gray-400 uppercase">Base Investment</span>
                  <div className="flex items-baseline justify-center md:justify-start gap-2">
                    <span className="text-6xl font-bold ">{service.price}</span>
                    <span className=" uppercase text-xs text-gray-400">{service.currency}</span>
                  </div>
                </div>

              
                  <button
                    onClick={() => setIsBookingModalOpen(true)}
                    className="w-full py-4 bg-linear-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white rounded-2xl font-bold uppercase text-sm transition-all shadow-lg shadow-purple-500/30 active:scale-95"
                  >
                    Book now
                  </button>
               

                <div className="space-y-5 pt-8 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex justify-between text-sm ">
                    <span className="text-gray-400 flex items-center gap-1.5"><Clock size={14}/> Delivery Time</span>
                    <span className="text-gray-700 dark:text-gray-200">{service.deliveryTime}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400 flex items-center gap-1.5"><MapPin size={14}/> Location</span>
                    <span className="text-gray-700 dark:text-gray-200">{service.location}</span>
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
    </>
  );
};

export default ServiceDetailsPage;