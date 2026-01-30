'use client';

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { marketplaceApi } from "@/lib/api/marketplace.api";
import { Plus, ChevronRight, LayoutGrid, Loader2, Store, Search, Ticket } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/auth/useAuth";
import { MarketplaceService } from "@/types/marketplace.types";



type ServicesResponse = {
  services: MarketplaceService[];
};

export default function MyServicesPage() {
  const router = useRouter();
  const { user, loading: isAuthLoading } = useAuth();


  const currentUserId = user?.id || (user as { _id?: string })?._id;

  // Fetch services for the current user
  const { data, isLoading: isServiceLoading } = useQuery<ServicesResponse>({
    queryKey: ["my-services", currentUserId],
    queryFn: () => marketplaceApi.listServices({ sellerId: currentUserId, limit: 100 }),
    enabled: !!currentUserId,
  });

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 transition-colors pb-20">
        <div className="max-w-6xl mx-auto py-12 px-6 space-y-10">

          {/* NAV BAR */}
          <div className="flex justify-end mb-4">
            <div className="flex items-center gap-2 p-1.5 ">
              <Link href="/marketplace" className="flex items-center gap-2 px-5 py-2.5 rounded-xl  border border-gray-200 dark:text-white dark:border-gray-500  font-bold text-sm text-gray-500 hover:text-purple-600 transition-all">
                <Search size={14} /> Explore
              </Link>
              <Link href="/marketplace/bookings" className="flex items-center gap-2 px-5 py-2.5 rounded-xl  border border-gray-200 dark:text-white dark:border-gray-500  font-bold text-sm text-gray-500 hover:text-purple-600 transition-all">
                <Ticket size={14} /> Bookings
              </Link>
            </div>
          </div>

          {/* HEADER */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-100 dark:border-zinc-800 pb-10 mt-4 md:mt-0">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold flex items-center gap-2 text-gray-500 dark:text-white">
                <Store size={20} />
                Service Manager</h1>
              <p className="text-sm text-zinc-400">Manage your active listings</p>
            </div>
            <button
              onClick={() => router.push("/marketplace/services/create")}
              className="flex items-center justify-center w-fit gap-2 px-4 md:px-8 py-3.5 bg-linear-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-sm shadow-lg active:scale-95 transition-all"
            >
              <Plus size={18} /> Create Service
            </button>
          </div>

          {/* LIST AREA */}
          <div className="space-y-4">
            {isServiceLoading || isAuthLoading ? (
              <div className="py-24 text-center flex flex-col items-center gap-4">
                <Loader2 className="animate-spin text-purple-500" size={32} />
                <p className="text-xs text-gray-400">Fetching your inventory...</p>
              </div>
            ) : !data?.services?.length ? (
              <div className="py-32 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] bg-zinc-50/30 dark:bg-zinc-900/10">
                <Store className="mx-auto text-zinc-200 mb-4" size={48} />
                <p className="text-xs dark:text-zinc-400">No services linked to your account</p>
              </div>
            ) : (
              data.services.map((service) => (
                <div
                  key={service._id}
                  onClick={() => router.push(`/marketplace/services/${service._id}`)}
                  className="group flex items-center justify-between p-7 bg-white dark:bg-zinc-900 border border-zinc-200 rounded-2xl hover:border-purple-500/50 transition-all cursor-pointer shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-zinc-50 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-400 group-hover:text-purple-600 transition-colors">
                      <LayoutGrid size={20} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xl font-bold tracking-tight">{service.title}</h3>
                      <p className="text-xs text-purple-600 font-bold uppercase tracking-widest">${service.price}</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 group-hover:bg-linear-to-r group-hover:from-purple-500 group-hover:to-blue-500 group-hover:text-white transition-all shadow-sm">
                    <ChevronRight size={20} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
  );
}
