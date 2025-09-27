'use client'

import DashboardLayout from "@/components/layout/Dashboard/Dashboard";
import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/utils/api";
import UserProfileHeader from "@/components/profile/ProfileCard";
import RizzScoreDisplay from "@/components/profile/RizzScoreDisplay";

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

        {/* Rizz Score Section */}
        <RizzScoreDisplay
          userId={user?.profile?.userId}
          showDetails={true}
        />
      </div>
    </DashboardLayout>
  );
}