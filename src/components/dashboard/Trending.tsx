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
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">No trending content found in this category.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Trending Collaborations</h2>
            <p className="text-gray-600 dark:text-gray-400">Most watched content this week</p>
          </div>
        </div>
        
        {/* Category Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => {
                setSelectedCategory(category);
                setCurrentSlide(0);
              }}
              className={`px-4 py-2 rounded-full font-medium transition-all duration-200 whitespace-nowrap ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Swiper Container */}
      <div 
        className="relative bg-background rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 overflow-hidden theme-transition"
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        {/* Auto-play indicator */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-black/20 backdrop-blur-sm rounded-full px-3 py-1">
          <div className={`w-2 h-2 rounded-full ${isAutoPlaying ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
          <span className="text-white text-xs font-medium">AUTO</span>
        </div>

        {/* Main Swiper */}
        <div className="relative h-full overflow-hidden">
          <div 
            className="flex transition-transform duration-500 ease-in-out h-full"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {filteredItems.map((item, index) => (
              <div key={item.id} className="w-full flex-shrink-0 relative">
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700"></div>
                
                {/* Content */}
                <div className="relative h-full flex items-center p-8 text-white">
                  <div className="flex-1 space-y-4">
                    {/* Rank Badge */}
                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                      <span className="text-2xl">{getTrendingRank(index)}</span>
                      <span className="font-bold">#{index + 1} Trending</span>
                    </div>

                    {/* Category & Live Badge */}
                    <div className="flex items-center gap-3">
                      <span className="bg-white/30 backdrop-blur-sm text-white px-3 py-1 rounded-full font-medium">
                        {item.category}
                      </span>
                      {item.live && (
                        <div className="bg-red-500 text-white px-3 py-1 rounded-full font-medium flex items-center gap-2">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                          LIVE
                        </div>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-3xl font-bold leading-tight mb-2">
                      {item.title}
                    </h3>

                    {/* Description */}
                    <p className="text-white/90 text-lg leading-relaxed mb-4">
                      {item.description}
                    </p>

                    {/* Creators */}
                    <div className="flex items-center gap-2 text-white/90 mb-4">
                      <Users className="w-5 h-5" />
                      <span className="font-medium">{item.creators.join(' & ')}</span>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6 text-white/90">
                      <div className="flex items-center gap-2">
                        <Eye className="w-5 h-5" />
                        <span className="font-semibold">{item.viewers} viewers</span>
                      </div>
                      <div className="flex items-center gap-2 text-green-300">
                        <TrendingUp className="w-5 h-5" />
                        <span className="font-semibold">{item.growth}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        <span>{item.duration}</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button className="inline-flex items-center gap-3 bg-white text-purple-600 px-6 py-3 rounded-full font-semibold hover:bg-white/90 transition-all duration-200 mt-4">
                      <Play className="w-5 h-5" />
                      Watch Now
                    </button>
                  </div>

                  {/* Thumbnail Display */}
                  <div className="hidden lg:flex items-center justify-center">
                    <div className="w-32 h-32 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center text-6xl">
                      {item.thumbnail}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dots Indicator */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 z-10">
          {filteredItems.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                currentSlide === index 
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
