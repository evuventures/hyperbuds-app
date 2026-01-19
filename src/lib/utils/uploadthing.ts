// src/lib/utils/uploadthing.ts

/**
 * Upload avatar image to backend API using FormData
 * @param file - The image file to upload
 * @returns Promise<string> - The URL of the uploaded image
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

      // Get base URL from environment or fallback
      const baseURL =
         process.env.NEXT_PUBLIC_API_BASE_URL ||
         "https://api-hyperbuds-backend.onrender.com/api/v1";

      // Get auth token
      let token: string | null = null;
      if (globalThis.window !== undefined) {
         token = globalThis.window.localStorage.getItem("accessToken");
      }

      // Create FormData - backend expects field name "file"
      const formData = new FormData();
      formData.append("file", file);
      
      // Log what we're about to send
      if (process.env.NODE_ENV === "development") {
         console.log("📤 Upload attempt:", {
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            endpoint: `${baseURL}/profiles/upload-media`,
            fieldName: "file",
         });
      }

      // Upload using fetch (FormData automatically sets Content-Type with boundary)
      const response = await fetch(`${baseURL}/profiles/upload-media`, {
         method: "POST",
         headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            // Don't set Content-Type - browser will set it with boundary for FormData
         },
         body: formData,
      });

      if (!response.ok) {
         // Try to get detailed error information from backend
         let errorMessage = `Upload failed with status ${response.status}`;
         let errorData: { message?: string; error?: string; details?: unknown } | null = null;

         try {
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
               errorData = await response.json();
               errorMessage = errorData?.message || errorData?.error || errorMessage;
            } else {
               const text = await response.text();
               if (text) {
                  errorMessage = text;
               }
            }
         } catch (parseError) {
            console.error("Failed to parse error response:", parseError);
         }

         // Log full error details for debugging
         console.error("Upload error details:", {
            status: response.status,
            statusText: response.statusText,
            errorData: errorData ? JSON.stringify(errorData, null, 2) : null,
            fullErrorData: errorData,
            url: `${baseURL}/profiles/upload-media`,
         });

         // Provide user-friendly error messages for common backend issues
         if (errorMessage.includes("api_key") || errorMessage.includes("api key") || errorMessage.includes("Must supply api_key")) {
            throw new Error(
               "Backend configuration error: The upload service requires an API key. " +
               "Please contact the backend team to configure the storage service API key (e.g., Cloudinary, AWS S3)."
            );
         }

         throw new Error(errorMessage);
      }

      // Parse response - handle common response formats
      const data = await response.json();

      // Try multiple possible response structures
      if (data.url) {
         return data.url;
      }
      if (data.data?.url) {
         return data.data.url;
      }
      if (typeof data === "string") {
         // If response is just a URL string
         return data;
      }

      console.error("Upload response:", data);
      throw new Error("Upload succeeded but no URL returned in response");
   } catch (error) {
      console.error("Avatar upload error:", error);
      throw error instanceof Error ? error : new Error("Failed to upload avatar");
   }
}
