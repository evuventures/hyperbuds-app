"use client";

import React from "react";
import { motion } from "framer-motion";
import { brandColors, textColors } from "@/constants/colors";

interface BasicInfoSectionProps {
  displayName: string;
  bio: string;
  onDisplayNameChange: (value: string) => void;
  onBioChange: (value: string) => void;
}

export function BasicInfoSection({
  displayName,
  bio,
  onDisplayNameChange,
  onBioChange,
}: BasicInfoSectionProps) {
  return (
    <>
      {/* Display Name */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        className="mb-6"
      >
        <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
          Display Name
        </label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => onDisplayNameChange(e.target.value)}
          className={`px-4 py-3 w-full ${textColors.primary} bg-white rounded-xl border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800`}
          placeholder="Enter your display name"
        />
      </motion.div>

      {/* Bio */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.4 }}
        className="mb-6"
      >
        <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
          Bio
        </label>
        <textarea
          rows={3}
          value={bio}
          onChange={(e) => onBioChange(e.target.value)}
          className={`px-4 py-3 w-full ${textColors.primary} bg-white rounded-xl border-2 border-gray-200 resize-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800`}
          placeholder="Tell us about yourself..."
        />
      </motion.div>
    </>
  );
}
