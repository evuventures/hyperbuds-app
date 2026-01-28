"use client";

import React, { useRef, useState } from "react";
import { FaCamera, FaSpinner, FaCheckCircle } from "react-icons/fa";
import { motion } from "framer-motion";
import { validateImageUrl } from "@/lib/utils/imageUrlValidation";
import { brandColors, statusColors } from "@/constants/colors";

interface AvatarUploadSectionProps {
  avatar: string | null;
  avatarUrl: string;
  avatarUrlError: string;
  imageLoadingError: boolean;
  selectedFile: File | null;
  previewUrl: string | null;
  onAvatarUrlChange: (url: string) => void;
  onFileChange: (file: File | null) => void;
  onFileUpload: () => Promise<void>;
  onAvatarUrlSubmit: () => Promise<void>;
  isLoading?: boolean;
}

export function AvatarUploadSection({
  avatar,
  avatarUrl,
  avatarUrlError,
  imageLoadingError,
  selectedFile,
  previewUrl,
  onAvatarUrlChange,
  onFileChange,
  onFileUpload,
  onAvatarUrlSubmit,
  isLoading = false,
}: AvatarUploadSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isUrlSubmitting, setIsUrlSubmitting] = useState(false);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        return;
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        return;
      }

      onFileChange(file);
    }
  };

  const handleFileUploadClick = async () => {
    setIsUploading(true);
    try {
      await onFileUpload();
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlSubmitClick = async () => {
    setIsUrlSubmitting(true);
    try {
      await onAvatarUrlSubmit();
    } finally {
      setIsUrlSubmitting(false);
    }
  };

  const imageSrc = previewUrl || ((avatarUrl && !avatarUrlError) ? avatarUrl : avatar);
  const shouldShowImage = imageSrc && (!avatarUrl || !imageLoadingError || avatar === imageSrc || previewUrl);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.4 }}
      className="mb-8"
    >
      <label className="block mb-2 font-semibold text-gray-700 dark:text-white">
        Profile Picture
      </label>
      <div className="flex gap-4 items-start">
        <div className="flex overflow-hidden justify-center items-center w-24 h-24 bg-gray-100 rounded-full shadow-lg transition-all dark:bg-gray-700 flex-shrink-0">
          {shouldShowImage ? (
            <img
              src={imageSrc}
              alt="avatar"
              className="object-cover w-full h-full pointer-events-none"
              crossOrigin={previewUrl ? undefined : "anonymous"}
              onError={() => {
                if (avatarUrl && avatarUrl === imageSrc && avatar !== imageSrc && !previewUrl) {
                  // Error handled by parent
                }
              }}
            />
          ) : (
            <FaCamera className="w-8 h-8 text-gray-400 transition-colors pointer-events-none" />
          )}
        </div>

        <div className="flex-1 space-y-3">
          {/* File Upload Option */}
          <div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`w-full px-4 py-2 text-sm font-medium ${brandColors.primary.text} ${brandColors.primary.bgLight} rounded-lg ${brandColors.primary.border} transition-all cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900/50`}
            >
              <FaCamera className="inline mr-2 w-4 h-4" />
              {selectedFile ? `File Selected: ${selectedFile.name}` : "Choose File"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
            />
            {selectedFile && (
              <button
                type="button"
                onClick={handleFileUploadClick}
                disabled={isUploading || isLoading}
                className={`mt-2 w-full px-4 py-2 text-sm font-medium text-white ${brandColors.gradient.full} rounded-lg transition-all disabled:opacity-50`}
              >
                {isUploading ? (
                  <>
                    <FaSpinner className="inline mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <FaCheckCircle className="inline mr-2" />
                    Upload File
                  </>
                )}
              </button>
            )}
          </div>

          {/* URL Input Option */}
          <div>
            <input
              type="text"
              value={avatarUrl}
              onChange={(e) => onAvatarUrlChange(e.target.value.trim())}
              placeholder="Or enter image URL"
              className={`w-full px-4 py-2 text-sm border-2 rounded-lg ${
                avatarUrlError
                  ? `${statusColors.error.border} ${statusColors.error.bg}`
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              } text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500`}
            />
            {avatarUrlError && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{avatarUrlError}</p>
            )}
            {avatarUrl && !avatarUrlError && (
              <button
                type="button"
                onClick={handleUrlSubmitClick}
                disabled={isUrlSubmitting || isLoading}
                className={`mt-2 w-full px-4 py-2 text-sm font-medium text-white ${brandColors.gradient.full} rounded-lg transition-all disabled:opacity-50`}
              >
                {isUrlSubmitting ? (
                  <>
                    <FaSpinner className="inline mr-2 animate-spin" />
                    Validating...
                  </>
                ) : (
                  "Use URL"
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
