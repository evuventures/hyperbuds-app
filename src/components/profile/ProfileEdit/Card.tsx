"use client";

import React, { useState, useEffect, useRef } from "react";
import { FaCamera, FaCheckCircle, FaSpinner, FaSearch } from "react-icons/fa";
import { ChevronLeft, X, Check, LucideAArrowDown } from "lucide-react";
import { BASE_URL } from "@/config/baseUrl";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { PlatformUsernameGroup } from "@/components/profile/PlatformUsernameInput";
import { useNiches } from "@/hooks/features/useNiches";
import { nicheApi } from "@/lib/api/niche.api";

// Define a type for a social media link
interface SocialLinks {
  [key: string]: string;
}

// Define platform credentials type
interface PlatformCredentials {
  tiktok?: string;
  twitter?: string;
  twitch?: string;
  instagram?: string;
  youtube?: string;
}

// Define the full user profile type based on the API response structure
interface UserProfile {
  username: string;
  displayName: string;
  bio: string;
  niche: string[];
  location: { city: string; state: string; country: string };
  socialLinks: SocialLinks;
  platformCredentials?: PlatformCredentials;
  avatar: string | null;
  // Allows for other properties not explicitly defined
  [key: string]: unknown;
}

// Only platforms that backend accepts (based on backend validation)
const SOCIAL_PLATFORMS = [
  { id: "tiktok", name: "TikTok", placeholder: "https://tiktok.com/@username" },
  { id: "instagram", name: "Instagram", placeholder: "https://instagram.com/username" },
  { id: "youtube", name: "YouTube", placeholder: "https://youtube.com/@username" },
  { id: "twitch", name: "Twitch", placeholder: "https://twitch.tv/username" },
  { id: "twitter", name: "Twitter", placeholder: "https://twitter.com/username" },
];

// Niches are now fetched from API - see useNiches hook below

// Helper function to validate social media URL format
const isValidSocialUrl = (url: string, platform: string): boolean => {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.toLowerCase();
    const pathname = urlObj.pathname.toLowerCase();

    // Platform-specific domain and path validation
    const platformRules: { [key: string]: { domains: string[], pathPattern: RegExp } } = {
      tiktok: {
        domains: ['tiktok.com', 'www.tiktok.com'],
        pathPattern: /^\/@?[a-zA-Z0-9._-]+$/
      },
      instagram: {
        domains: ['instagram.com', 'www.instagram.com'],
        pathPattern: /^\/[a-zA-Z0-9._-]+$/
      },
      youtube: {
        domains: ['youtube.com', 'www.youtube.com', 'youtu.be', 'www.youtu.be'],
        pathPattern: /^\/@?[a-zA-Z0-9._-]+$|^\/c\/[a-zA-Z0-9._-]+$|^\/channel\/[a-zA-Z0-9._-]+$|^\/watch\?v=[a-zA-Z0-9_-]+$/
      },
      twitch: {
        domains: ['twitch.tv', 'www.twitch.tv'],
        pathPattern: /^\/[a-zA-Z0-9._-]+$/
      },
      twitter: {
        domains: ['twitter.com', 'www.twitter.com', 'x.com', 'www.x.com'],
        pathPattern: /^\/[a-zA-Z0-9._-]+$/
      },
      facebook: {
        domains: ['facebook.com', 'www.facebook.com', 'fb.com', 'www.fb.com'],
        pathPattern: /^\/[a-zA-Z0-9._-]+$/
      },
      snapchat: {
        domains: ['snapchat.com', 'www.snapchat.com'],
        pathPattern: /^\/add\/[a-zA-Z0-9._-]+$/
      },
      discord: {
        domains: ['discord.gg', 'www.discord.gg', 'discord.com'],
        pathPattern: /^\/[a-zA-Z0-9_-]+$|^\/invite\/[a-zA-Z0-9_-]+$/
      },
      telegram: {
        domains: ['t.me', 'telegram.me', 'www.telegram.me'],
        pathPattern: /^\/[a-zA-Z0-9._-]+$/
      },
      reddit: {
        domains: ['reddit.com', 'www.reddit.com'],
        pathPattern: /^\/u\/[a-zA-Z0-9._-]+$|^\/user\/[a-zA-Z0-9._-]+$/
      },
      pinterest: {
        domains: ['pinterest.com', 'www.pinterest.com'],
        pathPattern: /^\/[a-zA-Z0-9._-]+$/
      }
    };

    const rules = platformRules[platform];
    if (!rules) return false;

    // Check domain
    const isValidDomain = rules.domains.some(validDomain =>
      domain === validDomain || domain.endsWith('.' + validDomain)
    );

    // Check path pattern
    const isValidPath = rules.pathPattern.test(pathname);

    return isValidDomain && isValidPath;
  } catch {
    return false;
  }
};



