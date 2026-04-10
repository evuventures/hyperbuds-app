import { useState, useEffect, useCallback } from "react";
import apiClient from "@/lib/api/client";

interface ApiError {
  message: string;
  status?: number;
  // data?: {
  //   message?: string;
  //   suggestions?: string[];
  //   status?: boolean;
  // };
}

export type ProfileFormData = {
  username: string;
  displayName: string;
  bio: string;
  location: {
    city: string;
    state: string;
    country: string;
    coordinates: [lng: number, lat: number];
  };
  socialLinks: Record<string, string>;
  niches: string[];
  avatarUrl: string | null;
};

// Define supported platforms as a union type
type Platform =
  | "twitter"
  | "instagram"
  | "facebook"
  | "linkedin"
  | "tiktok"
  | "youtube"
  | "snapchat"
  | "reddit"
  | "pinterest"
  | "twitch";

// Input object: keys are platforms, values are usernames or links
type SocialHandles = Partial<Record<Platform, string>>;

// Output object: keys are platforms, values are canonical URLs
type NormalizedSocialLinks = Partial<Record<Platform, string>>;

// Canonical formats for supported platforms
const canonicalFormats: Record<Platform, string> = {
  twitter: "https://twitter.com/{username}",
  instagram: "https://instagram.com/{username}",
  facebook: "https://facebook.com/{username}",
  linkedin: "https://linkedin.com/in/{username}",
  tiktok: "https://www.tiktok.com/@{username}",
  youtube: "https://www.youtube.com/{username}",
  snapchat: "https://www.snapchat.com/add/{username}",
  reddit: "https://www.reddit.com/user/{username}",
  pinterest: "https://www.pinterest.com/{username}",
  twitch: "https://www.twitch.tv/{username}"
};

// Regex patterns to detect and extract usernames/IDs
const patterns: Partial<Record<Platform, RegExp>> = {
  twitter: /(?:https?:\/\/)?(?:www\.)?(?:mobile\.)?twitter\.com\/([A-Za-z0-9_]+)/i,
  instagram: /(?:https?:\/\/)?(?:www\.)?instagram\.com\/([A-Za-z0-9_.]+)/i,
  facebook: /(?:https?:\/\/)?(?:www\.)?facebook\.com\/([A-Za-z0-9.]+)/i,
  linkedin: /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([A-Za-z0-9-]+)/i,
  tiktok: /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@([A-Za-z0-9_.]+)/i,
  youtube: /(?:https?:\/\/)?(?:www\.)?youtube\.com\/(channel\/[A-Za-z0-9_-]+|c\/[A-Za-z0-9_-]+|user\/[A-Za-z0-9_-]+)/i,
  snapchat: /(?:https?:\/\/)?(?:www\.)?snapchat\.com\/add\/([A-Za-z0-9_.]+)/i,
  reddit: /(?:https?:\/\/)?(?:www\.)?reddit\.com\/user\/([A-Za-z0-9_-]+)/i,
  pinterest: /(?:https?:\/\/)?(?:www\.)?pinterest\.com\/([A-Za-z0-9_-]+)/i,
  twitch: /(?:https?:\/\/)?(?:www\.)?twitch\.tv\/([A-Za-z0-9_]+)/i
};

function normalizeSocialLink(
  input: string,
  platformHint: Platform | null = null
): string | null {
  if (!input) return null;

  input = input.trim().replace(/\/+$/, "");

  for (const [platform, regex] of Object.entries(patterns)) {
    const match = input.match(regex!);
    if (match) {
      const username = match[1];
      return canonicalFormats[platform as Platform].replace("{username}", username);
    }
  }

  if (input.startsWith("@") || input.startsWith("#")) {
    const username = input.slice(1);
    if (platformHint) {
      return canonicalFormats[platformHint].replace("{username}", username);
    }
    return canonicalFormats.twitter.replace("{username}", username);
  }

  if (/^[A-Za-z0-9_.-]+$/.test(input)) {
    if (platformHint) {
      return canonicalFormats[platformHint].replace("{username}", input);
    }
    return canonicalFormats.twitter.replace("{username}", input);
  }

  return null;
}

function normalizeSocialObject(handles: SocialHandles): NormalizedSocialLinks {
  const result: NormalizedSocialLinks = {};

  for (const [platform, username] of Object.entries(handles)) {
    const normalized = normalizeSocialLink(username!, platform as Platform);
    if (normalized) {
      result[platform as Platform] = normalized;
    }
  }

  return result;
}



