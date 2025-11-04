import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PlatformStats } from "@/components/collaboration/PlatformStats";
import { useMultiplePlatformData, useCombinedPlatformMetrics } from "@/hooks/features/usePlatformData";
import {
  User,

  Mail,

  MoreHorizontal,

  Users,
  TrendingUp,
  Star,

  Target,
  Activity,

  Share2,
  Heart,
  MessageCircle,

  Copy,
  Check,
  ExternalLink,
  Verified,
  Sparkles,
  UserCheck,
  PartyPopper,
  Info,
  Database,
} from "lucide-react";
import Link from "next/link";

// Enhanced Loading skeleton component
const LoadingSkeleton = () => (
  <div className="bg-gray-50 transition-all dark:bg-gray-900">
    <div className="p-8 bg-white rounded-3xl border border-gray-200 shadow-lg backdrop-blur-sm transition-all dark:bg-gray-800/50 dark:border-gray-700/50">
      <div className="flex justify-between items-start mb-8">
        <div className="flex gap-6 items-center">
          <div className="w-32 h-32 bg-gray-300 rounded-3xl animate-pulse dark:bg-gray-700"></div>
          <div className="space-y-4">
            <div className="w-72 h-12 bg-gray-300 rounded-lg animate-pulse dark:bg-gray-700"></div>
            <div className="w-48 h-6 bg-gray-300 rounded animate-pulse dark:bg-gray-700"></div>
            <div className="w-96 h-5 bg-gray-300 rounded animate-pulse dark:bg-gray-700"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Enhanced User Profile Header Component
export default function UserProfileHeader({
  userData,
  isLoading = false,
  isOwnProfile = false,
  onEditProfile,
  onConnect,
  onMessage,
}) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showFullBio, setShowFullBio] = useState(false);
  const [open, setOpen] = useState(false);

  // Platform data fetching for stats
  const [platformCredentials, setPlatformCredentials] = useState({});
  const [platforms, setPlatforms] = useState([]);

  // Extract platform credentials from social links
  useEffect(() => {
    if (userData?.profile?.socialLinks) {
      const socialLinks = userData.profile.socialLinks;
      const creds = {};
      const platformList = [];

      // Extract TikTok username from URL
      if (socialLinks.tiktok) {
        const match = socialLinks.tiktok.match(/tiktok\.com\/@?([^/?]+)/);
        if (match) {
          creds.tiktok = match[1];
          platformList.push({ type: 'tiktok', username: match[1] });
        }
      }

      // Extract Twitter username from URL
      if (socialLinks.twitter) {
        const match = socialLinks.twitter.match(/(?:twitter|x)\.com\/([^/?]+)/);
        if (match) {
          creds.twitter = match[1];
          platformList.push({ type: 'twitter', username: match[1] });
        }
      }

      // Extract Twitch username from URL
      if (socialLinks.twitch) {
        const match = socialLinks.twitch.match(/twitch\.tv\/([^/?]+)/);
        if (match) {
          creds.twitch = match[1];
          platformList.push({ type: 'twitch', username: match[1] });
        }
      }

      // Extract Instagram username from URL
      if (socialLinks.instagram) {
        const match = socialLinks.instagram.match(/instagram\.com\/([^/?]+)/);
        if (match) {
          creds.instagram = match[1];
          platformList.push({ type: 'instagram', username: match[1] });
        }
      }

      // Extract YouTube username from URL
      if (socialLinks.youtube) {
        const match = socialLinks.youtube.match(/(?:youtube\.com\/@|youtube\.com\/c\/)([^/?]+)/) ||
                     socialLinks.youtube.match(/youtube\.com\/user\/([^/?]+)/);
        if (match) {
          creds.youtube = match[1];
          platformList.push({ type: 'youtube', username: match[1] });
        }
      }

      setPlatformCredentials(creds);
      setPlatforms(platformList);
    }
  }, [userData?.profile?.socialLinks]);

  // Fetch platform data only if we have platforms
  const { data: platformData, loading: platformLoading } = useMultiplePlatformData(platforms, { enabled: platforms.length > 0 });
  const combinedMetrics = useCombinedPlatformMetrics(platformData);

  const handleNavigateToRizzScore = () => {
    router.push("/profile/rizz-score");
  };

  // Show loading skeleton if no userData or isLoading is true
  if (isLoading || !userData || !userData.profile) {
    return <LoadingSkeleton />;
  }

  const user = userData.profile || userData;

  const formatLocation = (location) => {
    if (!location) return "Location not provided";
    return `${location.city}, ${location.state}, ${location.country}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatShortDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const copyProfileUrl = async () => {
    try {
      await navigator.clipboard.writeText(user.profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleConnect = () => {
    setIsFollowing(!isFollowing);
    onConnect?.(user.id);
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header Profile Card */}

      <div className="overflow-hidden relative bg-gradient-to-br from-white to-white rounded-3xl border shadow-xl backdrop-blur-sm via-gray-50/50 dark:from-gray-800 dark:via-gray-800/80 dark:to-gray-900 border-gray-200/60 dark:border-gray-700/60">
        {/* Decorative Background Pattern */}
        <div className="absolute inset-0 opacity-5 dark:opacity-10">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-gradient-to-tr from-pink-500 to-blue-500 rounded-full blur-3xl"></div>
        </div>

        <div className="relative p-4 sm:p-6 md:p-8">
          {/* Quick Actions Menu - Mobile First */}
          <div className="flex gap-2 justify-end items-center mb-8 pb-4 border-b border-gray-200 dark:border-gray-700 md:hidden">
            <button
              onClick={copyProfileUrl}
              className="p-3 text-gray-600 rounded-xl border shadow-md transition-all cursor-pointer hover:scale-105 bg-gray-100/80 dark:bg-gray-700/60 hover:bg-gray-200 dark:hover:bg-gray-600/80 dark:text-gray-300 border-gray-200/50 dark:border-gray-600/50 group"
              title="Copy profile URL"
            >
              {copied ? (
                <Check size={18} className="text-green-500" />
              ) : (
                <Copy size={18} />
              )}
            </button>

            <button className="p-3 text-gray-600 rounded-xl border shadow-md transition-all cursor-pointer hover:scale-105 bg-gray-100/80 dark:bg-gray-700/60 hover:bg-gray-200 dark:hover:bg-gray-600/80 dark:text-gray-300 border-gray-200/50 dark:border-gray-600/50">
              <Share2 size={18} />
            </button>

            {isOwnProfile && (
              <div className="relative">
                {/* Trigger button */}
                <button
                  onClick={() => setOpen(!open)}
                  className="p-3 text-gray-600 rounded-xl border shadow-md transition-all cursor-pointer hover:scale-105 bg-gray-100/80 dark:bg-gray-700/60 hover:bg-gray-200 dark:hover:bg-gray-600/80 dark:text-gray-300 border-gray-200/50 dark:border-gray-600/50"
                >
                  <MoreHorizontal size={18} />
                </button>

                {/* Dropdown menu */}
                {open && (
                  <div className="absolute right-0 z-50 mt-2 w-40 bg-white rounded-md ring-1 shadow-lg dark:bg-gray-800 ring-black/5">
                    <Link
                      href="/profile/edit"
                      className="block px-4 py-2 text-sm text-gray-700 rounded-md cursor-pointer dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Edit Profile
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col justify-between items-start mb-8 mt-4 md:mt-0 md:flex-row">

            <div className="flex flex-row gap-4 sm:gap-6 md:gap-8 items-start w-full md:items-center md:w-auto">

              {/* Enhanced Avatar*/}
              <div className="relative flex-shrink-0">
                <div className="flex justify-center items-center text-3xl font-bold text-white bg-gradient-to-br from-blue-400 via-purple-500 to-pink-400 rounded-3xl ring-4 ring-white ring-offset-4 ring-offset-gray-50 shadow-2xl transition-all w-28 h-28 sm:w-32 sm:h-32 md:w-32 md:h-32 dark:from-blue-500 dark:via-purple-600 dark:to-pink-500 dark:ring-gray-800 dark:ring-offset-gray-900">
                  {user.displayName?.charAt(0) ||
                    user.username?.charAt(0) ||
                    "U"}
                </div>

                {/* Status Indicators */}
                {user.isActive && (
                  <div className="flex absolute -right-2 -bottom-2 justify-center items-center w-10 h-10 bg-green-500 rounded-full border-4 border-white shadow-xl animate-pulse dark:border-gray-800">
                    <Activity size={14} className="text-white" />
                  </div>
                )}

                {user.isVerified && (
                  <div className="flex absolute -top-2 -right-2 justify-center items-center w-10 h-10 bg-blue-500 rounded-full border-4 border-white shadow-xl dark:border-gray-800">
                    <Verified size={14} className="text-white fill-current" />
                  </div>
                )}
              </div>

              {/* Enhanced User Information */}
              <div className="flex-1 space-y-3 text-left w-full md:w-auto">
                <div>
                  <div className="flex gap-3 justify-start items-center mb-2 mt-2 md:mt-0">
                    <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-300">
                      {user.displayName || user.username}
                    </h1>
                    {user.isVerified && (
                      <Verified
                        size={24}
                        className="text-blue-500 fill-current"
                      />
                    )}
                  </div>

                  <div className="flex gap-2 justify-start items-center mb-3 flex-row flex-wrap md:gap-4">
                    <p className="text-base sm:text-lg font-medium text-blue-600 transition-colors cursor-pointer dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                      @{user.username}
                    </p>
                    <div
                      className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${user.isActive
                        ? "bg-green-50 dark:bg-green-500/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-500/30"
                        : "bg-gray-50 dark:bg-gray-500/20 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-500/30"
                        }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${user.isActive
                          ? "bg-green-500 animate-pulse"
                          : "bg-gray-400"
                          }`}
                      ></div>
                      {user.isActive ? "Online" : "Offline"}
                    </div>
                  </div>
                </div>

                {user.bio && (
                  <div className="max-w-2xl">
                    <p
                      className={`text-base md:text-lg leading-relaxed text-gray-600 dark:text-gray-300 transition-all ${showFullBio ? "" : "line-clamp-2"}`}
                    >
                      {user.bio}
                    </p>
                    {user.bio.length > 150 && (
                      <button
                        onClick={() => setShowFullBio(!showFullBio)}
                        className="mt-1 text-sm font-medium text-blue-600 transition-colors dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                      >
                        {showFullBio ? "Show less" : "Show more"}
                      </button>
                    )}
                  </div>
                )}

              </div>
            </div>

            {/* Quick Actions Menu - Desktop Only */}
            <div className="hidden gap-2 justify-end items-center md:flex">
              <button
                onClick={copyProfileUrl}
                className="p-3 text-gray-600 rounded-xl border shadow-md transition-all cursor-pointer hover:scale-105 bg-gray-100/80 dark:bg-gray-700/60 hover:bg-gray-200 dark:hover:bg-gray-600/80 dark:text-gray-300 border-gray-200/50 dark:border-gray-600/50 group"
                title="Copy profile URL"
              >
                {copied ? (
                  <Check size={18} className="text-green-500" />
                ) : (
                  <Copy size={18} />
                )}
              </button>

              <button className="p-3 text-gray-600 rounded-xl border shadow-md transition-all cursor-pointer hover:scale-105 bg-gray-100/80 dark:bg-gray-700/60 hover:bg-gray-200 dark:hover:bg-gray-600/80 dark:text-gray-300 border-gray-200/50 dark:border-gray-600/50">
                <Share2 size={18} />
              </button>

              {isOwnProfile && (
                <div className="relative">
                  {/* Trigger button */}
                  <button
                    onClick={() => setOpen(!open)}
                    className="p-3 text-gray-600 rounded-xl border shadow-md transition-all cursor-pointer hover:scale-105 bg-gray-100/80 dark:bg-gray-700/60 hover:bg-gray-200 dark:hover:bg-gray-600/80 dark:text-gray-300 border-gray-200/50 dark:border-gray-600/50"
                  >
                    <MoreHorizontal size={18} />
                  </button>

                  {/* Dropdown menu */}
                  {open && (
                    <div className="absolute right-0 z-50 mt-2 w-40 bg-white rounded-md ring-1 shadow-lg dark:bg-gray-800 ring-black/5">
                      <Link
                        href="/profile/edit"
                        className="block px-4 py-2 text-sm text-gray-700 rounded-md cursor-pointer dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Edit Profile
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* Enhanced Meta Information */}
          <div className="mt-0 md:mt-0 flex flex-col gap-3 items-start my-5 text-sm md:flex-row">
            <div className="flex gap-2 items-center text-gray-500 dark:text-gray-400">
              <PartyPopper size={16} className="text-purple-500" />
              <span>Joined {formatShortDate(user.createdAt)}</span>
            </div>

            <div className="flex gap-2 items-center text-gray-500 dark:text-gray-400">
              <UserCheck size={16} className="text-green-500" />
              <span>{user.isPublic ? "Public" : "Private"} Profile</span>
            </div>

            <div className="flex gap-2 items-center text-gray-500 dark:text-gray-400">
              <Sparkles size={16} className="text-blue-500" />
              <span>
                {user.location
                  ? formatLocation(user.location)
                  : "Anywhere"}
              </span>
            </div>
          </div>


          {/* Enhanced Action Buttons */}
          {isOwnProfile ? (
            <div className="flex justify-start">
              <Link href="/matching">
                <button className="flex gap-2 justify-center items-center px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-lg transition-all transform cursor-pointer hover:scale-105 hover:from-purple-600 hover:to-pink-600 dark:from-purple-600 dark:to-pink-600 dark:hover:from-purple-700 dark:hover:to-pink-700 hover:shadow-xl">
                  <Heart size={18} />
                  Get Match
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 w-full md:grid-cols-3">
              <button
                onClick={handleConnect}
                className={`px-8 py-4 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-xl hover:shadow-2xl flex items-center gap-3 justify-center ${isFollowing
                  ? "text-gray-700 bg-gray-200 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                  : "text-white bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-600 dark:to-purple-600 hover:from-blue-600 hover:to-purple-600 dark:hover:from-blue-700 dark:hover:to-purple-700"
                  }`}
              >
                {isFollowing ? (
                  <>
                    <Check size={20} />
                    Following
                  </>
                ) : (
                  <>
                    <User size={20} />
                    Connect
                  </>
                )}
              </button>

              <button
                onClick={() => onMessage?.(user.id)}
                className="flex gap-3 justify-center items-center px-6 py-4 font-semibold text-gray-700 bg-white rounded-xl border-2 border-gray-200 shadow-lg transition-all hover:scale-105 dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
              >
                <MessageCircle size={20} />
                Message
              </button>

              <button className="flex gap-3 justify-center items-center px-6 py-4 font-semibold text-gray-700 bg-white rounded-xl border-2 border-gray-200 shadow-lg transition-all hover:scale-105 dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500">
                <Mail size={20} />
                Email
              </button>
            </div>
          )}
        </div>
      </div >

      {/* Enhanced Stats Overview with Animation */}
      {
        user.stats && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 md:grid-cols-4">
            {[
              {
                label: "Total Followers",
                value: platformLoading ? "..." : (combinedMetrics.totalFollowers > 0 ? combinedMetrics.totalFollowers.toLocaleString() : (user.stats?.totalFollowers?.toLocaleString() || "0")),
                color: "blue",
                icon: Users,
                change: "+12%",
                isFromAPI: !platformLoading && combinedMetrics.totalFollowers > 0,
                isFromFallback: !platformLoading && combinedMetrics.totalFollowers === 0 && user.stats?.totalFollowers > 0,
              },
              {
                label: "Engagement Rate",
                value: platformLoading ? "..." : (combinedMetrics.averageEngagementRate > 0 ? `${combinedMetrics.averageEngagementRate.toFixed(1)}%` : `${user.stats?.avgEngagement || "0"}%`),
                color: "green",
                icon: TrendingUp,
                change: "+5%",
                isFromAPI: !platformLoading && combinedMetrics.averageEngagementRate > 0,
                isFromFallback: !platformLoading && combinedMetrics.averageEngagementRate === 0 && user.stats?.avgEngagement > 0,
              },
              {
                label: "Rizz Score",
                value: user.rizzScore || "0",
                color: "purple",
                icon: Star,
                change: "+8%",
              },
              {
                label: "Content Niches",
                value: user.niche?.length || "0",
                color: "orange",
                icon: Target,
                change: null,
              },
            ].map((stat, index) => (
              <div
                key={stat.label}
                className={`group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800/50 border border-gray-200/60 dark:border-gray-700/60 p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] backdrop-blur-sm ${stat.label === "Rizz Score" && isOwnProfile ? "cursor-pointer" : ""
                  }`}
                onClick={stat.label === "Rizz Score" && isOwnProfile ? handleNavigateToRizzScore : undefined}
              >
                <div className="flex justify-between items-center mb-3 sm:mb-4">
                  <div
                    className={`p-2 sm:p-3 rounded-xl bg-gradient-to-br flex-shrink-0 ${stat.color === "blue"
                      ? "from-blue-100 to-blue-200 dark:from-blue-500/20 dark:to-blue-600/20"
                      : stat.color === "green"
                        ? "from-green-100 to-green-200 dark:from-green-500/20 dark:to-green-600/20"
                        : stat.color === "purple"
                          ? "from-purple-100 to-purple-200 dark:from-purple-500/20 dark:to-purple-600/20"
                          : "from-orange-100 to-orange-200 dark:from-orange-500/20 dark:to-orange-600/20"
                      }`}
                  >
                    <stat.icon
                      size={20}
                      className={`sm:w-6 sm:h-6 ${stat.color === "blue"
                        ? "text-blue-600 dark:text-blue-400"
                        : stat.color === "green"
                          ? "text-green-600 dark:text-green-400"
                          : stat.color === "purple"
                            ? "text-purple-600 dark:text-purple-400"
                            : "text-orange-600 dark:text-orange-400"
                        }`}
                    />
                  </div>
                  <div className="flex gap-2 items-center">
                    {stat.change && (
                      <span className="flex-shrink-0 px-2 py-1 text-xs font-medium text-green-600 bg-green-50 rounded-full dark:text-green-400 dark:bg-green-500/20">
                        {stat.change}
                      </span>
                    )}
                    {/* Data Source Indicator */}
                    {stat.isFromFallback && (stat.label === "Total Followers" || stat.label === "Engagement Rate") && (
                      <div className="group/indicator relative">
                        <div className="flex items-center justify-center w-5 h-5 text-gray-400 transition-colors cursor-help hover:text-amber-500 dark:text-gray-500 dark:hover:text-amber-400">
                          <Database size={14} />
                        </div>
                        <div className="absolute right-0 top-6 z-10 hidden w-48 p-2 text-xs text-white bg-gray-900 rounded-lg shadow-lg group-hover/indicator:block dark:bg-gray-800">
                          <div className="flex items-center gap-2">
                            <Database size={12} className="text-amber-400" />
                            <span>From stored profile data</span>
                          </div>
                          <div className="mt-1 text-xs text-gray-400">
                            Connect platforms for real-time updates
                          </div>
                        </div>
                      </div>
                    )}
                    {stat.isFromAPI && (stat.label === "Total Followers" || stat.label === "Engagement Rate") && (
                      <div className="group/indicator relative">
                        <div className="flex items-center justify-center w-5 h-5 text-green-500 transition-colors cursor-help hover:text-green-600 dark:text-green-400 dark:hover:text-green-300">
                          <Info size={14} />
                        </div>
                        <div className="absolute right-0 top-6 z-10 hidden w-48 p-2 text-xs text-white bg-gray-900 rounded-lg shadow-lg group-hover/indicator:block dark:bg-gray-800">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span>Live data from platforms</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div
                  className={`text-2xl sm:text-3xl font-bold mb-2 break-words overflow-visible ${stat.color === "blue"
                    ? "text-blue-600 dark:text-blue-400"
                    : stat.color === "green"
                      ? "text-green-600 dark:text-green-400"
                      : stat.color === "purple"
                        ? "text-purple-600 dark:text-purple-400"
                        : "text-orange-600 dark:text-orange-400"
                    }`}
                >
                  {stat.value}
                </div>
                <div className="flex flex-col gap-2 justify-between">
                  <div className="self-start text-sm font-medium text-gray-500 dark:text-gray-400">
                    {stat.label}
                  </div>
                  {stat.label === "Rizz Score" && isOwnProfile && (
                    <div className="flex self-end">
                      <div className="flex items-center text-xs font-medium text-purple-500 opacity-0 transition-opacity duration-200 dark:text-purple-400 group-hover:opacity-100">
                        View Details →
                      </div>
                    </div>
                  )}
                </div>

                {/* Hover Effect Background */}
                <div
                  className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity bg-gradient-to-br ${stat.color === "blue"
                    ? "from-blue-500 to-blue-700"
                    : stat.color === "green"
                      ? "from-green-500 to-green-700"
                      : stat.color === "purple"
                        ? "from-purple-500 to-purple-700"
                        : "from-orange-500 to-orange-700"
                    }`}
                ></div>
              </div>
            ))}
          </div>
        )
      }

      {/* Enhanced Content Niches */}
      {
        user.niche && user.niche.length > 0 && (
          <div className="p-6 bg-white rounded-2xl border shadow-lg backdrop-blur-sm dark:bg-gray-800/50 border-gray-200/60 dark:border-gray-700/60">
            <h3 className="flex gap-3 items-center mb-6 text-xl font-bold text-gray-900 dark:text-gray-100">
              <div className="p-2 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg dark:from-blue-500/20 dark:to-purple-500/20">
                <Target size={24} className="text-blue-600 dark:text-blue-400" />
              </div>
              Content Specializations
            </h3>
            <div className="flex flex-wrap gap-3">
              {user.niche.map((tag, index) => (
                <span
                  key={index}
                  className="px-4 py-3 text-sm font-medium text-blue-700 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-xl border transition-all cursor-pointer group hover:scale-105 dark:from-blue-500/10 dark:via-purple-500/10 dark:to-pink-500/10 dark:text-blue-300 border-blue-200/50 dark:border-blue-500/30 hover:border-blue-300 dark:hover:border-blue-400/50 hover:shadow-lg"
                >
                  <span className="transition-all group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text">
                    #{tag}
                  </span>
                </span>
              ))}
            </div>
          </div>
        )
      }

      {/* Enhanced Contact Information 
      <div className="p-6 bg-white rounded-2xl border shadow-lg backdrop-blur-sm dark:bg-gray-800/50 border-gray-200/60 dark:border-gray-700/60">
        <h3 className="flex gap-3 items-center mb-6 text-xl font-bold text-gray-900 dark:text-gray-100">
          <div className="p-2 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg dark:from-green-500/20 dark:to-blue-500/20">
            <User size={24} className="text-green-600 dark:text-green-400" />
          </div>
          Contact Information
        </h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: Phone,
              label: "Phone Number",
              value: user.phone,
              color: "blue",
            },
            {
              icon: Mail,
              label: "Email Address",
              value: user.email,
              color: "green",
            },
            {
              icon: Globe,
              label: "Website",
              value: user.website,
              color: "purple",
              isLink: true,
            },
          ]
            .filter((item) => item.value)
            .map((contact, index) => (
              <div
                key={index}
                className="group p-5 rounded-xl transition-all hover:scale-[1.02] bg-gray-50/80 dark:bg-gray-700/40 border border-gray-200 dark:border-gray-600/50 hover:border-gray-300 dark:hover:border-gray-500/70 hover:shadow-lg"
              >
                <div className="flex gap-4 items-center">
                  <div
                    className={`p-4 rounded-xl bg-gradient-to-br ${contact.color === "blue"
                      ? "from-blue-100 to-blue-200 dark:from-blue-500/20 dark:to-blue-600/30"
                      : contact.color === "green"
                        ? "from-green-100 to-green-200 dark:from-green-500/20 dark:to-green-600/30"
                        : "from-purple-100 to-purple-200 dark:from-purple-500/20 dark:to-purple-600/30"
                      } group-hover:scale-110 transition-transform`}
                  >
                    <contact.icon
                      size={24}
                      className={`${contact.color === "blue"
                        ? "text-blue-600 dark:text-blue-400"
                        : contact.color === "green"
                          ? "text-green-600 dark:text-green-400"
                          : "text-purple-600 dark:text-purple-400"
                        }`}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="mb-1 text-xs font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                      {contact.label}
                    </div>
                    {contact.isLink ? (
                      <a
                        href={
                          contact.value.startsWith("http")
                            ? contact.value
                            : `https://${contact.value}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex gap-2 items-center text-base font-semibold text-gray-900 transition-colors dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        {contact.value}
                        <ExternalLink size={14} />
                      </a>
                    ) : (
                      <div className="text-base font-semibold text-gray-900 dark:text-gray-100">
                        {contact.value}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>*/}

      {/* Social Media Links */}
      {user.socialLinks && Object.keys(user.socialLinks).length > 0 && (
        <div className="p-6 bg-white rounded-2xl border shadow-lg backdrop-blur-sm dark:bg-gray-800/50 border-gray-200/60 dark:border-gray-700/60">
          <h3 className="flex gap-3 items-center mb-6 text-xl font-bold text-gray-900 dark:text-gray-100">
            <div className="p-2 bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg dark:from-pink-500/20 dark:to-purple-500/20">
              <Share2 size={24} className="text-pink-600 dark:text-pink-400" />
            </div>
            Social Media
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(user.socialLinks).map(([platform, url]) => {
              const platformInfo = {
                tiktok: { name: "TikTok", color: "from-black to-gray-800", icon: "🎵" },
                instagram: { name: "Instagram", color: "from-pink-500 to-purple-600", icon: "📷" },
                youtube: { name: "YouTube", color: "from-red-500 to-red-700", icon: "📺" },
                twitch: { name: "Twitch", color: "from-purple-500 to-purple-700", icon: "🎮" },
                twitter: { name: "Twitter", color: "from-blue-400 to-blue-600", icon: "🐦" },
              };

              const info = platformInfo[platform] || { name: platform, color: "from-gray-500 to-gray-700", icon: "🔗" };

              return (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group p-4 rounded-xl transition-all hover:scale-[1.02] bg-gray-50/80 dark:bg-gray-700/40 border border-gray-200 dark:border-gray-600/50 hover:border-gray-300 dark:hover:border-gray-500/70 hover:shadow-lg"
                >
                  <div className="flex gap-3 items-center">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${info.color} group-hover:scale-110 transition-transform`}>
                      <span className="text-lg text-white">{info.icon}</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {info.name}
                      </div>
                      <div className="text-xs text-gray-500 truncate dark:text-gray-400">
                        {url.replace('https://', '').replace('http://', '')}
                      </div>
                    </div>
                    <ExternalLink size={16} className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* Enhanced Platform Performance */}
      {user?.profile?.socialLinks && (() => {
        // Extract usernames from social links URLs for connected platforms only
        const platformCreds = {};
        const socialLinks = user.profile.socialLinks;

        // Extract TikTok username from URL
        if (socialLinks.tiktok) {
          const match = socialLinks.tiktok.match(/tiktok\.com\/@?([^/?]+)/);
          if (match) {
            platformCreds.tiktok = match[1];
          }
        }

        // Extract Twitter username from URL
        if (socialLinks.twitter) {
          const match = socialLinks.twitter.match(/(?:twitter|x)\.com\/([^/?]+)/);
          if (match) {
            platformCreds.twitter = match[1];
          }
        }

        // Extract Twitch username from URL
        if (socialLinks.twitch) {
          const match = socialLinks.twitch.match(/twitch\.tv\/([^/?]+)/);
          if (match) {
            platformCreds.twitch = match[1];
          }
        }

        // Extract Instagram username from URL
        if (socialLinks.instagram) {
          const match = socialLinks.instagram.match(/instagram\.com\/([^/?]+)/);
          if (match) {
            platformCreds.instagram = match[1];
          }
        }

        // Extract YouTube username from URL
        if (socialLinks.youtube) {
          const match = socialLinks.youtube.match(/(?:youtube\.com\/@|youtube\.com\/c\/)([^/?]+)/) ||
                       socialLinks.youtube.match(/youtube\.com\/user\/([^/?]+)/);
          if (match) {
            platformCreds.youtube = match[1];
          }
        }

        const hasPlatforms = Object.values(platformCreds).some(v => v);

        return hasPlatforms && (
          <div className="p-6 bg-white rounded-2xl border shadow-lg backdrop-blur-sm dark:bg-gray-800/50 border-gray-200/60 dark:border-gray-700/60">
            <h3 className="flex gap-3 items-center mb-6 text-xl font-bold text-gray-900 dark:text-gray-100">
              <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg dark:from-purple-500/20 dark:to-pink-500/20">
                <TrendingUp
                  size={24}
                  className="text-purple-600 dark:text-purple-400"
                />
              </div>
              Platform Performance
            </h3>

            <PlatformStats
              platformCredentials={platformCreds}
              showCombinedMetrics={false}
              compact={true}
            />
          </div>
        );
      })()}
    </div >
  );
}