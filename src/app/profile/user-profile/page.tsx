'use client'

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

type UserProfileHeaderProps = {
  userData: {
    name?: string;
    email?: string;
    avatar?: string;
    role?: string;
    bio?: string;
  } | null;
  isDark: boolean;
  isLoading: boolean;
};

export default function UserProfileHeader({ userData, isDark, isLoading }: UserProfileHeaderProps) {
  const router = useRouter();
  const [currentUserEmail, setCurrentUserEmail] = useState(null);

  useEffect(() => {
    // Get logged-in user email from localStorage or context
    const authUser = localStorage.getItem('user');
    if (authUser) {
      const parsedUser = JSON.parse(authUser);
      setCurrentUserEmail(parsedUser?.email);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="p-6 bg-white/60 rounded-2xl shadow animate-pulse">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 bg-gray-200 rounded-full" />
          <div className="space-y-2">
            <div className="w-40 h-4 bg-gray-200 rounded" />
            <div className="w-28 h-3 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="p-6 bg-white/80 rounded-2xl shadow text-center text-gray-500">
        No profile data found.
      </div>
    );
  }

  const isOwnProfile = userData?.email === currentUserEmail;

  return (
    <div
      className={`p-6 rounded-3xl border ${
        isDark ? "bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700" : "bg-white/70 border-gray-200"
      } shadow-lg`}
    >
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        {/* Profile Image + Info */}
        <div className="flex items-center space-x-4">
          <div className="relative w-20 h-20 rounded-full overflow-hidden ring-4 ring-indigo-500/30">
            <Image
              src={userData?.avatar || "/assets/avatar-placeholder.png"}
              alt={`${userData?.name || "User"}'s avatar`}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h2
              className={`text-2xl font-semibold ${
                isDark ? "text-white" : "text-gray-800"
              }`}
            >
              {userData?.name || "Unnamed User"}
            </h2>
            <p
              className={`text-sm ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}
            >
              {userData?.email}
            </p>
            <p className="text-sm text-indigo-500 mt-1">
              {userData?.role || "User"}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {isOwnProfile ? (
            <button
              onClick={() => router.push("/profile/edit")}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all"
            >
              Edit Profile
            </button>
          ) : (
            <>
              <button
                onClick={() => alert(`Messaging ${userData?.name}`)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all"
              >
                Message
              </button>
              <button
                onClick={() => alert(`Followed ${userData?.name}`)}
                className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-all"
              >
                Follow
              </button>
            </>
          )}
        </div>
      </div>

      {/* Bio / About Section */}
      {userData?.bio && (
        <div
          className={`mt-6 text-sm leading-relaxed ${
            isDark ? "text-gray-300" : "text-gray-700"
          }`}
        >
          {userData.bio}
        </div>
      )}
    </div>
  );
}
