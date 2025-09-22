"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import Image from "next/image";
interface LoaderAnimationProps {
    onComplete?: () => void;
}

const LoaderAnimation: React.FC<LoaderAnimationProps> = ({ onComplete }) => {
    const [isComplete, setIsComplete] = useState(false);
    const [currentStageText, setCurrentStageText] = useState("Analyzing Profile...");

    // Main animation timer and stage text updates
    useEffect(() => {
        const totalDuration = 10000;
        const textStages = [
            "Analyzing Profile...",
            "Calculating Scores...",
            "Generating Insights...",
        ];
        let stageIndex = 0;

        // Set up intervals to change the text
        const textTimer = setInterval(() => {
            if (stageIndex < textStages.length) {
                setCurrentStageText(textStages[stageIndex]);
                stageIndex++;
            }
        }, 1500); // Change text every 1.5 seconds

        // Main timer to signal the end of the loading process
        const mainTimer = setTimeout(() => {
            setIsComplete(true);
            clearInterval(textTimer);
            setCurrentStageText("Complete!");

            // Add a slight delay before calling onComplete to show the "Complete!" message
            const completionDelayTimer = setTimeout(() => {
                if (onComplete) {
                    onComplete();
                }
            }, 2000); // Show "Complete!" for 2 seconds before unmounting

            return () => clearTimeout(completionDelayTimer);
        }, totalDuration);

        return () => {
            clearTimeout(mainTimer);
            clearInterval(textTimer);
        };
    }, [onComplete]);

    // Animation variants
    const containerVariants: Variants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.5,
                when: "beforeChildren",
                staggerChildren: 0.2
            },
        },
    };

    const textVariants: Variants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 },
    };

    // New variants for the bouncing avatars
    const bounceVariants: Variants = {
        animate: {
            y: [0, -20, 0],
            transition: {
                duration: 1.5,
                repeat: Infinity,
                ease: "linear",
            },
        },
    };

    const progressVariants: Variants = {
        animate: {
            rotate: 360,
            borderColor: [
                "#EC4899", // Pink
                "#8B5CF6", // Violet
                "#EF4444", // Red
                "#EC4899", // Back to Pink
            ],
            transition: {
                rotate: { repeat: Infinity, duration: 3, ease: "linear" },
                borderColor: { repeat: Infinity, duration: 3, ease: "linear" }
            },
        },
    };

    // Updated mock data with image URLs
    const mockAvatars = [
        { id: 1, score: 88, imageUrl: "/images/animation/Ellipse 1.png" },
        { id: 2, score: 92, imageUrl: "/images/animation/Ellipse 2.png" },
        { id: 3, score: 95, imageUrl: "/images/animation/Ellipse 3.png" },
        { id: 4, score: 79, imageUrl: "/images/animation/Ellipse 5.png" },
    ];

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <motion.div
                className="
                flex flex-col items-center justify-center p-8 rounded-3xl shadow-2xl relative overflow-hidden
                min-w-[300px] min-h-[400px] md:min-w-[600px] md:min-h-[600px]
                border-2 border-white/20
                bg-gradient-to-br from-pink-400 to-purple-600
                "
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                style={{
                    boxShadow: '0 0 40px rgba(236, 72, 153, 0.5), 0 0 80px rgba(139, 92, 246, 0.5)',
                }}
            >
                {/* Dynamic background effect with multiple animated layers */}
                <motion.div
                    className="absolute inset-0 z-0 opacity-20"
                    style={{
                        background: 'radial-gradient(circle at center, rgba(255,255,255,0.3) 0%, transparent 70%)'
                    }}
                    animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.4, 0.2] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeOut" }}
                />

                <motion.div
                    className="absolute inset-0 z-0"
                    style={{
                        background: 'radial-gradient(circle at top right, rgba(255,255,255,0.1) 0%, transparent 50%)'
                    }}
                    animate={{ x: [-100, 100], y: [-100, 100], opacity: [0.1, 0.3, 0.1] }}
                    transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
                />

                <AnimatePresence mode="wait">
                    {!isComplete && (
                        <motion.div key="loader-content" initial="hidden" animate="visible" exit="hidden" className="flex flex-col items-center z-10">
                            <motion.h2
                                className="text-xl md:text-2xl font-semibold mb-8 text-center text-white/70"
                                variants={textVariants}
                            >
                                <AnimatePresence mode="wait">
                                    <motion.span
                                        key={currentStageText}
                                        initial={{ opacity: 0, y: -20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 20 }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        {currentStageText}
                                    </motion.span>
                                </AnimatePresence>
                            </motion.h2>

                            <motion.div
                                className="relative w-48 h-48 flex items-center justify-center"
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.5 }}
                                transition={{ duration: 0.5 }}
                            >
                                {/* Main Progress Circle */}
                                <motion.div
                                    className="absolute w-48 h-48 border-4 rounded-full border-t-transparent"
                                    variants={progressVariants}
                                    animate="animate"
                                    style={{ borderBottomColor: '#EC4899', borderLeftColor: '#8B5CF6', borderRightColor: '#EF4444' }}
                                />

                                {/* Avatar Carousel with bouncy animation */}
                                <div className="flex flex-row gap-4 absolute w-full justify-center">
                                    {mockAvatars.map((avatar, index) => (
                                        <motion.div
                                            key={avatar.id}
                                            className="flex flex-col items-center"
                                            variants={bounceVariants}
                                            animate="animate"
                                        >
                                            <div
                                                className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-lg"
                                            >
                                                <Image src={avatar.imageUrl} alt={`Profile ${avatar.id}`} width={40} height={40} className="w-full h-full object-cover" />
                                            </div>
                                            <motion.span
                                                className="mt-2 font-bold text-lg text-white"
                                                initial={{ y: 10, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                transition={{ delay: index * 0.2 + 0.5 }}
                                            >
                                                {avatar.score}%
                                            </motion.span>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        </motion.div>
                    )}

                    {isComplete && (
                        <motion.div
                            key="complete-message"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="flex flex-col items-center z-10 text-white"
                        >
                            <h2 className="text-3xl md:text-4xl font-extrabold text-center">
                                Analysis Complete!
                            </h2>
                            <p className="mt-4 text-white/80 text-center max-w-sm">
                                Your matches have been generated. You&apos;re ready to proceed!
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default LoaderAnimation;