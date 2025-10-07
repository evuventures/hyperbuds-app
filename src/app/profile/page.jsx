'use client'

import DashboardLayout from "@/components/layout/Dashboard/Dashboard";
import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/utils/api";
import UserProfileHeader from "@/components/profile/ProfileCard";
import { PlatformStats } from "@/components/collaboration/PlatformStats";

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
        <div className="p-6">
          <div className="">
            <p className="text-red-400">Error loading profile: {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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
      <div className="p-6 space-y-6">
        <UserProfileHeader
          userData={user}
          isDark={true}
          isLoading={isLoading}
        />

        {/* Platform Stats Section */}
        {user?.profile?.socialLinks && (() => {
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
            <div className="mt-6">
              <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                Platform Analytics
              </h2>
              <PlatformStats
                platformCredentials={platformCreds}
                showCombinedMetrics={true}
                compact={false}
              />
            </div>
          );
        })()}

      </div>
    </DashboardLayout>
  );
}