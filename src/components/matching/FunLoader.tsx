"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Heart, Zap, Star, Users, Rocket } from "lucide-react";

interface FunLoaderProps {
   onComplete: () => void;
}

const FunLoader: React.FC<FunLoaderProps> = ({ onComplete }) => {
   const [currentStep, setCurrentStep] = useState(0);
   const [progress, setProgress] = useState(0);

   const steps = [
      { icon: Sparkles, text: "Analyzing your profile", color: "from-yellow-400 via-orange-400 to-orange-500" },
      { icon: Users, text: "Finding compatible creators", color: "from-blue-400 via-cyan-400 to-teal-500" },
      { icon: Heart, text: "Calculating match scores", color: "from-pink-400 via-rose-400 to-red-500" },
      { icon: Zap, text: "Preparing your matches", color: "from-purple-400 via-violet-400 to-fuchsia-500" },
      { icon: Star, text: "Almost ready", color: "from-green-400 via-emerald-400 to-teal-500" }
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
      <div className="flex overflow-hidden relative flex-col justify-center items-center p-8 min-h-screen w-full bg-white dark:bg-[#0f172a]">
         {/* Main Content - Higher z-index */}
         <div className="flex relative z-10 flex-col items-center">
            {/* Modern Circular Progress */}
            <div className="relative mb-12">
               {/* Pulsing Glow Background */}
               <motion.div
                  className="absolute inset-0 -m-8 w-52 h-52 rounded-full opacity-20"
                  animate={{
                     scale: [1, 1.2, 1],
                     opacity: [0.1, 0.3, 0.1]
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
               >
                  <div className="w-full h-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-full blur-3xl" />
               </motion.div>

               {/* Main Circle Container */}
               <div className="relative w-40 h-40">
                  {/* Gradient Border Ring */}
                  <div className="absolute inset-0 p-1.5 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-full shadow-2xl">
                     <div className="w-full h-full bg-white dark:bg-[#0f172a] rounded-full" />
                  </div>

                  {/* SVG Progress Circle */}
                  <svg className="absolute inset-3 -rotate-90 w-34 h-34" viewBox="0 0 100 100">
                     {/* Background circle */}
                     <circle
                        cx="50"
                        cy="50"
                        r="44"
                        fill="none"
                        stroke="rgba(168, 85, 247, 0.1)"
                        strokeWidth="2.5"
                        className="dark:stroke-purple-500/20"
                     />
                     {/* Animated progress circle */}
                     <motion.circle
                        cx="50"
                        cy="50"
                        r="44"
                        fill="none"
                        stroke="url(#modernGradient)"
                        strokeWidth="4"
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: progress / 100 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        style={{ filter: 'drop-shadow(0 0 8px rgba(168, 85, 247, 0.8))' }}
                     />
                     <defs>
                        <linearGradient id="modernGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                           <stop offset="0%" stopColor="#8B5CF6" />
                           <stop offset="50%" stopColor="#EC4899" />
                           <stop offset="100%" stopColor="#F59E0B" />
                        </linearGradient>
                     </defs>
                  </svg>

                  {/* Progress Percentage in Center */}
                  <div className="flex absolute inset-0 justify-center items-center">
                     <motion.div
                        className="text-center"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                     >
                        <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 dark:from-purple-400 dark:via-pink-400 dark:to-orange-400">
                           {Math.round(progress)}%
                        </div>
                     </motion.div>
                  </div>

                  {/* Animated Icon */}
                  <motion.div
                     className="absolute -bottom-2 left-1/2 -translate-x-1/2"
                     animate={{
                        y: [-5, 5, -5],
                        rotate: [0, 5, -5, 0]
                     }}
                     transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                     <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${currentStepData?.color} flex items-center justify-center shadow-2xl`}>
                        <IconComponent className="w-7 h-7 text-white drop-shadow-lg" />
                     </div>
                  </motion.div>
               </div>
            </div>

            {/* Status Text */}
            <AnimatePresence mode="wait">
               <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="mb-8 text-center"
               >
                  <h2 className="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">
                     {currentStepData?.text}
                  </h2>
                  <div className="flex gap-2 justify-center items-center">
                     <motion.div
                        className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                     />
                     <p className="text-sm font-medium text-gray-600 sm:text-base dark:text-gray-300">
                        Processing...
                     </p>
                     <motion.div
                        className="w-2 h-2 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full"
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
                     />
                  </div>
               </motion.div>
            </AnimatePresence>

            {/* Modern Progress Bar */}
            <div className="w-full max-w-md">
               <div className="overflow-hidden relative h-3 rounded-full shadow-inner backdrop-blur-sm bg-gray-200/50 dark:bg-white/10">
                  {/* Animated gradient background */}
                  <motion.div
                     className="absolute inset-0 bg-gradient-to-r from-purple-200 via-pink-200 to-orange-200 dark:from-purple-500/20 dark:via-pink-500/20 dark:to-orange-500/20"
                     animate={{ x: ['-100%', '100%'] }}
                     transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />

                  {/* Actual progress */}
                  <motion.div
                     className="relative h-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-full shadow-lg"
                     initial={{ width: 0 }}
                     animate={{ width: `${progress}%` }}
                     transition={{ duration: 0.5, ease: "easeOut" }}
                  >
                     {/* Shimmer effect */}
                     <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent to-transparent via-white/40"
                        animate={{ x: ['-200%', '200%'] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                     />

                     {/* Glowing edge */}
                     <div className="absolute top-0 right-0 bottom-0 w-2 rounded-r-full blur-sm bg-white/50" />
                  </motion.div>
               </div>

               {/* Progress milestones */}
               <div className="flex justify-between px-1 mt-3">
                  {steps.map((step, index) => (
                     <motion.div
                        key={index}
                        className={`flex flex-col items-center ${index <= currentStep ? 'opacity-100' : 'opacity-30'
                           } transition-opacity duration-300`}
                        animate={index <= currentStep ? { scale: [1, 1.2, 1] } : {}}
                        transition={{ duration: 0.5 }}
                     >
                        <div className={`w-2 h-2 rounded-full mb-1 ${index < currentStep
                           ? 'bg-green-500 shadow-lg shadow-green-500/50'
                           : index === currentStep
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg shadow-purple-500/50'
                              : 'bg-gray-300 dark:bg-gray-600'
                           }`} />
                     </motion.div>
                  ))}
               </div>
            </div>

            {/* Fun Floating Elements */}
            <div className="overflow-hidden absolute inset-0 pointer-events-none">
               {[...Array(20)].map((_, i) => {
                  const IconComp = [Heart, Star, Sparkles, Zap, Rocket][i % 5];

                  return (
                     <motion.div
                        key={`float-${i}`}
                        className="absolute"
                        style={{
                           left: `${10 + i * 4.5}%`,
                           top: `${15 + (i % 5) * 15}%`,
                        }}
                        animate={{
                           y: [0, -30, 0],
                           x: [0, Math.sin(i) * 20, 0],
                           rotate: [0, 360],
                           opacity: [0.1, 0.6, 0.1],
                        }}
                        transition={{
                           duration: 5 + i * 0.3,
                           repeat: Infinity,
                           delay: i * 0.4,
                           ease: "easeInOut"
                        }}
                     >
                        <IconComp
                           className="w-4 h-4 text-purple-400 sm:w-6 sm:h-6 dark:text-purple-300"
                           style={{ filter: 'blur(0.5px)' }}
                        />
                     </motion.div>
                  );
               })}
            </div>

            {/* Motivational Message */}
            <AnimatePresence>
               {progress > 70 && (
                  <motion.div
                     initial={{ opacity: 0, scale: 0.8, y: 20 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.8, y: -20 }}
                     transition={{ duration: 0.5 }}
                     className="mt-12 text-center"
                  >
                     <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="inline-flex justify-center items-center mb-4 w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-2xl shadow-purple-500/50"
                     >
                        <Rocket className="w-6 h-6 text-white" />
                     </motion.div>
                     <p className="mb-1 text-lg font-bold text-gray-800 sm:text-xl dark:text-white">
                        Great matches incoming! 🎉
                     </p>
                     <p className="text-sm text-gray-600 sm:text-base dark:text-gray-300">
                        Get ready to connect with amazing creators
                     </p>
                  </motion.div>
               )}
            </AnimatePresence>
         </div>
      </div>
   );
};

export default FunLoader;