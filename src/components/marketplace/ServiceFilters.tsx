"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { X } from "lucide-react";
import type { ServiceListFilters } from "@/types/marketplace.types";

interface ServiceFiltersProps {
  filters: ServiceListFilters;
  onFiltersChange: (filters: ServiceListFilters) => void;
  categories?: string[];
}

const SORT_OPTIONS = [
  { value: "recent", label: "Most Recent" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
];

export function ServiceFilters({ filters, onFiltersChange, categories = [] }: ServiceFiltersProps) {
  const [localFilters, setLocalFilters] = useState<ServiceListFilters>(filters);
  const [priceRange, setPriceRange] = useState<[number, number]>([
    filters.minPrice || 0,
    filters.maxPrice || 10000,
  ]);

  const handleFilterChange = (key: keyof ServiceListFilters, value: unknown) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
  };

  const handlePriceRangeChange = (values: number[]) => {
    const [min, max] = values;
    setPriceRange([min, max]);
    setLocalFilters({
      ...localFilters,
      minPrice: min > 0 ? min : undefined,
      maxPrice: max < 10000 ? max : undefined,
    });
  };

  const clearFilters = () => {
    const cleared: ServiceListFilters = {
      q: "",
      category: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      location: undefined,
      featured: undefined,
      sort: undefined,
    };
    setLocalFilters(cleared);
    setPriceRange([0, 10000]);
    onFiltersChange(cleared);
  };

  const hasActiveFilters =
    localFilters.q ||
    localFilters.category ||
    localFilters.minPrice ||
    localFilters.maxPrice ||
    localFilters.location ||
    localFilters.featured ||
    localFilters.sort;

  // Auto-apply filters when they change (debounced)
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onFiltersChange(localFilters);
    }, 300);
    return () => clearTimeout(timer);
  }, [localFilters]);

  return (
    <div className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        {/* Category */}
        {categories.length > 0 && (
          <div className="flex items-center gap-2">
            <Label className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">Category:</Label>
            <Select
              value={localFilters.category || "all"}
              onValueChange={(value) =>
                handleFilterChange("category", value === "all" ? undefined : value)
              }
            >
              <SelectTrigger className="h-8 w-[140px] text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <SelectItem value="all" className="text-gray-900 dark:text-gray-100">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat} className="text-gray-900 dark:text-gray-100">
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Price Range - Compact */}
        <div className="flex items-center gap-2">
          <Label className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">Price:</Label>
          <div className="flex items-center gap-2 w-[200px]">
            <Input
              type="number"
              placeholder="Min"
              value={priceRange[0] || ""}
              onChange={(e) => {
                const min = parseInt(e.target.value) || 0;
                setPriceRange([min, priceRange[1]]);
                handleFilterChange("minPrice", min > 0 ? min : undefined);
              }}
              className="h-8 w-20 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <span className="text-gray-500 dark:text-gray-400">-</span>
            <Input
              type="number"
              placeholder="Max"
              value={priceRange[1] || ""}
              onChange={(e) => {
                const max = parseInt(e.target.value) || 10000;
                setPriceRange([priceRange[0], max]);
                handleFilterChange("maxPrice", max < 10000 ? max : undefined);
              }}
              className="h-8 w-20 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2">
          <Label className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">Location:</Label>
          <Input
            id="location"
            placeholder="City, Country"
            value={localFilters.location || ""}
            onChange={(e) => handleFilterChange("location", e.target.value || undefined)}
            className="h-8 w-[150px] text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
        </div>

        {/* Featured */}
        <div className="flex items-center gap-2">
          <Checkbox
            id="featured"
            checked={localFilters.featured === true}
            onCheckedChange={(checked) =>
              handleFilterChange("featured", checked ? true : undefined)
            }
          />
          <Label htmlFor="featured" className="cursor-pointer text-xs text-gray-700 dark:text-gray-300 whitespace-nowrap">
            Featured
          </Label>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <Label className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">Sort:</Label>
          <Select
            value={localFilters.sort || "default"}
            onValueChange={(value) =>
              handleFilterChange("sort", (value === "default" ? undefined : value) as ServiceListFilters["sort"])
            }
          >
            <SelectTrigger className="h-8 w-[140px] text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
              <SelectValue placeholder="Default" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <SelectItem value="default" className="text-gray-900 dark:text-gray-100">Default</SelectItem>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value} className="text-gray-900 dark:text-gray-100">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Clear Button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-8 text-xs text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            <X className="w-3 h-3 mr-1" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
