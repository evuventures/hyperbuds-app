import React, { useState, useEffect } from 'react';
import { TrendingUp, Eye, Users, Play, Clock } from 'lucide-react';

interface TrendingItem {
  id: number;
  title: string;
  category: string;
  viewers: string;
  growth: string;
  duration: string;
  thumbnail: string;
  creators: string[];
  live?: boolean;
  description: string;
}

const Trending: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const categories = ['All', 'Gaming', 'Beauty', 'Tech', 'Food', 'Music', 'Lifestyle'];

  const trendingItems: TrendingItem[] = [
    {
      id: 1,
      title: "Building a Gaming Empire: From Zero to 1M Subscribers",
      category: "Gaming",
      viewers: "45K",
      growth: "+187%",
      duration: "45:32",
      thumbnail: "🎮",
      creators: ["GameMaster", "PixelPro"],
      live: true,
      description: "Watch as two gaming legends share their secrets to building massive audiences and creating viral content."
    },
    {
      id: 2,
      title: "The Ultimate Skincare Routine for Content Creators",
      category: "Beauty",
      viewers: "32K",
      growth: "+156%",
      duration: "28:15",
      thumbnail: "💄",
      creators: ["BeautyGuru", "SkincareQueen"],
      description: "Essential skincare tips for creators who spend hours under studio lights and in front of cameras."
    },
    {
      id: 3,
      title: "AI Tools Every Creator Should Know About",
      category: "Tech",
      viewers: "28K",
      growth: "+134%",
      duration: "35:42",
      thumbnail: "🤖",
      creators: ["TechReviewer", "AIExpert"],
      description: "Discover the latest AI tools that are revolutionizing content creation and boosting productivity."
    },
    {
      id: 4,
      title: "Cooking with Popular TikTok Trends",
      category: "Food",
      viewers: "25K",
      growth: "+128%",
      duration: "22:18",
      thumbnail: "🍳",
      creators: ["ChefTok", "FoodieLife"],
      description: "Turn viral TikTok food trends into amazing dishes with professional cooking techniques."
    },
    {
      id: 5,
      title: "Behind the Scenes: Music Video Production",
      category: "Music",
      viewers: "21K",
      growth: "+112%",
      duration: "52:07",
      thumbnail: "🎵",
      creators: ["MusicMaker", "VideoDirector"],
      description: "Get exclusive access to a professional music video shoot and learn industry secrets."
    },
    {
      id: 6,
      title: "Minimalist Home Decor for Small Spaces",
      category: "Lifestyle",
      viewers: "19K",
      growth: "+98%",
      duration: "31:24",
      thumbnail: "🏠",
      creators: ["HomeDesigner", "MinimalLifestyle"],
      description: "Transform your small space into a stylish haven with these minimalist design principles."
    }
  ];

  const filteredItems = selectedCategory === 'All'
    ? trendingItems
    : trendingItems.filter(item => item.category === selectedCategory);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || filteredItems.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % filteredItems.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, filteredItems.length]);





  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const getTrendingRank = (index: number) => {
    const ranks = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣'];
    return ranks[index] || '📈';
  };

  if (filteredItems.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500 dark:text-gray-400">No trending content found in this category.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 justify-between items-start sm:items-center">
        <div className="flex gap-3 items-center">
          <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Trending Collaborations</h2>
            <p className="text-gray-600 dark:text-gray-400">Most watched content this week</p>
          </div>
        </div>

        {/* Category Filter */}
        <div className="w-full max-w-full">
          <div className="flex overflow-x-scroll gap-2 items-center pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800 sm:pb-0 md:overflow-x-visible md:scrollbar-none md:flex-wrap">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  setCurrentSlide(0);
                }}
                className={`px-4 py-2 rounded-full font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 ${selectedCategory === category
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Swiper Container */}
      <div
        className="overflow-hidden relative rounded-2xl border border-gray-100 shadow-lg bg-background dark:border-gray-800 theme-transition"
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        {/* Auto-play indicator */}
        <div className="flex absolute top-4 right-4 z-20 gap-2 items-center px-3 py-1 rounded-full backdrop-blur-sm bg-black/20">
          <div className={`w-2 h-2 rounded-full ${isAutoPlaying ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
          <span className="text-xs font-medium text-white">AUTO</span>
        </div>

        {/* Main Swiper */}
        <div className="overflow-hidden relative h-full">
          <div
            className="flex h-full transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {filteredItems.map((item, index) => (
              <div key={item.id} className="relative flex-shrink-0 w-full">
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700"></div>

                {/* Content */}
                <div className="flex relative items-center p-8 h-full text-white">
                  <div className="flex-1 space-y-4">
                    {/* Rank Badge */}
                    <div className="inline-flex gap-2 items-center px-4 py-2 rounded-full backdrop-blur-sm bg-white/20">
                      <span className="text-2xl">{getTrendingRank(index)}</span>
                      <span className="font-bold">#{index + 1} Trending</span>
                    </div>

                    {/* Category & Live Badge */}
                    <div className="flex gap-3 items-center">
                      <span className="px-3 py-1 font-medium text-white rounded-full backdrop-blur-sm bg-white/30">
                        {item.category}
                      </span>
                      {item.live && (
                        <div className="flex gap-2 items-center px-3 py-1 font-medium text-white bg-red-500 rounded-full">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                          LIVE
                        </div>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="mb-2 text-3xl font-bold leading-tight">
                      {item.title}
                    </h3>

                    {/* Description */}
                    <p className="mb-4 text-lg leading-relaxed text-white/90">
                      {item.description}
                    </p>

                    {/* Creators */}
                    <div className="flex gap-2 items-center mb-4 text-white/90">
                      <Users className="w-5 h-5" />
                      <span className="font-medium">{item.creators.join(' & ')}</span>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-6 items-center text-white/90">
                      <div className="flex gap-2 items-center">
                        <Eye className="w-5 h-5" />
                        <span className="font-semibold">{item.viewers} viewers</span>
                      </div>
                      <div className="flex gap-2 items-center text-green-300">
                        <TrendingUp className="w-5 h-5" />
                        <span className="font-semibold">{item.growth}</span>
                      </div>
                      <div className="flex gap-2 items-center">
                        <Clock className="w-5 h-5" />
                        <span>{item.duration}</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button className="inline-flex gap-3 items-center px-6 py-3 mt-4 font-semibold text-purple-600 bg-white rounded-full transition-all duration-200 hover:bg-white/90">
                      <Play className="w-5 h-5" />
                      Watch Now
                    </button>
                  </div>

                  {/* Thumbnail Display */}
                  <div className="hidden justify-center items-center lg:flex">
                    <div className="flex justify-center items-center w-32 h-32 text-6xl rounded-3xl backdrop-blur-sm bg-white/20">
                      {item.thumbnail}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dots Indicator */}
        <div className="flex absolute bottom-4 left-1/2 z-10 gap-2 items-center transform -translate-x-1/2">
          {filteredItems.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${currentSlide === index
                ? 'bg-white scale-110'
                : 'bg-white/50 hover:bg-white/70'
                }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Trending;
