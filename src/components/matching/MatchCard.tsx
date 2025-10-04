"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, X, Eye, Star, Zap, MessageCircle } from "lucide-react";
import type { MatchSuggestion } from "@/types/matching.types";

interface MatchCardProps {
   match: MatchSuggestion;
   onAction: (matchId: string, action: "like" | "unlike" | "pass" | "view") => void;
   onCollaboration: (matchId: string) => void;
   onMessage?: (matchId: string) => void;
   onViewProfile?: (matchId: string) => void;
   isLiked?: boolean;
   isSidebarContext?: boolean;
}

const MatchCard: React.FC<MatchCardProps> = ({
   match,
   onAction,
   onCollaboration,
   onMessage,
   onViewProfile,
   isLiked = false,
   isSidebarContext = false
}) => {
   const profile = match.targetProfile;

   if (!profile) {
      return null;
   }

   const handleLikeToggle = () => {
      onAction(profile.userId, isLiked ? "unlike" : "like");
   };


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
         whileHover={{ y: -4 }}
         transition={{ duration: 0.3, ease: "easeOut" }}
         className="w-full h-full"
      >
         <Card className="overflow-hidden h-full border border-gray-200 shadow-sm backdrop-blur-sm transition-all duration-300 group bg-white/80 dark:bg-slate-800/80 dark:border-slate-700 hover:shadow-xl hover:shadow-purple-500/10 dark:hover:shadow-purple-500/20 hover:border-purple-300 dark:hover:border-purple-500/50">
            {/* Simplified Card Content */}
            <CardContent className="flex flex-col p-4 h-full sm:p-5">
               {/* Enhanced Avatar and Basic Info */}
               <div className="flex items-center mb-4 space-x-3 sm:space-x-4">
                  <motion.div
                     whileHover={{ scale: 1.08 }}
                     whileTap={{ scale: 0.95 }}
                     transition={{ type: "spring", stiffness: 400, damping: 17 }}
                     className="relative flex-shrink-0"
                  >
                     {/* Glowing Ring Effect */}
                     <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-30" />

                     {/* Avatar with Enhanced Styling */}
                     <Avatar className="relative w-14 h-14 border-2 ring-2 ring-transparent shadow-md transition-all duration-300 sm:w-16 sm:h-16 group-hover:ring-purple-500/30 border-white/50 dark:border-slate-600 shadow-purple-500/10">
                        <AvatarImage
                           src={profile.avatar}
                           alt={profile.displayName}
                           className="object-cover"
                        />
                        <AvatarFallback className="text-base font-bold text-white bg-gradient-to-br from-purple-500 to-pink-500 sm:text-lg">
                           {profile.displayName?.charAt(0) || "U"}
                        </AvatarFallback>
                     </Avatar>
                  </motion.div>

                  <div className="flex-1 min-w-0">
                     <h3 className="text-base font-bold text-gray-900 truncate transition-colors duration-200 sm:text-lg dark:text-white">
                        {profile.displayName}
                     </h3>
                     <p className="text-xs text-gray-500 sm:text-sm dark:text-gray-400">@{profile.username || 'user'}</p>
                  </div>
               </div>

               {/* Enhanced Score Badges */}
               <div className="flex flex-wrap gap-2 mb-4">
                  <div className={`font-semibold text-xs sm:text-sm px-3 py-1.5 border backdrop-blur-sm rounded-lg flex items-center justify-center ${getRizzScoreColor(profile.rizzScore || 0)} transition-transform duration-200 hover:scale-105`}>
                     <Star className="inline mr-1.5 w-3 h-3 sm:w-3.5 sm:h-3.5" />
                     Rizz: {profile.rizzScore || "—"}
                  </div>

                  <div className={`font-bold text-xs sm:text-sm px-3 py-1.5 border backdrop-blur-sm rounded-lg ${getCompatibilityColor(match.compatibilityScore)} transition-transform duration-200 hover:scale-105`}>
                     {match.compatibilityScore}% Match
                  </div>
               </div>

               {/* Enhanced Niches */}
               {profile.niche && profile.niche.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                     {profile.niche.slice(0, 3).map((tag) => (
                        <Badge
                           key={tag}
                           variant="outline"
                           className="text-xs sm:text-sm px-2.5 py-1 bg-gradient-to-r transition-all duration-200 from-purple-50 to-pink-50 dark:from-purple-500/10 dark:to-pink-500/10 border-purple-200 dark:border-purple-500/30 text-purple-700 dark:text-purple-300 hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-500/20 dark:hover:to-pink-500/20 hover:border-purple-300 dark:hover:border-purple-400/50 hover:scale-105 cursor-default"
                        >
                           #{tag}
                        </Badge>
                     ))}
                     {profile.niche.length > 3 && (
                        <Badge
                           variant="outline"
                           className="text-xs sm:text-sm px-2.5 py-1 text-gray-600 bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200 transition-all duration-200 dark:from-gray-700/30 dark:to-gray-600/30 dark:border-gray-600/30 dark:text-gray-300 hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-600/40 dark:hover:to-gray-500/40 hover:border-gray-300 dark:hover:border-gray-500/50 hover:scale-105 cursor-default"
                        >
                           +{profile.niche.length - 3}
                        </Badge>
                     )}
                  </div>
               )}

               {/* Spacer to push buttons to bottom */}
               <div className="flex-1" />

               {/* Action Buttons */}
               {isSidebarContext ? (
                  /* Sidebar Context - History Cards */
                  <div className="flex gap-1.5 sm:gap-2 pt-3 border-t border-gray-100 dark:border-slate-700">
                     {/* Liked Icon (if liked) */}
                     {isLiked && (
                        <div className="flex flex-shrink-0 justify-center items-center w-8 h-8 rounded-lg border transition-all duration-200 sm:w-9 sm:h-9 bg-green-500/20 border-green-400/30 hover:scale-110">
                           <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-400 fill-current" />
                        </div>
                     )}

                     {/* Message Button */}
                     <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onMessage?.(profile.userId)}
                        className="flex-1 h-8 text-xs font-semibold text-blue-600 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200 shadow-sm transition-all duration-200 cursor-pointer sm:h-9 sm:text-sm dark:text-blue-400 dark:from-blue-500/20 dark:to-cyan-500/20 dark:border-blue-500/40 hover:from-blue-100 hover:to-cyan-100 dark:hover:from-blue-500/30 dark:hover:to-cyan-500/30 hover:border-blue-300 dark:hover:border-blue-400/60 hover:text-blue-700 dark:hover:text-blue-300 hover:shadow-md hover:shadow-blue-500/20 hover:scale-105"
                     >
                        <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-1" />
                        <span className="hidden sm:inline">Message</span>
                     </Button>

                     {/* View Profile Button */}
                     <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewProfile?.(profile.userId)}
                        className="flex-1 h-8 text-xs font-semibold text-purple-600 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200 shadow-sm transition-all duration-200 cursor-pointer sm:h-9 sm:text-sm dark:text-purple-400 dark:from-purple-500/20 dark:to-pink-500/20 dark:border-purple-500/40 hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-500/30 dark:hover:to-pink-500/30 hover:border-purple-300 dark:hover:border-purple-400/60 hover:text-purple-700 dark:hover:text-purple-300 hover:shadow-md hover:shadow-purple-500/20 hover:scale-105"
                     >
                        <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-1" />
                        <span className="hidden sm:inline">View</span>
                     </Button>
                  </div>
               ) : (
                  /* Main Page Context - Matching Cards */
                  <>
                     <div className="grid grid-cols-3 gap-1.5 sm:gap-2 py-3 border-t border-gray-100 dark:border-slate-700">
                        <Button
                           variant="outline"
                           size="sm"
                           onClick={() => onAction(profile.userId, "pass")}
                           className="h-9 text-xs font-semibold text-red-600 bg-gradient-to-r from-red-50 to-rose-50 rounded-lg border border-red-200 shadow-sm transition-all duration-200 cursor-pointer sm:h-10 sm:text-sm dark:text-red-400 dark:from-red-500/20 dark:to-rose-500/20 dark:border-red-500/40 hover:from-red-100 hover:to-rose-100 dark:hover:from-red-500/30 dark:hover:to-rose-500/30 hover:border-red-300 dark:hover:border-red-400/60 hover:text-red-700 dark:hover:text-red-300 hover:shadow-md hover:shadow-red-500/20 hover:scale-105"
                        >
                           <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-1" />
                           <span className="hidden sm:inline">Pass</span>
                        </Button>

                        <Button
                           variant="outline"
                           size="sm"
                           onClick={() => onAction(profile.userId, "view")}
                           className="h-9 text-xs font-semibold text-blue-600 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200 shadow-sm transition-all duration-200 cursor-pointer sm:h-10 sm:text-sm dark:text-blue-400 dark:from-blue-500/20 dark:to-cyan-500/20 dark:border-blue-500/40 hover:from-blue-100 hover:to-cyan-100 dark:hover:from-blue-500/30 dark:hover:to-cyan-500/30 hover:border-blue-300 dark:hover:border-blue-400/60 hover:text-blue-700 dark:hover:text-blue-300 hover:shadow-md hover:shadow-blue-500/20 hover:scale-105"
                        >
                           <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-1" />
                           <span className="hidden sm:inline">View</span>
                        </Button>

                        <Button
                           variant="outline"
                           size="sm"
                           onClick={handleLikeToggle}
                           className={`h-9 sm:h-10 text-xs sm:text-sm rounded-lg border cursor-pointer transition-all duration-200 font-semibold shadow-sm hover:shadow-md hover:scale-105 ${isLiked
                              ? "text-white bg-green-500 border-green-400 dark:bg-green-600 dark:border-green-500 hover:bg-green-600 dark:hover:bg-green-700 hover:text-white hover:shadow-green-500/30"
                              : "text-green-600 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 dark:text-green-400 dark:from-green-500/20 dark:to-emerald-500/20 dark:border-green-500/40 hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-500/30 dark:hover:to-emerald-500/30 hover:border-green-300 dark:hover:border-green-400/60 hover:text-green-700 dark:hover:text-green-300 hover:shadow-green-500/20"
                              }`}
                        >
                           <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 inline ${isLiked ? "fill-current sm:mr-1" : "sm:mr-1"}`} />
                           <span className="hidden sm:inline">{isLiked ? "Liked" : "Like"}</span>
                        </Button>
                     </div>

                     {/* Collaboration Button */}
                     <div className="mt-2">
                        <Button
                           onClick={() => onCollaboration(profile.userId)}
                           className="w-full h-10 sm:h-11 text-sm sm:text-base font-bold text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg border-0 shadow-md transition-all duration-200 cursor-pointer hover:from-purple-600 hover:to-pink-600 hover:text-white hover:shadow-lg hover:shadow-purple-500/40 hover:scale-[1.02]"
                        >
                           <Zap className="mr-1.5 sm:mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                           Start Collab
                        </Button>
                     </div>
                  </>
               )}
            </CardContent>
         </Card>
      </motion.div >
   );
};

export default MatchCard;
