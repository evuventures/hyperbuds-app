"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SimpleLoaderProps {
   onComplete?: () => void;
}

const SimpleLoader: React.FC<SimpleLoaderProps> = ({ onComplete }) => {
   const [isComplete, setIsComplete] = useState(false);
   const [currentStageText, setCurrentStageText] = useState("Analyzing Profile...");
   const [progress, setProgress] = useState(0);
   const [currentStage, setCurrentStage] = useState(0);

   useEffect(() => {
      const totalDuration = 8000; // 8 seconds for better UX
      const textStages = [
         { text: "Analyzing Profile...", duration: 2000 },
         { text: "Calculating Scores...", duration: 2000 },
         { text: "Generating Insights...", duration: 2000 },
         { text: "Finalizing Results...", duration: 2000 },
      ];

      let stageIndex = 0;

      const updateProgress = () => {
         setProgress(prev => {
            if (prev >= 100) return 100;
            return prev + (100 / (totalDuration / 100));
         });
      };

      const progressInterval = setInterval(updateProgress, 100);

      const startStage = (index: number) => {
         if (index < textStages.length) {
            setCurrentStageText(textStages[index].text);
            setCurrentStage(index);
         }
      };


      // Start first stage
      startStage(0);

      // Stage transitions
      const stageInterval = setInterval(() => {
         stageIndex++;
         if (stageIndex < textStages.length) {
            startStage(stageIndex);
         } else {
            clearInterval(stageInterval);
         }
      }, 2000);

      // Main completion timer
      const mainTimer = setTimeout(() => {
         setIsComplete(true);
         setCurrentStageText("Analysis Complete!");
         setProgress(100);
         clearInterval(progressInterval);
         clearInterval(stageInterval);

         setTimeout(() => {
            if (onComplete) {
               onComplete();
            }
         }, 2000);
      }, totalDuration);

      return () => {
         clearTimeout(mainTimer);
         clearInterval(progressInterval);
         clearInterval(stageInterval);
      };
   }, [onComplete]);

   return (
      <div className="">
         {/* Animated background particles */}
         <div className="overflow-hidden absolute inset-0">
            {[...Array(15)].map((_, i) => (
               <motion.div
                  key={i}
                  className="absolute w-1 h-1 rounded-full bg-white/20"
                  style={{
                     left: `${Math.random() * 100}%`,
                     top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                     y: [0, -80, 0],
                     opacity: [0, 1, 0],
                     scale: [0, 1, 0],
                  }}
                  transition={{
                     duration: 2 + Math.random() * 2,
                     repeat: Infinity,
                     delay: Math.random() * 2,
                  }}
               />
            ))}
         </div>

         {/* Simple Loader */}
         <motion.div
            className="flex flex-col items-center justify-center p-8 rounded-3xl relative overflow-hidden shadow-2xl
               min-w-[320px] min-h-[450px] md:min-w-[500px] md:min-h-[550px]
               border border-white/10 backdrop-blur-xl 
               bg-gradient-to-br from-white/5 to-white/10"
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{
               boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
            }}
         >
            {/* Glassmorphism background effects */}
            <motion.div
               className="absolute inset-0 z-0"
               style={{
                  background: 'radial-gradient(circle at 30% 20%, rgba(120, 119, 198, 0.2) 0%, transparent 50%)'
               }}
               animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.2, 0.4, 0.2],
                  rotate: [0, 90, 180]
               }}
               transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            />

            <motion.div
               className="absolute inset-0 z-0"
               style={{
                  background: 'radial-gradient(circle at 70% 80%, rgba(168, 85, 247, 0.15) 0%, transparent 50%)'
               }}
               animate={{
                  scale: [1.1, 1, 1.1],
                  opacity: [0.15, 0.3, 0.15],
                  rotate: [180, 90, 0]
               }}
               transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            />

            <AnimatePresence mode="wait">
               {!isComplete && (
                  <motion.div
                     key="loader-content"
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -20 }}
                     className="flex z-10 flex-col items-center w-full"
                  >
                     {/* Progress Bar */}
                     <div className="mb-6 w-full max-w-sm">
                        <div className="flex justify-between items-center mb-2">
                           <span className="text-sm font-medium text-white/70">Progress</span>
                           <span className="text-sm font-bold text-white">{Math.round(progress)}%</span>
                        </div>
                        <div className="overflow-hidden w-full h-2 rounded-full bg-white/10">
                           <motion.div
                              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              transition={{ duration: 0.3, ease: "easeOut" }}
                           />
                        </div>
                     </div>

                     {/* Stage Indicators */}
                     <div className="flex gap-2 mb-6">
                        {[0, 1, 2, 3].map((stage) => (
                           <motion.div
                              key={stage}
                              className={`w-2 h-2 rounded-full ${stage <= currentStage
                                 ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                                 : 'bg-white/20'
                                 }`}
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{
                                 scale: stage === currentStage ? 1.3 : 1,
                                 opacity: 1
                              }}
                              transition={{ duration: 0.3, ease: "easeOut" }}
                           />
                        ))}
                     </div>

                     {/* Main Title */}
                     <motion.h2
                        className="mb-8 text-xl font-bold text-center text-white md:text-2xl"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                     >
                        <AnimatePresence mode="wait">
                           <motion.span
                              key={currentStageText}
                              initial={{ opacity: 0, y: -10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 10, scale: 0.95 }}
                              transition={{ duration: 0.4, ease: "easeOut" }}
                              className="block"
                           >
                              {currentStageText}
                           </motion.span>
                        </AnimatePresence>
                     </motion.h2>

                     {/* Main Spinner */}
                     <motion.div
                        className="flex relative justify-center items-center mb-6 w-48 h-48"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                     >
                        {/* Outer rotating ring */}
                        <motion.div
                           className="absolute w-48 h-48 rounded-full border-transparent border-3"
                           style={{
                              background: 'conic-gradient(from 0deg, #8B5CF6, #EC4899, #F59E0B, #10B981, #8B5CF6)',
                              mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                              maskComposite: 'xor',
                              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                              WebkitMaskComposite: 'xor',
                              padding: '3px'
                           }}
                           animate={{
                              rotate: 360,
                              scale: [1, 1.05, 1]
                           }}
                           transition={{
                              rotate: { repeat: Infinity, duration: 2, ease: "linear" },
                              scale: { repeat: Infinity, duration: 2, ease: "easeInOut" }
                           }}
                        />

                        {/* Inner pulsing circle */}
                        <motion.div
                           className="absolute w-36 h-36 bg-gradient-to-br rounded-full border from-white/10 to-white/5 border-white/20"
                           animate={{
                              scale: [1, 1.1, 1],
                              opacity: [0.7, 1, 0.7]
                           }}
                           transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              ease: "easeInOut"
                           }}
                        />

                        {/* Center content */}
                        <div className="flex relative z-10 flex-col justify-center items-center">
                           <motion.div
                              className="flex justify-center items-center mb-2 w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                              animate={{
                                 scale: [1, 1.1, 1],
                                 rotate: [0, 5, -5, 0]
                              }}
                              transition={{
                                 duration: 2,
                                 repeat: Infinity,
                                 ease: "easeInOut"
                              }}
                           >
                              <motion.div
                                 className="w-8 h-8 rounded-full border-2 border-white"
                                 animate={{ rotate: 360 }}
                                 transition={{
                                    rotate: { repeat: Infinity, duration: 1, ease: "linear" }
                                 }}
                              />
                           </motion.div>

                           <motion.span
                              className="text-sm font-semibold text-white"
                              animate={{ opacity: [0.5, 1, 0.5] }}
                              transition={{
                                 duration: 1.5,
                                 repeat: Infinity,
                                 ease: "easeInOut"
                              }}
                           >
                              Processing...
                           </motion.span>
                        </div>
                     </motion.div>

                     {/* Subtitle */}
                     <motion.p
                        className="max-w-sm text-sm text-center text-white/60"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                     >
                        Finding the perfect matches for your collaboration needs...
                     </motion.p>
                  </motion.div>
               )}

               {isComplete && (
                  <motion.div
                     key="complete-message"
                     initial={{ opacity: 0, scale: 0.8, y: 30 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     transition={{ duration: 0.8, ease: "easeOut" }}
                     className="flex z-10 flex-col items-center text-center text-white"
                  >
                     <motion.div
                        className="flex justify-center items-center mb-6 w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{
                           delay: 0.2,
                           type: "spring",
                           stiffness: 200,
                           damping: 15
                        }}
                     >
                        <motion.svg
                           className="w-10 h-10 text-white"
                           fill="none"
                           stroke="currentColor"
                           viewBox="0 0 24 24"
                           initial={{ pathLength: 0 }}
                           animate={{ pathLength: 1 }}
                           transition={{ delay: 0.5, duration: 0.6 }}
                        >
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </motion.svg>
                     </motion.div>

                     <h2 className="mb-4 text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                        Analysis Complete!
                     </h2>
                     <p className="max-w-sm text-base leading-relaxed text-white/80">
                        Your personalized matches have been generated. Ready to discover amazing collaborations!
                     </p>
                  </motion.div>
               )}
            </AnimatePresence>
         </motion.div>
      </div>
   );
};

export default SimpleLoader;
