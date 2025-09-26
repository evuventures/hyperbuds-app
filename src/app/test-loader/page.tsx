"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import LoaderAnimation from "@/components/matching/LoaderAnimation";
import SimpleLoader from "@/components/matching/SimpleLoader";

export default function TestLoaderPage() {
   const [showLoader, setShowLoader] = useState(true);
   const [loaderType, setLoaderType] = useState<'complex' | 'simple'>('complex');

   const handleComplete = () => {
      console.log("Loader animation completed!");
      setShowLoader(false);
   };

   const resetLoader = () => {
      setShowLoader(true);
   };

   return (
      <div className="flex overflow-hidden relative flex-col justify-center items-center min-h-screen bg-gradient-to-br via-purple-900 from-slate-900 to-slate-900">
         {/* Animated background elements */}
         <div className="overflow-hidden absolute inset-0">
            {/* Floating orbs */}
            {[...Array(8)].map((_, i) => (
               <motion.div
                  key={`orb-${i}`}
                  className="absolute w-32 h-32 rounded-full opacity-20"
                  style={{
                     background: `radial-gradient(circle, ${['#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#EF4444'][i % 6]
                        } 0%, transparent 70%)`,
                     left: `${Math.random() * 100}%`,
                     top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                     x: [0, 100, -50, 0],
                     y: [0, -80, 60, 0],
                     scale: [1, 1.2, 0.8, 1],
                     opacity: [0.1, 0.3, 0.2, 0.1],
                  }}
                  transition={{
                     duration: 15 + Math.random() * 10,
                     repeat: Infinity,
                     ease: "easeInOut",
                     delay: Math.random() * 5,
                  }}
               />
            ))}

            {/* Grid pattern */}
            <div
               className="absolute inset-0 opacity-5"
               style={{
                  backgroundImage: `
                     linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                     linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                  `,
                  backgroundSize: '50px 50px'
               }}
            />

            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t via-transparent from-slate-900/50 to-slate-900/30" />
            <div className="absolute inset-0 bg-gradient-to-r via-transparent from-purple-900/20 to-pink-900/20" />
         </div>

         {/* Control Panel */}
         <motion.div
            className="relative z-10 mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
         >
            <div className="flex gap-4 p-2 rounded-2xl border shadow-2xl backdrop-blur-xl bg-white/5 border-white/10">
               <button
                  onClick={() => setLoaderType('complex')}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${loaderType === 'complex'
                     ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105'
                     : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                     }`}
               >
                  Complex Loader
               </button>
               <button
                  onClick={() => setLoaderType('simple')}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${loaderType === 'simple'
                     ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105'
                     : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                     }`}
               >
                  Simple Loader
               </button>
            </div>
         </motion.div>

         {/* Loader Content */}
         <div className="relative z-10">
            {showLoader ? (
               loaderType === 'complex' ? (
                  <LoaderAnimation onComplete={handleComplete} />
               ) : (
                  <SimpleLoader onComplete={handleComplete} />
               )
            ) : (
               <motion.div
                  className="text-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
               >
                  <div className="p-8 rounded-3xl border shadow-2xl backdrop-blur-xl bg-white/5 border-white/10">
                     <motion.div
                        className="flex justify-center items-center mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                     >
                        <motion.svg
                           className="w-8 h-8 text-white"
                           fill="none"
                           stroke="currentColor"
                           viewBox="0 0 24 24"
                           initial={{ pathLength: 0 }}
                           animate={{ pathLength: 1 }}
                           transition={{ delay: 0.5, duration: 0.8 }}
                        >
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </motion.svg>
                     </motion.div>

                     <h3 className="mb-2 text-2xl font-bold text-white">Animation Complete!</h3>
                     <p className="mb-6 text-white/70">Both loaders are working perfectly!</p>

                     <button
                        onClick={resetLoader}
                        className="px-6 py-3 font-semibold text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg transition-all duration-300 hover:scale-105"
                     >
                        Restart Animation
                     </button>
                  </div>
               </motion.div>
            )}
         </div>
      </div>
   );
}