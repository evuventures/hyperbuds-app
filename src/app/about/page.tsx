"use client";

import React from 'react';
import { Header } from '@/components/layout/Header/Header';
import { AboutHero } from '@/components/about/AboutHero';
import { TeamGallery } from '@/components/about/TeamGallery';
import { MissionSection } from '@/components/about/MissionSection';
import { VideoTestimonial } from '@/components/about/VideoTestimonial';
import { FeaturesSection } from '@/components/about/FeaturesSection';

// Mock user data for header
const mockUser = {
   username: "user",
   email: "user@example.com",
   displayName: "User",
   avatar: ""
};

export default function AboutPage() {
   return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
         {/* Header */}
         <Header user={mockUser} onMenuClick={() => { }} />

         {/* Hero Section */}
         <AboutHero />

         {/* Team Gallery */}
         <TeamGallery />

         {/* Mission Section */}
         <MissionSection />

         {/* Video Testimonial */}
         <VideoTestimonial />

         {/* Features Section */}
         <FeaturesSection />
      </div>
   );
}
