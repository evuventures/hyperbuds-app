'use client';

import { useParams } from "next/navigation"; // Correct import for Next.js
import { useQuery } from "@tanstack/react-query";
import { marketplaceApi } from "@/lib/api/marketplace.api";
import { ArrowLeft, Clock, Tag, DollarSign } from "lucide-react";
import Link from "next/link";

export default function ServiceDetailsPage() {
  const params = useParams();
  const serviceId = params.id as string; // Get the ID from the URL segment

  const { data: service, isLoading, error } = useQuery({
    queryKey: ["service", serviceId],
    queryFn: () => marketplaceApi.getService(serviceId),
    enabled: !!serviceId,
  });

  if (isLoading) return <div className="p-20 text-center font-black uppercase italic">Loading Service Details...</div>;
  if (error) return <div className="p-20 text-center text-red-500">Service not found.</div>;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link href="/marketplace" className="flex items-center gap-2 text-zinc-500 hover:text-pink-500 font-bold uppercase text-xs">
          <ArrowLeft size={16} /> Back to Marketplace
        </Link>

        <div className="bg-white dark:bg-zinc-900 border-2 border-zinc-900 rounded-[2.5rem] overflow-hidden shadow-[12px_12px_0px_0px_rgba(236,72,153,0.2)]">
          <div className="h-64 bg-zinc-200 dark:bg-zinc-800" /> {/* Placeholder for image */}
          <div className="p-10 space-y-6">
            <h1 className="text-5xl font-black uppercase italic tracking-tighter">{service?.title}</h1>
            <p className="text-zinc-600 dark:text-zinc-400 text-lg leading-relaxed">{service?.description}</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl flex items-center gap-3">
                <Tag className="text-pink-500" />
                <span className="font-bold uppercase text-xs tracking-widest">{service?.category}</span>
              </div>
              <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl flex items-center gap-3">
                <DollarSign className="text-pink-500" />
                <span className="font-black text-xl italic">${service?.price}</span>
              </div>
            </div>

            <button className="w-full py-5 bg-pink-500 text-white font-black uppercase text-sm tracking-[0.2em] rounded-2xl hover:scale-[1.02] transition shadow-lg shadow-pink-500/20">
              Book Service Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
