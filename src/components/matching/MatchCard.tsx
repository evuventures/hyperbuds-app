"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, X, Eye, MapPin, Users, TrendingUp, Star, Zap } from "lucide-react";
import type { MatchSuggestion } from "@/types/matching.types";

interface MatchCardProps {
   match: MatchSuggestion;
   onAction: (matchId: string, action: "like" | "unlike" | "pass" | "view") => void;
   onCollaboration: (matchId: string) => void;
   isLiked?: boolean;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, onAction, onCollaboration, isLiked = false }) => {
   const profile = match.targetProfile;

   if (!profile) {
      return null;
   }

   const handleLikeToggle = () => {
      onAction(profile.userId, isLiked ? "unlike" : "like");
   };

   const locationStr = [profile.location?.city, profile.location?.state, profile.location?.country]
      .filter(Boolean)
      .join(", ");

   const getCompatibilityColor = (score: number) => {
      if (score >= 90) return "text-white bg-green-600 border-green-500 shadow-lg";
      if (score >= 80) return "text-white bg-yellow-600 border-yellow-500 shadow-lg";
      if (score >= 70) return "text-white bg-orange-600 border-orange-500 shadow-lg";
      return "text-white bg-red-600 border-red-500 shadow-lg";
   };

   const getRizzScoreColor = (score: number) => {
      if (score >= 85) return "text-white bg-purple-600 border-purple-500 shadow-lg";
      if (score >= 75) return "text-white bg-blue-600 border-blue-500 shadow-lg";
      if (score >= 65) return "text-white bg-green-600 border-green-500 shadow-lg";
      return "text-white bg-gray-600 border-gray-500 shadow-lg";
   };

   return (
      <motion.div
         whileHover={{ y: -4, scale: 1.02 }}
         transition={{ duration: 0.2 }}
         className="h-full"
      >
         <Card className="overflow-hidden h-full border backdrop-blur-sm transition-all duration-300 bg-white/10 border-white/20 hover:bg-white/15">
            {/* Profile Image Section */}
            <div className="relative h-48 bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400">
               <div className="absolute inset-0 bg-black/20" />

               {/* Avatar */}
               <div className="absolute top-4 left-4">
                  <Avatar className="w-16 h-16 border-4 border-white/30">
                     <AvatarImage src={profile.avatar} alt={profile.displayName} />
                     <AvatarFallback className="text-lg font-bold text-white bg-white/20">
                        {profile.displayName?.charAt(0) || "U"}
                     </AvatarFallback>
                  </Avatar>
               </div>

               {/* Score Badges */}
               <div className="flex absolute top-4 right-4 flex-col gap-2">
                  <div className={`font-bold text-sm px-3 py-1 border-2 backdrop-blur-sm rounded-full ${getRizzScoreColor(profile.rizzScore || 0)}`}>
                     <Star className="inline mr-1 w-3 h-3" />
                     Rizz: {profile.rizzScore || "—"}
                  </div>
                  <div className={`font-bold text-sm px-3 py-1 border-2 backdrop-blur-sm rounded-full ${getCompatibilityColor(match.compatibilityScore)}`}>
                     {match.compatibilityScore}% Match
                  </div>
               </div>

               {/* Profile Info Overlay */}
               <div className="absolute right-4 bottom-4 left-4 text-white">
                  <h3 className="mb-1 text-xl font-bold">{profile.displayName}</h3>
                  <p className="mb-2 text-sm text-white/80">@{profile.username}</p>
                  {locationStr && (
                     <div className="flex items-center text-sm text-white/70">
                        <MapPin className="mr-1 w-3 h-3" />
                        {locationStr}
                     </div>
                  )}
               </div>
            </div>

            <CardContent className="p-4 space-y-4">
               {/* Bio */}
               {profile.bio && (
                  <p className="text-sm leading-relaxed text-white/80 line-clamp-2">
                     {profile.bio}
                  </p>
               )}

               {/* Niches */}
               {profile.niche && profile.niche.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                     {profile.niche.slice(0, 3).map((tag) => (
                        <Badge
                           key={tag}
                           variant="outline"
                           className="text-xs bg-white/10 border-white/20 text-white/80 hover:bg-white/20"
                        >
                           #{tag}
                        </Badge>
                     ))}
                     {profile.niche.length > 3 && (
                        <Badge variant="outline" className="text-xs bg-white/10 border-white/20 text-white/80">
                           +{profile.niche.length - 3} more
                        </Badge>
                     )}
                  </div>
               )}

               {/* Stats */}
               <div className="grid grid-cols-2 gap-4 py-3 border-t border-white/20">
                  <div className="text-center">
                     <div className="flex justify-center items-center mb-1">
                        <Users className="mr-1 w-4 h-4 text-blue-400" />
                        <span className="text-sm font-semibold text-white">
                           {(profile.stats.totalFollowers / 1000).toFixed(0)}K
                        </span>
                     </div>
                     <span className="text-xs text-white/60">Followers</span>
                  </div>
                  <div className="text-center">
                     <div className="flex justify-center items-center mb-1">
                        <TrendingUp className="mr-1 w-4 h-4 text-green-400" />
                        <span className="text-sm font-semibold text-white">
                           {profile.stats.avgEngagement}%
                        </span>
                     </div>
                     <span className="text-xs text-white/60">Engagement</span>
                  </div>
               </div>

               {/* Compatibility Breakdown */}
               <div className="space-y-2">
                  <h4 className="mb-2 text-sm font-semibold text-white">Compatibility</h4>
                  <div className="space-y-1">
                     <div className="flex justify-between items-center text-xs">
                        <span className="text-white/70">Niche Match</span>
                        <span className="font-medium text-white">
                           {match.scoreBreakdown.nicheCompatibility}%
                        </span>
                     </div>
                     <div className="flex justify-between items-center text-xs">
                        <span className="text-white/70">Audience Overlap</span>
                        <span className="font-medium text-white">
                           {match.scoreBreakdown.audienceOverlap}%
                        </span>
                     </div>
                     <div className="flex justify-between items-center text-xs">
                        <span className="text-white/70">Engagement Style</span>
                        <span className="font-medium text-white">
                           {match.scoreBreakdown.engagementStyle}%
                        </span>
                     </div>
                  </div>
               </div>

               {/* Action Buttons */}
               <div className="flex gap-3 pt-3">
                  <motion.div
                     whileHover={{ scale: 1.05 }}
                     whileTap={{ scale: 0.95 }}
                     transition={{ type: "spring", stiffness: 400, damping: 17 }}
                     className="flex-1"
                  >
                     <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onAction(profile.userId, "pass")}
                        className="w-full h-9 font-medium text-red-300 rounded-lg border shadow-sm transition-all duration-200 cursor-pointer bg-white/10 border-red-400/30 hover:bg-red-500/20 hover:border-red-400/50 hover:text-red-200 hover:shadow-md hover:shadow-red-500/20"
                     >
                        <X className="mr-1 w-4 h-4" />
                        Pass
                     </Button>
                  </motion.div>

                  <motion.div
                     whileHover={{ scale: 1.05 }}
                     whileTap={{ scale: 0.95 }}
                     transition={{ type: "spring", stiffness: 400, damping: 17 }}
                     className="flex-1"
                  >
                     <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onAction(profile.userId, "view")}
                        className="w-full h-9 font-medium text-blue-300 rounded-lg border shadow-sm transition-all duration-200 cursor-pointer bg-white/10 border-blue-400/30 hover:bg-blue-500/20 hover:border-blue-400/50 hover:text-blue-200 hover:shadow-md hover:shadow-blue-500/20"
                     >
                        <Eye className="mr-1 w-4 h-4" />
                        View
                     </Button>
                  </motion.div>

                  <motion.div
                     whileHover={{ scale: 1.05 }}
                     whileTap={{ scale: 0.95 }}
                     transition={{ type: "spring", stiffness: 400, damping: 17 }}
                     className="flex-1"
                  >
                     <Button
                        variant="outline"
                        size="sm"
                        onClick={handleLikeToggle}
                        className={`w-full h-9 rounded-lg border cursor-pointer transition-all duration-200 font-medium shadow-sm hover:shadow-md ${isLiked
                           ? "text-white bg-green-500 border-green-400 hover:bg-green-600 hover:text-white hover:shadow-green-500/30"
                           : "text-green-300 bg-white/10 border-green-400/30 hover:bg-green-500/20 hover:border-green-400/50 hover:text-green-200 hover:shadow-green-500/20"
                           }`}
                     >
                        <motion.div
                           animate={{ scale: isLiked ? 1.15 : 1 }}
                           transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                           <Heart className={`w-4 h-4 mr-1 ${isLiked ? "fill-current" : ""}`} />
                        </motion.div>
                        {isLiked ? "Liked!" : "Like"}
                     </Button>
                  </motion.div>
               </div>

               {/* Collaboration Button */}
               <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  className="mt-3"
               >
                  <Button
                     onClick={() => onCollaboration(profile.userId)}
                     className="w-full h-10 font-semibold text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg border-0 shadow-sm transition-all duration-200 cursor-pointer hover:from-purple-600 hover:to-pink-600 hover:text-white hover:shadow-md hover:shadow-purple-500/30"
                  >
                     <Zap className="mr-2 w-4 h-4" />
                     Collab
                  </Button>
               </motion.div>
            </CardContent>
         </Card>
      </motion.div>
   );
};

export default MatchCard;
