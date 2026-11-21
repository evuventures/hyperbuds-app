'use client';

import DashboardLayout from "@/components/layout/Dashboard/Dashboard";
import { useState, useEffect, useCallback } from "react";
import apiClient from "@/lib/api/client";
import UserProfileHeader from "@/components/profile/ProfileCard";
import { InlineProfileSegments } from "@/components/profile/InlineProfileSegments";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const loadProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get("/profiles/me");
      const data = res.data;

      if (data && data.profile) {
        data.profile.profileUrl =
          typeof window !== "undefined"
            ? `${window.location.origin}/profile/@${data.profile.username}`
            : `https://app.hyperbuds.cloud/profile/@${data.profile.username}`;
      } else if (data) {
        data.profileUrl =
          typeof window !== "undefined"
            ? `${window.location.origin}/profile/@${data.username}`
            : `https://app.hyperbuds.cloud/profile/@${data.username}`;
      }

      setUser(data);
      setError(null);
    } catch (err) {
      console.error("Error loading profile:", err);
      setError(err?.message || "Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile, refreshTrigger]);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "profileUpdated") {
        setRefreshTrigger((prev) => prev + 1);
        localStorage.removeItem("profileUpdated");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("profileUpdated")) {
      setRefreshTrigger((prev) => prev + 1);
      localStorage.removeItem("profileUpdated");
    }
  }, []);

  if (error) {
    return (
      <DashboardLayout>
        <div className="min-h-full bg-gray-50 dark:bg-slate-900">
          <div className="p-4 pb-16 lg:p-6 lg:pb-34">
            <div className="mx-auto max-w-6xl">
              <div className="p-5 rounded-xl border-2 shadow-xl backdrop-blur-sm sm:p-6 sm:rounded-2xl border-red-200/50 bg-white/90 dark:bg-slate-800/90 dark:border-red-500/30">
                <p className="text-sm text-red-500 sm:text-base">
                  Error loading profile: {error}
                </p>
                <Button
                  onClick={() => void loadProfile()}
                  variant="outline"
                  size="sm"
                  className="mt-3 text-xs text-red-600 border-red-300 sm:text-sm hover:bg-red-50"
                >
                  Retry
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-full bg-gray-50 dark:bg-slate-900">
        <div className="p-4 pb-16 space-y-6 lg:p-6 lg:pb-34">
          <div className="mx-auto max-w-6xl space-y-5">
            {!isLoading && (
              <InlineProfileSegments
                profile={user?.profile ?? null}
                completion={user?.completion ?? null}
                onProfileUpdated={loadProfile}
              />
            )}
            <UserProfileHeader
              userData={user}
              isDark={true}
              isLoading={isLoading}
              isOwnProfile={true}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
