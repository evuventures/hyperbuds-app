"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/Dashboard/Dashboard";
import LoaderAnimation from "@/components/matching/LoaderAnimation";
import MatchingUI, { UserProfile, Match, Recommendation, HistoryItem } from "@/components/matching/MatchingUI/MatchingUI";
import { getSuggestions, takeAction, blockUser, getHistory } from "@/lib/api/matching.api";
import { BASE_URL } from '@/config/baseUrl';
import { mockRecommendations } from "@/components/matching/mock/MockRecommendations";

const MatchmakingPage: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
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
            headers: { 'Authorization': `Bearer ${accessToken}` },
          }),
          getSuggestions(),
          getHistory(),
        ]);

        if (!profileRes.ok) throw new Error("Failed to load user profile");
        const profileData = await profileRes.json();

        setUserProfile(profileData.profile);
        setMatches(suggestionsRes.suggestions || []);
        setHistory(historyRes?.history || []);
        setRecommendations(mockRecommendations);

        setError(null);
      } catch (err: unknown) {
        console.error("Error loading data:", err);
        setError(err instanceof Error ? err.message : "Failed to load matching data");
      } finally {
        setDataLoaded(true);
      }
    }
    loadData();
  }, []);

  const handleAction = async (matchId: string | number, action: string) => {
    try {
      await takeAction(matchId, action);
      setMatches((prev) => prev.filter((m) => m.id !== matchId));
    } catch (err) {
      console.error("Action failed:", err);
    }
  };

  const handleBlock = async (userId: string | number) => {
    try {
      await blockUser(userId);
      setMatches((prev) => prev.filter((m) => m.id !== userId));
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
        <MatchingUI
          userProfile={userProfile}
          matches={matches}
          history={history}
          recommendations={recommendations}
          handleAction={handleAction}
          handleBlock={handleBlock}
        />
      )}
    </DashboardLayout>
  );
};

export default MatchmakingPage;
