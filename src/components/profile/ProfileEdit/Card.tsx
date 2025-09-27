"use client";

import React, { useState, useEffect } from "react";
import { FaCamera, FaCheckCircle, FaSpinner } from "react-icons/fa";
import { ChevronLeft } from "lucide-react";
import { BASE_URL } from "@/config/baseUrl";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

// Define a type for a social media link
interface SocialLinks {
  [key: string]: string;
}

// Define the full user profile type based on the API response structure
interface UserProfile {
  username: string;
  displayName: string;
  bio: string;
  niche: string[];
  location: { city: string; state: string; country: string };
  socialLinks: SocialLinks;
  avatar: string | null;
  // Allows for other properties not explicitly defined
  [key: string]: unknown;
}

const SOCIAL_PLATFORMS = [
  { id: "tiktok", name: "TikTok", placeholder: "https://tiktok.com/@username" },
  { id: "instagram", name: "Instagram", placeholder: "https://instagram.com/username" },
  { id: "youtube", name: "YouTube", placeholder: "https://youtube.com/@username" },
  { id: "twitch", name: "Twitch", placeholder: "https://twitch.tv/username" },
  { id: "twitter", name: "Twitter", placeholder: "https://twitter.com/username" },
  { id: "linkedin", name: "LinkedIn", placeholder: "https://linkedin.com/in/username" },
];

