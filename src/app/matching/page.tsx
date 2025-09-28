// src/app/matchmaking/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import HeaderOnlyLayout from "@/components/layout/HeaderOnly/HeaderOnly";
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
      } catch (err: unknown) {
        console.error("Error loading data:", err);
        setError(err instanceof Error ? err.message : "Failed to load matching data");
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
      <HeaderOnlyLayout>
        <div className="flex overflow-hidden relative flex-col justify-center items-center min-h-screen bg-gradient-to-br via-purple-900 from-slate-900 to-slate-900 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 light:from-slate-100 light:via-purple-50 light:to-slate-100">
          {/* Animated background elements */}
          <div className="overflow-hidden absolute inset-0">
            {/* Floating orbs */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={`orb-${i}`}
                className="absolute w-32 h-32 rounded-full opacity-20"
                style={{
                  background: `radial-gradient(circle, ${['#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#EF4444'][i % 6]
                    } 0%, transparent 70%)`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  x: [0, 100, -50, 0],
                  y: [0, -80, 60, 0],
                  scale: [1, 1.2, 0.8, 1],
                  opacity: [0.1, 0.3, 0.2, 0.1],
                }}
                transition={{
                  duration: 15 + Math.random() * 10,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: Math.random() * 5,
                }}
              />
            ))}

            {/* Grid pattern */}
            <div
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                `,
                backgroundSize: '50px 50px'
              }}
            />

            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t via-transparent from-slate-900/50 to-slate-900/30 dark:from-slate-900/50 dark:to-slate-900/30 light:from-slate-100/50 light:to-slate-100/30" />
            <div className="absolute inset-0 bg-gradient-to-r via-transparent from-purple-900/20 to-pink-900/20 dark:from-purple-900/20 dark:to-pink-900/20 light:from-purple-500/20 light:to-pink-500/20" />
          </div>

          <div className="relative z-10">
            <LoaderAnimation onComplete={() => setAnimationComplete(true)} />
          </div>
        </div>
      </HeaderOnlyLayout>
    );
  }

  if (error) {
    return (
      <HeaderOnlyLayout>
        <div className="flex justify-center items-center h-screen text-red-500">
          <p>{error}</p>
        </div>
      </HeaderOnlyLayout>
    );
  }

  return (
    <HeaderOnlyLayout>
      <div className="flex overflow-hidden relative flex-col min-h-screen bg-gradient-to-br via-purple-900 from-slate-900 to-slate-900 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 light:from-slate-100 light:via-purple-50 light:to-slate-100">
        {/* Animated background elements */}
        <div className="overflow-hidden absolute inset-0">
          {/* Floating orbs */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`orb-${i}`}
              className="absolute w-32 h-32 rounded-full opacity-20"
              style={{
                background: `radial-gradient(circle, ${['#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#EF4444'][i % 6]
                  } 0%, transparent 70%)`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                x: [0, 100, -50, 0],
                y: [0, -80, 60, 0],
                scale: [1, 1.2, 0.8, 1],
                opacity: [0.1, 0.3, 0.2, 0.1],
              }}
              transition={{
                duration: 15 + Math.random() * 10,
                repeat: Infinity,
                ease: "easeInOut",
                delay: Math.random() * 5,
              }}
            />
          ))}

          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px'
            }}
          />

          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t via-transparent from-slate-900/50 to-slate-900/30 dark:from-slate-900/50 dark:to-slate-900/30 light:from-slate-100/50 light:to-slate-100/30" />
          <div className="absolute inset-0 bg-gradient-to-r via-transparent from-purple-900/20 to-pink-900/20 dark:from-purple-900/20 dark:to-pink-900/20 light:from-purple-500/20 light:to-pink-500/20" />
        </div>

        <div className="relative z-10 flex-1">
          {userProfile && (
            <MatchingInterface
              userProfile={userProfile}
              matches={matches}
              history={history}
              handleAction={handleAction}
              handleBlock={handleBlock}
            />
          )}
        </div>
      </div>
    </HeaderOnlyLayout>
  );
};

export default MatchmakingPage;
