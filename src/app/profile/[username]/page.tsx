'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { profileApi } from '@/lib/api/profile.api';
import type { ProfileByUsernameResponse } from '@/lib/api/profile.api';
import DashboardLayout from '@/components/layout/Dashboard/Dashboard';
import UserProfileHeader from '@/components/profile/ProfileCard.jsx';
import { FaSpinner } from 'react-icons/fa';

export default function ProfileByUsernamePage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  const [profile, setProfile] = useState<ProfileByUsernameResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!username) {
        setError('Username is required');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const data = await profileApi.getProfileByUsername(username);
        setProfile(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load profile';
        setError(errorMessage);
        console.error('Error fetching profile:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <FaSpinner className="animate-spin mx-auto h-7 w-7 text-indigo-600 mb-3" />
            <p className="text-sm text-slate-600 dark:text-slate-400">Loading profile...</p>
          </div>
        </div>
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

  const profileData = {
    profile: {
      userId: profile.userId || profile.id || profile._id,
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
          : `https://www.hyperbuds.com/@${profile.username}`,
    },
  };

  const handleMessage = () => {
    const userId = profile.userId || profile.id || profile._id;
    if (userId) {
      router.push(`/messages?userId=${encodeURIComponent(String(userId))}`);
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
          isOwnProfile={false}
          onEditProfile={() => {}}
          onMessage={handleMessage}
        />
      </div>
    </DashboardLayout>
  );
}
