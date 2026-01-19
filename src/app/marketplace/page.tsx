'use client';

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { marketplaceApi } from "@/lib/api/marketplace.api";
import { ServiceCard } from "@/components/marketplace/ServiceCard/ServiceCard";
import { Search, Store, Ticket, Globe, ArrowRight, Plus } from "lucide-react";
import Link from "next/link";
import type { MarketplaceService, Booking } from "@/types/marketplace.types";

type TabType = "marketplace" | "my-services" | "bookings";

export const MarketplaceDashboard = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialTab = (searchParams.get("tab") as TabType) || "marketplace";
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState<string | undefined>();

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    router.push(`?tab=${tab}`, { scroll: false });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const current = (searchParams.get("tab") as TabType) || "marketplace";
    setActiveTab(current);
  }, [searchParams]);

  // 🪄 FETCH DATA BY TAB
  const { data: marketData, isLoading: marketLoading } = useQuery({
    queryKey: ["marketplace-all", searchQuery, category],
    queryFn: () =>
      marketplaceApi.listServices({
        q: searchQuery,
        category,
        limit: 12,
      }),
    enabled: activeTab === "marketplace",
  });

  const { data: myServicesData, isLoading: myServicesLoading } = useQuery({
    queryKey: ["my-services"],
    queryFn: () => marketplaceApi.listServices({ sellerId: "me" }),
    enabled: activeTab === "my-services",
  });

  const { data: bookingsData, isLoading: bookingsLoading } = useQuery({
    queryKey: ["my-bookings"],
    queryFn: () => marketplaceApi.listBookings(),
    enabled: activeTab === "bookings",
  });

  const bookings = bookingsData?.bookings || [];
  const myServices = myServicesData?.services || [];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 pb-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* HEADER */}
        <header className="mb-12 space-y-8 flex flex-col items-center">
          <div className="bg-pink-100 dark:bg-pink-900/20 p-4 rounded-3xl">
            <Store className="text-pink-500" size={40} />
          </div>

          <div className="text-center">
            <h1 className="text-5xl font-black tracking-tighter uppercase italic">
              Marketplace
            </h1>
            <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">
              {{
                marketplace: "Browse Global Services",
                "my-services": "Your Offered Services",
                bookings: "Your Active Transactions",
              }[activeTab]}
            </p>
          </div>

          {/* TAB NAVIGATION */}
          <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 p-2 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <button
              onClick={() => handleTabChange("marketplace")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${
                activeTab === "marketplace"
                  ? "bg-pink-500 text-white shadow-lg shadow-pink-500/20"
                  : "text-zinc-400 hover:text-zinc-800 dark:hover:text-white"
              }`}
            >
              <Globe size={16} /> Explore
            </button>

            <button
              onClick={() => handleTabChange("my-services")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${
                activeTab === "my-services"
                  ? "bg-pink-50 text-pink-600 dark:bg-pink-900/20 shadow-lg shadow-pink-500/10"
                  : "text-zinc-400 hover:text-zinc-800 dark:hover:text-white"
              }`}
            >
              <Store size={16} /> My Services
            </button>

            <button
              onClick={() => handleTabChange("bookings")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${
                activeTab === "bookings"
                  ? "bg-pink-50 text-pink-600 dark:bg-pink-900/20 shadow-lg shadow-pink-500/10"
                  : "text-zinc-400 hover:text-zinc-800 dark:hover:text-white"
              }`}
            >
              <Ticket size={16} /> Bookings
            </button>
          </div>
        </header>

        {/* SEARCH + FILTERS (only for Explore tab) */}
        {activeTab === "marketplace" && (
          <div className="max-w-4xl mx-auto mb-12 space-y-6">
            <div className="relative group">
              <Search
                className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-pink-500 transition-colors"
                size={20}
              />
              <input
                type="text"
                placeholder="Search for designers, developers, or creators..."
                className="w-full pl-14 pr-6 py-5 bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-4xl focus:border-pink-500 outline-none transition-all shadow-sm font-medium"
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar justify-center">
              {["Design", "Development", "Video", "Audio", "Writing"].map(
                (cat) => (
                  <button
                    key={cat}
                    onClick={() =>
                      setCategory(cat === category ? undefined : cat)
                    }
                    className={`px-6 py-2 rounded-full border text-xs font-black uppercase tracking-tighter transition-all ${
                      category === cat
                        ? "bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-black"
                        : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    }`}
                  >
                    {cat}
                  </button>
                )
              )}
            </div>
          </div>
        )}

        {/* MAIN CONTENT */}
        <main className="min-h-100">
          {activeTab === "marketplace" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {marketLoading ? (
                [...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-80 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded-[2.5rem]"
                  />
                ))
              ) : marketData?.services?.length === 0 ? (
                <div className="col-span-full py-20 text-center text-zinc-400 font-bold uppercase tracking-widest">
                  No services found matching your search.
                </div>
              ) : (
                marketData?.services?.map((service: MarketplaceService) => (
                  <ServiceCard key={service._id} service={service} />
                ))
              )}
            </div>
          )}

          {activeTab === "my-services" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold uppercase tracking-widest">
                  My Services
                </h2>
                <Link
                  href="/marketplace/services/new"
                  className="flex items-center gap-2 bg-pink-500 text-white px-4 py-2 rounded-full font-bold text-sm hover:bg-pink-600 transition"
                >
                  <Plus size={16} /> New Service
                </Link>
              </div>

              {myServicesLoading ? (
                <div className="text-center text-zinc-400 uppercase font-bold">
                  Loading your services...
                </div>
              ) : myServices.length === 0 ? (
                <div className="p-20 text-center bg-white dark:bg-zinc-900 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[3rem]">
                  <Store className="mx-auto text-zinc-200 mb-4" size={48} />
                  <p className="text-zinc-500 font-black uppercase tracking-widest text-sm">
                    You haven’t added any services yet
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {myServices.map((service: MarketplaceService) => (
                    <ServiceCard key={service._id} service={service} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "bookings" && (
            <div className="max-w-3xl mx-auto space-y-4">
              {bookingsLoading ? (
                <div className="p-10 text-center animate-pulse uppercase font-black text-zinc-400">
                  Loading your activity...
                </div>
              ) : bookings.length === 0 ? (
                <div className="p-20 text-center bg-white dark:bg-zinc-900 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[3rem]">
                  <Ticket className="mx-auto text-zinc-200 mb-4" size={48} />
                  <p className="text-zinc-500 font-black uppercase tracking-widest text-sm">
                    No active bookings found
                  </p>
                </div>
              ) : (
                bookings.map((booking: Booking) => (
                  <Link
                    href={`/marketplace/bookings/${booking._id}`}
                    key={booking._id}
                    className="p-6 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-4xl flex justify-between items-center hover:border-pink-500 transition-all group shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center font-bold text-pink-500">
                        #
                      </div>
                      <div>
                        <p className="font-black uppercase text-sm group-hover:text-pink-600 transition-colors">
                          {typeof booking.serviceId === 'object' ? booking.serviceId?.title : "Project Request"}
                        </p>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase">
                          Status:{" "}
                          <span className="text-pink-500">
                            {booking.status}
                          </span>
                        </p>
                      </div>
                    </div>
                    <ArrowRight
                      size={20}
                      className="text-zinc-300 group-hover:text-pink-500 group-hover:translate-x-1 transition-all"
                    />
                  </Link>
                ))
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default MarketplaceDashboard;