export const useProfileForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [suggestions, setSuggestions] = useState<string[] | null>(null);

  // Image State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState<ProfileFormData>({
    username: "",
    displayName: "",
    bio: "",
    location: { city: "", state: "", country: "", coordinates: [0, 0] },
    socialLinks: {},
    niches: [],
    avatarUrl: null,
  });

  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<
    boolean | null
  >(null);

  // --- Image Handlers ---

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image must be smaller than 5MB");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError("");
    }
  };

  /**
   * Logic to cancel/remove the selected image
   */

  const clearSelectedFile = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl); // Clear memory
    }
    setSelectedFile(null);
    setPreviewUrl(null);
  }, [previewUrl]);

  // const uploadAvatarToUploadThing = async () => {
  //   if (!selectedFile) return null;
  //   try {
  //     const { uploadAvatar } = await import('@/lib/utils/uploadthing');
  //     const uploadedUrl = await uploadAvatar(selectedFile);
  //     return uploadedUrl;
  //   } catch (err) {
  //     throw err instanceof Error ? err : new Error("Upload failed");
  //   }
  // };

  // Utility to convert selected file to base64
  const getSelectedFileBase64 = useCallback((): Promise<string | null> => {
    return new Promise((resolve, reject) => {
      if (!selectedFile) return resolve(null);
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          resolve(null);
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(selectedFile);
    });
  }, [selectedFile]);

  const handleSubmit = async () => {
    setIsLoading(true);
    setError("");
    setMessage("");

    window.navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          location: {
            ...prev.location,
            coordinates: [position.coords.longitude || 0, position.coords.latitude || 0],
          },
        }));
      },
      (err) => {
        console.warn("Geolocation error:", err);
      },
      { timeout: 10000 }
    );

    try {
      let finalAvatarUrl = formData.avatarUrl;

      // Only upload if a file is actually selected
      if (selectedFile) {
        setMessage("Uploading profile picture...");
        finalAvatarUrl = await getSelectedFileBase64();
      }

      setMessage("Saving your profile...");

      const payload = {
        username: formData.username.trim(),
        displayName: formData.displayName.trim(),
        bio: formData.bio.trim(),
        niche: formData.niches,
        socialLinks: normalizeSocialObject(formData.socialLinks),
        location: {
          city: formData.location.city.trim(),
          state: formData.location.state.trim(),
          country: formData.location.country.trim(),
          coordinates: formData.location.coordinates,
        },
        avatar: finalAvatarUrl, // Send base64 for immediate preview on next page, backend can choose to ignore if using uploadthing URL
      };

      await apiClient.put("/profiles/me", payload);
      setCurrentStep(5);
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.message || "An error occurred during submission");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Geolocation Logic (Abstract API) ---
  // useEffect(() => {
  //   const fetchLocation = async () => {
  //     try {
  //       const apiKey = process.env.NEXT_PUBLIC_ABSTRACT_API_KEY;
  //       if (!apiKey) return;

  //       const res = await fetch(
  //         `https://ipgeolocation.abstractapi.com/v1/?api_key=${apiKey}`
  //       );

  //       if (!res.ok) return;
  //       const data = await res.json();

  //       setFormData(prev => ({
  //         ...prev,
  //         location: {
  //           city: data.city || "",
  //           state: data.region || "",
  //           country: data.country || "",
  //         }
  //       }));
  //     } catch {
  //       console.warn("Location auto-fill unavailable.");
  //     }
  //   };

  //   fetchLocation();
  // }, []);

  // --- Username Check Logic ---
  useEffect(() => {
    if (formData.username.length < 3) {
      setIsUsernameAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingUsername(true);
      try {
        const res = await apiClient.get(`/profiles/@${formData.username}/public`);

        if (!res.data.profile) {
          setIsUsernameAvailable(true);
          
        }else {          
          if (res.data.suggestions && Array.isArray(res.data.suggestions)) {
            setSuggestions(res.data.suggestions);
          } else {
            setSuggestions(null);
          }
          setIsUsernameAvailable(false);
        }

      } catch (err) {
        const apiErr = err as ApiError;
        setSuggestions(null);
        if (apiErr.status === 404 || apiErr.status === 500) {
          setIsUsernameAvailable(true);
        } else {
          setIsUsernameAvailable(null);
        }
      } finally {
        setIsCheckingUsername(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.username]);

  // --- State Helpers ---

  const updateField = useCallback(
    (field: keyof ProfileFormData, value: unknown) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const updateLocation = useCallback(
    (key: keyof ProfileFormData["location"], value: string) => {
      setFormData((prev) => ({
        ...prev,
        location: { ...prev.location, [key]: value },
      }));
    },
    [],
  );

  const updateSocials = useCallback((platformId: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [platformId]: value },
    }));
  }, []);

  return {
    suggestions,
    currentStep,
    formData,
    isLoading,
    error,
    message,
    isCheckingUsername,
    isUsernameAvailable,
    updateField,
    updateLocation,
    updateSocials,
    nextStep: () => setCurrentStep((prev) => prev + 1),
    prevStep: () => setCurrentStep((prev) => prev - 1),
    setError,
    setMessage,
    handleFileChange,
    clearSelectedFile,
    previewUrl,
    handleSubmit,
    getSelectedFileBase64,
    canProceed: () => {
      switch (currentStep) {
        case 1:
          return true;
        case 2:
          return formData.username.length >= 3 && !!formData.displayName;
        case 3:
          return !!formData.bio && formData.niches.length > 0;
        case 4:
          return true;
        default:
          return false;
      }
    },
  };
};
