'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { profileApi } from '@/lib/api/profile.api';
import type { ProfileByUsernameResponse } from '@/lib/api/profile.api';
import apiClient from '@/lib/api/client';
import notificationSocket from '@/lib/socket/notificationSocket';
import DashboardLayout from '@/components/layout/Dashboard/Dashboard';
import { ProfileSkeleton } from '@/components/ui/AppSkeletons';
import UserProfileHeader from '@/components/profile/ProfileCard.jsx';
import { FaSpinner } from 'react-icons/fa';

export default function ProfileByUsernamePage() {
  const params = useParams();
  const router = useRouter();
  const rawUsername = params.username as string;
  const username = rawUsername ? decodeURIComponent(rawUsername).replace(/^@+/, '').trim() : '';
  const [profile, setProfile] = useState<ProfileByUsernameResponse | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState<number | null>(null);
  const [followingCount, setFollowingCount] = useState<number | null>(null);
  const [followLoading, setFollowLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const fetchProfile = async () => {
      if (!username) {
        setError('Username is required');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const [data, meRes] = await Promise.all([
          profileApi.getProfileByUsername(username),
          apiClient.get('/users/me').catch(() => null),
        ]);
        if (!active) return;

        setProfile(data);
        const viewerId = meRes?.data?.user?._id || meRes?.data?.user?.id || meRes?.data?._id || null;
        setCurrentUserId(viewerId ? String(viewerId) : null);

        const targetId = String(data.userId || data.id || data._id || data.username || '');
        if (targetId) {
          const followRes = await profileApi.getFollowStatus(targetId).catch(() => null);
          if (active && followRes) {
            setIsFollowing(Boolean(followRes.isFollowing));
            setFollowersCount(typeof followRes.followersCount === 'number' ? followRes.followersCount : null);
            setFollowingCount(typeof followRes.followingCount === 'number' ? followRes.followingCount : null);
          }
        }
      } catch (err) {
        if (!active) return;
        const errorMessage = err instanceof Error ? err.message : 'Failed to load profile';
        setError(errorMessage);
        console.error('Error fetching profile:', err);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void fetchProfile();
    return () => {
      active = false;
    };
  }, [username]);

  // Keep hook unconditionally above all early returns (React Rules of Hooks)
  useEffect(() => {
    const targetId = String(profile?.userId || profile?.id || profile?._id || '');
    if (!targetId) return;
    const onFollowUpdated = (payload?: unknown) => {
      if (!payload || typeof payload !== 'object') return;
      const p = payload as { userId?: string; followersCount?: number; followingCount?: number };
      if (p.userId && String(p.userId) !== targetId) return;
      if (typeof p.followersCount === 'number') setFollowersCount(p.followersCount);
      if (typeof p.followingCount === 'number') setFollowingCount(p.followingCount);
    };
    notificationSocket.on('profile:follow-updated', onFollowUpdated);
    return () => notificationSocket.off('profile:follow-updated', onFollowUpdated);
  }, [profile?.userId, profile?.id, profile?._id]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <ProfileSkeleton />
      </DashboardLayout>
    );
  }

  if (error || !profile) {
    return (
      <DashboardLayout>
        <div className="flex flex-col justify-center items-center min-h-[60vh] px-4">
          <div className="p-6 text-center max-w-md bg-white rounded-2xl border border-slate-200 shadow-xs dark:bg-slate-900 dark:border-slate-800">
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Profile Not Found
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-5">
              {error || "The profile you're looking for doesn't exist or is set to private."}
            </p>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-5 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const targetUserId = String(profile.userId || profile.id || profile._id || '');
  const isOwnProfile = Boolean(currentUserId && targetUserId && currentUserId === targetUserId);

  const profileData = {
    profile: {
      userId: targetUserId,
      username: profile.username,
      displayName: profile.displayName || profile.username,
      avatar: profile.avatar || null,
      bio: profile.bio || '',
      niche: profile.niche || [],
      location: profile.location || {
        city: '',
        state: '',
        country: '',
      },
      locationName: typeof profile.locationName === 'string' ? profile.locationName : undefined,
      socialLinks: profile.socialLinks || {},
      rizzScore: profile.profileRizzScore ?? profile.rizzScore,
      createdAt: profile.createdAt,
      stats: profile.stats || { totalFollowers: undefined, avgEngagement: undefined },
      primaryRole: typeof profile.primaryRole === 'string' ? profile.primaryRole : undefined,
      skills: Array.isArray(profile.skills) ? profile.skills : [],
      offerPreference: typeof profile.offerPreference === 'string' ? profile.offerPreference : undefined,
      availability: typeof profile.availability === 'string' ? profile.availability : undefined,
      portfolioLinks:
        profile.portfolioLinks && typeof profile.portfolioLinks === 'object'
          ? profile.portfolioLinks
          : {},
      experience: Array.isArray(profile.experience) ? profile.experience : [],
      isPublic: true,
      isActive: profile.isActive,
      profileUrl:
        typeof window !== 'undefined'
          ? `${window.location.origin}/profile/@${profile.username}`
          : `https://app.hyperbuds.cloud/profile/@${profile.username}`,
    },
  };

  const handleToggleFollow = async () => {
    if (!targetUserId || followLoading) return;
    setFollowLoading(true);
    try {
      const result = isFollowing
        ? await profileApi.unfollowUser(targetUserId)
        : await profileApi.followUser(targetUserId);
      setIsFollowing(Boolean(result.isFollowing));
      if (typeof result.followersCount === 'number') {
        setFollowersCount(result.followersCount);
      }
      if (typeof result.followingCount === 'number') {
        setFollowingCount(result.followingCount);
      }
      toast.success(
        result.isFollowing
          ? `Following @${profile.username}`
          : `Unfollowed @${profile.username}`,
      );
    } catch (err) {
      const msg = (err as { message?: string })?.message || 'Unable to update follow status.';
      toast.error(msg);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleMessage = () => {
    if (targetUserId) {
      router.push(`/messages?userId=${encodeURIComponent(targetUserId)}`);
      return;
    }
    console.error('User ID not found for profile:', profile);
  };

  return (
    <DashboardLayout>
      <div className="mx-auto px-4 py-6 pb-24 max-w-6xl">
        <UserProfileHeader
          userData={profileData}
          isLoading={false}
          isOwnProfile={isOwnProfile}
          onEditProfile={() => {}}
          onMessage={handleMessage}
          isFollowing={isFollowing}
          followLoading={followLoading}
          followersCount={followersCount}
          followingCount={followingCount}
          onToggleFollow={isOwnProfile ? undefined : handleToggleFollow}
        />
      </div>
    </DashboardLayout>
  );
}
