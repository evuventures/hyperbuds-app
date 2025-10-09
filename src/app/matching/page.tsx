"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, RefreshCw } from "lucide-react";
import { BASE_URL } from "@/config/baseUrl";
import type { MatchSuggestion, CreatorProfile } from "@/types/matching.types";
import PreferencesForm from "@/components/matching/PreferencesForm";
import MatchCard from "@/components/matching/MatchCard";
import ProfileModal from "@/components/matching/ProfileModal";
import CompatibilityModal from "@/components/matching/CompatibilityModal";
import FunLoader from "@/components/matching/FunLoader";
import DashboardLayout from "@/components/layout/Dashboard/Dashboard";

// Mock data removed - now using real API data
/* const mockMatches: MatchSuggestion[] = [
  {
    _id: "1",
    userId: "current-user",
    targetUserId: "user-1",
    compatibilityScore: 92,
    matchType: "ai-suggested",
    scoreBreakdown: {
      audienceOverlap: 85,
      nicheCompatibility: 95,
      engagementStyle: 88,
      geolocation: 90,
      activityTime: 78,
      rizzScoreCompatibility: 92
    },
    status: "pending",
    metadata: {
      algorithm: "ai-v2",
      confidence: 0.92,
      features: ["Strong audience overlap", "Similar content style", "High engagement potential"]
    },
    targetProfile: {
      userId: "user-1",
      username: "gamergirl2025",
      displayName: "Gaming Girl",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face",
      bio: "Gaming content creator and lifestyle influencer. Love creating fun content and collaborating with amazing creators!",
      niche: ["gaming", "tech", "lifestyle"],
      location: {
        city: "Los Angeles",
        state: "California",
        country: "US"
      },
      stats: {
        totalFollowers: 95000,
        avgEngagement: 7.2,
        platformBreakdown: {
          tiktok: { followers: 60000, engagement: 8.1 },
          instagram: { followers: 25000, engagement: 6.5 },
          youtube: { followers: 10000, engagement: 5.8 }
        }
      },
      socialLinks: {
        tiktok: "https://tiktok.com/@gamergirl2025",
        instagram: "https://instagram.com/gamergirl2025",
        youtube: "https://youtube.com/c/gamergirl2025"
      },
      rizzScore: 82,
      isPublic: true,
      isActive: true
    },
    createdAt: "2025-01-15T10:00:00Z",
    updatedAt: "2025-01-15T10:00:00Z"
  },
  {
    _id: "2",
    userId: "current-user",
    targetUserId: "user-2",
    compatibilityScore: 88,
    matchType: "ai-suggested",
    scoreBreakdown: {
      audienceOverlap: 78,
      nicheCompatibility: 92,
      engagementStyle: 85,
      geolocation: 88,
      activityTime: 82,
      rizzScoreCompatibility: 88
    },
    status: "pending",
    metadata: {
      algorithm: "ai-v2",
      confidence: 0.88,
      features: ["Complementary niches", "Good location match", "High collaboration potential"]
    },
    targetProfile: {
      userId: "user-2",
      username: "creativevibes",
      displayName: "Creative Vibes",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
      bio: "Creative content creator focusing on art, design, and lifestyle. Always looking for new collaboration opportunities!",
      niche: ["art", "design", "lifestyle"],
      location: {
        city: "New York",
        state: "New York",
        country: "US"
      },
      stats: {
        totalFollowers: 75000,
        avgEngagement: 6.8,
        platformBreakdown: {
          instagram: { followers: 45000, engagement: 7.2 },
          tiktok: { followers: 20000, engagement: 6.1 },
          youtube: { followers: 10000, engagement: 7.5 }
        }
      },
      socialLinks: {
        instagram: "https://instagram.com/creativevibes",
        tiktok: "https://tiktok.com/@creativevibes",
        youtube: "https://youtube.com/c/creativevibes"
      },
      rizzScore: 85,
      isPublic: true,
      isActive: true
    },
    createdAt: "2025-01-15T10:00:00Z",
    updatedAt: "2025-01-15T10:00:00Z"
  },
  {
    _id: "3",
    userId: "current-user",
    targetUserId: "user-3",
    compatibilityScore: 90,
    matchType: "ai-suggested",
    scoreBreakdown: {
      audienceOverlap: 82,
      nicheCompatibility: 88,
      engagementStyle: 92,
      geolocation: 85,
      activityTime: 88,
      rizzScoreCompatibility: 90
    },
    status: "pending",
    metadata: {
      algorithm: "ai-v2",
      confidence: 0.90,
      features: ["Excellent engagement match", "Similar audience demographics", "High collaboration success rate"]
    },
    targetProfile: {
      userId: "user-3",
      username: "musicmaker",
      displayName: "Music Maker",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
      bio: "Music producer and content creator. Love creating original music and collaborating with other creators on unique projects.",
      niche: ["music", "entertainment", "tech"],
      location: {
        city: "Austin",
        state: "Texas",
        country: "US"
      },
      stats: {
        totalFollowers: 120000,
        avgEngagement: 8.5,
        platformBreakdown: {
          youtube: { followers: 70000, engagement: 9.2 },
          tiktok: { followers: 35000, engagement: 7.8 },
          instagram: { followers: 15000, engagement: 8.1 }
        }
      },
      socialLinks: {
        youtube: "https://youtube.com/c/musicmaker",
        tiktok: "https://tiktok.com/@musicmaker",
        instagram: "https://instagram.com/musicmaker"
      },
      rizzScore: 89,
      isPublic: true,
      isActive: true
    },
    createdAt: "2025-01-15T10:00:00Z",
    updatedAt: "2025-01-15T10:00:00Z"
  }
]; */

