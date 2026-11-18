import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useMultiplePlatformData, useCombinedPlatformMetrics } from "@/hooks/features/usePlatformData";
import { useMatchSuggestions } from "@/hooks/features/useMatching";
import {
  Pencil,
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
  Briefcase,
  Clock,
  Code2,
  Globe,
  Building2,
  LayoutGrid,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const LoadingSkeleton = () => (
  <div className="space-y-5">
    <div className="overflow-hidden bg-white rounded-2xl border border-slate-200 shadow-xs dark:bg-slate-900 dark:border-slate-800">
      <div className="h-28 bg-slate-200 animate-pulse dark:bg-slate-800" />
      <div className="px-6 pb-6 -mt-12 flex gap-6 items-end">
        <div className="w-24 h-24 bg-slate-300 rounded-2xl border-4 border-white animate-pulse dark:bg-slate-700 dark:border-slate-900" />
        <div className="space-y-2.5 flex-1 pt-14">
          <div className="w-56 h-7 bg-slate-200 rounded-lg animate-pulse dark:bg-slate-800" />
          <div className="w-36 h-4 bg-slate-200 rounded animate-pulse dark:bg-slate-800" />
        </div>
      </div>
    </div>
  </div>
);

const PLATFORM_INFO = {
  tiktok: { name: "TikTok", icon: "🎵", handlePrefix: "@" },
  instagram: { name: "Instagram", icon: "📷", handlePrefix: "@" },
  youtube: { name: "YouTube", icon: "📺", handlePrefix: "@" },
  twitch: { name: "Twitch", icon: "🎮", handlePrefix: "" },
  twitter: { name: "X / Twitter", icon: "🐦", handlePrefix: "@" },
  linkedin: { name: "LinkedIn", icon: "💼", handlePrefix: "in/" },
};

const AVAILABILITY_LABELS = {
  immediately: "Available immediately",
  within_2_weeks: "Available within 2 weeks",
  within_1_month: "Available within 1 month",
  in_2_3_months: "Available in 2–3 months",
};

const OFFER_PREFERENCE_LABELS = {
  salary: "Salary preferred",
  equity: "Equity preferred",
  hybrid: "Hybrid (Salary + Equity)",
};

export default function UserProfileHeader({
  userData,
  isLoading = false,
  isOwnProfile = false,
  onEditProfile,
  onConnect = /** @type {((id: string) => void) | undefined} */ (undefined),
  onMessage,
}) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [failedAvatar, setFailedAvatar] = useState(null);
  const [showFullBio, setShowFullBio] = useState(false);
  const [platforms, setPlatforms] = useState([]);

  useEffect(() => {
    if (userData?.profile?.socialLinks) {
      const socialLinks = userData.profile.socialLinks;
      const platformList = [];

      if (socialLinks.tiktok) {
        const match = socialLinks.tiktok.match(/tiktok\.com\/@?([^/?]+)/);
        if (match) platformList.push({ type: "tiktok", username: match[1] });
      }
      if (socialLinks.twitter) {
        const match = socialLinks.twitter.match(/(?:twitter|x)\.com\/([^/?]+)/);
        if (match) platformList.push({ type: "twitter", username: match[1] });
      }
      if (socialLinks.twitch) {
        const match = socialLinks.twitch.match(/twitch\.tv\/([^/?]+)/);
        if (match) platformList.push({ type: "twitch", username: match[1] });
      }
      if (socialLinks.instagram) {
        const match = socialLinks.instagram.match(/instagram\.com\/([^/?]+)/);
        if (match) platformList.push({ type: "instagram", username: match[1] });
      }
      if (socialLinks.youtube) {
        const match =
          socialLinks.youtube.match(/(?:youtube\.com\/@|youtube\.com\/c\/)([^/?]+)/) ||
          socialLinks.youtube.match(/youtube\.com\/user\/([^/?]+)/);
        if (match) platformList.push({ type: "youtube", username: match[1] });
      }

      setPlatforms(platformList);
    }
  }, [userData?.profile?.socialLinks]);

  const { data: platformData, loading: platformLoading } = useMultiplePlatformData(platforms, {
    enabled: platforms.length > 0,
  });
  const combinedMetrics = useCombinedPlatformMetrics(platformData);
  const { data: matchesData } = useMatchSuggestions({ limit: 10, enabled: isOwnProfile });

  const matchingRizzScore = useMemo(() => {
    if (!isOwnProfile) return undefined;
    const matches = matchesData?.matches || [];
    if (matches.length === 0) return undefined;

    const scores = matches
      .map((match) => {
        if (match.compatibilityScore) return match.compatibilityScore;
        if (match.scoreBreakdown?.rizzScoreCompatibility) {
          return match.scoreBreakdown.rizzScoreCompatibility;
        }
        if (match.scoreBreakdown) {
          const values = Object.values(match.scoreBreakdown);
          if (values.length > 0) {
            const sum = values.reduce((acc, val) => acc + (typeof val === "number" ? val : 0), 0);
            return sum / values.length;
          }
        }
        return 0;
      })
      .filter((score) => score > 0);

    if (scores.length === 0) return undefined;
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    return Math.round(average);
  }, [isOwnProfile, matchesData]);

  const handleNavigateToRizzScore = () => {
    router.push("/profile/rizz-score");
  };

  if (isLoading || !userData || (!userData.profile && !userData.username)) {
    return <LoadingSkeleton />;
  }

  const user = userData.profile || userData;

  const filledSocialLinks = Object.entries(user.socialLinks || {}).filter(
    ([, url]) => typeof url === "string" && url.trim() !== ""
  );
  const hasSocialLinks = filledSocialLinks.length > 0;

  const formatLocation = (location, locationName) => {
    if (typeof locationName === "string" && locationName.trim()) {
      return locationName.trim();
    }
    if (!location) return "Anywhere";
    return [location.city, location.state, location.country].filter(Boolean).join(", ") || "Anywhere";
  };

  const formatShortDate = (dateString) => {
    const date = new Date(dateString);
    if (!dateString || !Number.isFinite(date.getTime())) return null;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const joinedDate = formatShortDate(user.createdAt);

  const copyProfileUrl = async () => {
    try {
      const urlToCopy = user.profileUrl || window.location.href;
      await navigator.clipboard.writeText(urlToCopy);
      setCopied(true);
      toast.success("Profile link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      toast.error("Failed to copy link");
    }
  };

  const skills = Array.isArray(user.skills) ? user.skills.filter(Boolean) : [];
  const experience = Array.isArray(user.experience)
    ? user.experience.filter((item) => item && (item.title || item.company || item.duration))
    : [];
  const portfolioEntries = Object.entries(user.portfolioLinks || {}).filter(
    ([, url]) => typeof url === "string" && url.trim() !== ""
  );
  const hasProfessionalData =
    Boolean(user.primaryRole) ||
    Boolean(user.availability) ||
    Boolean(user.offerPreference) ||
    skills.length > 0 ||
    experience.length > 0 ||
    portfolioEntries.length > 0;

  const followerDisplay = platformLoading
    ? "..."
    : combinedMetrics.totalFollowers > 0
    ? combinedMetrics.totalFollowers.toLocaleString()
    : user.stats?.totalFollowers?.toLocaleString() ?? "—";

  return (
    <div className="space-y-5">
      {/* LinkedIn Cover Banner + Instagram Identity Header */}
      <section className="overflow-hidden bg-white rounded-2xl border border-slate-200 shadow-xs dark:bg-slate-900 dark:border-slate-800">
        {/* Architectural Cover Banner (LinkedIn Header Pattern) */}
        <div className="relative h-28 sm:h-36 bg-slate-900 dark:bg-slate-950 overflow-hidden border-b border-slate-200 dark:border-slate-800">
          <div
            className="absolute inset-0 opacity-90"
            style={{
              backgroundImage:
                "radial-gradient(circle at 18% 25%, rgba(168, 85, 247, 0.38), transparent 45%), radial-gradient(circle at 82% 70%, rgba(99, 102, 241, 0.42), transparent 50%), linear-gradient(135deg, #0f172a 0%, #1e1b4b 55%, #0f172a 100%)",
            }}
          />
          <div
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage:
                "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          <div className="relative h-full px-5 sm:px-7 py-3.5 flex justify-between items-start">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase rounded-md bg-white/10 text-white/90 backdrop-blur-xs border border-white/15">
              <LayoutGrid size={12} className="text-purple-300" />
              Creator &amp; Talent Identity
            </span>
            <div className="flex flex-wrap gap-2 items-center">
              {user.availability && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 backdrop-blur-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {AVAILABILITY_LABELS[user.availability] || user.availability}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Overlapping Avatar + Action Row */}
        <div className="px-5 sm:px-7 pb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-end -mt-12 sm:-mt-14 mb-4 relative z-10">
            <div className="flex items-end gap-4">
              <div className="relative shrink-0">
                {user.avatar && failedAvatar !== user.avatar ? (
                  <div className="relative overflow-hidden w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 shadow-sm">
                    <Image
                      src={user.avatar}
                      alt={`${user.displayName || user.username}'s avatar`}
                      width={112}
                      height={112}
                      className="object-cover w-full h-full"
                      priority
                      onError={() => setFailedAvatar(user.avatar)}
                    />
                  </div>
                ) : (
                  <div className="flex justify-center items-center w-24 h-24 sm:w-28 sm:h-28 text-2xl sm:text-3xl font-bold text-white rounded-2xl border-4 border-white dark:border-slate-900 bg-indigo-600 shadow-sm">
                    {(user.displayName?.charAt(0) || user.username?.charAt(0) || "U").toUpperCase()}
                  </div>
                )}

                {user.status === "online" && (
                  <div className="flex absolute -right-1 -bottom-1 justify-center items-center w-6 h-6 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900">
                    <Activity size={11} className="text-white" />
                  </div>
                )}
              </div>

              {/* Instagram-style Compact Stat Strip on Desktop */}
              <div className="hidden lg:flex items-center gap-6 pb-1 pl-2 text-sm">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">{followerDisplay}</span>{" "}
                  <span className="text-slate-500 dark:text-slate-400">followers</span>
                </div>
                <div className="h-3.5 w-px bg-slate-200 dark:bg-slate-800" />
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">{user.rizzScore ?? "—"}</span>{" "}
                  <span className="text-slate-500 dark:text-slate-400">rizz score</span>
                </div>
                <div className="h-3.5 w-px bg-slate-200 dark:bg-slate-800" />
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">{user.niche?.length || 0}</span>{" "}
                  <span className="text-slate-500 dark:text-slate-400">niches</span>
                </div>
              </div>
            </div>

            {/* Action Toolbar */}
            <div className="flex flex-wrap gap-2 items-center shrink-0 pt-2 sm:pt-0">
              <button
                type="button"
                onClick={copyProfileUrl}
                className="inline-flex gap-1.5 items-center px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-slate-50 rounded-xl border border-slate-200 transition-colors hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700"
                title="Copy profile URL"
                aria-label="Copy profile URL"
              >
                {copied ? <Check size={15} className="text-emerald-500" /> : <Copy size={15} />}
                <span>{copied ? "Copied" : "Copy link"}</span>
              </button>

              {isOwnProfile ? (
                <>
                  <Link
                    href="/profile/edit"
                    onClick={onEditProfile}
                    className="inline-flex gap-1.5 items-center px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-white rounded-xl border border-slate-200 transition-colors hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700"
                    title="Edit Profile"
                  >
                    <Pencil size={14} />
                    <span>Edit Profile</span>
                  </Link>
                  <Link
                    href="/ai-matches"
                    className="inline-flex gap-1.5 items-center px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 rounded-xl transition-colors hover:bg-indigo-500"
                  >
                    <Heart size={14} />
                    <span>Get Match</span>
                  </Link>
                </>
              ) : (
                <>
                  {onConnect && (
                    <button
                      type="button"
                      onClick={() => onConnect(user.id || user.userId)}
                      className="inline-flex gap-1.5 items-center px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 rounded-xl transition-colors hover:bg-indigo-500"
                    >
                      Connect
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onMessage?.(user.id || user.userId)}
                    className="inline-flex gap-2 items-center px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-white rounded-xl border border-slate-200 transition-colors hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700"
                  >
                    <MessageCircle size={15} />
                    <span>Message</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Identity Headline & Metadata */}
          <div className="space-y-2.5">
            <div className="flex flex-wrap gap-2.5 items-center">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 break-words">
                {user.displayName || user.username}
              </h1>
              {user.isVerified && <Verified size={20} className="text-indigo-600 dark:text-indigo-400 shrink-0" />}
              {user.primaryRole && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 bg-indigo-50 rounded-full border border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800">
                  <Briefcase size={12} />
                  {user.primaryRole}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-3 items-center text-sm">
              <span className="font-medium text-indigo-600 dark:text-indigo-400">@{user.username}</span>
              {["online", "offline"].includes(user.status) && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full border border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      user.status === "online" ? "bg-emerald-500" : "bg-slate-400"
                    }`}
                  />
                  {user.status === "online" ? "Online" : "Offline"}
                </span>
              )}
            </div>

            {user.bio && (
              <div className="max-w-3xl pt-0.5">
                <p
                  className={`text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300 ${
                    showFullBio ? "" : "line-clamp-3"
                  }`}
                >
                  {user.bio}
                </p>
                {user.bio.length > 160 && (
                  <button
                    type="button"
                    onClick={() => setShowFullBio(!showFullBio)}
                    className="mt-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    {showFullBio ? "Show less" : "Show more"}
                  </button>
                )}
              </div>
            )}

            {/* Metadata Bar */}
            <div className="flex flex-wrap gap-x-5 gap-y-2 pt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80">
              {joinedDate && (
                <div className="flex gap-1.5 items-center">
                  <PartyPopper size={14} className="text-purple-500 shrink-0" />
                  <span>Joined {joinedDate}</span>
                </div>
              )}

              <div className="flex gap-1.5 items-center">
                <UserCheck size={14} className="text-emerald-500 shrink-0" />
                <span>{user.isPublic !== false ? "Public" : "Private"} Profile</span>
              </div>

              <div className="flex gap-1.5 items-center">
                <Sparkles size={14} className="text-indigo-500 shrink-0" />
                <span>{formatLocation(user.location, user.locationName)}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Measured Metrics Row */}
      {user.stats && (
        <section
          aria-label="Measured creator metrics"
          className="grid grid-cols-2 gap-3 lg:grid-cols-4"
        >
          {[
            {
              label: "Total Followers",
              value: followerDisplay,
              icon: Users,
              isFromAPI: !platformLoading && combinedMetrics.totalFollowers > 0,
              isFromFallback:
                !platformLoading && combinedMetrics.totalFollowers === 0 && user.stats?.totalFollowers > 0,
            },
            {
              label: "Matching Rizz Score",
              value: matchingRizzScore !== undefined ? `${matchingRizzScore}` : "—",
              icon: TrendingUp,
              isFromAPI: false,
              isFromFallback: false,
            },
            {
              label: "Profile Rizz Score",
              value: user.rizzScore ?? "—",
              icon: Star,
            },
            {
              label: "Content Niches",
              value: user.niche?.length || "0",
              icon: Target,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`p-4 bg-white rounded-xl border border-slate-200 shadow-xs dark:bg-slate-900 dark:border-slate-800 ${
                stat.label === "Profile Rizz Score" && isOwnProfile
                  ? "cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700"
                  : ""
              }`}
              onClick={
                stat.label === "Profile Rizz Score" && isOwnProfile ? handleNavigateToRizzScore : undefined
              }
            >
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{stat.label}</span>
                <div className="flex items-center gap-1">
                  {stat.isFromFallback && stat.label === "Total Followers" && (
                    <span
                      className="inline-flex items-center gap-1 text-xs text-slate-400"
                      title="Stored profile metric"
                    >
                      <Database size={12} />
                    </span>
                  )}
                  {stat.isFromAPI && stat.label === "Total Followers" && (
                    <span
                      className="inline-flex items-center gap-1 text-xs text-emerald-500"
                      title="Synced platform metric"
                    >
                      <Info size={12} />
                    </span>
                  )}
                  <stat.icon size={15} className="text-indigo-500 dark:text-indigo-400" />
                </div>
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {stat.value}
                </div>
                {stat.label === "Profile Rizz Score" && isOwnProfile && (
                  <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">Details →</span>
                )}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* LinkedIn + Instagram 2-Column Split Layout */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 items-start">
        {/* Left Column (LinkedIn Professional Credentials & Skills Rail) */}
        <div className="space-y-5 lg:col-span-5">
          {(hasProfessionalData || isOwnProfile) && (
            <section className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs dark:bg-slate-900 dark:border-slate-800">
              <div className="flex flex-wrap gap-2 justify-between items-start mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex gap-2.5 items-center">
                  <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                    <Briefcase size={17} />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                      Professional &amp; Startup Hub Profile
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Role, availability, skills &amp; portfolio
                    </p>
                  </div>
                </div>
                {isOwnProfile && (
                  <Link
                    href="/profile/edit"
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Update talent details →
                  </Link>
                )}
              </div>

              {hasProfessionalData ? (
                <div className="space-y-4">
                  {/* Role / Availability / Offer Preference */}
                  {(user.primaryRole || user.availability || user.offerPreference) && (
                    <div className="flex flex-wrap gap-2">
                      {user.primaryRole && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                          <Briefcase size={12} className="text-indigo-500" />
                          Role: {user.primaryRole}
                        </span>
                      )}
                      {user.availability && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60">
                          <Clock size={12} />
                          {AVAILABILITY_LABELS[user.availability] || user.availability}
                        </span>
                      )}
                      {user.offerPreference && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/60">
                          {OFFER_PREFERENCE_LABELS[user.offerPreference] || user.offerPreference}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Skills */}
                  {skills.length > 0 && (
                    <div>
                      <h3 className="flex gap-1.5 items-center mb-2 text-[11px] font-semibold tracking-wider uppercase text-slate-500 dark:text-slate-400">
                        <Code2 size={13} />
                        Verified &amp; Self-Reported Skills
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {skills.map((skill) => (
                          <span
                            key={skill}
                            className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-50 rounded-md border border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Portfolio Links */}
                  {portfolioEntries.length > 0 && (
                    <div>
                      <h3 className="flex gap-1.5 items-center mb-2 text-[11px] font-semibold tracking-wider uppercase text-slate-500 dark:text-slate-400">
                        <Globe size={13} />
                        Portfolio &amp; Code Links
                      </h3>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {portfolioEntries.map(([key, url]) => (
                          <a
                            key={key}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex justify-between items-center px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700"
                          >
                            <span className="capitalize">{key}</span>
                            <ExternalLink size={13} className="text-slate-400" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 text-xs sm:text-sm text-slate-600 bg-slate-50 rounded-xl border border-dashed border-slate-200 dark:bg-slate-800/40 dark:text-slate-300 dark:border-slate-700">
                  Add your primary role, skills, availability, and portfolio links to appear in Startup &amp; Talent Hub searches.
                </div>
              )}
            </section>
          )}

          {/* Content Specializations (Niches) */}
          {user.niche && user.niche.length > 0 && (
            <section className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs dark:bg-slate-900 dark:border-slate-800">
              <h2 className="flex gap-2 items-center mb-3 text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
                  <Target size={16} />
                </div>
                Content Specializations
              </h2>
              <div className="flex flex-wrap gap-2">
                {user.niche.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 rounded-lg border border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800/70"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Column (LinkedIn Experience Timeline + Instagram Channel Showcase) */}
        <div className="space-y-5 lg:col-span-7">
          {experience.length > 0 && (
            <section className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs dark:bg-slate-900 dark:border-slate-800">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    <Building2 size={17} />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                      Experience
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Verified &amp; self-reported work history
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative pl-5 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-slate-200 dark:before:bg-slate-800">
                {experience.map((exp, idx) => (
                  <div
                    key={idx}
                    className="relative p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1"
                  >
                    <span className="absolute -left-[17px] top-5 w-2.5 h-2.5 rounded-full bg-indigo-600 ring-4 ring-white dark:ring-slate-900" />
                    <div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {exp.title || "Contributor"}
                      </div>
                      {exp.company && (
                        <div className="text-xs font-medium text-slate-600 dark:text-slate-300">
                          {exp.company}
                        </div>
                      )}
                    </div>
                    {exp.duration && (
                      <span className="inline-flex self-start sm:self-center px-2.5 py-0.5 text-xs font-medium rounded-md bg-white border border-slate-200 text-slate-600 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400">
                        {exp.duration}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Social Media & Channel Grid */}
          <section className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs dark:bg-slate-900 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="flex gap-2.5 items-center text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                <div className="p-2 rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  <Share2 size={17} />
                </div>
                Social Media
              </h2>
              {isOwnProfile && hasSocialLinks && (
                <Link
                  href="/profile/edit"
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Manage channels →
                </Link>
              )}
            </div>

            {hasSocialLinks ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {filledSocialLinks.map(([platform, url]) => {
                  const info = PLATFORM_INFO[platform] || { name: platform, icon: "🔗" };
                  return (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex gap-3 items-center p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-100 transition-colors dark:bg-slate-800/50 dark:border-slate-700 dark:hover:bg-slate-800"
                    >
                      <div className="flex justify-center items-center w-10 h-10 rounded-xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-700">
                        <span className="text-base">{info.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 capitalize">
                          {info.name}
                        </div>
                        <div className="text-xs text-slate-500 truncate dark:text-slate-400">
                          {url.replace("https://", "").replace("http://", "")}
                        </div>
                      </div>
                      <ExternalLink size={15} className="text-slate-400 shrink-0" />
                    </a>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col gap-3 items-center px-6 py-8 text-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-800/30">
                <div className="space-y-1 max-w-md">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {isOwnProfile ? "No social accounts linked yet" : "No social accounts shared"}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {isOwnProfile
                      ? "Add your TikTok, Instagram, YouTube, Twitch, or X profiles to show your reach and improve your matches."
                      : `${user.displayName || user.username} hasn't added any social media links yet.`}
                  </p>
                </div>
                {isOwnProfile && (
                  <Link
                    href="/profile/edit"
                    className="inline-flex gap-1.5 items-center px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-500"
                  >
                    <Pencil size={14} />
                    Add social links
                  </Link>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
