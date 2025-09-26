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
    const [progress, setProgress] = useState(0);
    const [currentStage, setCurrentStage] = useState(0);

    // Enhanced animation timer with progress tracking
    useEffect(() => {
        const totalDuration = 12000; // Increased to 12 seconds for better UX
        const textStages = [
            { text: "Analyzing Profile...", duration: 3000 },
            { text: "Calculating Compatibility...", duration: 3000 },
            { text: "Generating Insights...", duration: 3000 },
            { text: "Finalizing Results...", duration: 3000 },
        ];

        let stageIndex = 0;

        const updateProgress = () => {
            setProgress(prev => {
                if (prev >= 100) return 100;
                return prev + (100 / (totalDuration / 100));
            });
        };

        const startStage = (index: number) => {
            if (index < textStages.length) {
                setCurrentStageText(textStages[index].text);
                setCurrentStage(index);
            }
        };

        // Start progress animation
        const progressInterval = setInterval(updateProgress, 100);

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
        }, 3000);

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
            }, 2500);
        }, totalDuration);

        return () => {
            clearTimeout(mainTimer);
            clearInterval(progressInterval);
            clearInterval(stageInterval);
        };
    }, [onComplete]);

    // Enhanced animation variants
    const containerVariants: Variants = {
        hidden: { opacity: 0, scale: 0.8, y: 50 },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                duration: 0.8,
                ease: "easeOut",
                when: "beforeChildren",
                staggerChildren: 0.3
            },
        },
    };

    const textVariants: Variants = {
        hidden: { y: 30, opacity: 0, scale: 0.9 },
        visible: {
            y: 0,
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.6,
                ease: "easeOut"
            }
        },
    };

    const progressVariants: Variants = {
        animate: {
            rotate: 360,
            scale: [1, 1.05, 1],
            transition: {
                rotate: { repeat: Infinity, duration: 2, ease: "linear" },
                scale: { repeat: Infinity, duration: 2, ease: "easeInOut" }
            },
        },
    };

    const avatarVariants: Variants = {
        animate: {
            y: [0, -25, 0],
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
            transition: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
            },
        },
    };

    const pulseVariants: Variants = {
        animate: {
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7],
            transition: {
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
            },
        },
    };

    const stageIndicatorVariants: Variants = {
        hidden: { scale: 0, opacity: 0 },
        visible: {
            scale: 1,
            opacity: 1,
            transition: {
                duration: 0.5,
                ease: "easeOut"
            }
        },
        active: {
            scale: 1.2,
            opacity: 1,
            transition: {
                duration: 0.3,
                ease: "easeOut"
            }
        }
    };

    // Updated mock data with image URLs
    const mockAvatars = [
        { id: 1, score: 88, imageUrl: "/images/animation/Ellipse 1.png" },
        { id: 2, score: 92, imageUrl: "/images/animation/Ellipse 2.png" },
        { id: 3, score: 95, imageUrl: "/images/animation/Ellipse 3.png" },
        { id: 4, score: 79, imageUrl: "/images/animation/Ellipse 5.png" },
    ];

    return (
        <div className="">
            {/* Animated background particles */}
            <div className="overflow-hidden absolute inset-0">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-2 h-2 rounded-full bg-white/10"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            y: [0, -100, 0],
                            opacity: [0, 1, 0],
                            scale: [0, 1, 0],
                        }}
                        transition={{
                            duration: 3 + Math.random() * 2,
                            repeat: Infinity,
                            delay: Math.random() * 2,
                        }}
                    />
                ))}
            </div>

            {/* Loader Animation */}
            <motion.div
                className="
                flex flex-col items-center justify-center p-8 rounded-3xl shadow-2xl relative overflow-hidden
                min-w-[320px] min-h-[500px] md:min-w-[700px] md:min-h-[650px]
                border border-white/10 backdrop-blur-xl
                bg-gradient-to-br from-white/5 to-white/10
                "
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                style={{
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
                }}
            >
                {/* Glassmorphism background effects */}
                <motion.div
                    className="absolute inset-0 z-0"
                    style={{
                        background: 'radial-gradient(circle at 30% 20%, rgba(120, 119, 198, 0.3) 0%, transparent 50%)'
                    }}
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.6, 0.3],
                        rotate: [0, 180, 360]
                    }}
                    transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
                />

                <motion.div
                    className="absolute inset-0 z-0"
                    style={{
                        background: 'radial-gradient(circle at 70% 80%, rgba(168, 85, 247, 0.2) 0%, transparent 50%)'
                    }}
                    animate={{
                        scale: [1.2, 1, 1.2],
                        opacity: [0.2, 0.5, 0.2],
                        rotate: [360, 180, 0]
                    }}
                    transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                />

                <AnimatePresence mode="wait">
                    {!isComplete && (
                        <motion.div key="loader-content" initial="hidden" animate="visible" exit="hidden" className="flex z-10 flex-col items-center w-full">
                            {/* Progress Bar */}
                            <div className="mb-8 w-full max-w-md">
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
                            <div className="flex gap-2 mb-8">
                                {[0, 1, 2, 3].map((stage) => (
                                    <motion.div
                                        key={stage}
                                        className={`w-3 h-3 rounded-full ${stage <= currentStage
                                            ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                                            : 'bg-white/20'
                                            }`}
                                        variants={stageIndicatorVariants}
                                        animate={stage === currentStage ? "active" : "visible"}
                                    />
                                ))}
                            </div>

                            {/* Main Title */}
                            <motion.h2
                                className="mb-8 text-2xl font-bold text-center text-white md:text-3xl"
                                variants={textVariants}
                            >
                                <AnimatePresence mode="wait">
                                    <motion.span
                                        key={currentStageText}
                                        initial={{ opacity: 0, y: -20, scale: 0.9 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                                        transition={{ duration: 0.6, ease: "easeOut" }}
                                        className="block"
                                    >
                                        {currentStageText}
                                    </motion.span>
                                </AnimatePresence>
                            </motion.h2>

                            {/* Main Progress Circle */}
                            <motion.div
                                className="flex relative justify-center items-center mb-8 w-64 h-64"
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.5 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                            >
                                {/* Outer rotating ring */}
                                <motion.div
                                    className="absolute w-64 h-64 rounded-full border-2 border-transparent"
                                    style={{
                                        background: 'conic-gradient(from 0deg, #8B5CF6, #EC4899, #F59E0B, #10B981, #8B5CF6)',
                                        mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                                        maskComposite: 'xor',
                                        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                                        WebkitMaskComposite: 'xor',
                                        padding: '4px'
                                    }}
                                    variants={progressVariants}
                                    animate="animate"
                                />

                                {/* Inner pulsing circle */}
                                <motion.div
                                    className="absolute w-48 h-48 bg-gradient-to-br rounded-full border from-white/10 to-white/5 border-white/20"
                                    variants={pulseVariants}
                                    animate="animate"
                                />

                                {/* Avatar Carousel */}
                                <div className="flex absolute flex-row gap-6 justify-center w-full">
                                    {mockAvatars.map((avatar, index) => (
                                        <motion.div
                                            key={avatar.id}
                                            className="flex flex-col items-center"
                                            variants={avatarVariants}
                                            animate="animate"
                                            style={{ animationDelay: `${index * 0.2}s` }}
                                        >
                                            <div className="relative">
                                                <div className="overflow-hidden w-20 h-20 rounded-full shadow-2xl border-3 border-white/30">
                                                    <Image
                                                        src={avatar.imageUrl}
                                                        alt={`Profile ${avatar.id}`}
                                                        width={80}
                                                        height={80}
                                                        className="object-cover w-full h-full"
                                                    />
                                                </div>
                                                {/* Score badge */}
                                                <motion.div
                                                    className="flex absolute -top-2 -right-2 justify-center items-center w-8 h-8 text-xs font-bold text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg"
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ delay: index * 0.2 + 1 }}
                                                >
                                                    {avatar.score}
                                                </motion.div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Subtitle */}
                            <motion.p
                                className="max-w-md text-sm text-center text-white/60 md:text-base"
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
                            initial={{ opacity: 0, scale: 0.8, y: 50 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="flex z-10 flex-col items-center text-center text-white"
                        >
                            <motion.div
                                className="flex justify-center items-center mb-6 w-24 h-24 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            >
                                <motion.svg
                                    className="w-12 h-12 text-white"
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

                            <h2 className="mb-4 text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                                Analysis Complete!
                            </h2>
                            <p className="max-w-md text-lg leading-relaxed text-white/80">
                                Your personalized matches have been generated. Ready to discover amazing collaborations!
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default LoaderAnimation;