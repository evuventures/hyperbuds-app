"use client";

import React, { useState, useEffect } from "react";
import { FaCamera, FaCheckCircle, FaSpinner } from "react-icons/fa";
import { BASE_URL } from "@/config/baseUrl";
import { useRouter } from "next/navigation";

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

export default function EditProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [niches, setNiches] = useState<string[]>([]);
  const [location, setLocation] = useState({ city: "", state: "", country: "" });
  const [socialLinks, setSocialLinks] = useState<any>({});
  const [avatar, setAvatar] = useState<string | null>(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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
        const token = localStorage.getItem("accessToken");
        const response = await fetch(`${BASE_URL}/api/v1/profiles/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 200) {
          const data = await response.json();
          setProfile(data.profile);
         
          setDisplayName(data.displayName || "");
          setBio(data.bio || "");
          setNiches(data.niche || []);
          setLocation(data.location || { city: "", state: "", country: "" });
          setSocialLinks(data.socialLinks || {});
          setAvatar(data.avatar || null);

        } else if (response.status === 401) {
          router.push("/auth/signin");
        }
      } catch (err) {
        console.error("Error loading profile:", err);
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
    setSocialLinks((prev: any) => ({ ...prev, [platformId]: value }));
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

      const cleanedProfile: any = {
        displayName,
        bio,
        niche: niches,
        socialLinks,
        location,
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
        router.push("/profile");
      } else {
        const data = await response.json();
        setError(data.message || "Failed to update profile");
      }
    } catch (err) {
      setError("Network error. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 flex items-center justify-center md:p-6">
      <div className="w-full max-w-3xl bg-white/80 dark:bg-black rounded-3xl shadow-lg p-5 md:p-10 border border-white/50 dark:border-gray-700">
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-8">
          Edit Your Profile
        </h1>

        {message && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 border-2 border-green-200 dark:border-green-700 rounded-xl text-green-700 dark:text-green-400 font-medium">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border-2 border-red-200 dark:border-red-700 rounded-xl text-red-700 dark:text-red-400 font-medium">
            {error}
          </div>
        )}

        {/* Avatar Upload */}
        <div className="mb-8">
          <label className="block font-semibold mb-2 text-gray-700 dark:text-white">Profile Picture</label>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center shadow-lg">
              {avatar ? (
                <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <FaCamera className="text-gray-400 w-8 h-8" />
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files && handleAvatarUpload(e.target.files[0])}
              className="hidden"
            />
          </div>
        </div>

        {/* Username */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Username</label>
          <input
            type="text"
            value={profile?.username || ""}
            disabled
            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Username cannot be changed</p>
        </div>

        {/* Display Name */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Display Name</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800"
          />
        </div>

        {/* Bio */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Bio</label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 resize-none"
          />
        </div>

        {/* Niches */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Select Niches (max 5)
          </label>
          <div className="flex flex-wrap gap-2">
            {MOCK_NICHES.map((niche) => (
              <button
                key={niche}
                type="button"
                onClick={() => handleNicheToggle(niche)}
                disabled={!niches.includes(niche) && niches.length >= 5}
                className={`px-4 py-2 text-sm font-medium rounded-full transition ${
                  niches.includes(niche)
                    ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {niche}
              </button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <input
            type="text"
            value={location.city}
            onChange={(e) => setLocation({ ...location, city: e.target.value })}
            placeholder="City"
            className="px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:border-purple-500 dark:focus:border-purple-600"
          />
          <input
            type="text"
            value={location.state}
            onChange={(e) => setLocation({ ...location, state: e.target.value })}
            placeholder="State"
            className="px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:border-purple-500 dark:focus:border-purple-600"
          />
          <input
            type="text"
            value={location.country}
            onChange={(e) => setLocation({ ...location, country: e.target.value })}
            placeholder="Country"
            className="px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:border-purple-500 dark:focus:border-purple-600"
          />
        </div>

        {/* Social Links */}
        <div className="space-y-4 mb-8">
          {SOCIAL_PLATFORMS.map((platform) => (
            <div key={platform.id}>
              <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">{platform.name}</label>
              <input
                type="url"
                value={socialLinks[platform.id] || ""}
                onChange={(e) => handleSocialChange(platform.id, e.target.value)}
                placeholder={platform.placeholder}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:border-purple-500 dark:focus:border-purple-600"
              />
            </div>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold py-4 rounded-xl shadow-lg hover:scale-105 transition disabled:opacity-50"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <FaSpinner className="animate-spin" /> Saving...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              Save Changes <FaCheckCircle />
            </span>
          )}
        </button>
      </div>
    </div>
  );
}