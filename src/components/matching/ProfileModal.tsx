"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
   Heart, X, MapPin, Users, TrendingUp, Star, Zap,
   ExternalLink, MessageCircle, Share2, Globe
} from "lucide-react";
import type { CreatorProfile } from "@/types/matching.types";

interface ProfileModalProps {
   profile: CreatorProfile | null;
   isOpen: boolean;
   onClose: () => void;
   onAction: (matchId: string, action: "like" | "unlike" | "pass" | "view") => void;
   onCollaboration: (matchId: string) => void;
   isLiked?: boolean;
}

const ProfileModal: React.FC<ProfileModalProps> = ({
   profile,
   isOpen,
   onClose,
   onAction,
   onCollaboration,
   isLiked = false
}) => {
   if (!profile) return null;

   const handleLikeToggle = () => {
      onAction(profile.userId, isLiked ? "unlike" : "like");
   };

   const locationStr = [profile.location?.city, profile.location?.state, profile.location?.country]
      .filter(Boolean)
      .join(", ");

   const getRizzScoreColor = (score: number) => {
      if (score >= 85) return "text-white bg-purple-600 border-purple-500 shadow-lg";
      if (score >= 75) return "text-white bg-blue-600 border-blue-500 shadow-lg";
      if (score >= 65) return "text-white bg-green-600 border-green-500 shadow-lg";
      return "text-white bg-gray-600 border-gray-500 shadow-lg";
   };

   return (
      <AnimatePresence>
         {isOpen && (
            <Dialog open={isOpen} onOpenChange={onClose}>
               <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto overflow-x-hidden bg-slate-900 border-slate-700 p-0 scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-slate-600 hover:scrollbar-thumb-slate-500 [&>button:not(.custom-close-btn)]:hidden">
                  <motion.div
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.95 }}
                     transition={{ duration: 0.2 }}
                     className="overflow-x-hidden p-6 w-full max-w-full"
                  >
                     {/* Header */}
                     <DialogHeader className="pb-4">
                        <div className="flex justify-between items-center">
                           <DialogTitle className="text-2xl font-bold text-white">
                              Creator Profile
                           </DialogTitle>
                           <button
                              onClick={(e) => {
                                 e.preventDefault();
                                 e.stopPropagation();
                                 onClose();
                              }}
                              className="flex relative z-10 justify-center items-center p-2 rounded-md transition-all duration-200 cursor-pointer custom-close-btn text-white/60 hover:text-white hover:bg-white/10"
                              type="button"
                           >
                              <X className="w-5 h-5" />
                           </button>
                        </div>
                     </DialogHeader>

                     {/* Profile Header */}
                     <div className="relative mb-8 w-full">
                        <div className="overflow-hidden w-full bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 rounded-2xl shadow-2xl h-68">
                           <div className="absolute inset-0 h-full bg-gradient-to-br from-black/30 to-black/10" />

                           {/* Decorative Elements */}
                           <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl translate-x-16 -translate-y-16 bg-white/10" />
                           <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full blur-2xl -translate-x-12 translate-y-12 bg-pink-300/20" />

                           {/* Rizz Score - Top Right */}
                           <div className="absolute top-6 right-6">
                              <div className={`font-bold text-sm px-4 py-2 border-2 backdrop-blur-md rounded-full shadow-lg ${getRizzScoreColor(profile.rizzScore || 0)}`}>
                                 <Star className="inline mr-2 w-4 h-4" />
                                 Rizz: {profile.rizzScore || "—"}
                              </div>
                           </div>

                           {/* Main Content Container */}
                           <div className="flex absolute inset-0 items-center p-4 w-full md:p-8">
                              {/* Avatar and Profile Info */}
                              <div className="flex flex-col gap-6 items-start w-full min-w-0">
                                 <div className="relative flex-shrink-0">
                                    <Avatar className="w-24 h-24 border-4 shadow-xl border-white/40">
                                       <AvatarImage src={profile.avatar} alt={profile.displayName} />
                                       <AvatarFallback className="text-2xl font-bold text-white bg-white/30">
                                          {profile.displayName?.charAt(0) || "U"}
                                       </AvatarFallback>
                                    </Avatar>
                                    {/* Online Status Indicator */}
                                    <div className="absolute -right-1 -bottom-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white" />
                                 </div>

                                 <div className="flex-1 space-y-2 min-w-0 text-white">
                                    <h2 className="text-3xl font-bold tracking-tight truncate">{profile.displayName}
                                    </h2>
                                    <p className="text-xl font-medium truncate text-white/90">@{profile.username}</p>
                                    {locationStr && (
                                       <div className="flex items-center p-1 text-base rounded-full backdrop-blur-sm text-white/80 bg-white/5 w-fit">
                                          <MapPin className="flex-shrink-0 mr-2 w-4 h-4" />
                                          <span className="truncate">{locationStr}</span>
                                       </div>
                                    )}
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* Content Tabs */}
                     <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="grid grid-cols-3 w-full bg-slate-800 border-slate-700">
                           <TabsTrigger
                              value="overview"
                              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white text-slate-300 cursor-pointer"
                           >
                              Overview
                           </TabsTrigger>
                           <TabsTrigger
                              value="stats"
                              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white text-slate-300 cursor-pointer"
                           >
                              Stats
                           </TabsTrigger>
                           <TabsTrigger
                              value="social"
                              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white text-slate-300 cursor-pointer"
                           >
                              Social
                           </TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="mt-8 space-y-6 duration-300 animate-in fade-in-0 slide-in-from-bottom-4">
                           {/* Bio */}
                           {profile.bio && (
                              <Card className="bg-gradient-to-br border shadow-xl backdrop-blur-sm from-slate-800/80 to-slate-900/80 border-slate-700/50">
                                 <CardContent className="p-6">
                                    <h3 className="flex items-center mb-4 text-xl font-bold text-white">
                                       <div className="mr-3 w-2 h-2 bg-purple-500 rounded-full"></div>
                                       About
                                    </h3>
                                    <p className="text-base leading-relaxed text-slate-300">{profile.bio}</p>
                                 </CardContent>
                              </Card>
                           )}

                           {/* Niches */}
                           {profile.niche && profile.niche.length > 0 && (
                              <Card className="bg-gradient-to-br border shadow-xl backdrop-blur-sm from-slate-800/80 to-slate-900/80 border-slate-700/50">
                                 <CardContent className="p-6">
                                    <h3 className="flex items-center mb-4 text-xl font-bold text-white">
                                       <div className="mr-3 w-2 h-2 bg-pink-500 rounded-full"></div>
                                       Content Niches
                                    </h3>
                                    <div className="flex flex-wrap gap-3">
                                       {profile.niche.map((tag) => (
                                          <div
                                             key={tag}
                                             className="px-4 py-2 font-medium text-purple-200 bg-gradient-to-r rounded-full border transition-all duration-200 from-purple-600/20 to-pink-600/20 border-purple-500/30 hover:from-purple-600/30 hover:to-pink-600/30"
                                          >
                                             #{tag}
                                          </div>
                                       ))}
                                    </div>
                                 </CardContent>
                              </Card>
                           )}

                           {/* Location Details */}
                           {profile.location && (
                              <Card className="bg-gradient-to-br border shadow-xl backdrop-blur-sm from-slate-800/80 to-slate-900/80 border-slate-700/50">
                                 <CardContent className="p-6">
                                    <h3 className="flex items-center mb-4 text-xl font-bold text-white">
                                       <div className="mr-3 w-2 h-2 bg-blue-500 rounded-full"></div>
                                       Location
                                    </h3>
                                    <div className="flex items-center px-4 py-3 rounded-lg text-slate-300 bg-white/5">
                                       <MapPin className="mr-3 w-5 h-5 text-blue-400" />
                                       <span className="font-medium">{locationStr}</span>
                                    </div>
                                 </CardContent>
                              </Card>
                           )}
                        </TabsContent>

                        <TabsContent value="stats" className="mt-8 space-y-6 duration-300 animate-in fade-in-0 slide-in-from-bottom-4">
                           {/* Main Stats */}
                           <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                              <Card className="bg-gradient-to-br border shadow-xl backdrop-blur-sm from-blue-600/20 to-blue-800/20 border-blue-500/30">
                                 <CardContent className="p-6 text-center">
                                    <div className="flex justify-center items-center mb-3">
                                       <div className="p-3 rounded-full bg-blue-500/20">
                                          <Users className="w-6 h-6 text-blue-400" />
                                       </div>
                                    </div>
                                    <span className="block mb-1 text-3xl font-bold text-white">
                                       {(profile.stats.totalFollowers / 1000).toFixed(0)}K
                                    </span>
                                    <p className="text-sm font-medium text-blue-200">Total Followers</p>
                                 </CardContent>
                              </Card>

                              <Card className="bg-gradient-to-br border shadow-xl backdrop-blur-sm from-green-600/20 to-green-800/20 border-green-500/30">
                                 <CardContent className="p-6 text-center">
                                    <div className="flex justify-center items-center mb-3">
                                       <div className="p-3 rounded-full bg-green-500/20">
                                          <TrendingUp className="w-6 h-6 text-green-400" />
                                       </div>
                                    </div>
                                    <span className="block mb-1 text-3xl font-bold text-white">
                                       {profile.stats.avgEngagement}%
                                    </span>
                                    <p className="text-sm font-medium text-green-200">Avg Engagement</p>
                                 </CardContent>
                              </Card>

                              <Card className="bg-gradient-to-br border shadow-xl backdrop-blur-sm from-purple-600/20 to-purple-800/20 border-purple-500/30">
                                 <CardContent className="p-6 text-center">
                                    <div className="flex justify-center items-center mb-3">
                                       <div className="p-3 rounded-full bg-purple-500/20">
                                          <Star className="w-6 h-6 text-purple-400" />
                                       </div>
                                    </div>
                                    <span className="block mb-1 text-3xl font-bold text-white">
                                       {profile.rizzScore || "—"}
                                    </span>
                                    <p className="text-sm font-medium text-purple-200">Rizz Score</p>
                                 </CardContent>
                              </Card>
                           </div>

                           {/* Platform Breakdown */}
                           {profile.stats.platformBreakdown && (
                              <Card className="bg-gradient-to-br border shadow-xl backdrop-blur-sm from-slate-800/80 to-slate-900/80 border-slate-700/50">
                                 <CardContent className="p-6">
                                    <h3 className="flex items-center mb-6 text-xl font-bold text-white">
                                       <div className="mr-3 w-2 h-2 bg-indigo-500 rounded-full"></div>
                                       Platform Breakdown
                                    </h3>
                                    <div className="space-y-4">
                                       {Object.entries(profile.stats.platformBreakdown).map(([platform, data]) => (
                                          <div key={platform} className="flex justify-between items-center p-4 rounded-lg transition-all duration-200 bg-white/5 hover:bg-white/10">
                                             <div className="flex items-center">
                                                <div className="mr-4 w-4 h-4 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full" />
                                                <span className="text-lg font-medium capitalize text-slate-200">{platform}</span>
                                             </div>
                                             <div className="text-right">
                                                <div className="text-lg font-bold text-white">
                                                   {(data.followers / 1000).toFixed(0)}K
                                                </div>
                                                <div className="text-sm font-medium text-slate-400">{data.engagement}% engagement</div>
                                             </div>
                                          </div>
                                       ))}
                                    </div>
                                 </CardContent>
                              </Card>
                           )}
                        </TabsContent>

                        <TabsContent value="social" className="mt-8 space-y-6 duration-300 animate-in fade-in-0 slide-in-from-bottom-4">
                           {/* Social Links */}
                           {profile.socialLinks && Object.keys(profile.socialLinks).length > 0 && (
                              <Card className="bg-gradient-to-br border shadow-xl backdrop-blur-sm from-slate-800/80 to-slate-900/80 border-slate-700/50">
                                 <CardContent className="p-6">
                                    <h3 className="flex items-center mb-6 text-xl font-bold text-white">
                                       <div className="mr-3 w-2 h-2 bg-cyan-500 rounded-full"></div>
                                       Social Media
                                    </h3>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                       {Object.entries(profile.socialLinks).map(([platform, url]) => (
                                          <a
                                             key={platform}
                                             href={url}
                                             target="_blank"
                                             rel="noopener noreferrer"
                                             className="flex items-center p-4 rounded-xl transition-all duration-200 bg-white/5 hover:bg-white/10 hover:scale-105 group"
                                          >
                                             <div className="p-2 mr-4 rounded-lg transition-colors bg-cyan-500/20 group-hover:bg-cyan-500/30">
                                                <Globe className="w-5 h-5 text-cyan-400" />
                                             </div>
                                             <span className="text-lg font-medium capitalize text-slate-200">{platform}</span>
                                             <ExternalLink className="ml-auto w-4 h-4 transition-colors text-slate-400 group-hover:text-cyan-400" />
                                          </a>
                                       ))}
                                    </div>
                                 </CardContent>
                              </Card>
                           )}

                           {/* Contact Actions */}
                           <Card className="bg-slate-800 border-slate-700">
                              <CardContent className="p-4">
                                 <h3 className="mb-4 text-lg font-semibold text-white">Connect</h3>
                                 <div className="flex gap-3">
                                    <Button
                                       variant="outline"
                                       className="flex-1 text-blue-400 bg-blue-500/20 border-blue-400/30 hover:bg-blue-500/30"
                                    >
                                       <MessageCircle className="mr-2 w-4 h-4" />
                                       Message
                                    </Button>
                                    <Button
                                       variant="outline"
                                       className="flex-1 text-green-400 bg-green-500/20 border-green-400/30 hover:bg-green-500/30"
                                    >
                                       <Share2 className="mr-2 w-4 h-4" />
                                       Share
                                    </Button>
                                 </div>
                              </CardContent>
                           </Card>
                        </TabsContent>
                     </Tabs>

                     {/* Action Buttons */}
                     <div className="flex gap-3 pt-6 border-t border-slate-700">
                        <Button
                           variant="outline"
                           size="sm"
                           onClick={() => {
                              onAction(profile.userId, "pass");
                              onClose();
                           }}
                           className="flex-1 h-9 font-medium text-red-300 rounded-lg border shadow-sm transition-all duration-200 cursor-pointer bg-white/10 border-red-400/30 hover:bg-red-500/20 hover:border-red-400/50 hover:text-red-200 hover:shadow-md hover:shadow-red-500/20"
                        >
                           <X className="mr-1 w-4 h-4" />
                           Pass
                        </Button>

                        <Button
                           variant="outline"
                           size="sm"
                           onClick={handleLikeToggle}
                           className={`flex-1 h-9 rounded-lg border cursor-pointer transition-all duration-200 font-medium shadow-sm hover:shadow-md ${isLiked
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

                        <Button
                           size="sm"
                           onClick={() => onCollaboration(profile.userId)}
                           className="flex-1 h-10 font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-sm transition-all duration-200 cursor-pointer hover:from-purple-600 hover:to-pink-600 hover:shadow-md hover:shadow-purple-500/30"
                        >
                           <Zap className="mr-1 w-4 h-4" />
                           Collab
                        </Button>
                     </div>
                  </motion.div>
               </DialogContent>
            </Dialog>
         )}
      </AnimatePresence>
   );
};

export default ProfileModal;
