'use client';

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { marketplaceApi } from "@/lib/api/marketplace.api";
import { ServiceCard } from "@/components/marketplace/ServiceCard/ServiceCard";
import { 
  Search, 
  Store, 
  Ticket, 
  Loader2, 
  ShoppingBag, 
  Filter, 
  ChevronDown, 
  MapPin, 
  DollarSign, 
  Sparkles,
  ArrowUpDown
} from "lucide-react";
import Link from "next/link";
import type { MarketplaceService } from "@/types/marketplace.types";
import DashboardLayout from "@/components/layout/Dashboard/Dashboard";

interface ServicesResponse {
  services: MarketplaceService[];
  total?: number;
}

export default function MarketplaceDashboard() {
  // FILTER STATES (Based on Swagger Parameters)
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState<string | undefined>();
  const [minPrice, setMinPrice] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number | undefined>();
  const [location, setLocation] = useState<string | undefined>();
  const [featured, setFeatured] = useState<boolean | undefined>();
  const [sort, setSort] = useState<string>("recent");

  const { data, isLoading } = useQuery<ServicesResponse>({
    queryKey: ["marketplace-all", searchQuery, category, minPrice, maxPrice, location, featured, sort],
    queryFn: () =>
      marketplaceApi.listServices({
        q: searchQuery,
        category,
        minPrice,
        maxPrice,
        location,
        featured,
        sort: sort as "recent" | "price_low" | "price_high" | "rating",
        limit: 12,
      }),
  });

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white transition-colors duration-300 pb-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          
          {/* TOP NAVIGATION */}
          <div className="flex justify-end mb-12">
            <div className="flex items-center gap-2 p-1.5 border border-gray-200 dark:border-gray-800 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/50">
              <Link href="/marketplace/services" className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-gray-500 hover:text-purple-600 transition-all">
                <Store size={14} /> My Services
              </Link>
              <Link href="/marketplace/bookings" className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-gray-500 hover:text-purple-600 transition-all">
                <Ticket size={14} /> Bookings
              </Link>
            </div>
          </div>

          {/* HERO SECTION */}
          <header className="mb-16 text-center space-y-4">
            <div className="flex flex-row gap-3 items-center justify-center">
              <ShoppingBag className="text-purple-500" size={48} />
              <h1 className="text-6xl md:text-8xl font-bold text-gray-900 dark:text-white">
                Marketplace
              </h1>
            </div>
            <p className="text-zinc-400 font-bold uppercase text-[10px]">
              Authorized Global Talent Registry
            </p>
          </header>

          {/* SEARCH BAR */}
          <div className="max-w-3xl mx-auto mb-10">
            <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-purple-500 transition-colors" size={22} />
              <input 
                type="text" 
                placeholder="Search services, skills, or creators..." 
                className="w-full pl-16 pr-6 py-5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:ring-4 focus:ring-purple-500/5 outline-none transition-all text-xl font-medium"
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* ADVANCED FILTER REGISTRY */}
          <div className="max-w-6xl mx-auto mb-16 space-y-6">
            <div className="flex flex-wrap items-center justify-center gap-4">
              
              {/* Category Dropdown */}
              <div className="relative group">
                <select 
                  onChange={(e) => setCategory(e.target.value || undefined)}
                  className="appearance-none pl-10 pr-10 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold uppercase cursor-pointer outline-none hover:border-purple-500 transition-all"
                >
                  <option value="">All Categories</option>
                  <option value="Design">Design</option>
                  <option value="Development">Development</option>
                  <option value="Video">Video</option>
                  <option value="Audio">Audio</option>
                  <option value="Writing">Writing</option>
                </select>
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
              </div>

              {/* Location Filter */}
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
                <input 
                  type="text"
                  placeholder="LOCATION"
                  className="pl-10 pr-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold uppercase outline-none w-40 hover:border-purple-500 transition-all"
                  onChange={(e) => setLocation(e.target.value || undefined)}
                />
              </div>

              {/* Price Range */}
              <div className="flex items-center gap-2 px-4 py-2 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                <DollarSign size={14} className="text-zinc-400" />
                <input 
                  type="number" 
                  placeholder="MIN" 
                  className="w-16 bg-transparent outline-none text-xs font-bold"
                  onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : undefined)}
                />
                <span className="text-zinc-300">—</span>
                <input 
                  type="number" 
                  placeholder="MAX" 
                  className="w-16 bg-transparent outline-none text-xs font-bold"
                  onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>

              {/* Sort Order Dropdown */}
              <div className="relative group">
                <select 
                  onChange={(e) => setSort(e.target.value)}
                  className="appearance-none pl-10 pr-10 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold uppercase cursor-pointer outline-none hover:border-purple-500 transition-all"
                >
                  <option value="recent">Newest First</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
                <ArrowUpDown className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
              </div>

              {/* Featured Toggle */}
              <button 
                onClick={() => setFeatured(featured ? undefined : true)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl border text-xs font-bold uppercase transition-all ${
                  featured 
                  ? "bg-purple-500 text-white border-transparent shadow-lg shadow-purple-500/20" 
                  : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-purple-500"
                }`}
              >
                <Sparkles size={14} /> Featured
              </button>

            </div>
          </div>

          {/* GRID AREA */}
          <main>
            {isLoading ? (
              <div className="flex flex-col items-center py-32 gap-4">
                <Loader2 className="animate-spin text-purple-500" size={32} />
                <p className="text-[10px] font-bold uppercase text-zinc-400">Syncing Catalog Registry...</p>
              </div>
            ) : !data?.services || data.services.length === 0 ? (
              <div className="py-32 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl bg-zinc-50/30 dark:bg-zinc-900/10">
                <p className="text-zinc-400 font-bold uppercase text-[10px]">
                  No listings match the current filters
                </p>
                <button 
                  onClick={() => window.location.reload()}
                  className="mt-4 text-purple-600 font-bold text-xs uppercase underline"
                >
                  Reset Registry
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {data.services.map((service: MarketplaceService) => (
                  <ServiceCard key={service._id} service={service} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </DashboardLayout>
  );
}