/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Heart, X, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { BASE_URL } from "@/config/baseUrl";
import type { MatchSuggestion, CreatorProfile } from "@/types/matching.types";
//import PreferencesForm from "@/components/matching/PreferencesForm";
//import MatchCard from "@/components/matching/MatchCard";
//import ProfileModal from "@/components/matching/ProfileModal";
//import CompatibilityModal from "@/components/matching/CompatibilityModal";
//import FunLoader from "@/components/matching/FunLoader";
import DashboardLayout from "@/components/layout/Dashboard/Dashboard";
import { suggestionsApi } from "@/lib/api/suggestions.api";
import { profileApi } from "@/lib/api/profile.api";
import Image from "next/image";
export default function MatchmakerPage() {
  const [matches, setMatches] = useState<MatchSuggestion[]>([]);
  //const [isLoading, setIsLoading] = useState(false);
  //const [user, setUser] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<CreatorProfile | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [, setIsSubmittingPreferences] = useState(false);
  const [, setShowAILoader] = useState(false);
  const [, setActiveTab] = useState<string>("ai-matches");
  const [, setIsRefreshing] = useState(false);
   
  const [, setSelectedMatch] = useState<MatchSuggestion | null>(null);
   
  const [, setSelectedProfile] = useState<CreatorProfile | null>(null);
  const [, setIsCompatibilityModalOpen] = useState(false);
  const [, setLikedMatches] = useState<Set<string>>(new Set());

  // ✅ Fetch current user profile and matches
  const loadData = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
          console.warn("⚠️ No access token found.");
          setError("Unauthorized. Please log in again.");
          return;
        }

        // Get user profile first to get userId
        const profileRes = await fetch(`${BASE_URL}/api/v1/users/me`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        let currentUserId: string | null = null;
        let currentProfile: CreatorProfile | null = null;

        if (profileRes.ok) {
          const profileData = await profileRes.json();

          // Handle different response structures
          if (profileData.profile) {
            currentProfile = profileData.profile as CreatorProfile;
            currentUserId = currentProfile.userId;
          } else if (profileData.data?.profile) {
            currentProfile = profileData.data.profile as CreatorProfile;
            currentUserId = currentProfile.userId;
          } else if (profileData.data) {
            currentProfile = profileData.data as CreatorProfile;
            currentUserId = currentProfile.userId;
          } else if (profileData.userId) {
            currentUserId = profileData.userId;
          }
        }

        // Fallback: get userId from localStorage or profile response
        if (!currentUserId) {
          currentUserId = localStorage.getItem('userId') || 
                         JSON.parse(localStorage.getItem('user') || '{}')?.userId ||
                         null;
        }

        // Set user profile (use fallback if needed)
        if (currentProfile) {
          setUserProfile(currentProfile);
        } else {
          // Use minimal profile as fallback
          setUserProfile({
            userId: currentUserId || "current-user",
            username: "currentuser",
            displayName: "Current User",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
            bio: "Content creator looking for amazing collaborations!",
            niche: ["gaming", "tech", "lifestyle"],
            location: {
              city: "San Francisco",
              state: "California",
              country: "US"
            },
            stats: {
              totalFollowers: 50000,
              avgEngagement: 6.5,
              platformBreakdown: {
                tiktok: { followers: 30000, engagement: 7.0 },
                instagram: { followers: 15000, engagement: 6.0 },
                youtube: { followers: 5000, engagement: 6.5 }
              }
            },
            rizzScore: 78,
            isPublic: true,
            isActive: true
          });
        }

        // Fetch suggestions using new API endpoint
        if (currentUserId) {
          try {
            const suggestionsData = await suggestionsApi.getSuggestions(currentUserId);
            
            // Transform API response to MatchSuggestion format
            const transformedMatches: MatchSuggestion[] = await Promise.all(
              suggestionsData.suggestions.map(async (suggestion) => {
                // Fetch full profile for each suggestion
                let targetProfile: CreatorProfile | undefined;
                try {
                  const profileData = await profileApi.getProfileByUsername(suggestion.username);
                  targetProfile = {
                    userId: suggestion.userId,
                    username: suggestion.username,
                    displayName: profileData.displayName || suggestion.username,
                    avatar: profileData.avatar,
                    bio: profileData.bio,
                    niche: profileData.niche || [],
                    location: profileData.location,
                    stats: {
                      totalFollowers: 0,
                      avgEngagement: 0,
                      platformBreakdown: {}
                    },
                    socialLinks: profileData.socialLinks,
                    rizzScore: profileData.profileRizzScore,
                    isPublic: true,
                    isActive: true
                  };
                } catch (err) {
                  console.warn(`Failed to fetch profile for ${suggestion.username}:`, err);
                  // Create minimal profile from suggestion data
                  targetProfile = {
                    userId: suggestion.userId,
                    username: suggestion.username,
                    displayName: suggestion.username,
                    niche: suggestion.sharedNiches || [],
                    stats: {
                      totalFollowers: 0,
                      avgEngagement: 0,
                      platformBreakdown: {}
                    },
                    isPublic: true,
                    isActive: true
                  };
                }

                return {
                  _id: `match-${suggestion.userId}`,
                  id: `match-${suggestion.userId}`,
                  userId: currentUserId || "current-user",
                  targetUserId: suggestion.userId,
                  compatibilityScore: suggestion.matchingScore,
                  matchType: 'niche-based' as const,
                  scoreBreakdown: {
                    audienceOverlap: 0,
                    nicheCompatibility: suggestion.matchingScore,
                    engagementStyle: 0,
                    geolocation: 0,
                    activityTime: 0,
                    rizzScoreCompatibility: 0
                  },
                  status: 'pending' as const,
                  metadata: {
                    algorithm: 'matchmaker-v1',
                    confidence: suggestion.matchingScore / 100,
                    features: suggestion.sharedNiches.length > 0 
                      ? [`Shared niches: ${suggestion.sharedNiches.join(', ')}`]
                      : []
                  },
                  targetProfile,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                };
              })
            );

            setMatches(transformedMatches);
          } catch (suggestionsError) {
            console.error("Error fetching suggestions:", suggestionsError);
            setMatches([]);
          }
        } else {
          console.warn("No userId available, cannot fetch suggestions");
          setMatches([]);
        }

        setError(null);
      } catch (err: unknown) {
        console.error("Error loading data:", err);
        setError(err instanceof Error ? err.message : "Failed to load matching data");
        // Set empty data on error
        setMatches([]);
      } finally {
        setDataLoaded(true);
      }
  };

  useEffect(() => {
    loadData();
  }, []); // Empty dependency array - only run once on mount



  const handleCollaboration = async (matchId: string) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (accessToken) {
        await fetch(`${BASE_URL}/api/v1/collaborations/invite`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            recipientId: matches.find(m => m._id === matchId)?.targetUserId,
            type: "live-stream",
            title: "Collaboration Invite",
            description: "Let's collaborate on some amazing content together!",
            proposedDateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            duration: 120,
            platform: "tiktok",
            splitRevenue: true
          }),
        });
      }

      // Remove the match after collaboration invite
      setMatches(prev => prev.filter(m => m._id !== matchId));
    } catch (err) {
      console.error("Collaboration invite failed:", err);
    }
  };

  /*************  ✨ Windsurf Command ⭐  *************/
  /**
   * Submits user preferences to the server and refreshes the matches
   * list accordingly.
   *
   * @param {Record<string, unknown>} preferences - User preferences to be submitted
   */
  /*******  524a4fcd-6779-4312-bb77-6b52ac339bec  *******/
  const handlePreferencesSubmit = async (preferences: Record<string, unknown>) => {
    setIsSubmittingPreferences(true);
    setShowAILoader(true); // Show AI loader when processing preferences

    try {
      const accessToken = localStorage.getItem("accessToken");
      if (accessToken) {
        await fetch(`${BASE_URL}/api/v1/profiles/me`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ preferences }),
        });
      }

      // Switch to AI matches tab
      setActiveTab("ai-matches");

      // Refresh matches with AI processing
      await refreshMatches();
    } catch (err) {
      console.error("Preferences update failed:", err);
    } finally {
      setIsSubmittingPreferences(false);
      setShowAILoader(false); // Hide AI loader when done
    }
  };

  const refreshMatches = async () => {
    setIsRefreshing(true);
    setShowAILoader(true); // Show AI loader when refreshing matches

    try {
      // Get userId
      const userId = userProfile?.userId || 
                     localStorage.getItem('userId') || 
                     JSON.parse(localStorage.getItem('user') || '{}')?.userId;

      if (!userId) {
        console.warn("No userId available for refresh");
        setMatches([]);
        return;
      }

      // Fetch suggestions using new API endpoint
      const suggestionsData = await suggestionsApi.getSuggestions(userId);
      
      // Transform API response to MatchSuggestion format
      const transformedMatches: MatchSuggestion[] = await Promise.all(
        suggestionsData.suggestions.map(async (suggestion) => {
          // Fetch full profile for each suggestion
          let targetProfile: CreatorProfile | undefined;
          try {
            const profileData = await profileApi.getProfileByUsername(suggestion.username);
            targetProfile = {
              userId: suggestion.userId,
              username: suggestion.username,
              displayName: profileData.displayName || suggestion.username,
              avatar: profileData.avatar,
              bio: profileData.bio,
              niche: profileData.niche || [],
              location: profileData.location,
              stats: {
                totalFollowers: 0,
                avgEngagement: 0,
                platformBreakdown: {}
              },
              socialLinks: profileData.socialLinks,
              rizzScore: profileData.profileRizzScore,
              isPublic: true,
              isActive: true
            };
          } catch (err) {
            console.warn(`Failed to fetch profile for ${suggestion.username}:`, err);
            // Create minimal profile from suggestion data
            targetProfile = {
              userId: suggestion.userId,
              username: suggestion.username,
              displayName: suggestion.username,
              niche: suggestion.sharedNiches || [],
              stats: {
                totalFollowers: 0,
                avgEngagement: 0,
                platformBreakdown: {}
              },
              isPublic: true,
              isActive: true
            };
          }

          return {
            _id: `match-${suggestion.userId}`,
            id: `match-${suggestion.userId}`,
            userId: userId,
            targetUserId: suggestion.userId,
            compatibilityScore: suggestion.matchingScore,
            matchType: 'niche-based' as const,
            scoreBreakdown: {
              audienceOverlap: 0,
              nicheCompatibility: suggestion.matchingScore,
              engagementStyle: 0,
              geolocation: 0,
              activityTime: 0,
              rizzScoreCompatibility: 0
            },
            status: 'pending' as const,
            metadata: {
              algorithm: 'matchmaker-v1',
              confidence: suggestion.matchingScore / 100,
              features: suggestion.sharedNiches.length > 0 
                ? [`Shared niches: ${suggestion.sharedNiches.join(', ')}`]
                : []
            },
            targetProfile,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
        })
      );

      setMatches(transformedMatches);
    } catch (err) {
      console.error("Refresh failed:", err);
      setMatches([]);
    } finally {
      setIsRefreshing(false);
      setShowAILoader(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4 pb-16 space-y-6 lg:p-6 lg:pb-34">
        {error ? (
          <div className="flex flex-col justify-center items-center py-20 text-red-500">
            <p className="mb-4">{error}</p>
            <button
              onClick={loadData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center transition-colors"
            >
              <RefreshCw className="mr-2 w-4 h-4" /> Retry
            </button>
          </div>
        ) : !dataLoaded ? (
          <div className="flex flex-col justify-center items-center py-20">
            <Loader2 className="animate-spin text-blue-500 w-8 h-8 mb-4" />
            <span className="text-blue-500 font-medium">Loading matches...</span>
          </div>
        ) : matches.length === 0 ? (
          <div className="flex flex-col justify-center items-center py-20 text-gray-400 dark:text-gray-500">
            <Heart className="w-16 h-16 mb-4 text-pink-500 dark:text-pink-400" />
            <p className="text-lg font-medium mb-2">No match suggestions yet.</p>
            <p className="text-sm mb-6 text-gray-500 dark:text-gray-400">
              Complete your profile to get better matches!
            </p>
            <button
              onClick={loadData}
              className="px-6 py-3 bg-linear-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 flex items-center transition-all transform hover:scale-105 shadow-lg"
            >
              <RefreshCw className="mr-2 w-4 h-4" /> Refresh
            </button>
          </div>
        ) : (
          <>
            <div className="flex gap-4 justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">🎯 Match Suggestions</h1>
              <button
                onClick={refreshMatches}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center transition-colors"
              >
                <RefreshCw className="mr-2 w-4 h-4" /> Refresh
              </button>
            </div>
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {matches.map((match, index) => (
                <motion.div
                  key={match.id || match._id || index}
                  className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md flex flex-col items-center border border-gray-200 dark:border-gray-700"
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.2 }}
                >
                 
                  <Image
                    src={match?.profile?.avatar || match?.targetProfile?.avatar || "/default-avatar.png"}
                    alt={match?.profile?.displayName || match?.targetProfile?.displayName || "User"}
                    className="w-24 h-24 rounded-full mb-3 object-cover ring-2 ring-pink-200 dark:ring-pink-800"
                  />
                  <h2 className="font-semibold text-lg text-gray-900 dark:text-white">
                    {match?.profile?.displayName || match?.targetProfile?.displayName || "Unknown User"}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    {match?.profile?.niche?.join(", ") || match?.targetProfile?.niche?.join(", ") || "No niche info"}
                  </p>
                  {match.compatibilityScore && (
                    <p className="text-sm font-medium text-pink-600 dark:text-pink-400 mb-3">
                      {match.compatibilityScore.toFixed(0)}% Match
                    </p>
                  )}
                  <div className="flex gap-4">
                    <button className="p-2 rounded-full bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">
                      <X className="text-red-500 dark:text-red-400" />
                    </button>
                    <button className="p-2 rounded-full bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors">
                      <Heart className="text-green-500 dark:text-green-400" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
