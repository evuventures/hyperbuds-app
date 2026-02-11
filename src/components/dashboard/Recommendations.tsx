"use client";
import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation, Autoplay } from "swiper/modules";
import {
   Heart,
   Users,
   MapPin,
   Star,
   ChevronRight,
   Zap,
   RefreshCw,
   ArrowRight,
   X,
   Eye,
   Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRecommendations } from "@/hooks/features/useRecommendations";
import type { RecommendationCard } from "@/types/recommendation.types";
import Link from "next/link";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

const Recommendations: React.FC = () => {
   const [likedCreators, setLikedCreators] = useState<number[]>([]);
   const [removedCreators, setRemovedCreators] = useState<number[]>([]);

   const {
      recommendations,
      isLoading,
      isLiking,
      isRemoving,
      error,
      giveAnotherChance,
      permanentlyPass,
   } = useRecommendations({ enabled: true });

   const handleGiveAnotherChance = (creatorId: number) => {
      if (isLiking) return;

      // Add to liked creators immediately for UI feedback
      setLikedCreators((prev) => [...prev, creatorId]);

      // Call the mutation
      giveAnotherChance(creatorId);

      // Show success feedback
      setTimeout(() => {
         console.log(`✅ Gave another chance to creator ${creatorId} - they'll be moved to your matches!`);
         // In a real app, you might show a toast notification here
         // toast.success("Creator added to your matches!");
      }, 500);
   };

   const handlePermanentlyPass = (creatorId: number) => {
      if (isRemoving) return;

      // Add to removed creators for UI feedback
      setRemovedCreators(prev => [...prev, creatorId]);

      // Call the mutation
      permanentlyPass(creatorId);

      // Show success feedback
      setTimeout(() => {
         console.log(`❌ Permanently passed on creator ${creatorId} - they won't appear in recommendations again`);
         // In a real app, you might show a toast notification here
         // toast.success("Creator permanently removed from recommendations");
      }, 500);
   };

   const getCompatibilityColor = (score: number) => {
      if (score >= 90) return "text-white bg-green-600 border-green-500 shadow-lg";
      if (score >= 80) return "text-white bg-yellow-600 border-yellow-500 shadow-lg";
      if (score >= 70) return "text-white bg-purple-600 border-purple-500 shadow-lg";
      return "text-white bg-pink-600 border-pink-500 shadow-lg";
   };

   const getRizzScoreColor = (score: number) => {
      if (score >= 85) return "text-white bg-purple-600 border-purple-500 shadow-lg";
      if (score >= 75) return "text-white bg-blue-600 border-blue-500 shadow-lg";
      if (score >= 65) return "text-white bg-green-600 border-green-500 shadow-lg";
      return "text-white bg-gray-600 border-gray-500 shadow-lg";
   };

   const handleViewAllRecommendations = () => {
      console.log("📋 Viewing all recommendations...");

      // In a real app, this would navigate to a dedicated recommendations page
      // For now, we'll show a modal or expand the current view
      // You could also navigate to: router.push('/recommendations')

      // Show feedback
      setTimeout(() => {
         console.log("🔍 Opening full recommendations view...");
         // In a real app, you might show a toast notification here
         // toast.info("Opening all recommendations...");

         // For demonstration, we could:
         // 1. Navigate to a dedicated page: router.push('/recommendations')
         // 2. Open a modal with all recommendations
         // 3. Expand the current view to show more cards
         // 4. Scroll to the recommendations section

         // Example: Scroll to recommendations section
         const recommendationsSection = document.querySelector('[data-section="recommendations"]');
         if (recommendationsSection) {
            recommendationsSection.scrollIntoView({ behavior: 'smooth' });
         }
      }, 300);
   };

   if (isLoading) {
      return (
         <section className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 justify-between items-start sm:items-center">
               <div className="flex gap-3 items-center">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                     <RefreshCw className="w-5 h-5 text-white animate-spin" />
                  </div>
                  <div>
                     <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Recommendations
                     </h2>
                     <p className="text-gray-600 dark:text-gray-400">
                        Creators you passed on - give them another chance
                     </p>
                  </div>
               </div>
            </div>

            {/* Loading State */}
            <div className="flex justify-center items-center py-12">
               <div className="flex flex-col gap-4 items-center">
                  <RefreshCw className="w-8 h-8 text-purple-600 animate-spin dark:text-purple-400" />
                  <p className="text-gray-600 dark:text-gray-400">Loading recommendations...</p>
               </div>
            </div>
         </section>
      );
   }

   if (error) {
      return (
         <section className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 justify-between items-start sm:items-center">
               <div className="flex gap-3 items-center">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                     <Star className="w-5 h-5 text-white" />
                  </div>
                  <div>
                     <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Recommendations
                     </h2>
                     <p className="text-gray-600 dark:text-gray-400">
                        Creators you passed on - give them another chance
                     </p>
                  </div>
               </div>
            </div>

            {/* Error State */}
            <div className="p-12 text-center text-gray-900 bg-white rounded-3xl border border-gray-300 shadow-sm dark:bg-gray-800 dark:text-white dark:border-gray-700">
               <div className="flex flex-col gap-6 items-center mx-auto max-w-md">
                  <div className="p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full dark:from-purple-900/40 dark:to-pink-900/40">
                     <X className="w-12 h-12 text-purple-600 dark:text-purple-400" />
                  </div>

                  <div className="space-y-2">
                     <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Failed to Load Recommendations
                     </h3>
                     <p className="text-gray-600 dark:text-gray-400">
                        There was an error loading your recommendations. Please try again.
                     </p>
                  </div>

                  <motion.button
                     onClick={() => window.location.reload()}
                     className="flex gap-2 items-center px-8 py-4 font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-lg transition-all duration-200 transform cursor-pointer hover:from-purple-700 hover:to-pink-700 hover:scale-105"
                     whileHover={{ scale: 1.05 }}
                     whileTap={{ scale: 0.95 }}
                     transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                     <RefreshCw className="w-5 h-5" />
                     Try Again
                  </motion.button>
               </div>
            </div>
         </section>
      );
   }

   if (recommendations.length === 0) {
      return (
         <section className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 justify-between items-start sm:items-center">
               <div className="flex gap-3 items-center">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                     <Star className="w-5 h-5 text-white" />
                  </div>
                  <div>
                     <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Recommendations
                     </h2>
                     <p className="text-gray-600 dark:text-gray-400">
                        Creators you passed on - give them another chance
                     </p>
                  </div>
               </div>
            </div>

            {/* Empty State */}
            <div className="p-12 text-center text-gray-900 bg-white rounded-3xl border border-gray-300 shadow-sm dark:bg-gray-800 dark:text-white dark:border-gray-700">
               <div className="flex flex-col gap-6 items-center mx-auto max-w-md">
                  <div className="p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full dark:from-purple-900/40 dark:to-pink-900/40">
                     <Star className="w-12 h-12 text-purple-600 dark:text-purple-400" />
                  </div>

                  <div className="space-y-2">
                     <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        No Recommendations Yet
                     </h3>
                     <p className="text-gray-600 dark:text-gray-400">
                        Start matching with creators to see recommendations here.
                        We&apos;ll show you creators you passed on so you can give them another chance.
                     </p>
                  </div>

                  <Link href="/ai-matches">
                     <motion.button
                        className="flex gap-2 items-center px-8 py-4 font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg transition-all duration-200 transform cursor-pointer hover:from-purple-700 hover:to-indigo-700 hover:scale-105"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                     >
                        <Sparkles className="w-5 h-5" />
                        Start to Generate
                        <ArrowRight className="w-5 h-5" />
                     </motion.button>
                  </Link>
               </div>
            </div>
         </section>
      );
   }

   return (
      <section className="space-y-6" data-section="recommendations">
         {/* Header */}
         <div className="flex flex-col gap-4 justify-between items-start sm:items-center">
            <div className="flex gap-3 items-center">
               <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                  <Star className="w-5 h-5 text-white" />
               </div>
               <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                     Recommendations
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                     Creators you passed on - give them another chance
                  </p>
               </div>
            </div>

            <button
               onClick={handleViewAllRecommendations}
               className="flex gap-2 items-center font-medium text-purple-600 transition-all duration-200 transform cursor-pointer dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:gap-3 hover:scale-105 group"
            >
               View All Recommendations
               <ChevronRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </button>
         </div>

         {/* Swiper Container */}
         <div className="relative">
            <Swiper
               modules={[Pagination, Navigation, Autoplay]}
               slidesPerView={1}
               spaceBetween={16}
               loop={true}
               autoplay={{
                  delay: 5000,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
               }}
               pagination={{
                  clickable: true,
                  bulletClass: "swiper-pagination-bullet custom-bullet",
                  bulletActiveClass:
                     "swiper-pagination-bullet-active custom-bullet-active",
               }}
               breakpoints={{
                  640: { slidesPerView: 1, spaceBetween: 20 },
                  768: { slidesPerView: 2, spaceBetween: 20 },
                  1024: { slidesPerView: 2, spaceBetween: 24 },
                  1280: { slidesPerView: 2, spaceBetween: 32 },
               }}
               className="!pb-8 sm:!pb-12 !pt-4"
            >
               {recommendations
                  .filter(card => !removedCreators.includes(card.id))
                  .map((card: RecommendationCard) => (
                     <SwiperSlide key={card.id} className="!h-auto">
                        <motion.div
                           whileHover={{ y: -2 }}
                           transition={{ duration: 0.3, ease: "easeOut" }}
                           className="p-2 w-full h-full"
                        >
                           <Card className="overflow-hidden h-full border border-gray-300 shadow-sm backdrop-blur-sm transition-all duration-300 group bg-white/80 dark:bg-slate-800/80 dark:border-slate-700 hover:shadow-xl hover:shadow-purple-500/10 dark:hover:shadow-purple-500/20 hover:border-purple-300 dark:hover:border-purple-500/50">
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
                                             src={card.img}
                                             alt={card.name}
                                             className="object-cover"
                                          />
                                          <AvatarFallback className="text-base font-bold text-white bg-gradient-to-br from-purple-500 to-pink-500 sm:text-lg">
                                             {card.name?.charAt(0) || "U"}
                                          </AvatarFallback>
                                       </Avatar>
                                    </motion.div>

                                    <div className="flex-1 min-w-0">
                                       <h3 className="text-base font-bold text-gray-900 truncate transition-colors duration-200 sm:text-lg dark:text-white">
                                          {card.name}
                                       </h3>
                                       <p className="text-xs text-gray-500 sm:text-sm dark:text-gray-400">{card.role}</p>
                                       <div className="flex gap-2 items-center mt-1 text-xs text-gray-500 sm:text-sm dark:text-gray-400">
                                          <span className="flex gap-1 items-center">
                                             <Users className="w-3 h-3" />
                                             {card.followers}
                                          </span>
                                          <span className="flex gap-1 items-center">
                                             <MapPin className="w-3 h-3" />
                                             {card.location}
                                          </span>
                                       </div>
                                    </div>
                                 </div>

                                 {/* Enhanced Score Badges */}
                                 <div className="flex flex-wrap gap-2 mb-4">
                                    <div className={`font-semibold text-xs sm:text-sm px-3 py-1.5 border backdrop-blur-sm rounded-lg flex items-center justify-center ${getRizzScoreColor(card.rizzScore)} transition-transform duration-200 hover:scale-105`}>
                                       <Star className="inline mr-1.5 w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                       Rizz: {card.rizzScore}
                                    </div>

                                    <div className={`font-bold text-xs sm:text-sm px-3 py-1.5 border backdrop-blur-sm rounded-lg ${getCompatibilityColor(parseInt(card.overlap.replace('%', '')))} transition-transform duration-200 hover:scale-105`}>
                                       {card.overlap} Match
                                    </div>

                                    {/* Passed Indicator */}
                                    <div className="font-medium text-xs sm:text-sm px-3 py-1.5 border backdrop-blur-sm rounded-lg text-white bg-purple-600 border-purple-500 shadow-lg transition-transform duration-200 hover:scale-105 flex items-center">
                                       <X className="inline mr-1.5 w-3 h-3" />
                                       Passed {card.passedAt}
                                    </div>
                                 </div>

                                 {/* Enhanced Specialties */}
                                 {card.specialties && card.specialties.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-4">
                                       {card.specialties.slice(0, 3).map((specialty) => (
                                          <Badge
                                             key={specialty}
                                             variant="outline"
                                             className="text-xs sm:text-sm px-2.5 py-1 bg-gradient-to-r transition-all duration-200 from-purple-50 to-pink-50 dark:from-purple-500/10 dark:to-pink-500/10 border-purple-200 dark:border-purple-500/30 text-purple-700 dark:text-purple-300 hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-500/20 dark:hover:to-pink-500/20 hover:border-purple-300 dark:hover:border-purple-400/50 hover:scale-105 cursor-default"
                                          >
                                             #{specialty}
                                          </Badge>
                                       ))}
                                       {card.specialties.length > 3 && (
                                          <Badge
                                             variant="outline"
                                             className="text-xs sm:text-sm px-2.5 py-1 text-gray-600 bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300 transition-all duration-200 dark:from-gray-700/30 dark:to-gray-600/30 dark:border-gray-600/30 dark:text-gray-300 hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-600/40 dark:hover:to-gray-500/40 hover:border-gray-300 dark:hover:border-gray-500/50 hover:scale-105 cursor-default"
                                          >
                                             +{card.specialties.length - 3}
                                          </Badge>
                                       )}
                                    </div>
                                 )}

                                 {/* Spacer to push buttons to bottom */}
                                 <div className="flex-1" />

                                 {/* Action Buttons - Matching AI-matches style */}
                                 <div className="grid grid-cols-3 gap-1.5 sm:gap-2 py-3 border-t border-gray-300 dark:border-slate-700">
                                    <Button
                                       variant="outline"
                                       size="sm"
                                       onClick={() => handlePermanentlyPass(card.id)}
                                       disabled={isRemoving}
                                       className="h-9 text-xs font-semibold text-purple-600 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200 shadow-sm transition-all duration-200 cursor-pointer sm:h-10 sm:text-sm dark:text-purple-400 dark:from-purple-500/20 dark:to-pink-500/20 dark:border-purple-500/40 hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-500/30 dark:hover:to-pink-500/30 hover:border-purple-300 dark:hover:border-purple-400/60 hover:text-purple-700 dark:hover:text-purple-300 hover:shadow-md hover:shadow-purple-500/20 hover:scale-105"
                                    >
                                       <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-1" />
                                       <span className="hidden sm:inline">Pass</span>
                                    </Button>

                                    <Button
                                       variant="outline"
                                       size="sm"
                                       className="h-9 text-xs font-semibold text-blue-600 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200 shadow-sm transition-all duration-200 cursor-pointer sm:h-10 sm:text-sm dark:text-blue-400 dark:from-blue-500/20 dark:to-cyan-500/20 dark:border-blue-500/40 hover:from-blue-100 hover:to-cyan-100 dark:hover:from-blue-500/30 dark:hover:to-cyan-500/30 hover:border-blue-300 dark:hover:border-blue-400/60 hover:text-blue-700 dark:hover:text-blue-300 hover:shadow-md hover:shadow-blue-500/20 hover:scale-105"
                                    >
                                       <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-1" />
                                       <span className="hidden sm:inline">View</span>
                                    </Button>

                                    <Button
                                       variant="outline"
                                       size="sm"
                                       onClick={() => handleGiveAnotherChance(card.id)}
                                       disabled={isLiking || likedCreators.includes(card.id)}
                                       className={`h-9 sm:h-10 text-xs sm:text-sm rounded-lg border cursor-pointer transition-all duration-200 font-semibold shadow-sm hover:shadow-md hover:scale-105 ${likedCreators.includes(card.id)
                                          ? "text-white bg-green-500 border-green-400 dark:bg-green-600 dark:border-green-500 hover:bg-green-600 dark:hover:bg-green-700 hover:text-white hover:shadow-green-500/30"
                                          : "text-green-600 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 dark:text-green-400 dark:from-green-500/20 dark:to-emerald-500/20 dark:border-green-500/40 hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-500/30 dark:hover:to-emerald-500/30 hover:border-green-300 dark:hover:border-green-400/60 hover:text-green-700 dark:hover:text-green-300 hover:shadow-green-500/20"
                                          }`}
                                    >
                                       <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 inline ${likedCreators.includes(card.id) ? "fill-current sm:mr-1" : "sm:mr-1"}`} />
                                       <span className="hidden sm:inline">{likedCreators.includes(card.id) ? "Liked" : "Like"}</span>
                                    </Button>
                                 </div>

                                 {/* Collaboration Button */}
                                 <div className="mt-2">
                                    <Button
                                       onClick={() => handleGiveAnotherChance(card.id)}
                                       disabled={isLiking || likedCreators.includes(card.id)}
                                       className="w-full h-10 sm:h-11 text-sm sm:text-base font-bold text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg border-0 shadow-md transition-all duration-200 cursor-pointer hover:from-purple-600 hover:to-pink-600 hover:text-white hover:shadow-lg hover:shadow-purple-500/40 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                       <Zap className="mr-1.5 sm:mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                                       {likedCreators.includes(card.id) ? "Collaboration Started!" : "Start Collab"}
                                    </Button>
                                 </div>
                              </CardContent>
                           </Card>
                        </motion.div>
                     </SwiperSlide>
                  ))}
            </Swiper>
         </div>
      </section>
   );
};

export default Recommendations;