export default function EditProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [, setProfile] = useState<UserProfile | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [niches, setNiches] = useState<string[]>([]);
  const [location, setLocation] = useState({ city: "", state: "", country: "" });
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({});
  const [platformCredentials, setPlatformCredentials] = useState<PlatformCredentials>({});
  const [avatar, setAvatar] = useState<string | null>(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Fetch niches from API
  const { niches: availableNiches, isLoading: isLoadingNiches, error: nichesError } = useNiches();

  // Ref for file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Smooth navigation function
  const handleNavigation = (path: string) => {
    setIsNavigating(true);

    // Add a small delay for smooth transition
    setTimeout(() => {
      router.push(path);
    }, 150);
  };

  // 🔒 Protect route
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/auth/login");
    }
  }, [router]);

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoadingProfile(true);
        const token = localStorage.getItem("accessToken");

        if (!token) {
          router.push("/auth/signin");
          return;
        }

        const response = await fetch(`${BASE_URL}/api/v1/profiles/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 200) {
          const responseData = await response.json();
          // Extract the actual profile data from the response
          const data: UserProfile = responseData.profile;
          setProfile(data);

          // Always populate form fields with existing data
          setDisplayName(data.displayName || "");
          setBio(data.bio || "");

          // Ensure niches is always an array and normalize to capitalized format
          const nicheArray = Array.isArray(data.niche) ? data.niche : (data.niche ? [data.niche] : []);
          // Normalize niches to capitalized format (match API format)
          const normalizedNiches = nicheArray.map(niche => {
            // If already capitalized (has uppercase), keep as is
            // Otherwise capitalize first letter of each word
            if (niche && niche.charAt(0) === niche.charAt(0).toUpperCase()) {
              return niche.trim();
            }
            // Capitalize first letter of each word
            return niche
              .trim()
              .split(' ')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
              .join(' ');
          });
          setNiches(normalizedNiches);

          setLocation(data.location || { city: "", state: "", country: "" });

          // Extract usernames from social links for platform credentials
          const socialLinksData = data.socialLinks || {};
          const platformCreds: PlatformCredentials = {};

          // Extract username from TikTok URL
          if (socialLinksData.tiktok) {
            const tiktokUrl = socialLinksData.tiktok as string;
            const match = tiktokUrl.match(/tiktok\.com\/@?([^/?]+)/);
            if (match) platformCreds.tiktok = match[1];
          }

          // Extract username from Twitter URL
          if (socialLinksData.twitter) {
            const twitterUrl = socialLinksData.twitter as string;
            const match = twitterUrl.match(/(?:twitter|x)\.com\/([^/?]+)/);
            if (match) platformCreds.twitter = match[1];
          }

          // Extract username from Twitch URL
          if (socialLinksData.twitch) {
            const twitchUrl = socialLinksData.twitch as string;
            const match = twitchUrl.match(/twitch\.tv\/([^/?]+)/);
            if (match) platformCreds.twitch = match[1];
          }

          // Extract username from Instagram URL
          if (socialLinksData.instagram) {
            const instagramUrl = socialLinksData.instagram as string;
            const match = instagramUrl.match(/instagram\.com\/([^/?]+)/);
            if (match) platformCreds.instagram = match[1];
          }

          // Extract username from YouTube URL
          if (socialLinksData.youtube) {
            const youtubeUrl = socialLinksData.youtube as string;
            // Match both @username and /c/username formats
            const match = youtubeUrl.match(/(?:youtube\.com\/@|youtube\.com\/c\/)([^/?]+)/) || 
                         youtubeUrl.match(/youtube\.com\/user\/([^/?]+)/);
            if (match) platformCreds.youtube = match[1];
          }

          setSocialLinks(socialLinksData);
          setPlatformCredentials(platformCreds);
          setAvatar(data.avatar || null);

        } else if (response.status === 401) {
          router.push("/auth/signin");
        } else {
          console.error("Failed to fetch profile:", response.status, response.statusText);
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [router]);

  const MAX_NICHES = 100; // Backend supports 100+ niches (no hard limit)

  // Dropdown state for niches (same as complete-profile page)
  const [isNicheDropdownOpen, setIsNicheDropdownOpen] = useState(false);
  const [nicheSearch, setNicheSearch] = useState("");
  const nicheDropdownRef = useRef<HTMLDivElement>(null);
  const nicheSearchInputRef = useRef<HTMLInputElement>(null);

  // Filter niches (case-insensitive search, niches are capitalized from API)
  const filteredNiches = availableNiches.filter(n =>
    n.toLowerCase().includes(nicheSearch.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (nicheDropdownRef.current && !nicheDropdownRef.current.contains(event.target as Node)) {
        setIsNicheDropdownOpen(false);
        setNicheSearch(""); // Clear search when closing
      }
    };

    if (isNicheDropdownOpen) {
      // Use setTimeout to avoid immediate closure
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
        // Auto-focus search input when dropdown opens
        nicheSearchInputRef.current?.focus();
      }, 0);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isNicheDropdownOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isNicheDropdownOpen) {
        setIsNicheDropdownOpen(false);
        setNicheSearch("");
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isNicheDropdownOpen]);

  const toggleNiche = (niche: string) => {
    // Normalize comparison (case-insensitive)
    const normalizedNiche = niche.trim();
    const isSelected = niches.some(n => n.trim().toLowerCase() === normalizedNiche.toLowerCase());
    
    if (isSelected) {
      setNiches(prev => prev.filter(n => n.trim().toLowerCase() !== normalizedNiche.toLowerCase()));
    } else if (niches.length < MAX_NICHES) {
      // Add the capitalized version from API
      setNiches(prev => [...prev, normalizedNiche]);
      // Clear search after selection for better UX
      setNicheSearch("");
    }
  };

  const removeNiche = (niche: string) => {
    setNiches(prev => prev.filter(n => n !== niche));
  };

{/*const handleSocialChange = (platformId: string, value: string) => {
    // Clean the URL and validate format
    let cleanedValue = value.trim();

    // If empty, remove from socialLinks
    if (!cleanedValue) {
      setSocialLinks((prev: SocialLinks) => {
        const newLinks = { ...prev };
        delete newLinks[platformId];
        return newLinks;
      });
      return;
    }

    // Auto-format URLs
    if (!cleanedValue.startsWith('http://') && !cleanedValue.startsWith('https://')) {
      // Check if it's just a username (starts with @ or doesn't contain domain)
      if (cleanedValue.startsWith('@') || !cleanedValue.includes('.')) {
        const username = cleanedValue.replace('@', '');

        // Platform-specific formatting
        if (platformId === 'tiktok') {
          cleanedValue = `https://tiktok.com/@${username}`;
        } else if (platformId === 'youtube') {
          cleanedValue = `https://youtube.com/@${username}`;
        } else {
          // Default formatting for other platforms
          const platform = SOCIAL_PLATFORMS.find(p => p.id === platformId);
          if (platform) {
            const domain = platform.placeholder.replace('https://', '').split('/')[0];
            cleanedValue = `https://${domain}/${username}`;
          } else {
            cleanedValue = `https://${cleanedValue}`;
          }
        }
      } else {
        cleanedValue = `https://${cleanedValue}`;
      }
    }

    // Save the value (validation will be shown in UI)
    setSocialLinks((prev: SocialLinks) => ({ ...prev, [platformId]: cleanedValue }));
  };*/}

  const handleAvatarClick = () => {
    console.log("Avatar clicked - opening file picker");
    fileInputRef.current?.click();
  };

  const handleAvatarUpload = async (file: File) => {
    console.log("File selected:", file.name, file.type, file.size);
    setMessage("");
    setError("");

    try {
      // Import UploadThing utility
      const { uploadAvatar } = await import("@/lib/utils/uploadthing");
      const { profileApi } = await import("@/lib/api/profile.api");

      // Step 1: Upload to UploadThing to get CDN URL
      setMessage("Uploading image...");
      const avatarUrl = await uploadAvatar(file);
      console.log("UploadThing URL received:", avatarUrl);

      // Step 2: Send URL to backend to save in profile
      setMessage("Saving to profile...");
      await profileApi.updateAvatar(avatarUrl);

      // Step 3: Update local state
      setAvatar(avatarUrl);
      setMessage("Profile picture uploaded successfully!");

      // Step 4: Trigger profile refresh for other pages
      // Set a flag in localStorage to trigger refresh on profile pages
      localStorage.setItem('profileUpdated', 'true');
      
      // Dispatch storage event for cross-tab communication
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'profileUpdated',
        newValue: 'true'
      }));

      // Clear message after 3 seconds
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Avatar upload failed:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to upload profile picture. Please try again.";
      setError(errorMessage);
      // Clear error after 5 seconds
      setTimeout(() => setError(""), 5000);
    }
  };

  const handleSubmit = async () => {
    // Clear previous messages
    setMessage("");
    setError("");

    // Scroll to top FIRST (before setting loading state)
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Small delay to ensure scroll completes before showing loading
    await new Promise(resolve => setTimeout(resolve, 100));

    setIsLoading(true);

    try {
      const token = localStorage.getItem("accessToken");

      // Filter out empty social links and validate URLs
      const cleanedSocialLinks: SocialLinks = {};
      Object.entries(socialLinks).forEach(([platform, url]) => {
        if (url && url.trim() && isValidSocialUrl(url.trim(), platform)) {
          cleanedSocialLinks[platform] = url.trim();
        }
      });

      // WORKAROUND: Convert platform usernames to URLs for backend compatibility
      // Backend expects URLs in socialLinks, so we construct them from usernames
      const cleanedSocialLinksWithPlatforms = { ...cleanedSocialLinks };

      // Always use platform credentials if entered, or REMOVE if empty
      if (platformCredentials.tiktok?.trim()) {
        cleanedSocialLinksWithPlatforms.tiktok = `https://tiktok.com/@${platformCredentials.tiktok.trim()}`;
      } else {
        // User cleared TikTok, remove it from socialLinks
        delete cleanedSocialLinksWithPlatforms.tiktok;
      }

      if (platformCredentials.twitter?.trim()) {
        cleanedSocialLinksWithPlatforms.twitter = `https://twitter.com/${platformCredentials.twitter.trim()}`;
      } else {
        // User cleared Twitter, remove it from socialLinks
        delete cleanedSocialLinksWithPlatforms.twitter;
      }

      if (platformCredentials.twitch?.trim()) {
        cleanedSocialLinksWithPlatforms.twitch = `https://twitch.tv/${platformCredentials.twitch.trim()}`;
      } else {
        // User cleared Twitch, remove it from socialLinks
        delete cleanedSocialLinksWithPlatforms.twitch;
      }

      if (platformCredentials.instagram?.trim()) {
        cleanedSocialLinksWithPlatforms.instagram = `https://instagram.com/${platformCredentials.instagram.trim()}`;
      } else {
        delete cleanedSocialLinksWithPlatforms.instagram;
      }

      if (platformCredentials.youtube?.trim()) {
        cleanedSocialLinksWithPlatforms.youtube = `https://youtube.com/@${platformCredentials.youtube.trim()}`;
      } else {
        delete cleanedSocialLinksWithPlatforms.youtube;
      }


      const cleanedProfile: Partial<UserProfile> = {
        displayName,
        bio,
        // Note: Niches are updated via POST /matchmaker/niches/update (separate endpoint)
        location,
        socialLinks: cleanedSocialLinksWithPlatforms, // Include platform URLs
      };

      if (avatar) {
        cleanedProfile.avatar = avatar;
      }

      // Step 1: Update profile (without niches)
      const response = await fetch(`${BASE_URL}/api/v1/profiles/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(cleanedProfile),
      });

      if (response.ok) {
        // Parse response once (can only read response body once)
        const updated = await response.json();
        
        // Step 2: Update niches via matchmaker endpoint (separate from profile)
        if (niches.length > 0) {
          try {
            // Get userId from profile response or localStorage
            const userId = updated.profile?.userId || updated.userId || 
                           localStorage.getItem('userId') || 
                           JSON.parse(localStorage.getItem('user') || '{}')?.userId;

            if (userId) {
              // Normalize niches to capitalized format (match API format)
              const normalizedNiches = niches
                .slice(0, MAX_NICHES)
                .map(niche => {
                  const trimmed = niche.trim();
                  // If already capitalized (has uppercase), keep as is
                  if (trimmed && trimmed.charAt(0) === trimmed.charAt(0).toUpperCase()) {
                    return trimmed;
                  }
                  // Capitalize first letter of each word
                  return trimmed
                    .split(' ')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                    .join(' ');
                })
                .filter(niche => niche.length > 0); // Remove empty strings
              
              try {
                await nicheApi.updateNiches(userId, normalizedNiches);
                console.log('✅ Niches updated successfully');
              } catch (nicheError) {
                // Handle 404 gracefully (backend not ready yet)        
                const error = nicheError as Error & { status?: number; statusCode?: number };
                const errorMessage = error?.message || String(nicheError || '');
                const statusCode = error?.status || error?.statusCode;
                
                // Check for 404 status code or "not found" in message (case-insensitive)
                const is404Error = statusCode === 404 || 
                                  errorMessage.toLowerCase().includes('404') || 
                                  errorMessage.toLowerCase().includes('not found') || 
                                  errorMessage.toLowerCase().includes('route not found');
                
                if (is404Error) {
                  console.warn('⚠️ Niche update endpoint not available yet (backend not implemented)');
                  // Don't show error to user - backend will be implemented soon
                  // Don't set error state for 404 - profile update was successful
                } else {
                  console.error('❌ Failed to update niches:', nicheError);
                  // Only show error for non-404 errors
                  setError("Profile updated but failed to update niches. You can update them later.");
                }
              }
            } else {
              console.warn('⚠️ UserId not found, skipping niche update');
            }
          } catch (nicheError) {
            // Handle 404 gracefully (backend not ready yet)
            const error = nicheError as Error & { status?: number; statusCode?: number };
            const errorMessage = error instanceof Error ? error.message : String(nicheError);
            const statusCode = error?.status || error?.statusCode;
            
            // Check for 404 status code or "not found" in message (case-insensitive)
            const is404Error = statusCode === 404 || 
                              errorMessage.toLowerCase().includes('404') || 
                              errorMessage.toLowerCase().includes('not found') || 
                              errorMessage.toLowerCase().includes('route not found');
            
            if (is404Error) {
              console.warn('⚠️ Niche update endpoint not available yet (backend not implemented)');
              // Don't show error to user - backend will be implemented soon
              // Don't set error state for 404 - profile update was successful
            } else {
              console.error('❌ Failed to update niches:', nicheError);
              // Only show error for non-404 errors
              setError("Profile updated but failed to update niches. You can update them later.");
            }
          }
        }

        setMessage("Profile updated successfully!");
        setError(""); // Clear any previous errors
        setProfile(updated);

        // Set flag to trigger profile refresh
        localStorage.setItem('profileUpdated', 'true');

        // Scroll to top to show success message
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Use smooth navigation
        setTimeout(() => {
          handleNavigation("/profile");
        }, 1500);
      } else {
        const data = await response.json();
        const errorMessage = data.message || "Failed to update profile";

        // Handle token expiration
        if (response.status === 401 || errorMessage.includes('token') || errorMessage.includes('expired')) {
          setError("Your session has expired. Please log in again.");
          // Scroll to top to show error
          window.scrollTo({ top: 0, behavior: 'smooth' });

          // Redirect to login after 2 seconds
          setTimeout(() => {
            localStorage.removeItem('accessToken');
            router.push("/auth/signin");
          }, 2000);
        } else {
          setError(errorMessage);
          // Scroll to top to show error
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    } catch (error) {
      // Only show network error if it's not a handled 404 from niche update                                                                            
      const errorObj = error as Error & { status?: number; statusCode?: number };
      const errorMessage = errorObj instanceof Error ? errorObj.message : String(error || '');                                                                
      const statusCode = errorObj?.status || errorObj?.statusCode;
      
      // Check if this is a 404 error from niche update (already handled)
      const is404NicheError = statusCode === 404 || 
                              errorMessage.toLowerCase().includes('route not found') ||
                              errorMessage.toLowerCase().includes('matchmaker/niches/update');
      
      if (!is404NicheError) {
        setError("Network error. Please try again.");
        // Scroll to top to show error
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // 404 from niche update - already handled, don't show error
        console.warn('⚠️ Niche update 404 error caught in outer catch - already handled');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isNavigating ? 0.7 : 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="relative w-full"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative z-10 p-6 mx-auto w-full max-w-4xl rounded-3xl border shadow-2xl backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 md:p-10 border-gray-200/50 dark:border-gray-700/50"
      >
        {/* Header with Enhanced Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="flex gap-4 items-center mb-8"
        >
          <motion.button
            onClick={() => handleNavigation("/profile")}
            className="flex overflow-hidden relative justify-center items-center w-12 h-12 text-gray-600 bg-gray-100 rounded-full transition-all cursor-pointer group hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
            title="Back"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Background animation */}
            <motion.div
              className="absolute inset-0 bg-linear-to-r from-purple-500 to-blue-500 rounded-full opacity-0 group-hover:opacity-10"
              initial={{ scale: 0 }}
              whileHover={{ scale: 1 }}
              transition={{ duration: 0.2 }}
            />

            {/* Icon with smooth animation */}
            <motion.div
              animate={{ x: isNavigating ? -2 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronLeft size={24} className="relative z-10" />
            </motion.div>

            {/* Loading indicator */}
            <AnimatePresence>
              {isNavigating && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="flex absolute inset-0 justify-center items-center"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 rounded-full border-2 border-purple-500 border-t-transparent"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-linear-to-r from-purple-600 to-blue-600 md:text-3xl">
              Edit Your Profile
            </h1>
          </motion.div>
        </motion.div>

        {/* Messages with smooth animations */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="p-4 mb-6 font-medium text-green-700 bg-green-50 rounded-xl border-2 border-green-200 dark:bg-green-900/30 dark:border-green-700 dark:text-green-400"
            >
              {message}
            </motion.div>
          )}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="p-4 mb-6 font-medium text-red-700 bg-red-50 rounded-xl border-2 border-red-200 dark:bg-red-900/30 dark:border-red-700 dark:text-red-400"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>


        {/* Loading State */}
        {isLoadingProfile ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center items-center py-12"
          >
            <div className="flex flex-col gap-4 items-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 rounded-full border-4 border-purple-500 border-t-transparent"
              />
              <p className="text-gray-600 dark:text-gray-400">Loading profile data...</p>
            </div>
          </motion.div>
        ) : (
          /* Form Content with Staggered Animations */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            {/* Avatar Upload */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="mb-8"
            >
              <label className="block mb-2 font-semibold text-gray-700 dark:text-white">Profile Picture</label>
              <div className="flex gap-4 items-center">
                <div
                  onClick={handleAvatarClick}
                  className="relative group cursor-pointer"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleAvatarClick()}
                >
                  <div className="flex overflow-hidden justify-center items-center w-24 h-24 bg-gray-100 rounded-full shadow-lg transition-all group-hover:ring-4 group-hover:ring-purple-500/50 dark:bg-gray-700">
                    {avatar ? (
                      <Image src={avatar} alt="avatar" width={96} height={96} className="object-cover w-full h-full pointer-events-none" />
                    ) : (
                      <FaCamera className="w-8 h-8 text-gray-400 group-hover:text-purple-500 transition-colors pointer-events-none" />
                    )}
                  </div>
                  {/* Overlay on hover */}
                  <div className="flex absolute inset-0 justify-center items-center bg-black/50 rounded-full opacity-0 transition-opacity pointer-events-none group-hover:opacity-100">
                    <FaCamera className="w-6 h-6 text-white" />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={handleAvatarClick}
                    className="px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg border border-purple-200 transition-all cursor-pointer hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-700 dark:hover:bg-purple-900/50"
                  >
                    <FaCamera className="inline mr-2 w-4 h-4" />
                    Choose Photo
                  </button>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Max 5MB (JPG, PNG, GIF)
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    console.log("File input changed", e.target.files);
                    if (e.target.files && e.target.files[0]) {
                      handleAvatarUpload(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />
              </div>
            </motion.div>

            {/* Username 
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="mb-6"
            >
              <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Username</label>
              <input
                type="text"
                value={profile?.username || ""}
                disabled
                className="px-4 py-3 w-full text-gray-600 bg-gray-100 rounded-xl border-2 border-gray-200 cursor-not-allowed dark:border-gray-700 dark:bg-gray-700 dark:text-gray-300"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Username cannot be changed</p>
            </motion.div>
*/}
            {/* Display Name */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              className="mb-6"
            >
              <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="px-4 py-3 w-full text-gray-800 bg-white rounded-xl border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800"
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
              <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Bio</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="px-4 py-3 w-full text-gray-800 bg-white rounded-xl border-2 border-gray-200 resize-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800"
                placeholder="Tell us about yourself..."
              />
            </motion.div>

            {/* Niches - Dropdown UI (same as complete-profile page) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.4 }}
              className="mb-6 relative"
              ref={nicheDropdownRef}
            >
              <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                Select Niches (up to {MAX_NICHES}+)
              </label>
              <p className="text-xs text-gray-500 mb-3 dark:text-gray-400">
                Select niches to help us match you with the right opportunities.
              </p>

              {/* Selected Chips Container */}
              <div
                onClick={() => setIsNicheDropdownOpen(!isNicheDropdownOpen)}
                className={`relative border-2 rounded-xl bg-white dark:bg-gray-800 px-4 py-3 min-h-[56px] flex flex-wrap items-center gap-2 cursor-pointer transition-all duration-200 ${
                  isNicheDropdownOpen 
                    ? "border-purple-500 ring-2 ring-purple-200 dark:ring-purple-800" 
                    : "border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500"
                }`}
              >
                {niches.length > 0 ? (
                  niches.map(niche => (
                    <motion.span
                      key={niche}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-sm"
                    >
                      <span>{niche}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeNiche(niche);
                        }}
                        className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                        aria-label={`Remove ${niche}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </motion.span>
                  ))
                ) : (
                  <span className="text-gray-400 dark:text-gray-500 text-sm">
                    Click to select niches...
                  </span>
                )}
                <div className="flex items-center gap-2 ml-auto pl-2">
                  {niches.length > 0 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                      {niches.length}/{MAX_NICHES}
                    </span>
                  )}
                  <motion.div
                    animate={{ rotate: isNicheDropdownOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-center"
                  >
                    <LucideAArrowDown className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </motion.div>
                </div>
              </div>

              {/* Loading State */}
              {isLoadingNiches && (
                <div className="text-center py-8">
                  <FaSpinner className="animate-spin mx-auto h-6 w-6 text-purple-500 mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">Loading niches...</p>
                </div>
              )}

              {/* Error State */}
              {nichesError && !isLoadingNiches && (
                <div className="p-3 mb-3 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    Failed to load niches. Please refresh the page.
                  </p>
                </div>
              )}

              {/* Dropdown Menu */}
              <AnimatePresence>
                {isNicheDropdownOpen && !isLoadingNiches && !nichesError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute z-50 mt-2 w-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-80 overflow-hidden"
                  >
                    {/* Search Bar */}
                    <div className="sticky top-0 bg-white dark:bg-gray-800 z-10 p-3 border-b border-gray-200 dark:border-gray-700">
                      <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <input
                          ref={nicheSearchInputRef}
                          type="text"
                          placeholder="Search niches..."
                          value={nicheSearch}
                          onChange={(e) => setNicheSearch(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>

                    {/* Niche List */}
                    <div className="p-2 max-h-64 overflow-y-auto custom-scrollbar">
                      {filteredNiches.length > 0 ? (
                        filteredNiches.map(niche => {
                          // Normalize comparison (case-insensitive)
                          const isSelected = niches.some(n => n.trim().toLowerCase() === niche.trim().toLowerCase());
                          const isDisabled = !isSelected && niches.length >= MAX_NICHES;
                          
                          return (
                            <motion.div
                              key={niche}
                              onClick={() => !isDisabled && toggleNiche(niche)}
                              className={`group relative px-4 py-2.5 rounded-lg cursor-pointer text-sm mb-1 flex items-center justify-between transition-all ${
                                isSelected
                                  ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-sm"
                                  : isDisabled
                                  ? "bg-gray-50 dark:bg-gray-900 text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-60"
                                  : "hover:bg-purple-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 active:bg-purple-100 dark:active:bg-gray-600"
                              }`}
                              whileHover={!isDisabled ? { scale: 1.02 } : {}}
                              whileTap={!isDisabled ? { scale: 0.98 } : {}}
                            >
                              <span className="font-medium">{niche}</span>
                              {isSelected && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="flex items-center"
                                >
                                  <Check className="h-4 w-4" />
                                </motion.div>
                              )}
                              {isDisabled && (
                                <span className="text-xs opacity-75">Max reached</span>
                              )}
                            </motion.div>
                          );
                        })
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-400 dark:text-gray-500 text-sm">
                            No niches found
                          </p>
                          <p className="text-gray-300 dark:text-gray-600 text-xs mt-1">
                            Try a different search term
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Location */}
            <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-3">
              <input
                type="text"
                value={location.city}
                onChange={(e) => setLocation({ ...location, city: e.target.value })}
                placeholder="City"
                className="px-4 py-3 text-gray-800 bg-white rounded-xl border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 focus:border-purple-500 dark:focus:border-purple-600"
              />
              <input
                type="text"
                value={location.state}
                onChange={(e) => setLocation({ ...location, state: e.target.value })}
                placeholder="State"
                className="px-4 py-3 text-gray-800 bg-white rounded-xl border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 focus:border-purple-500 dark:focus:border-purple-600"
              />
              <input
                type="text"
                value={location.country}
                onChange={(e) => setLocation({ ...location, country: e.target.value })}
                placeholder="Country"
                className="px-4 py-3 text-gray-800 bg-white rounded-xl border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 focus:border-purple-500 dark:focus:border-purple-600"
              />
            </div>

            {/* Platform Usernames for AI Collaboration */}
            <div className="mb-8">
              <PlatformUsernameGroup
                values={platformCredentials}
                onChange={setPlatformCredentials}
                showPreviews={true}
              />
            </div>

            {/* Submit Button with Enhanced Animation */}
            <motion.button
              onClick={handleSubmit}
              disabled={isLoading || isNavigating}
              className="overflow-hidden relative py-4 w-full font-semibold text-white bg-linear-to-r from-purple-500 to-blue-500 rounded-xl shadow-lg transition-all disabled:opacity-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.4 }}
            >
              {/* Button background animation */}
              <motion.div
                className="absolute inset-0 bg-linear-to-r from-blue-500 to-purple-500 opacity-0"
                whileHover={{ opacity: 0.1 }}
                transition={{ duration: 0.2 }}
              />

              {/* Button content */}
              <span className="flex relative gap-2 justify-center items-center cursor-pointer">
                {isLoading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <FaSpinner />
                    </motion.div>
                    Saving...
                  </>
                ) : isNavigating ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 rounded-full border-2 border-white border-t-transparent"
                    />
                    Navigating...
                  </>
                ) : (
                  <>
                    Save Changes
                    <FaCheckCircle />
                  </>
                )}
              </span>
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}