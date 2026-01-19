'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { profileApi } from '@/lib/api/profile.api';
import type { ProfileByUsernameResponse } from '@/lib/api/profile.api';
import { getCurrentUser } from '@/lib/api/user.api';
import DashboardLayout from '@/components/layout/Dashboard/Dashboard';
import UserProfileHeader from '@/components/profile/ProfileCard.jsx';
import { FaSpinner } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function ProfileByUsernamePage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  const [profile, setProfile] = useState<ProfileByUsernameResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    const fetchProfileAndCheckOwnership = async () => {
      if (!username) {
        setError('Username is required');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Fetch profile and current user in parallel
        const [profileData, currentUserData] = await Promise.allSettled([
          profileApi.getProfileByUsername(username),
          getCurrentUser().catch(() => null), // Gracefully handle auth errors
        ]);

        // Handle profile fetch
        if (profileData.status === 'fulfilled') {
          setProfile(profileData.value);

          // Check ownership
          if (currentUserData.status === 'fulfilled' && currentUserData.value) {
            const currentUser = currentUserData.value;
            const currentUserUsername = currentUser.profile?.username || currentUser.user?.username;

            // Clean both usernames for comparison
            const profileUsername = profileData.value.username?.toLowerCase().trim();
            const cleanCurrentUsername = currentUserUsername?.toLowerCase().trim();

            setIsOwnProfile(profileUsername === cleanCurrentUsername);
          } else {
            setIsOwnProfile(false);
          }
        } else {
          throw profileData.reason;
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load profile';
        setError(errorMessage);
        console.error('Error fetching profile:', err);
        setIsOwnProfile(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileAndCheckOwnership();
  }, [username]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <FaSpinner className="animate-spin mx-auto h-8 w-8 text-purple-500 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex flex-col justify-center items-center min-h-screen px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md"
          >
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Profile Not Found
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
            <button
              onClick={() => router.back()}
              className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              Go Back
            </button>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout>
        <div className="flex flex-col justify-center items-center min-h-screen px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md"
          >
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Profile Not Found
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The profile you&apos;re looking for doesn&apos;t exist.
            </p>
            <button
              onClick={() => router.back()}
              className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              Go Back
            </button>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  // Transform profile data to match UserProfileHeader component format
  // Normalize avatar: convert empty strings, null, undefined to null
  const normalizedAvatar = profile.avatar && profile.avatar.trim() !== '' 
    ? profile.avatar.trim() 
    : null;

  const profileData = {
    profile: {
      userId: profile.id || profile.username,
      username: profile.username,
      displayName: profile.displayName || profile.username,
      avatar: normalizedAvatar,
      bio: profile.bio || '',
      niche: profile.niche || [],
      location: profile.location || {
        city: '',
        state: '',
        country: ''
      },
      socialLinks: profile.socialLinks || {},
      rizzScore: profile.profileRizzScore,
      stats: {
        totalFollowers: 0,
        avgEngagement: 0,
        platformBreakdown: {}
      },
      isPublic: true,
      isActive: true,
      profileUrl: typeof window !== 'undefined'
        ? `${window.location.origin}/profile/@${profile.username}`
        : `https://www.hyperbuds.com/@${profile.username}`
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8 pb-32 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <UserProfileHeader
            userData={profileData}
            isLoading={false}
            isOwnProfile={isOwnProfile}
            onEditProfile={() => { }}
            onConnect={() => { }}
            onMessage={() => { }}
          />

          {/* Additional profile information */}
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              About @{profile.username}
            </h2>

            {profile.bio && (
              <p className="text-gray-700 dark:text-gray-300 mb-6">{profile.bio}</p>
            )}

            {profile.niche && profile.niche.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Niches
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.niche.map((niche) => (
                    <span
                      key={niche}
                      className="px-3 py-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full text-sm font-medium"
                    >
                      {niche}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {profile.location && (profile.location.city || profile.location.state || profile.location.country) && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Location
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {[
                    profile.location.city,
                    profile.location.state,
                    profile.location.country
                  ].filter(Boolean).join(', ')}
                </p>
              </div>
            )}

            {profile.profileRizzScore !== undefined && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Rizz Score
                </h3>
                <div className="flex items-center gap-3">
                  <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">
                    {profile.profileRizzScore}
                  </div>
                  <div className="w-48 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                      style={{ width: `${profile.profileRizzScore}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}

