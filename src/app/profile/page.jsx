'use client'

import DashboardLayout from "@/components/layout/Dashboard/Dashboard";
import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/utils/api";
import UserProfileHeader from "@/components/profile/ProfileCard";
import { PlatformStats } from "@/components/collaboration/PlatformStats";
import SuggestedMatches from "@/components/profile/SuggestedMatches";
import { TrendingUp } from "lucide-react";

export default function ProfilePage() {
  // Initialize as null instead of array
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const data = await apiFetch("/api/v1/profiles/me");
      console.log("API Response:", data);

      // Add profileUrl for copy functionality
      if (data && data.profile) {
        data.profile.profileUrl = typeof window !== 'undefined'
          ? `${window.location.origin}/profile/@${data.profile.username}`
          : `https://www.hyperbuds.com/@${data.profile.username}`;
      } else if (data) {
        data.profileUrl = typeof window !== 'undefined'
          ? `${window.location.origin}/profile/@${data.username}`
          : `https://www.hyperbuds.com/@${data.username}`;
      }

      // Set the entire response data - the component will handle extracting profile
      setUser(data);
      setError(null);
    } catch (err) {
      console.error("Error loading profile:", err);
      setError(err.message || "Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [refreshTrigger]);

  // Listen for storage events to refresh when profile is updated
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'profileUpdated') {
        setRefreshTrigger(prev => prev + 1);
        localStorage.removeItem('profileUpdated');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Check for profile update flag on component mount
  useEffect(() => {
    if (localStorage.getItem('profileUpdated')) {
      setRefreshTrigger(prev => prev + 1);
      localStorage.removeItem('profileUpdated');
    }
  }, []);

  // Handle error state
  if (error) {
    return (
      <DashboardLayout>
        <div className="p-4 pb-16 lg:p-6 lg:pb-34">
          <div className="">
            <p className="text-red-400">Error loading profile: {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 mt-2 text-white bg-red-600 rounded-lg transition-colors hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 pb-16 space-y-6 lg:p-6 lg:pb-34">
        <UserProfileHeader
          userData={user}
          isDark={true}
          isLoading={isLoading}
          isOwnProfile={true}
        />

        {/* Platform Performance Section */}
        {/* TEMPORARILY COMMENTED OUT - Backend not ready yet */}
        {/* TODO: Uncomment when backend is working */}
        {/* {user?.profile?.socialLinks && (() => {
          // Extract usernames from social links URLs for connected platforms only
          const platformCreds = {};
          const socialLinks = user.profile.socialLinks;

          console.log('📊 Social Links:', socialLinks);

          // Extract TikTok username from URL
          if (socialLinks.tiktok) {
            const match = socialLinks.tiktok.match(/tiktok\.com\/@?([^/?]+)/);
            if (match) {
              platformCreds.tiktok = match[1];
              console.log('✅ TikTok username extracted:', match[1]);
            } else {
              console.warn('⚠️ TikTok URL found but username extraction failed:', socialLinks.tiktok);
            }
          }

          // Extract Twitter username from URL
          if (socialLinks.twitter) {
            const match = socialLinks.twitter.match(/(?:twitter|x)\.com\/([^/?]+)/);
            if (match) {
              platformCreds.twitter = match[1];
              console.log('✅ Twitter username extracted:', match[1]);
            } else {
              console.warn('⚠️ Twitter URL found but username extraction failed:', socialLinks.twitter);
            }
          }

          // Extract Twitch username from URL
          if (socialLinks.twitch) {
            const match = socialLinks.twitch.match(/twitch\.tv\/([^/?]+)/);
            if (match) {
              platformCreds.twitch = match[1];
              console.log('✅ Twitch username extracted:', match[1]);
            } else {
              console.warn('⚠️ Twitch URL found but username extraction failed:', socialLinks.twitch);
            }
          }

          console.log('🎯 Platform Credentials to fetch:', platformCreds);

          const hasPlatforms = Object.values(platformCreds).some(v => v);

          return hasPlatforms && (
            <div className="p-6 bg-white rounded-2xl border shadow-lg backdrop-blur-sm dark:bg-gray-800/50 border-gray-200/60 dark:border-gray-700/60">
              <h3 className="flex gap-3 items-center mb-6 text-xl font-bold text-gray-900 dark:text-gray-100">
                <div className="p-2 bg-linear-to-br from-purple-100 to-pink-100 rounded-lg dark:from-purple-500/20 dark:to-pink-500/20">
                  <TrendingUp
                    size={24}
                    className="text-purple-600 dark:text-purple-400"
                  />
                </div>
                Platform Performance
              </h3>
              <PlatformStats
                platformCredentials={platformCreds}
                showCombinedMetrics={false}
                compact={true}
                clickable={true}
              />
            </div>
          );
        })()} */}

        {/* Suggested Matches Section */}
        <SuggestedMatches />

      </div>
    </DashboardLayout>
  );
}