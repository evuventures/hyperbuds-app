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
      <div className="min-h-screen bg-white dark:bg-slate-900 text-black dark:text-white transition-colors duration-300 pb-20">
        <div className="max-w-6xl mx-auto px-6 py-12">

          {/* TOP NAVIGATION */}
          <div className="flex justify-end mb-12">
            <div className="flex items-center gap-2 p-1.5 ">
              <Link href="/marketplace/services" className="flex items-center gap-2 px-5 py-2.5 rounded-xl  border border-gray-200 dark:border-gray-500 font-bold text-sm text-gray-500 dark:text-white hover:text-purple-600 transition-all">
                <Store size={14} /> My Services
              </Link>
              <Link href="/marketplace/bookings" className="flex items-center gap-2 px-5 py-2.5 rounded-xl  border border-gray-200 dark:text-white dark:border-gray-500  font-bold text-sm text-gray-500 hover:text-purple-600 transition-all">
                <Ticket size={14} /> Bookings
              </Link>
            </div>
          </div>

          {/* HERO SECTION */}
          <header className="mb-16 text-center space-y-4">
            <div className="flex flex-row items-center justify-center">
              <div className="flex justify-center items-center mb-2 sm:mb-3">
                <div className="shrink-0 p-2 mr-2 bg-linear-to-br from-purple-500 to-blue-500 rounded-xl shadow-md sm:p-2.5 sm:mr-3 sm:rounded-2xl">
                  <ShoppingBag className="w-6 h-6 text-white sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
                </div>
              </div>
              <h1 className="text-2xl md:text-5xl font-bold text-gray-900 dark:text-white">
                Marketplace
              </h1>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-base flex items-center justify-center gap-2">
              Connect <span className="text-purple-500">•</span>
              Collaborate <span className="text-purple-500">•</span>
              Make Sales
            </p>
          </header>

          {/* SEARCH BAR */}
          <div className="max-w-3xl mx-auto mb-10">
            <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-purple-500 transition-colors" size={22} />
              <input
                type="text"
                placeholder="Search services, skills, or creators..."
                className="w-full pl-16 pr-6 py-5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-500 rounded-lg focus:ring-4 focus:ring-purple-500/5 outline-none transition-all text-base font-medium"
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
                  className="appearance-none text-gray-500 pl-10 pr-10 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-500 rounded-xl text-sm cursor-pointer outline-none hover:border-purple-500 transition-all"
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
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input
                  type="text"
                  placeholder="location"
                  className="pl-10 pr-4 py-3 text-gray-500 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-500 rounded-xl text-sm outline-none w-40 hover:border-purple-500 transition-all"
                  onChange={(e) => setLocation(e.target.value || undefined)}
                />
              </div>

              {/* Price Range */}
              <div className="flex items-center gap-2 px-4 py-2 bg-zinc-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                <DollarSign size={14} className="text-zinc-400" />
                <input
                  type="number"
                  placeholder="min"
                  className="w-16 bg-transparent outline-none text-sm"
                  onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : undefined)}
                />
                <span className="text-zinc-300">—</span>
                <input
                  type="number"
                  placeholder="max"
                  className="w-16 bg-transparent outline-none text-sm"
                  onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>

              {/* Sort Order Dropdown */}
              <div className="relative group">
                <select
                  onChange={(e) => setSort(e.target.value)}
                  className="appearance-none text-gray-500  pl-10 pr-10 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-500 rounded-xl text-sm cursor-pointer outline-none hover:border-purple-500 transition-all"
                >
                  <option value="recent">Newest First</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
                <ArrowUpDown className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              </div>

              {/* Featured Toggle */}
              <button
                onClick={() => setFeatured(featured ? undefined : true)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl border text-sm transition-all ${featured
                    ? "bg-linear-to-r from-purple-500 to-blue-500 text-white border-transparent shadow-lg shadow-purple-500/20"
                    : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-400 hover:text-purple-500"
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
                <p className="text-xs  text-gray-500">Syncing Catalog Registry...</p>
              </div>
            ) : !data?.services || data.services.length === 0 ? (
              <div className="py-32 text-center border border-dashed border-gray-200 dark:border-gray-800 rounded-3xl bg-gray-50/30 dark:bg-gray-900/10">
                <p className="text-gray-400  text-sm">
                  No listings match the current filters
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 text-purple-600 font-bold text-xs"
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