const MOCK_NICHES = [
  "beauty", "gaming", "music", "fitness", "food", "travel", "fashion", "tech",
  "comedy", "education", "lifestyle", "art", "dance", "sports", "business", "health", "other"
];

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
      linkedin: {
        domains: ['linkedin.com', 'www.linkedin.com'],
        pathPattern: /^\/in\/[a-zA-Z0-9._-]+$/
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
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [niches, setNiches] = useState<string[]>([]);
  const [location, setLocation] = useState({ city: "", state: "", country: "" });
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({});
  const [avatar, setAvatar] = useState<string | null>(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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

          // Ensure niches is always an array
          const nicheArray = Array.isArray(data.niche) ? data.niche : (data.niche ? [data.niche] : []);
          setNiches(nicheArray);

          setLocation(data.location || { city: "", state: "", country: "" });
          setSocialLinks(data.socialLinks || {});
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

  const handleNicheToggle = (niche: string) => {
    if (niches.includes(niche)) {
      setNiches(niches.filter((n) => n !== niche));
    } else if (niches.length < 5) {
      setNiches([...niches, niche]);
    }
  };

  const handleSocialChange = (platformId: string, value: string) => {
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
        if (platformId === 'linkedin') {
          cleanedValue = `https://linkedin.com/in/${username}`;
        } else if (platformId === 'tiktok') {
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
  };

  const handleAvatarUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "avatar");

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${BASE_URL}/api/v1/profiles/upload-media`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setAvatar(data.url);
      }
    } catch (err) {
      console.error("Avatar upload failed:", err);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setMessage("");
    setError("");

    try {
      const token = localStorage.getItem("accessToken");

      // Filter out empty social links and validate URLs
      const cleanedSocialLinks: SocialLinks = {};
      Object.entries(socialLinks).forEach(([platform, url]) => {
        if (url && url.trim() && isValidSocialUrl(url.trim(), platform)) {
          cleanedSocialLinks[platform] = url.trim();
        }
      });

      const cleanedProfile: Partial<UserProfile> = {
        displayName,
        bio,
        niche: niches,
        location,
        socialLinks: cleanedSocialLinks, // Always include social links
      };


      if (avatar) {
        cleanedProfile.avatar = avatar;
      }

      const response = await fetch(`${BASE_URL}/api/v1/profiles/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(cleanedProfile),
      });

      if (response.ok) {
        setMessage("Profile updated successfully!");
        const updated = await response.json();
        setProfile(updated);

        // Set flag to trigger profile refresh
        localStorage.setItem('profileUpdated', 'true');

        // Use smooth navigation
        handleNavigation("/profile");
      } else {
        const data = await response.json();
        setError(data.message || "Failed to update profile");
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isNavigating ? 0.7 : 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex justify-center items-center w-full min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 md:p-6"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="p-5 w-full max-w-3xl rounded-3xl border shadow-lg bg-white/80 dark:bg-black md:p-10 border-white/50 dark:border-gray-700"
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
            title="Back to Profile"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Background animation */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full opacity-0 group-hover:opacity-10"
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
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 md:text-3xl">
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
                <div className="flex overflow-hidden justify-center items-center w-24 h-24 bg-gray-100 rounded-full shadow-lg dark:bg-gray-700">
                  {avatar ? (
                    <Image src={avatar} alt="avatar" className="object-cover w-full h-full" />
                  ) : (
                    <FaCamera className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files && handleAvatarUpload(e.target.files[0])}
                  className="hidden"
                />
              </div>
            </motion.div>

            {/* Username */}
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

            {/* Niches */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.4 }}
              className="mb-6"
            >
              <label className="block mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                Select Niches (max 5)
              </label>
              <div className="flex flex-wrap gap-2">
                {MOCK_NICHES.map((niche) => {
                  const isSelected = niches.includes(niche);
                  return (
                    <motion.button
                      key={niche}
                      type="button"
                      onClick={() => handleNicheToggle(niche)}
                      disabled={!isSelected && niches.length >= 5}
                      className={`px-4 cursor-pointer py-2 text-sm font-medium rounded-full transition ${isSelected
                        ? "text-white bg-gradient-to-r from-purple-500 to-blue-500 shadow-lg"
                        : "text-gray-700 bg-gray-100 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                        }`}
                      whileHover={{ scale: isSelected ? 1 : 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      animate={{
                        scale: isSelected ? 1.02 : 1,
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      {niche} {isSelected && "✓"}
                    </motion.button>
                  );
                })}
              </div>
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

            {/* Social Links */}
            <div className="mb-8">
              <h3 className="mb-4 text-lg font-semibold text-gray-700 dark:text-gray-300">
                Social Media Links (Optional)
              </h3>
              <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                Add your social media profiles. Leave empty if you don&apos;t have an account.
              </p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {SOCIAL_PLATFORMS.map((platform) => {
                  const currentValue = socialLinks[platform.id] || "";
                  const isValid = !currentValue || isValidSocialUrl(currentValue, platform.id);

                  return (
                    <div key={platform.id}>
                      <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {platform.name}
                        <span className="ml-1 text-xs text-gray-400">(optional)</span>
                      </label>
                      <div className="relative mb-6">
                        <input
                          type="text"
                          value={currentValue}
                          onChange={(e) => handleSocialChange(platform.id, e.target.value)}
                          placeholder={`e.g., @username or ${platform.placeholder.replace('https://', '')}`}
                          className={`px-4 py-3 w-full text-gray-800 bg-white rounded-xl border-2 transition-colors dark:bg-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 ${currentValue && !isValid
                            ? 'border-red-300 focus:border-red-500 dark:border-red-600 dark:focus:border-red-400'
                            : 'border-gray-200 focus:border-purple-500 dark:border-gray-700 dark:focus:border-purple-600'
                            }`}
                        />
                        {currentValue && !isValid && (
                          <div className="mt-2 text-xs font-medium text-red-500">
                            {platform.id === 'linkedin'
                              ? 'Must be: linkedin.com/in/username'
                              : platform.id === 'tiktok'
                                ? 'Must be: tiktok.com/@username'
                                : platform.id === 'youtube'
                                  ? 'Must be: youtube.com/@username or youtube.com/c/username'
                                  : `Must be a valid ${platform.name} URL (e.g., ${platform.placeholder})`
                            }
                          </div>
                        )}
                        {currentValue && isValid && (
                          <div className="mt-2 text-xs font-medium text-green-600">
                            ✓ Valid {platform.name} URL
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Submit Button with Enhanced Animation */}
            <motion.button
              onClick={handleSubmit}
              disabled={isLoading || isNavigating}
              className="overflow-hidden relative py-4 w-full font-semibold text-white bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl shadow-lg transition-all disabled:opacity-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.4 }}
            >
              {/* Button background animation */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0"
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