"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation, Autoplay } from "swiper/modules";
import {
  Heart,
  Users,
  MapPin,
  Star,
  Verified,
  MessageCircle,
  ChevronRight,
  Zap,
} from "lucide-react";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

interface Card {
  id: number;
  name: string;
  role: string;
  followers: string;
  overlap: string;
  synergy: string;
  img: string;
  location: string;
  responseTime: string;
  collaborationRate: string;
  rizzScore: number;
  verified: boolean;
  online: boolean;
  specialties: string[];
  recentWork: string;
}

const Recommended: React.FC = () => {
  const [likedCreators, setLikedCreators] = useState<number[]>([]);

  const cards: Card[] = [
    {
      id: 1,
      name: "Angela Brooks",
      role: "Gaming Streamer",
      followers: "12K",
      overlap: "78%",
      synergy: "92%",
      img: "/images/icons-dashboard/slide-image.jpg",
      location: "Los Angeles, CA",
      responseTime: "< 2 hours",
      collaborationRate: "$500-1.2K",
      rizzScore: 94,
      verified: true,
      online: true,
      specialties: ["Gaming", "Tech Reviews", "Live Streaming"],
      recentWork: "Valorant Championship Coverage",
    },
    {
      id: 2,
      name: "Tayo Omotayo",
      role: "Podcaster",
      followers: "25K",
      overlap: "85%",
      synergy: "88%",
      img: "/images/icons-dashboard/user2.jpg",
      location: "New York, NY",
      responseTime: "< 1 hour",
      collaborationRate: "$300-800",
      rizzScore: 91,
      verified: true,
      online: false,
      specialties: ["Podcasting", "Interviews", "Business"],
      recentWork: "Entrepreneur Spotlight Series",
    },
    {
      id: 3,
      name: "Mia Chen",
      role: "Content Creator",
      followers: "18K",
      overlap: "65%",
      synergy: "95%",
      img: "/images/icons-dashboard/user3.jpg",
      location: "San Francisco, CA",
      responseTime: "< 30 min",
      collaborationRate: "$400-1K",
      rizzScore: 96,
      verified: false,
      online: true,
      specialties: ["Lifestyle", "Fashion", "Beauty"],
      recentWork: "Sustainable Fashion Campaign",
    },
    {
      id: 4,
      name: "James Carter",
      role: "Music Producer",
      followers: "32K",
      overlap: "82%",
      synergy: "90%",
      img: "/images/icons-dashboard/user1.jpg",
      location: "Nashville, TN",
      responseTime: "< 4 hours",
      collaborationRate: "$600-1.5K",
      rizzScore: 88,
      verified: true,
      online: true,
      specialties: ["Music Production", "Audio Engineering", "Collaborations"],
      recentWork: "Indie Artist Album Production",
    },
    {
      id: 5,
      name: "Sarah Johnson",
      role: "Lifestyle Blogger",
      followers: "22K",
      overlap: "73%",
      synergy: "87%",
      img: "/images/icons-dashboard/user2.jpg",
      location: "Miami, FL",
      responseTime: "< 3 hours",
      collaborationRate: "$350-900",
      rizzScore: 89,
      verified: false,
      online: true,
      specialties: ["Lifestyle", "Travel", "Photography"],
      recentWork: "Wellness Retreat Series",
    },
    {
      id: 6,
      name: "David Kim",
      role: "Tech Reviewer",
      followers: "45K",
      overlap: "91%",
      synergy: "93%",
      img: "/images/icons-dashboard/user1.jpg",
      location: "Seattle, WA",
      responseTime: "< 1 hour",
      collaborationRate: "$800-2K",
      rizzScore: 97,
      verified: true,
      online: true,
      specialties: ["Technology", "Reviews", "Tutorials"],
      recentWork: "AI Product Deep Dive",
    },
  ];

  const toggleLike = (creatorId: number) => {
    setLikedCreators((prev) =>
      prev.includes(creatorId)
        ? prev.filter((id) => id !== creatorId)
        : [...prev, creatorId]
    );
  };

  const getRizzBgColor = (score: number) => {
    if (score >= 90) return "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400";
    if (score >= 80) return "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400";
    if (score >= 70) return "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400";
    return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300";
  };

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 justify-between items-start sm:items-center">
        <div className="flex gap-3 items-center">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl">
            <Star className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              Perfect Matches for You
            </h2>
            <p className="text-foreground">
              Curated creators based on your collaboration style
            </p>
          </div>
        </div>

        <button className="flex gap-2 items-center font-medium text-purple-600 transition-colors dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300">
          View All Matches
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Swiper Container */}
      <div className="relative">
        <Swiper
          modules={[Pagination, Navigation, Autoplay]}
          slidesPerView={1}
          spaceBetween={20}
          loop={true}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          pagination={{
            clickable: true,
            bulletClass: "swiper-pagination-bullet custom-bullet",
            bulletActiveClass:
              "swiper-pagination-bullet-active custom-bullet-active",
          }}
          breakpoints={{
            640: { slidesPerView: 1, spaceBetween: 20 },
            768: { slidesPerView: 1, spaceBetween: 24 },
            1024: { slidesPerView: 1, spaceBetween: 24 },
            1280: { slidesPerView: 1, spaceBetween: 32 },
          }}
          className="!pb-12"
        >
          {cards.map((card) => (
            <SwiperSlide key={card.id}>
              <div className="bg-card text-foreground rounded-3xl shadow-sm border border-border overflow-hidden hover:shadow-xl transition-all duration-500 transform 
              hover:scale-[1.02] h-[680px] group m-5">
                {/* Image Container */}
                <div className="overflow-hidden relative">
                  <Image
                    src={card.img}
                    alt={card.name}
                    width={400}
                    height={280}
                    className="object-cover w-full h-80 transition-transform duration-700 group-hover:scale-110"
                  />

                  {/* Overlay Elements */}
                  <div className="absolute inset-0 bg-gradient-to-t via-transparent to-transparent opacity-0 transition-opacity duration-300 from-black/50 group-hover:opacity-100"></div>

                  {/* Status Indicators */}
                  <div className="flex absolute top-4 left-4 gap-2 items-center">
                    {card.online && (
                      <div className="flex gap-2 items-center px-3 py-1 text-xs font-medium text-white bg-green-500 rounded-full">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        Online
                      </div>
                    )}
                    {card.verified && (
                      <div className="bg-blue-500 text-white p-1.5 rounded-full">
                        <Verified className="w-3 h-3" />
                      </div>
                    )}
                  </div>

                  {/* Rizz Score */}
                  <div className="absolute top-4 right-4">
                    <div
                      className={`px-3 py-1.5 rounded-full text-xs font-bold ${getRizzBgColor(
                        card.rizzScore
                      )} backdrop-blur-sm border border-white/20`}
                    >
                      <div className="flex gap-1 items-center">
                        <Zap className="w-3 h-3" />
                        Rizz {card.rizzScore}
                      </div>
                    </div>
                  </div>

                  {/* Like Button */}
                  <div className="absolute right-4 bottom-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <button
                      onClick={() => toggleLike(card.id)}
                      className={`p-3 rounded-full backdrop-blur-sm border border-white/20 transition-all duration-200 transform hover:scale-110 ${likedCreators.includes(card.id)
                        ? "bg-red-500 text-white"
                        : "bg-white/20 text-white hover:bg-white/30"
                        }`}
                    >
                      <Heart
                        className={`w-5 h-5 ${likedCreators.includes(card.id) ? "fill-current" : ""
                          }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  {/* Name and Role */}
                  <div>
                    <div className="flex gap-2 items-center mb-2">
                      <h3 className="text-xl font-bold text-foreground">
                        {card.name}
                      </h3>
                      {card.verified && (
                        <div className="flex justify-center items-center w-5 h-5 bg-blue-500 rounded-full">
                          <Verified className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <p className="font-medium text-muted-foreground">
                      {card.role}
                    </p>
                    <div className="flex gap-4 items-center mt-1 text-sm text-muted-foreground">
                      <span className="flex gap-1 items-center">
                        <Users className="w-4 h-4" />
                        {card.followers} followers
                      </span>
                      <span className="flex gap-1 items-center">
                        <MapPin className="w-4 h-4" />
                        {card.location}
                      </span>
                    </div>
                  </div>

                  {/* Specialties */}
                  <div>
                    <div className="flex flex-wrap gap-2">
                      {card.specialties.slice(0, 2).map((specialty, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs font-medium text-purple-600 bg-purple-100 rounded-full dark:bg-purple-900/40 dark:text-purple-400"
                        >
                          {specialty}
                        </span>
                      ))}
                      {card.specialties.length > 2 && (
                        <span className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full dark:bg-gray-800 dark:text-gray-300">
                          +{card.specialties.length - 2}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Audience Overlap:
                      </span>
                      <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                        {card.overlap}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Synergy Score™:
                      </span>
                      <span className="text-sm font-bold text-green-600 dark:text-green-400">
                        {card.synergy}
                      </span>
                    </div>
                  </div>
                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button className="flex-1 px-4 py-3 font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg transition-all duration-200 transform hover:from-purple-700 hover:to-indigo-700 hover:scale-105">
                      View Profile
                    </button>
                    <button className="flex flex-1 gap-2 justify-center items-center px-4 py-3 font-semibold text-white bg-gray-900 rounded-xl transition-all duration-200 transform dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 hover:scale-105">
                      <MessageCircle className="w-4 h-4" />
                      Collaborate
                    </button>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default Recommended;
