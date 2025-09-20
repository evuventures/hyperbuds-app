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
  history,
  handleAction,
  handleBlock,
}) => {
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const cardRef = useRef<HTMLDivElement | null>(null);
  const currentMatch = matches[currentMatchIndex];

  const advanceIndex = (removedId?: string) => {
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
    advanceIndex(currentMatch._id);
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
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        No matches available
      </div>
    );
  }

  // ⬇️ Guard: targetProfile is optional in types
  const profile = currentMatch.targetProfile;
  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        This suggestion is missing profile data.
      </div>
    );
  }

  const locationStr = [profile.location?.city, profile.location?.state, profile.location?.country]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="max-w-md mx-auto h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm px-4 py-3 flex items-center justify-between">
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
      <div className="flex-1 p-4 relative">
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
            <Card className="h-full overflow-hidden bg-white shadow-2xl border-0">
              {/* Top section */}
              <div className="relative h-64 bg-gradient-to-br from-purple-400 to-pink-400">
                <div className="absolute inset-0 bg-black/20" />
                <Avatar className="absolute top-4 left-4 w-16 h-16 border-4 border-white">
                  <img
                    src={profile.avatar || "/placeholder-avatar.png"}
                    alt={profile.displayName}
                    className="object-cover"
                  />
                </Avatar>

                <div className="absolute top-4 right-4 flex space-x-2">
                  <Badge variant="secondary" className="bg-white/90 text-purple-700 font-semibold">
                    <Star className="w-3 h-3 mr-1" />
                    {profile.rizzScore ?? "—"}
                  </Badge>
                  <Badge variant="secondary" className="bg-white/90 text-green-700 font-semibold">
                    {currentMatch.compatibilityScore}% Match
                  </Badge>
                </div>

                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h2 className="text-2xl font-bold">{profile.displayName}</h2>
                  <p className="text-purple-100">{profile.username}</p>
                  {locationStr && (
                    <div className="flex items-center mt-2 text-sm">
                      <MapPin className="w-3 h-3 mr-1" />
                      {locationStr}
                    </div>
                  )}
                </div>
              </div>

              <CardContent className="p-4 space-y-4">
                {profile.bio && <p className="text-gray-700 text-sm leading-relaxed">{profile.bio}</p>}

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
                    <div className="flex items-center justify-center">
                      <Users className="w-4 h-4 mr-1 text-blue-500" />
                      <span className="text-sm font-semibold">
                        {(profile.stats.totalFollowers / 1000).toFixed(0)}K
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">Followers</span>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 mr-1 text-green-500" />
                      <span className="text-sm font-semibold">{profile.stats.avgEngagement}%</span>
                    </div>
                    <span className="text-xs text-gray-500">Engagement</span>
                  </div>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="compatibility" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="compatibility">Compatibility</TabsTrigger>
                    <TabsTrigger value="insights">Insights</TabsTrigger>
                  </TabsList>

                  <TabsContent value="compatibility" className="space-y-2 mt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Niche Match</span>
                      <span className="font-semibold">
                        {currentMatch.scoreBreakdown.nicheCompatibility}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Audience Overlap</span>
                      <span className="font-semibold">
                        {currentMatch.scoreBreakdown.audienceOverlap}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Engagement Style</span>
                      <span className="font-semibold">
                        {currentMatch.scoreBreakdown.engagementStyle}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Location</span>
                      <span className="font-semibold">
                        {currentMatch.scoreBreakdown.geolocation}%
                      </span>
                    </div>
                  </TabsContent>

                  <TabsContent value="insights" className="mt-4">
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Sparkles className="w-4 h-4 mr-2 text-yellow-500" />
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

        <div className="absolute bottom-20 left-4 right-4 text-center">
          <p className="text-xs text-gray-500">Swipe right to like • Swipe left to pass</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white p-4 flex justify-center space-x-8 shadow-lg">
        <Button
          variant="outline"
          size="lg"
          className="rounded-full w-16 h-16 border-2 border-red-200 hover:border-red-300 hover:bg-red-50"
          onClick={() => handleSwipe("left")}
        >
          <X className="w-8 h-8 text-red-500" />
        </Button>

        <Button
          variant="outline"
          size="lg"
          className="rounded-full w-20 h-20 border-2 border-purple-200 hover:border-purple-300 hover:bg-purple-50"
          // optional: super-like action here
        >
          <Zap className="w-10 h-10 text-purple-500" />
        </Button>

        <Button
          variant="outline"
          size="lg"
          className="rounded-full w-16 h-16 border-2 border-green-200 hover:border-green-300 hover:bg-green-50"
          onClick={() => handleSwipe("right")}
        >
          <Heart className="w-8 h-8 text-green-500" />
        </Button>
      </div>
    </div>
  );
};

export default MatchingInterface;
