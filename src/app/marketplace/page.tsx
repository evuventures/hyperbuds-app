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
  ArrowUpDown,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import type { MarketplaceService } from "@/types/marketplace.types";
import DashboardLayout from "@/components/layout/Dashboard/Dashboard";

interface ServicesResponse {
  services: MarketplaceService[];
  total?: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export default function MarketplaceDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState<string | undefined>();
  const [minPrice, setMinPrice] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number | undefined>();
  const [location, setLocation] = useState<string | undefined>();
  const [featured, setFeatured] = useState<boolean | undefined>();
  const [sort, setSort] = useState<string>("recent");

  const { data, isLoading, isError, refetch } = useQuery<ServicesResponse>({
    queryKey: ["marketplace-all", searchQuery, category, minPrice, maxPrice, location, featured, sort],
    queryFn: () =>
      marketplaceApi.listServices({
        q: searchQuery || undefined,
        category,
        minPrice,
        maxPrice,
        location,
        featured,
        sort: sort as "recent" | "price_low" | "price_high" | "rating",
        limit: 12,
      }),
  });

  const resetFilters = () => {
    setSearchQuery("");
    setCategory(undefined);
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setLocation(undefined);
    setFeatured(undefined);
    setSort("recent");
  };

  const services = data?.services || [];
  const totalCount = data?.pagination?.total ?? data?.total ?? services.length;

  return (
    <DashboardLayout>
      <section
        aria-label="Creator service marketplace"
        className="min-h-screen bg-slate-50/60 px-4 py-6 pb-20 text-slate-900 transition-colors dark:bg-slate-950 dark:text-white sm:px-6 lg:py-8"
      >
        <div className="mx-auto max-w-6xl space-y-6">
          {/* Linear + Airbnb Command Header */}
          <header className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-2xl">
                <div className="mb-2 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/60 dark:text-indigo-300">
                    <ShoppingBag className="h-3 w-3" /> Airbnb · Linear Service Catalog
                  </span>
                  <span className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-0.5 font-mono text-[11px] font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
                    {totalCount} {totalCount === 1 ? "LISTING" : "LISTINGS"}
                  </span>
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
                  Creator Marketplace
                </h1>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  Book verified creator production, editing, design, and engineering services with structured deliverable tracking.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <Link
                  href="/marketplace/gear"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <ShoppingBag size={14} className="text-indigo-500" /> Creator Gear
                </Link>
                <Link
                  href="/marketplace/services"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <Store size={14} className="text-indigo-500" /> Services
                </Link>
                <Link
                  href="/marketplace/bookings"
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700"
                >
                  <Ticket size={14} /> Bookings
                </Link>
              </div>
            </div>

            {/* Search & Structured Filter Bar */}
            <div className="mt-5 space-y-3 border-t border-slate-100 pt-4 dark:border-slate-800">
              <div className="flex flex-col gap-3 sm:flex-row">
                <label className="relative flex-1">
                  <span className="sr-only">Search marketplace services</span>
                  <Search
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    size={16}
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    placeholder="Search services, skills, or production deliverables…"
                    className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </label>

                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <RotateCcw size={13} /> Reset filters
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* Category Filter */}
                <label className="relative">
                  <span className="sr-only">Filter by category</span>
                  <Filter className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                  <select
                    aria-label="Filter by category"
                    value={category || ""}
                    onChange={(e) => setCategory(e.target.value || undefined)}
                    className="appearance-none rounded-xl border border-slate-300 bg-white py-2 pl-8 pr-8 text-xs font-medium text-slate-700 outline-none transition hover:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                  >
                    <option value="">All Categories</option>
                    <option value="Design">Design</option>
                    <option value="Development">Development</option>
                    <option value="Video">Video</option>
                    <option value="Audio">Audio</option>
                    <option value="Writing">Writing</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                </label>

                {/* Location Filter */}
                <label className="relative">
                  <span className="sr-only">Filter by location</span>
                  <MapPin className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                  <input
                    type="text"
                    aria-label="Filter by location"
                    value={location || ""}
                    placeholder="Location"
                    className="w-32 rounded-xl border border-slate-300 bg-white py-2 pl-8 pr-3 text-xs text-slate-700 outline-none transition hover:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                    onChange={(e) => setLocation(e.target.value || undefined)}
                  />
                </label>

                {/* Price Range */}
                <div className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-1.5 dark:border-slate-700 dark:bg-slate-950">
                  <DollarSign size={13} className="text-slate-400" />
                  <input
                    type="number"
                    aria-label="Minimum price"
                    value={minPrice ?? ""}
                    placeholder="Min"
                    className="w-14 bg-transparent text-xs text-slate-700 outline-none dark:text-slate-200"
                    onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : undefined)}
                  />
                  <span className="text-xs text-slate-300 dark:text-slate-600">—</span>
                  <input
                    type="number"
                    aria-label="Maximum price"
                    value={maxPrice ?? ""}
                    placeholder="Max"
                    className="w-14 bg-transparent text-xs text-slate-700 outline-none dark:text-slate-200"
                    onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
                  />
                </div>

                {/* Sort Order */}
                <label className="relative">
                  <span className="sr-only">Sort services</span>
                  <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                  <select
                    aria-label="Sort services"
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="appearance-none rounded-xl border border-slate-300 bg-white py-2 pl-8 pr-8 text-xs font-medium text-slate-700 outline-none transition hover:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                  >
                    <option value="recent">Newest</option>
                    <option value="price_low">Price ↑</option>
                    <option value="price_high">Price ↓</option>
                    <option value="rating">Top Rated</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                </label>

                {/* Featured Toggle */}
                <button
                  type="button"
                  aria-pressed={Boolean(featured)}
                  onClick={() => setFeatured(featured ? undefined : true)}
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition ${
                    featured
                      ? "border-indigo-600 bg-indigo-600 text-white"
                      : "border-slate-300 bg-white text-slate-600 hover:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
                  }`}
                >
                  <Sparkles size={13} /> Featured
                </button>
              </div>
            </div>
          </header>

          {/* Catalog Grid */}
          <div>
            {isLoading ? (
              <div
                role="status"
                className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white py-20 dark:border-slate-800 dark:bg-slate-900"
              >
                <Loader2 className="animate-spin text-indigo-600" size={28} />
                <p className="text-xs font-medium text-slate-500">Loading marketplace listings…</p>
              </div>
            ) : isError ? (
              <div
                role="alert"
                className="rounded-2xl border border-red-200 bg-white p-8 text-center dark:border-red-900/60 dark:bg-slate-900"
              >
                <p className="text-sm font-medium text-red-700 dark:text-red-300">
                  Unable to load marketplace services right now.
                </p>
                <button
                  type="button"
                  onClick={() => void refetch()}
                  className="mt-3 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  Try again
                </button>
              </div>
            ) : services.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center dark:border-slate-800 dark:bg-slate-900">
                <ShoppingBag className="mx-auto mb-3 text-slate-400" size={28} />
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                  No listings match the current filters
                </h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Clear or adjust your search criteria to browse all available services.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
                >
                  Reset Registry
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {services.map((service: MarketplaceService) => (
                  <ServiceCard key={service._id} service={service} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}
