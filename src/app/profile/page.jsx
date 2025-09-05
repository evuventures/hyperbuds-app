'use client'

import DashboardLayout from "@/components/layout/Dashboard/Dashboard";
import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/utils/api";
import UserProfileHeader from "@/components/profile/ProfileCard";

export default function ProfilePage() {
  // Initialize as null instead of array
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadProfile() {
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
    }
    
    loadProfile();
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
      <div className="p-6">
        <UserProfileHeader 
          userData={user} 
          isDark={true}
          isLoading={isLoading}
        />
      </div>
    </DashboardLayout>
  );
}