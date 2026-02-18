"use client";
import React from "react";
import {
    Zap,
   
    Sparkles,
} from "lucide-react";
//import { motion } from "framer-motion";
//import { Card, CardContent } from "@/components/ui/card";
//import { Button } from "@/components/ui/button";
//import { Badge } from "@/components/ui/badge";
//import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRecommendations } from "@/hooks/features/useRecommendations";
//import type { RecommendationCard } from "@/types/recommendation.types";
//import Link from "next/link";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

const Recommendations: React.FC = () => {
    // 🚧 API STATUS FLAG
    // Flip this to 'true' once the backend recommendation endpoint is ready.
    // This prevents the useRecommendations hook from firing and causing console errors.
    const isApiReady = false; 

    //const [, setLikedCreators] = useState<number[]>([]);
    //const [, setRemovedCreators] = useState<number[]>([]);

    // This hook is currently dormant while isApiReady is false
    const {
       
       // isLiking,
        //isRemoving,
        
        //giveAnotherChance,
       // permanentlyPass,
    } = useRecommendations({ enabled: isApiReady });

    /**
     * FEATURE PLACEHOLDER
     * We return this UI while the backend is under development.
     * This keeps the dashboard layout intact without triggering API errors.
     */
    if (!isApiReady) {
        return (
            <section className="space-y-6" data-section="recommendations">
                <div className="flex flex-col gap-4 justify-between items-start sm:items-center">
                    <div className="flex gap-3 items-center">
                        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-xl">
                            <Sparkles className="w-5 h-5 text-purple-500 animate-pulse" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                AI Recommendations
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400">
                                Smart matching is being calibrated for your profile...
                            </p>
                        </div>
                    </div>
                </div>

                <div className="relative overflow-hidden p-12 text-center bg-white/50 dark:bg-slate-800/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-slate-700 backdrop-blur-sm">
                    <div className="flex flex-col gap-4 items-center mx-auto max-w-sm">
                        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-full">
                            <Zap className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Coming Soon to Hyperbuds</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Our AI is currently analyzing creator data to find your perfect matches. 
                            Check back shortly!
                        </p>
                    </div>
                </div>
            </section>
        );
    }

   {/*
    const handleGiveAnotherChance = (creatorId: number) => {
        if (isLiking) return;
        setLikedCreators((prev) => [...prev, creatorId]);
        giveAnotherChance(creatorId);
    };

    const handlePermanentlyPass = (creatorId: number) => {
        if (isRemoving) return;
        setRemovedCreators(prev => [...prev, creatorId]);
        permanentlyPass(creatorId);
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
    }; */}

    
    return (
        <section className="space-y-6">
            {/* Your full original Swiper UI code */}
        </section>
    );
};

export default Recommendations;