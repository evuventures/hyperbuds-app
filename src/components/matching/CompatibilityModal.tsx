"use client";

import React from "react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, Star, TrendingUp, Users, Target, Zap } from "lucide-react";
import type { MatchSuggestion, CreatorProfile } from "@/types/matching.types";

interface CompatibilityModalProps {
   match: MatchSuggestion | null;
   profile: CreatorProfile | null;
   isOpen: boolean;
   onClose: () => void;
   onCollaboration: (matchId: string) => void;
}

const CompatibilityModal: React.FC<CompatibilityModalProps> = ({
   match,
   profile,
   isOpen,
   onClose,
   onCollaboration
}) => {
   if (!match || !profile) return null;

   const getCompatibilityColor = (score: number) => {
      if (score >= 90) return "text-green-600 dark:text-green-400";
      if (score >= 80) return "text-yellow-600 dark:text-yellow-400";
      if (score >= 70) return "text-orange-600 dark:text-orange-400";
      return "text-red-600 dark:text-red-400";
   };

   const getRizzScoreColor = (score: number) => {
      if (score >= 85) return "text-purple-600 dark:text-purple-400";
      if (score >= 75) return "text-blue-600 dark:text-blue-400";
      if (score >= 65) return "text-green-600 dark:text-green-400";
      return "text-gray-600 dark:text-gray-400";
   };

   return (
      <Dialog open={isOpen} onOpenChange={onClose}>
         <DialogContent className="overflow-hidden p-0 w-full max-w-lg bg-white border-gray-300 dark:bg-slate-900 dark:border-slate-700 [&>button:not(.custom-close-btn)]:hidden">
            <motion.div
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               transition={{ duration: 0.2 }}
               className="overflow-hidden"
            >
               {/* Header */}
               <DialogHeader className="p-6 pb-4">
                  <div className="flex justify-between items-center">
                     <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
                        Compatibility Analysis
                     </DialogTitle>
                     <button
                        onClick={(e) => {
                           e.preventDefault();
                           e.stopPropagation();
                           onClose();
                        }}
                        className="flex relative z-10 justify-center items-center p-2 text-gray-600 rounded-md transition-all duration-200 cursor-pointer custom-close-btn dark:text-white/60 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10"
                        type="button"
                     >
                        <X className="w-5 h-5" />
                     </button>
                  </div>
               </DialogHeader>

               {/* Content */}
               <div className="px-6 pb-6">
                  {/* Profile Info */}
                  <div className="flex items-center p-4 mb-6 space-x-4 bg-gray-50 rounded-lg border border-gray-300 dark:bg-white/5 dark:border-white/10">
                     <Avatar className="w-16 h-16 border-2 border-gray-300 dark:border-white/30">
                        <AvatarImage src={profile.avatar} alt={profile.displayName} />
                        <AvatarFallback className="text-lg font-bold text-gray-900 bg-gray-200 dark:text-white dark:bg-white/20">
                           {profile.displayName?.charAt(0) || "U"}
                        </AvatarFallback>
                     </Avatar>
                     <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{profile.displayName}</h3>
                        <p className="text-sm text-gray-600 dark:text-white/70">@{profile.username}</p>
                        <div className="flex gap-2 justify-start items-center mt-2">
                           <div className={`text-sm font-medium ${getRizzScoreColor(profile.rizzScore || 0)}`}>
                              <Star className="inline mr-1 w-3 h-3" />
                              Rizz: {profile.rizzScore || "—"}
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Overall Compatibility Score */}
                  <div className="mb-6 text-center">
                     <div className="inline-flex justify-center items-center mb-3 w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full">
                        <span className="text-2xl font-bold text-white">
                           {match.compatibilityScore}%
                        </span>
                     </div>
                     <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Overall Match</h4>
                     <p className="text-sm text-gray-600 dark:text-white/70">AI-calculated compatibility score</p>
                  </div>

                  {/* Detailed Breakdown */}
                  <div className="mb-6 space-y-4">
                     <h5 className="font-semibold text-gray-900 dark:text-white">Compatibility Breakdown</h5>

                     <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-gray-100 rounded-lg border border-gray-300 dark:bg-white/5 dark:border-white/10">
                           <div className="flex items-center space-x-2">
                              <Target className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                              <span className="text-sm text-gray-700 dark:text-white/80">Niche Match</span>
                           </div>
                           <span className={`font-semibold ${getCompatibilityColor(match.scoreBreakdown.nicheCompatibility)}`}>
                              {match.scoreBreakdown.nicheCompatibility}%
                           </span>
                        </div>

                        <div className="flex justify-between items-center p-3 bg-gray-100 rounded-lg border border-gray-300 dark:bg-white/5 dark:border-white/10">
                           <div className="flex items-center space-x-2">
                              <Users className="w-4 h-4 text-green-500 dark:text-green-400" />
                              <span className="text-sm text-gray-700 dark:text-white/80">Audience Overlap</span>
                           </div>
                           <span className={`font-semibold ${getCompatibilityColor(match.scoreBreakdown.audienceOverlap)}`}>
                              {match.scoreBreakdown.audienceOverlap}%
                           </span>
                        </div>

                        <div className="flex justify-between items-center p-3 bg-gray-100 rounded-lg border border-gray-300 dark:bg-white/5 dark:border-white/10">
                           <div className="flex items-center space-x-2">
                              <TrendingUp className="w-4 h-4 text-orange-500 dark:text-orange-400" />
                              <span className="text-sm text-gray-700 dark:text-white/80">Engagement Style</span>
                           </div>
                           <span className={`font-semibold ${getCompatibilityColor(match.scoreBreakdown.engagementStyle)}`}>
                              {match.scoreBreakdown.engagementStyle}%
                           </span>
                        </div>

                        <div className="flex justify-between items-center p-3 bg-gray-100 rounded-lg border border-gray-300 dark:bg-white/5 dark:border-white/10">
                           <div className="flex items-center space-x-2">
                              <Zap className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                              <span className="text-sm text-gray-700 dark:text-white/80">Rizz Compatibility</span>
                           </div>
                           <span className={`font-semibold ${getCompatibilityColor(match.scoreBreakdown.rizzScoreCompatibility)}`}>
                              {match.scoreBreakdown.rizzScoreCompatibility}%
                           </span>
                        </div>
                     </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                     <Button
                        variant="outline"
                        onClick={onClose}
                        className="flex-1 h-10 text-gray-700 bg-gray-100 border-gray-300 cursor-pointer dark:text-white/80 dark:bg-white/10 dark:border-white/20 hover:bg-gray-200 dark:hover:bg-white/20 hover:text-gray-900 dark:hover:text-white"
                     >
                        Close
                     </Button>
                     <Button
                        onClick={() => onCollaboration(profile.userId)}
                        className="flex-1 h-10 text-white bg-gradient-to-r from-purple-500 to-pink-500 cursor-pointer hover:from-purple-600 hover:to-pink-600"
                     >
                        <Zap className="mr-2 w-4 h-4" />
                        Start Collab
                     </Button>
                  </div>
               </div>
            </motion.div>
         </DialogContent>
      </Dialog>
   );
};

export default CompatibilityModal;
