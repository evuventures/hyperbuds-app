"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Heart, Zap, Star, Users, Globe } from "lucide-react";

interface FunLoaderProps {
   onComplete: () => void;
}

const FunLoader: React.FC<FunLoaderProps> = ({ onComplete }) => {
   const [currentStep, setCurrentStep] = useState(0);
   const [progress, setProgress] = useState(0);

   const steps = [
      { icon: Sparkles, text: "Analyzing your profile...", color: "from-yellow-400 to-orange-500" },
      { icon: Users, text: "Finding compatible creators...", color: "from-blue-400 to-purple-500" },
      { icon: Heart, text: "Calculating match scores...", color: "from-pink-400 to-red-500" },
      { icon: Zap, text: "Preparing your matches...", color: "from-purple-400 to-pink-500" },
      { icon: Star, text: "Almost ready!", color: "from-green-400 to-blue-500" }
   ];

   useEffect(() => {
      const timer = setInterval(() => {
         setProgress(prev => {
            if (prev >= 100) {
               clearInterval(timer);
               setTimeout(onComplete, 500);
               return 100;
            }
            return prev + 2;
         });
      }, 50);

      const stepTimer = setInterval(() => {
         setCurrentStep(prev => {
            if (prev >= steps.length - 1) {
               clearInterval(stepTimer);
               return prev;
            }
            return prev + 1;
         });
      }, 800);

      return () => {
         clearInterval(timer);
         clearInterval(stepTimer);
      };
   }, [onComplete, steps.length]);

   const currentStepData = steps[currentStep];
   const IconComponent = currentStepData?.icon || Sparkles;

   return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
         {/* Main Loading Animation */}
         <div className="relative mb-8">
            {/* Outer Ring */}
            <motion.div
               className="w-32 h-32 rounded-full border-4 border-white/20"
               animate={{ rotate: 360 }}
               transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />

            {/* Inner Ring */}
            <motion.div
               className="absolute inset-4 rounded-full border-4 border-purple-400/60"
               animate={{ rotate: -360 }}
               transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />

            {/* Center Icon */}
            <motion.div
               className="absolute inset-0 flex items-center justify-center"
               animate={{ scale: [1, 1.1, 1] }}
               transition={{ duration: 1, repeat: Infinity }}
            >
               <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${currentStepData?.color || 'from-purple-400 to-pink-500'} flex items-center justify-center`}>
                  <IconComponent className="w-8 h-8 text-white" />
               </div>
            </motion.div>

            {/* Progress Ring */}
            <svg className="absolute inset-0 w-32 h-32 -rotate-90" viewBox="0 0 100 100">
               <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="2"
               />
               <motion.circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: progress / 100 }}
                  transition={{ duration: 0.5 }}
               />
               <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                     <stop offset="0%" stopColor="#8B5CF6" />
                     <stop offset="50%" stopColor="#EC4899" />
                     <stop offset="100%" stopColor="#F59E0B" />
                  </linearGradient>
               </defs>
            </svg>
         </div>

         {/* Step Text */}
         <AnimatePresence mode="wait">
            <motion.div
               key={currentStep}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -20 }}
               transition={{ duration: 0.3 }}
               className="text-center"
            >
               <h2 className="text-2xl font-bold text-white mb-2">
                  {currentStepData?.text || "Loading..."}
               </h2>
               <p className="text-white/70 text-sm">
                  {Math.round(progress)}% complete
               </p>
            </motion.div>
         </AnimatePresence>

         {/* Progress Bar */}
         <div className="w-64 h-2 bg-white/20 rounded-full mt-6 overflow-hidden">
            <motion.div
               className="h-full bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 rounded-full"
               initial={{ width: 0 }}
               animate={{ width: `${progress}%` }}
               transition={{ duration: 0.5 }}
            />
         </div>

         {/* Floating Elements */}
         <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(6)].map((_, i) => (
               <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-white/30 rounded-full"
                  style={{
                     left: `${20 + i * 15}%`,
                     top: `${30 + (i % 2) * 40}%`,
                  }}
                  animate={{
                     y: [0, -20, 0],
                     opacity: [0.3, 1, 0.3],
                     scale: [1, 1.5, 1],
                  }}
                  transition={{
                     duration: 2 + i * 0.5,
                     repeat: Infinity,
                     delay: i * 0.3,
                  }}
               />
            ))}
         </div>

         {/* Fun Messages */}
         <AnimatePresence>
            {progress > 50 && (
               <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="mt-8 text-center"
               >
                  <motion.div
                     animate={{ rotate: [0, 5, -5, 0] }}
                     transition={{ duration: 2, repeat: Infinity }}
                     className="inline-block"
                  >
                     <Globe className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                  </motion.div>
                  <p className="text-white/60 text-sm">
                     Discovering amazing creators worldwide...
                  </p>
               </motion.div>
            )}
         </AnimatePresence>
      </div>
   );
};

export default FunLoader;
