"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, ArrowLeft } from "lucide-react";
import type { MatchSuggestion, CreatorProfile } from "@/types/matching.types";
import MatchHistoryGallery from "@/components/matching/MatchHistoryGallery";
import ProfileModal from "@/components/matching/ProfileModal";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/Dashboard/Dashboard";

// Mock data for demonstration - moved outside component to prevent infinite loop
const mockMatches: MatchSuggestion[] = [
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
      status: "liked",
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
      createdAt: "2025-01-14T10:00:00Z",
      updatedAt: "2025-01-14T10:00:00Z"
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
      status: "mutual",
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
      createdAt: "2025-01-13T15:30:00Z",
      updatedAt: "2025-01-13T15:30:00Z"
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
      status: "liked",
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
      createdAt: "2025-01-12T08:15:00Z",
      updatedAt: "2025-01-12T08:15:00Z"
   }
];

const AIMatchesPage: React.FC = () => {
   const router = useRouter();
   const [historyMatches, setHistoryMatches] = useState<MatchSuggestion[]>([]);
   const [selectedProfile, setSelectedProfile] = useState<CreatorProfile | null>(null);
   const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
   const [likedMatches, setLikedMatches] = useState<Set<string>>(new Set());
   const [isRefreshing, setIsRefreshing] = useState(false);

   // Initialize with mock data
   useEffect(() => {
      // Set history matches
      setHistoryMatches(mockMatches);

      // Initialize liked matches
      const likedIds = mockMatches
         .filter(match => match.status === "liked" || match.status === "mutual")
         .map(match => match.targetProfile?.userId)
         .filter((id): id is string => Boolean(id));
      setLikedMatches(new Set(likedIds));
   }, []);

   const handleMessage = (userId: string) => {
      console.log("Opening chat with user:", userId);
      // This would typically open a chat interface
      alert(`Opening chat with user: ${userId}`);
   };

   const handleViewProfile = (userId: string) => {
      const match = historyMatches.find(m => m.targetProfile?.userId === userId);
      if (match?.targetProfile) {
         setSelectedProfile(match.targetProfile);
         setIsProfileModalOpen(true);
      }
   };

   const refreshMatches = async () => {
      setIsRefreshing(true);
      try {
         // Simulate API call
         await new Promise(resolve => setTimeout(resolve, 1000));
         console.log("Refreshed AI matches");
      } catch (err) {
         console.error("Refresh failed:", err);
      } finally {
         setIsRefreshing(false);
      }
   };

   return (
      <DashboardLayout>
         <div className="min-h-screen bg-gray-50 dark:bg-slate-900">

            <div className="p-6">
               <div className="mx-auto max-w-4xl">
                  {/* Simple Header */}
                  <div className="flex justify-between items-center mb-1">
                     <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.back()}
                        className="text-gray-900 bg-gray-100 border-gray-300 cursor-pointer dark:text-white dark:bg-white/10 dark:border-white/20 hover:bg-gray-200 dark:hover:bg-white/20"
                     >
                        <ArrowLeft className="mr-2 w-4 h-4" />
                        Back
                     </Button>

                     <Button
                        variant="outline"
                        size="sm"
                        onClick={refreshMatches}
                        disabled={isRefreshing}
                        className="text-gray-900 bg-gray-100 border-gray-300 cursor-pointer dark:text-white dark:bg-white/10 dark:border-white/20 hover:bg-gray-200 dark:hover:bg-white/20"
                     >
                        <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                        Refresh
                     </Button>
                  </div>

                  {/* Simple Title */}
                  <div className="mb-4 text-center">
                     <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">AI Matches</h1>
                     <p className="text-gray-600 dark:text-gray-400">Your match history</p>
                  </div>

                  {/* Simple Content */}
                  <div className="p-6 rounded-xl border border-gray-200 backdrop-blur-sm bg-white/80 dark:bg-white/5 dark:border-white/10">
                     <MatchHistoryGallery
                        historyMatches={historyMatches}
                        onMessage={handleMessage}
                        onViewProfile={handleViewProfile}
                        likedMatches={likedMatches}
                     />
                  </div>
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
               onAction={() => { }} // Not used in this context
               onCollaboration={() => { }} // Not used in this context
               isLiked={selectedProfile ? likedMatches.has(selectedProfile.userId) : false}
            />
         </div>
      </DashboardLayout>
   );
};

export default AIMatchesPage;