const MatchmakingPage: React.FC = () => {
  const [userProfile, setUserProfile] = useState<CreatorProfile | null>(null);
  const [matches, setMatches] = useState<MatchSuggestion[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("ai-matches");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<CreatorProfile | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<MatchSuggestion | null>(null);
  const [isCompatibilityModalOpen, setIsCompatibilityModalOpen] = useState(false);
  const [isSubmittingPreferences, setIsSubmittingPreferences] = useState(false);
  const [likedMatches, setLikedMatches] = useState<Set<string>>(new Set());
  const [showAILoader, setShowAILoader] = useState(false);


  useEffect(() => {
    async function loadData() {
      try {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
          // No token - redirect to login
          setError("Please login to view matches");
          setDataLoaded(true);
          return;
        }

        const [profileRes, suggestionsRes] = await Promise.all([
          fetch(`${BASE_URL}/api/v1/users/me`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
          fetch(`${BASE_URL}/api/v1/matching/suggestions?limit=10`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          })
        ]);

        if (profileRes.ok) {
          const profileData = await profileRes.json();

          // Handle different response structures
          if (profileData.profile) {
            setUserProfile(profileData.profile as CreatorProfile);
          } else if (profileData.data?.profile) {
            setUserProfile(profileData.data.profile as CreatorProfile);
          } else if (profileData.data) {
            setUserProfile(profileData.data as CreatorProfile);
          } else {
            // Use mock profile as fallback
            setUserProfile({
              userId: "current-user",
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
        } else {
          // Use mock profile as fallback
          setUserProfile({
            userId: "current-user",
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

        if (suggestionsRes.ok) {
          const suggestionsData = await suggestionsRes.json();

          // Handle different response structures
          if (suggestionsData.matches && suggestionsData.matches.length > 0) {
            setMatches(suggestionsData.matches as MatchSuggestion[]);
          } else if (suggestionsData.data?.matches && suggestionsData.data.matches.length > 0) {
            setMatches(suggestionsData.data.matches as MatchSuggestion[]);
          } else if (suggestionsData.data && Array.isArray(suggestionsData.data) && suggestionsData.data.length > 0) {
            setMatches(suggestionsData.data as MatchSuggestion[]);
          } else {
            // No matches available - set empty array
            setMatches([]);
          }
        } else {
          // API error - set empty array
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
    }
    loadData();
  }, []); // Empty dependency array - only run once on mount

  const handleAction = async (matchId: string, action: "like" | "unlike" | "pass" | "view") => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (accessToken) {
        await fetch(`${BASE_URL}/api/v1/matching/actions`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ matchId, action }),
        });
      }

      if (action === "view") {
        const match = matches.find(m => m.targetProfile?.userId === matchId);
        if (match && match.targetProfile) {
          setSelectedMatch(match);
          setSelectedProfile(match.targetProfile);
          setIsCompatibilityModalOpen(true);
        }
      } else if (action === "pass") {
        // Only remove the card when passing, not when liking
        setMatches(prev => prev.filter(m => m.targetProfile?.userId !== matchId));
      } else if (action === "like") {
        // Track liked matches for visual feedback
        setLikedMatches(prev => new Set(prev).add(matchId));
      } else if (action === "unlike") {
        // Remove from liked matches
        setLikedMatches(prev => {
          const newSet = new Set(prev);
          newSet.delete(matchId);
          return newSet;
        });
      }
    } catch (err) {
      console.error("Action failed:", err);
    }
  };

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
      // Simulate AI processing time for better UX
      await new Promise(resolve => setTimeout(resolve, 3000));

      const accessToken = localStorage.getItem("accessToken");
      if (accessToken) {
        const response = await fetch(`${BASE_URL}/api/v1/matching/suggestions?limit=10`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (response.ok) {
          const data = await response.json();
          
          // Handle different response structures
          if (data.matches) {
            setMatches(data.matches as MatchSuggestion[]);
          } else if (data.data?.matches) {
            setMatches(data.data.matches as MatchSuggestion[]);
          } else if (data.data) {
            setMatches(data.data as MatchSuggestion[]);
          } else {
            // No matches available
            setMatches([]);
          }
        } else {
          // API error - show empty
          setMatches([]);
        }
      }
    } catch (err) {
      console.error("Refresh failed:", err);
    } finally {
      setIsRefreshing(false);
      setShowAILoader(false); // Hide AI loader when done
    }
  };

  if (!dataLoaded) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="mx-auto mb-4 w-8 h-8 rounded-full border-4 border-purple-500 animate-spin border-t-transparent"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
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

  // Show AI loader when processing
  if (showAILoader) {
    return (
      <DashboardLayout>
        <FunLoader onComplete={() => setShowAILoader(false)} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col min-h-screen bg-white dark:bg-[#0f172a]">
        <div className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {/* Header Section */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <div className="flex gap-4 justify-between items-center">
                <div className="flex gap-4 items-center">
                  <motion.div
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    className="relative"
                  >
                    {/* Glowing Ring Effect */}
                    <motion.div
                      animate={{
                        scale: [1, 1.15, 1],
                        opacity: [0.4, 0.7, 0.4]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="absolute inset-0 bg-gradient-to-r rounded-full blur-md from-purple-400/40 to-pink-400/40"
                    />

                    {/* Enhanced Avatar */}
                    <Avatar className="relative w-16 h-16 border-4 shadow-md border-white/30 shadow-purple-500/30">
                      <AvatarImage
                        src={userProfile?.avatar}
                        alt={userProfile?.displayName}
                        className="object-cover"
                      />
                      <AvatarFallback className="text-lg font-bold bg-gradient-to-br from-purple-500 to-pink-500">
                        {userProfile?.displayName?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </motion.div>

                  <div className="flex-1">
                    <motion.h1
                      className="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl"
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      {userProfile?.displayName || "Creator"}
                    </motion.h1>

                    <motion.p
                      className="text-sm text-gray-600 dark:text-purple-200 md:text-base"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      {userProfile?.bio || "Find your perfect collaboration matches!"}
                    </motion.p>
                  </div>
                </div>

                <div className="flex gap-2 items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={refreshMatches}
                    disabled={isRefreshing}
                    className="text-gray-900 bg-gray-100 border-gray-300 cursor-pointer dark:text-white dark:bg-white/10 dark:border-white/20 hover:bg-gray-200 dark:hover:bg-white/20 dark:hover:text-white"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                    Refresh
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8"
            >
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className={`grid grid-cols-2 w-full mx-auto p-1 bg-gray-100 dark:bg-gray-800 rounded-xl transition-all duration-300 shadow-md border border-gray-200 dark:border-gray-700 ${activeTab === "preferences" ? "max-w-4xl" : "max-w-7xl"
                  }`}>
                  <TabsTrigger
                    value="ai-matches"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:font-semibold data-[state=active]:dark:text-white text-gray-600 dark:text-gray-300 cursor-pointer rounded-lg transition-all duration-200 hover:text-gray-900 dark:hover:text-white"
                  >
                    AI Matches
                  </TabsTrigger>
                  <TabsTrigger
                    value="preferences"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:font-semibold data-[state=active]:dark:text-white text-gray-600 dark:text-gray-300 cursor-pointer rounded-lg transition-all duration-200 hover:text-gray-900 dark:hover:text-white"
                  >
                    Preferences
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="ai-matches" className="mt-8">
                  {matches.length > 0 ? (
                    <div className="grid grid-cols-1 gap-8 py-4 md:grid-cols-2 lg:grid-cols-3">
                      {matches.map((match, index) => (
                        <motion.div
                          key={match._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                          <MatchCard
                            match={match}
                            onAction={handleAction}
                            onCollaboration={handleCollaboration}
                            isLiked={match.targetProfile ? likedMatches.has(match.targetProfile.userId) : false}
                          />
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col justify-center items-center py-12 text-center">
                      <div className="flex justify-center items-center mb-4 w-24 h-24 bg-gray-100 rounded-full dark:bg-white/10">
                        <Heart className="w-12 h-12 text-gray-400 dark:text-white/60" />
                      </div>
                      <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">No matches found</h3>
                      <p className="mb-4 text-gray-600 dark:text-white/60">Try adjusting your preferences or check back later!</p>
                      <Button
                        onClick={() => setActiveTab("preferences")}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      >
                        Update Preferences
                      </Button>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="preferences" className="mt-6">
                  <PreferencesForm
                    onSubmit={handlePreferencesSubmit}
                    isSubmitting={isSubmittingPreferences}
                  />
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        </div>

        {/* Profile Modal */}
        <ProfileModal
          profile={selectedProfile}
          isOpen={isProfileModalOpen}
          onClose={() => {
            setIsProfileModalOpen(false);
            setSelectedProfile(null);
          }}
          onAction={handleAction}
          onCollaboration={handleCollaboration}
          isLiked={selectedProfile ? likedMatches.has(selectedProfile.userId) : false}
        />

        {/* Compatibility Modal */}
        <CompatibilityModal
          match={selectedMatch}
          profile={selectedProfile}
          isOpen={isCompatibilityModalOpen}
          onClose={() => {
            setIsCompatibilityModalOpen(false);
            setSelectedMatch(null);
            setSelectedProfile(null);
          }}
          onCollaboration={handleCollaboration}
        />
      </div>
    </DashboardLayout>
  );
};

export default MatchmakingPage;

