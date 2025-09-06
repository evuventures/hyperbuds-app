// src/app/matchmaking/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/Dashboard/Dashboard";
import LoaderAnimation from "@/components/matching/LoaderAnimation";
// ⬇️ FIX: import the correct component
import MatchingInterface from "@/components/matching/MatchCard/MatchCard";
import { matchingApi } from "@/lib/api/matching.api";
import { BASE_URL } from "@/config/baseUrl";
import type { MatchSuggestion, CreatorProfile } from "@/types/matching.types";

const MatchmakingPage: React.FC = () => {
  const [userProfile, setUserProfile] = useState<CreatorProfile | null>(null);
  const [matches, setMatches] = useState<MatchSuggestion[]>([]);
  const [history, setHistory] = useState<MatchSuggestion[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) throw new Error("Access token not found. Please log in again.");

        const [profileRes, suggestionsRes, historyRes] = await Promise.all([
          fetch(`${BASE_URL}/api/v1/profiles/me`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
          matchingApi.getSuggestions(),
          matchingApi.getMatchHistory(),
        ]);

        if (!profileRes.ok) throw new Error("Failed to load user profile");
        const profileData = await profileRes.json();
        setUserProfile(profileData.profile as CreatorProfile);

        // ⬇️ Only update if matches are present (avoids clearing on 304/null)
        if (suggestionsRes?.matches !== undefined) {
          setMatches(suggestionsRes.matches as MatchSuggestion[]);
        }
        if (historyRes?.matches !== undefined) {
          setHistory(historyRes.matches as MatchSuggestion[]);
        }

        setError(null);
      } catch (err: any) {
        console.error("Error loading data:", err);
        setError(err.message || "Failed to load matching data");
      } finally {
        setDataLoaded(true);
      }
    }
    loadData();
  }, []);

  const handleAction = async (matchId: string | number, action: "like" | "pass" | "view") => {
    try {
      await matchingApi.updateMatchStatus(String(matchId), { action });
      setMatches((prev) => prev.filter((m) => m._id !== matchId));
    } catch (err) {
      console.error("Action failed:", err);
    }
  };

  const handleBlock = async (userId: string | number) => {
    try {
      await matchingApi.blockUser(String(userId));
      setMatches((prev) => prev.filter((m) => m.targetUserId !== userId));
    } catch (err) {
      console.error("Block failed:", err);
    }
  };

  if (!dataLoaded || !animationComplete) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex flex-col items-center justify-center bg-white text-black dark:bg-black dark:text-white">
          <LoaderAnimation onComplete={() => setAnimationComplete(true)} />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-screen text-red-500">
          <p>{error}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {userProfile && (
        <MatchingInterface
          userProfile={userProfile}
          matches={matches}
          history={history}
          handleAction={handleAction}
          handleBlock={handleBlock}
        />
      )}
    </DashboardLayout>
  );
};

export default MatchmakingPage;
