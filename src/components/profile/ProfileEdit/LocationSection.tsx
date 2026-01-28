"use client";

import React from "react";
import { brandColors, textColors } from "@/constants/colors";

interface Location {
  city: string;
  state: string;
  country: string;
}

interface LocationSectionProps {
  location: Location;
  onLocationChange: (location: Location) => void;
}

export function LocationSection({
  location,
  onLocationChange,
}: LocationSectionProps) {
  const handleChange = (field: keyof Location, value: string) => {
    onLocationChange({ ...location, [field]: value });
  };

  return (
    <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-3">
      <input
        type="text"
        value={location.city}
        onChange={(e) => handleChange("city", e.target.value)}
        placeholder="City"
        className={`px-4 py-3 ${textColors.primary} bg-white rounded-xl border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 focus:border-purple-500 dark:focus:border-purple-600`}
      />
      <input
        type="text"
        value={location.state}
        onChange={(e) => handleChange("state", e.target.value)}
        placeholder="State"
        className={`px-4 py-3 ${textColors.primary} bg-white rounded-xl border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 focus:border-purple-500 dark:focus:border-purple-600`}
      />
      <input
        type="text"
        value={location.country}
        onChange={(e) => handleChange("country", e.target.value)}
        placeholder="Country"
        className={`px-4 py-3 ${textColors.primary} bg-white rounded-xl border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 focus:border-purple-500 dark:focus:border-purple-600`}
      />
    </div>
  );
}
