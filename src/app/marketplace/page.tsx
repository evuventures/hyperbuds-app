"use client";

import React, { useState, useMemo } from "react";
import { useServices } from "@/hooks/features/useMarketplace";
import { ServiceCard } from "@/components/marketplace/ServiceCard/ServiceCard";
import { ServiceFilters } from "@/components/marketplace/ServiceFilters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardLayout from "@/components/layout/Dashboard/Dashboard";
import { Search, Grid, List, Sparkles } from "lucide-react";
import type { ServiceListFilters } from "@/types/marketplace.types";

type ViewMode = "grid" | "list";

export default function MarketplacePage() {
  const [filters, setFilters] = useState<ServiceListFilters>({
    page: 1,
    limit: 12,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const { data, isLoading, error } = useServices(filters);

  // Extract unique categories from services
  const categories = useMemo(() => {
    if (!data?.services) return [];
    const cats = new Set<string>();
    data.services.forEach((service) => {
      if (service.category) cats.add(service.category);
    });
    return Array.from(cats).sort();
  }, [data?.services]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((prev) => ({
      ...prev,
      q: searchQuery || undefined,
      page: 1,
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const services = data?.services || [];
  const pagination = data?.pagination;

  return (
    <DashboardLayout>
      <div className="min-h-full bg-gradient-to-br from-gray-50 via-white to-purple-50/10 dark:from-gray-900 dark:via-gray-900 dark:to-purple-900/10">
        <div className="p-4 pb-16 lg:p-6 lg:pb-34">
          <div className="mx-auto max-w-7xl space-y-6">
            {/* Header */}
            <div className="flex gap-3 items-center">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-md">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">
                  Marketplace
                </h1>
                <p className="text-xs text-gray-500 sm:text-sm dark:text-gray-400">
                  Discover and book services from creators
                </p>
              </div>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-primary dark:focus:border-purple-500"
                />
              </div>
              <Button 
                type="submit"
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg"
              >
                Search
              </Button>
            </form>

            {/* Filters Section - Always Visible Below Search */}
            <div className="w-full">
              <ServiceFilters
                filters={filters}
                onFiltersChange={setFilters}
                categories={categories}
              />
            </div>

            {/* Main Content */}
            <div className="w-full space-y-4">
                {/* View Mode Toggle */}
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                    {pagination?.total ? (
                      <>
                        Showing {services.length} of {pagination.total} services
                      </>
                    ) : (
                      "No services found"
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={viewMode === "grid" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                      className={viewMode === "grid" 
                        ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }
                    >
                      <Grid className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                      className={viewMode === "list"
                        ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Loading State */}
                {isLoading && (
                  <div
                    className={
                      viewMode === "grid"
                        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                        : "space-y-4"
                    }
                  >
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-48 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Error State */}
                {error && (
                  <div className="text-center py-12">
                    <p className="text-destructive text-lg font-medium">
                      {error instanceof Error ? error.message : "Failed to load services"}
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => window.location.reload()}
                      className="mt-4 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Retry
                    </Button>
                  </div>
                )}

                {/* Services Grid/List */}
                {!isLoading && !error && services.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-700 dark:text-gray-300 text-lg font-medium">No services found</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      Try adjusting your filters or search query
                    </p>
                  </div>
                )}

                {!isLoading && !error && services.length > 0 && (
                  <>
                    <div
                      className={
                        viewMode === "grid"
                          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                          : "space-y-4"
                      }
                    >
                      {services.map((service) => (
                        <ServiceCard key={service._id} service={service} />
                      ))}
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.pages > 1 && (
                      <div className="flex items-center justify-center gap-2 pt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(pagination.page - 1)}
                          disabled={pagination.page <= 1}
                          className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                        >
                          Previous
                        </Button>
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          Page {pagination.page} of {pagination.pages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(pagination.page + 1)}
                          disabled={pagination.page >= pagination.pages}
                          className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                        >
                          Next
                        </Button>
                      </div>
                    )}
                  </>
                )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
