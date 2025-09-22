"use client";

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

export function AboutHero() {
   const ref = useRef(null);
   const isInView = useInView(ref, { once: false, amount: 0.3 });

   return (
      <section ref={ref} className="overflow-hidden relative px-6 py-20 bg-gradient-to-br from-purple-500 to-blue-600 dark:from-purple-600 dark:to-blue-700">
         {/* Decorative Elements */}
         <div className="absolute inset-0 pointer-events-none">
            {/* Single moving square - top right */}
            <motion.div
               className="absolute top-20 right-20 w-6 h-6 rounded-lg bg-white/20 dark:bg-white/30"
               animate={isInView ? {
                  y: [0, -10, 0],
                  rotate: [0, 90, 180],
                  scale: [1, 1.1, 1]
               } : {}}
               transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: [0.4, 0, 0.6, 1]
               }}
            />

            {/* Static decorative elements */}
            <motion.div
               className="absolute top-10 left-10 w-4 h-4 rounded-full bg-white/20 dark:bg-white/30"
               initial={{ opacity: 0, scale: 0 }}
               animate={isInView ? {
                  opacity: 1,
                  scale: 1,
                  y: [0, -8, 0]
               } : { opacity: 0, scale: 0 }}
               transition={{
                  duration: 0.6,
                  delay: 0.2,
                  y: { duration: 3, repeat: Infinity, ease: "easeInOut" }
               }}
            />

            <motion.div
               className="absolute bottom-20 left-1/4 w-3 h-3 rounded bg-white/20 dark:bg-white/30"
               initial={{ opacity: 0, scale: 0 }}
               animate={isInView ? {
                  opacity: 1,
                  scale: [1, 1.3, 1]
               } : { opacity: 0, scale: 0 }}
               transition={{
                  duration: 0.6,
                  delay: 0.4,
                  scale: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
               }}
            />

            <motion.div
               className="absolute right-10 top-1/2 w-5 h-5 rounded bg-white/20 dark:bg-white/30"
               initial={{ opacity: 0, scale: 0 }}
               animate={isInView ? {
                  opacity: 1,
                  scale: 1,
                  x: [0, 8, 0],
                  y: [0, -5, 0]
               } : { opacity: 0, scale: 0 }}
               transition={{
                  duration: 0.6,
                  delay: 0.6,
                  x: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                  y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
               }}
            />
         </div>

         <div className="relative mx-auto max-w-6xl text-center">
            <motion.h1
               className="mb-8 text-6xl font-bold text-white md:text-7xl lg:text-8xl"
               initial={{ opacity: 0, y: 20 }}
               animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
               transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
               About us
            </motion.h1>

            <motion.p
               className="mx-auto max-w-4xl text-xl leading-relaxed text-white/90 md:text-2xl"
               initial={{ opacity: 0, y: 15 }}
               animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
               transition={{ duration: 1.2, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
               Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
               incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
               exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </motion.p>
         </div>
      </section>
   );
}
