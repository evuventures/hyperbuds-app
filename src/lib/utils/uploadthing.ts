// src/lib/utils/uploadthing.ts

import { generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

// Generate React helpers for UploadThing (exported for use in components with hooks)
// Get token from environment variables (client-side access requires NEXT_PUBLIC_ prefix)
// In Next.js, NEXT_PUBLIC_ variables are embedded at build time
// Try both token names (NEXT_PUBLIC_ for client-side, regular for server-side)
const token =
   process.env.NEXT_PUBLIC_UPLOADTHING_TOKEN ||
   process.env.UPLOADTHING_TOKEN;

// Debug logging (only in development)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
   console.log("🔍 UploadThing Debug:", {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      tokenPrefix: token?.substring(0, 20) || 'N/A',
      hasNextPublicToken: !!process.env.NEXT_PUBLIC_UPLOADTHING_TOKEN,
      hasServerToken: !!process.env.UPLOADTHING_TOKEN,
      envKeys: Object.keys(process.env).filter(k => k.includes('UPLOADTHING')),
   });
}

if (!token) {
   console.error("❌ UploadThing token is not set!");
   console.error("❌ Looking for: NEXT_PUBLIC_UPLOADTHING_TOKEN or UPLOADTHING_TOKEN");
   console.error("❌ Current env keys:", Object.keys(process.env).filter(k => k.includes('UPLOADTHING')));
   console.error("❌ Please add NEXT_PUBLIC_UPLOADTHING_TOKEN to your .env.local file and restart the dev server.");
   console.error("❌ Token format: NEXT_PUBLIC_UPLOADTHING_TOKEN=eyJhcGlLZXkiOi...");
}

// Generate helpers with token configuration
export const { useUploadThing, uploadFiles } =
   generateReactHelpers<OurFileRouter>({
      url: "/api/uploadthing",
      // Pass token explicitly - UploadThing SDK v7 requires this
      ...(token ? { token } : {}),
   });

/**
 * Upload avatar image to UploadThing
 * Uses UploadThing's uploadFiles function with proper router configuration
 * @param file - The image file to upload
 * @returns Promise<string> - The CDN URL of the uploaded image
 */
export async function uploadAvatar(file: File): Promise<string> {
   try {
      // Validate file type
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
         throw new Error("Invalid file type. Only JPG, PNG, GIF, and WebP files are allowed.");
      }

      // Validate file size (4MB max)
      const maxSize = 4 * 1024 * 1024; // 4MB in bytes
      if (file.size > maxSize) {
         throw new Error("File size exceeds 4MB limit.");
      }

      // Use the generated uploadFiles function with the endpoint name as a string literal
      // This ensures TypeScript knows the endpoint exists in our router
      // The uploadFiles function automatically uses NEXT_PUBLIC_UPLOADTHING_TOKEN from environment variables
      const response = await uploadFiles("avatar", {
         files: [file],
      });

      // UploadThing returns an array of file objects
      // The response type is ClientUploadedFileData<{ url: string }>[]
      // Each file has ufsUrl property (file.url is deprecated in v9, use ufsUrl)
      if (response && Array.isArray(response) && response.length > 0) {
         const uploadedFile = response[0];
         // Use ufsUrl (UploadThing File System URL) instead of deprecated url
         // ufsUrl is the preferred property in UploadThing SDK v7+
         if (uploadedFile.ufsUrl) {
            return uploadedFile.ufsUrl;
         }
         // Fallback to url for backward compatibility (deprecated but still works)
         // The url property exists at runtime even though it's deprecated
         const fileWithUrl = uploadedFile as typeof uploadedFile & { url?: string };
         if (fileWithUrl.url) {
            return fileWithUrl.url;
         }
      }

      console.error("Upload response:", response);
      throw new Error("Upload succeeded but no URL returned in response");
   } catch (error) {
      console.error("Avatar upload error:", error);
      throw error instanceof Error ? error : new Error("Failed to upload avatar");
   }
}

