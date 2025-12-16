import React, { useState, useRef } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { Heart, X, Sparkles, MapPin, Users, TrendingUp, Star, Filter, RefreshCw, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { MatchSuggestion, CreatorProfile } from "@/types/matching.types";
import Image from "next/image";
interface MatchingInterfaceProps {
  userProfile: CreatorProfile;
  matches: MatchSuggestion[];
  history: MatchSuggestion[]; // reserved for future use
  handleAction: (matchId: string | number, action: "like" | "pass" | "view") => Promise<void>;
  handleBlock: (userId: string | number) => Promise<void>;
}

const MatchingInterface: React.FC<MatchingInterfaceProps> = ({
  // userProfile, // not used yet but kept for future header/profile panel
  matches,
  handleAction,
}) => {
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const cardRef = useRef<HTMLDivElement | null>(null);
  const currentMatch = matches[currentMatchIndex];

  const advanceIndex = () => {
    // Keep index in range after parent removes a match
    setCurrentMatchIndex((prev) => {
      const nextLen = matches.length > 0 ? matches.length : 1;
      const next = (prev + 1) % nextLen;
      return next;
    });
  };

  const handleSwipe = async (direction: "left" | "right") => {
    if (!currentMatch) return;
    const action = direction === "right" ? "like" : "pass";
    await handleAction(currentMatch._id, action);
    advanceIndex();
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100;
    if (info.offset.x > threshold) handleSwipe("right");
    else if (info.offset.x < -threshold) handleSwipe("left");
  };

  const refreshMatches = async () => {
    setIsRefreshing(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIsRefreshing(false);
    setCurrentMatchIndex(0);
  };

  if (!currentMatch) {
    return (
      <div className="flex flex-col justify-center items-center h-full text-gray-500">
        No matches available
      </div>
    );
  }

  // ⬇️ Guard: targetProfile is optional in types
  const profile = currentMatch.targetProfile;
  if (!profile) {
    return (
      <div className="flex flex-col justify-center items-center h-full text-gray-500">
        This suggestion is missing profile data.
      </div>
    );
  }

  const locationStr = [profile.location?.city, profile.location?.state, profile.location?.country]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="flex flex-col mx-auto max-w-md h-screen bg-gray-50">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3 bg-white shadow-sm">
        <h1 className="text-xl font-bold text-gray-800">Discover</h1>
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" onClick={refreshMatches} disabled={isRefreshing}>
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
          <Dialog open={showFilters} onOpenChange={setShowFilters}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <Filter className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Filter Matches</DialogTitle>
              </DialogHeader>
              {/* TODO: Add FilterPanel if/when you wire filters */}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative flex-1 p-4">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentMatch._id}
            ref={cardRef}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.1}
            onDragEnd={handleDragEnd}
            className="absolute inset-0"
          >
            <Card className="overflow-hidden h-full bg-white border-0 shadow-2xl">
              {/* Top section */}
              <div className="relative h-64 bg-linear-to-br from-purple-400 to-pink-400">
                <div className="absolute inset-0 bg-black/20" />
                <Avatar className="absolute top-4 left-4 w-16 h-16 border-4 border-white">
                  <Image
                    src={profile.avatar || "/placeholder-avatar.png"}
                    alt={profile.displayName}
                    width={64}
                    height={64}
                    className="object-cover"
                  />
                </Avatar>

                <div className="flex absolute top-4 right-4 space-x-2">
                  <Badge variant="secondary" className="font-semibold text-purple-700 bg-white/90">
                    <Star className="mr-1 w-3 h-3" />
                    {profile.rizzScore ?? "—"}
                  </Badge>
                  <Badge variant="secondary" className="font-semibold text-green-700 bg-white/90">
                    {currentMatch.compatibilityScore}% Match
                  </Badge>
                </div>

                <div className="absolute right-4 bottom-4 left-4 text-white">
                  <h2 className="text-2xl font-bold">{profile.displayName}</h2>
                  <p className="text-purple-100">{profile.username}</p>
                  {locationStr && (
                    <div className="flex items-center mt-2 text-sm">
                      <MapPin className="mr-1 w-3 h-3" />
                      {locationStr}
                    </div>
                  )}
                </div>
              </div>

              <CardContent className="p-4 space-y-4">
                {profile.bio && <p className="text-sm leading-relaxed text-gray-700">{profile.bio}</p>}

                {/* Niches */}
                {!!profile.niche?.length && (
                  <div className="flex flex-wrap gap-2">
                    {profile.niche.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 py-2 border-t">
                  <div className="text-center">
                    <div className="flex justify-center items-center">
                      <Users className="mr-1 w-4 h-4 text-blue-500" />
                      <span className="text-sm font-semibold">
                        {(profile.stats.totalFollowers / 1000).toFixed(0)}K
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">Followers</span>
                  </div>
                  <div className="text-center">
                    <div className="flex justify-center items-center">
                      <TrendingUp className="mr-1 w-4 h-4 text-green-500" />
                      <span className="text-sm font-semibold">{profile.stats.avgEngagement}%</span>
                    </div>
                    <span className="text-xs text-gray-500">Engagement</span>
                  </div>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="compatibility" className="w-full">
                  <TabsList className="grid grid-cols-2 w-full">
                    <TabsTrigger value="compatibility">Compatibility</TabsTrigger>
                    <TabsTrigger value="insights">Insights</TabsTrigger>
                  </TabsList>

                  <TabsContent value="compatibility" className="mt-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Niche Match</span>
                      <span className="font-semibold">
                        {currentMatch.scoreBreakdown.nicheCompatibility}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Audience Overlap</span>
                      <span className="font-semibold">
                        {currentMatch.scoreBreakdown.audienceOverlap}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Engagement Style</span>
                      <span className="font-semibold">
                        {currentMatch.scoreBreakdown.engagementStyle}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Location</span>
                      <span className="font-semibold">
                        {currentMatch.scoreBreakdown.geolocation}%
                      </span>
                    </div>
                  </TabsContent>

                  <TabsContent value="insights" className="mt-4">
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Sparkles className="mr-2 w-4 h-4 text-yellow-500" />
                        <span className="text-gray-600">AI Confidence:</span>
                        <span className="ml-1 font-semibold">
                          {Math.round(currentMatch.metadata.confidence * 100)}%
                        </span>
                      </div>
                      {!!currentMatch.metadata.features?.length && (
                        <div>
                          <p className="text-sm font-medium">Key Highlights:</p>
                          {currentMatch.metadata.features.map((f, i) => (
                            <div key={i} className="text-xs text-gray-600">
                              • {f}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        <div className="absolute right-4 left-4 bottom-20 text-center">
          <p className="text-xs text-gray-500">Swipe right to like • Swipe left to pass</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center p-4 space-x-8 bg-white shadow-lg">
        <Button
          variant="outline"
          size="lg"
          className="w-16 h-16 rounded-full border-2 border-red-200 hover:border-red-300 hover:bg-red-50"
          onClick={() => handleSwipe("left")}
        >
          <X className="w-8 h-8 text-red-500" />
        </Button>

        <Button
          variant="outline"
          size="lg"
          className="w-20 h-20 rounded-full border-2 border-purple-200 hover:border-purple-300 hover:bg-purple-50"
        // optional: super-like action here
        >
          <Zap className="w-10 h-10 text-purple-500" />
        </Button>

        <Button
          variant="outline"
          size="lg"
          className="w-16 h-16 rounded-full border-2 border-green-200 hover:border-green-300 hover:bg-green-50"
          onClick={() => handleSwipe("right")}
        >
          <Heart className="w-8 h-8 text-green-500" />
        </Button>
      </div>
    </div>
  );
};

export default MatchingInterface;