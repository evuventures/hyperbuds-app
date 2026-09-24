"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useAppSelector } from "@/store/hooks";
import { Camera, AtSign, FileText, Sparkles, MapPin, Check, ChevronRight } from "lucide-react";

export interface SetupStep {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  isCompleted: boolean;
  link: string;
  color: string;
  bgLight: string;
}

export function useProfileCompletion() {
  const { user, token } = useAppSelector((state) => state.auth);

  const profile = (user as unknown as { profile?: Record<string, unknown> })?.profile;

  const steps: SetupStep[] = useMemo(() => {
    if (!user) return [];

    const avatar = (profile?.avatar ?? user.avatar) as string | undefined;
    const username = (profile?.username ?? user.username) as string | undefined;
    const bio = (profile?.bio ?? (user as unknown as { bio?: string })?.bio) as string | undefined;
    const niches = (profile?.niche ?? (profile as unknown as { niches?: unknown })?.niches ?? (user as unknown as { niche?: unknown })?.niche) as unknown;
    const location = (profile?.location ?? (user as unknown as { location?: unknown })?.location) as unknown;

    const hasAvatar = Boolean(avatar && typeof avatar === "string" && avatar.trim() !== "");
    const hasUsername = Boolean(username && typeof username === "string" && username.trim() !== "");
    const hasBio = Boolean(bio && typeof bio === "string" && bio.trim() !== "");
    const hasNiches = Boolean(Array.isArray(niches) && niches.length > 0);
    const hasLocation = Boolean(
      location &&
        ((typeof location === "object" && ((location as { city?: string })?.city || (location as { country?: string })?.country)) ||
          (typeof location === "string" && location.trim() !== ""))
    );

    return [
      {
        id: "avatar",
        title: "Add a profile photo",
        subtitle: "Takes 30 seconds",
        icon: Camera,
        isCompleted: hasAvatar,
        link: "/profile/complete-profile",
        color: "text-purple-600 dark:text-purple-400",
        bgLight: "bg-purple-100 dark:bg-purple-900/30",
      },
      {
        id: "username",
        title: "Set username & display name",
        subtitle: "Takes 1 minute",
        icon: AtSign,
        isCompleted: hasUsername,
        link: "/profile/complete-profile",
        color: "text-blue-600 dark:text-blue-400",
        bgLight: "bg-blue-100 dark:bg-blue-900/30",
      },
      {
        id: "bio",
        title: "Tell others about you",
        subtitle: "Takes 1 minute",
        icon: FileText,
        isCompleted: hasBio,
        link: "/profile/complete-profile",
        color: "text-indigo-600 dark:text-indigo-400",
        bgLight: "bg-indigo-100 dark:bg-indigo-900/30",
      },
      {
        id: "niches",
        title: "Select content niches",
        subtitle: "Takes 30 seconds",
        icon: Sparkles,
        isCompleted: hasNiches,
        link: "/profile/complete-profile",
        color: "text-amber-600 dark:text-amber-400",
        bgLight: "bg-amber-100 dark:bg-amber-900/30",
      },
      {
        id: "location",
        title: "Set your location",
        subtitle: "Takes 30 seconds",
        icon: MapPin,
        isCompleted: hasLocation,
        link: "/profile/complete-profile",
        color: "text-sky-600 dark:text-sky-400",
        bgLight: "bg-sky-100 dark:bg-sky-900/30",
      },
    ];
  }, [user, profile]);

  const completedCount = useMemo(() => steps.filter((s) => s.isCompleted).length, [steps]);
  const totalCount = steps.length;
  const isComplete = totalCount > 0 && completedCount === totalCount;
  const isLoggedIn = Boolean(user || token);
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return {
    steps,
    completedCount,
    totalCount,
    isComplete,
    isLoggedIn,
    progressPercent,
  };
}

export const FinishSettingUp: React.FC = () => {
  const { steps, completedCount, totalCount, isComplete, isLoggedIn, progressPercent } =
    useProfileCompletion();

  // If user is not logged in or has already completed their profile, do not show
  if (!isLoggedIn || isComplete || totalCount === 0) {
    return null;
  }

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/50 shadow-sm dark:shadow-none h-full flex flex-col justify-between">
      <div>
        {/* ── Header ────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Finish setting up
            </h2>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-0.5">
              {completedCount} of {totalCount} done
            </p>
          </div>
          <Link
            href="/profile/complete-profile"
            className="px-4 py-1.5 text-xs font-semibold rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 transition-colors"
          >
            View all
          </Link>
        </div>

        {/* ── Progress Bar ──────────────────────────────────── */}
        <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mt-4 mb-5">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* ── Steps List ────────────────────────────────────── */}
        <div className="divide-y divide-gray-100 dark:divide-gray-700/40">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <Link
                key={step.id}
                href={step.link}
                className="flex items-center justify-between py-3 px-2 -mx-2 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                      step.isCompleted
                        ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                        : step.bgLight
                    }`}
                  >
                    {step.isCompleted ? (
                      <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />
                    ) : (
                      <Icon className={`w-5 h-5 ${step.color}`} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p
                      className={`text-sm font-semibold truncate transition-colors ${
                        step.isCompleted
                          ? "text-gray-400 dark:text-gray-500 line-through"
                          : "text-gray-900 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400"
                      }`}
                    >
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {step.isCompleted ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                          Completed
                        </span>
                      ) : (
                        step.subtitle
                      )}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 ml-3">
                  {step.isCompleted ? (
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs">
                      ✓
                    </span>
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200 group-hover:translate-x-0.5 transition-all" />
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FinishSettingUp;
