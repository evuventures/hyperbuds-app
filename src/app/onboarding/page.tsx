'use client';

import { useState } from 'react';
import { FaHandshake, FaMicrophone, FaMagic } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

// Onboarding slides data
const onboardingSlides = [
  {
    id: 1,
    icon: <FaMagic size={80} className="text-purple-600 mb-6" />,
    title:  "Welcome to HyperBuds!",
    description:"Discover, connect, and collaborate with creators like never before, powered by intelligent AI matching.",
  },
  {
    id: 2,
    icon: <FaHandshake size={80} className="text-purple-600 mb-6" /> , 
    title: "Find your Perfect Collab Partner",
    description: "Our AI Matchmaker intelligently suggests ideal collaborators based on your niche, audience, and goals.",
  },
  {
    id: 3,
    icon:<FaMicrophone size={80} className="text-purple-600 mb-6" />,
    title:"Go Live & Create Magic",
    description:  "Jump into our basic Duet Studio to co-stream, record, and produce amazing content with your new partners.",
  },
];

// Onboarding Carousel component
export default function OnboardingCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    // Check if it's the last slide
    if (currentSlide === onboardingSlides.length - 1) {
      // If it is, redirect the user to the registration page
      window.location.href = '/auth/register';
    } else {
      // If not, move to the next slide
      setCurrentSlide((prevSlide) => (prevSlide + 1));
    }
  };

  const handleSkip = () => {
    // Implement skip logic, e.g., navigate to dashboard
    // Use a modal or state change instead of an alert
    window.location.href = '/auth/register'; // final route
  };

  const slideVariants = {
    initial: { opacity: 0, x: 200 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -200 },
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6 font-sans">
      <AnimatePresence mode="wait">
        <motion.div
          key={onboardingSlides[currentSlide].id}
          variants={slideVariants}
          initial="initial"
          animate="in"
          exit="out"
          transition={{ type: "tween", duration: 0.5 }}
          className="bg-white p-8 sm:p-12 rounded-3xl shadow-xl border border-gray-200 w-full max-w-lg text-center"
        >
          <div className="flex justify-center items-center mb-6">
            {onboardingSlides[currentSlide].icon}
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">{onboardingSlides[currentSlide].title}</h2>
          <p className="text-base sm:text-lg text-gray-600 mb-8">{onboardingSlides[currentSlide].description}</p>

          <div className="flex justify-center space-x-2 mb-8">
            {onboardingSlides.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                  index === currentSlide ? 'bg-purple-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="w-full py-4 rounded-full text-white font-bold text-lg bg-gradient-to-r from-purple-500 to-blue-600 shadow-lg hover:from-purple-600 hover:to-blue-700 transition-all transform hover:scale-[1.02] mb-4"
          >
            {currentSlide === onboardingSlides.length - 1 ? 'Get Started' : 'Next'}
          </button>
          <button
            onClick={handleSkip}
            className="w-full py-2 text-purple-600 font-semibold hover:text-purple-800 transition-colors"
          >
            Skip
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
