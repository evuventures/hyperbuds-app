'use client';

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { marketplaceApi } from "@/lib/api/marketplace.api";
import { Plus, ChevronRight, LayoutGrid, AlertCircle } from "lucide-react";

export default function MyServicesPage() {
  const router = useRouter();

  // Fetching all services without a seller filter as per your instruction
  const { data, isLoading, error } = useQuery({
    queryKey: ["all-management-services"],
    queryFn: () => marketplaceApi.listServices({ limit: 100 }),
  });

  return (
    <div className="max-w-5xl mx-auto py-12 px-6 space-y-10">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-4 border-zinc-900 pb-10">
        <div>
          <h1 className="text-6xl font-black uppercase italic tracking-tighter leading-none">
            Service Manager
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mt-2">
            Public Management Dashboard
          </p>
        </div>

        <button 
          onClick={() => router.push("/marketplace/create")}
          className="flex items-center gap-3 px-8 py-4 bg-zinc-900 text-white rounded-2xl font-black uppercase text-xs hover:bg-pink-600 transition shadow-[8px_8px_0px_0px_rgba(236,72,153,0.3)]"
        >
          <Plus size={18} strokeWidth={3} />
          Create Service
        </button>
      </div>

      {/* Services List Logic */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="py-20 text-center font-black uppercase animate-pulse text-zinc-400">
            Fetching Registry...
          </div>
        ) : error ? (
          <div className="py-20 text-center flex flex-col items-center gap-4 border-2 border-red-100 rounded-[3rem]">
            <AlertCircle className="text-red-500" size={32} />
            <p className="font-black uppercase text-red-500 italic">Failed to connect to API</p>
          </div>
        ) : !data?.services || data.services.length === 0 ? (
          /* NO SERVICES FOUND STATE */
          <div className="py-32 text-center border-4 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[3rem] bg-zinc-50/50">
            <LayoutGrid className="mx-auto text-zinc-200 mb-4" size={48} />
            <p className="font-black uppercase text-zinc-400 tracking-widest text-sm italic">
              No services found in the marketplace
            </p>
            <button 
              onClick={() => router.push("/marketplace/create")}
              className="mt-4 text-pink-500 font-black uppercase text-[10px] tracking-widest hover:underline"
            >
              Add the first service →
            </button>
          </div>
        ) : (
          /* SERVICES LIST */
          data.services.map((service: any) => (
            <div 
              key={service._id}
              onClick={() => router.push(`/marketplace/services/${service._id}`)}
              className="group flex items-center justify-between p-8 bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] hover:border-zinc-900 transition-all cursor-pointer shadow-sm"
            >
              <div className="flex items-center gap-8">
                <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-400 group-hover:bg-pink-100 group-hover:text-pink-500 transition-colors">
                  <LayoutGrid size={24} />
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-md">
                      {service.category}
                    </span>
                    <span className="text-[9px] font-black uppercase text-pink-500 tracking-widest">
                      ${service.price}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black uppercase italic tracking-tighter">
                    {service.title}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-[10px] font-black uppercase text-zinc-300 group-hover:text-zinc-900 transition-colors">View / Edit</span>
                <div className="p-3 rounded-full border-2 border-zinc-100 group-hover:bg-zinc-900 group-hover:text-white transition-all">
                  <ChevronRight size={20} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
