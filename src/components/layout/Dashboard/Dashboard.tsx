'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header/Header';
import { Sidebar } from '../Sidebar/Sidebar';
// import { RightSidebar } from '../RightSideBar/RightSidebar';
import DashboardSkeleton from '@/components/ui/skeleton';
import { BASE_URL } from '../../../config/baseUrl';
import { Menu, X, Moon, Sun, Bell } from 'lucide-react';
import { ThemeProvider, useTheme } from '@/context/Theme';
import { useSidebar } from '@/context/SidebarContext';

// Mobile Header Buttons Component (needs to be inside ThemeProvider)
function MobileHeaderButtons({ /* toggleRightSidebarOpen, */ user }: {
  // toggleRightSidebarOpen: () => void,
  user: { id: string; name: string; email: string; avatar?: string } | null
}) {
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <div className="flex gap-2 items-center">
      {/* Notifications */}
      <button
        className="relative p-2 bg-gray-100 rounded-xl transition-colors dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      </button>

      {/* Dark Mode Toggle */}
      <button
        onClick={toggleDarkMode}
        className="p-2 bg-gray-100 rounded-xl transition-colors dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
        aria-label="Toggle dark mode"
      >
        {isDarkMode ? (
          <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        ) : (
          <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        )}
      </button>

      {/* Right Sidebar Toggle */}
      {/* <button
        onClick={toggleRightSidebarOpen}
        className="p-2 bg-gray-100 rounded-xl transition-colors dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 xl:hidden"
      >
        <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zM12 13a1 1 0 110-2 1 1 0 010 2zM12 20a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
      </button> */}

      {/* User Avatar */}
      <div className="flex justify-center items-center w-8 h-8 bg-linear-to-r from-purple-500 to-pink-500 rounded-full">
        <span className="text-sm font-medium text-white">
          {user?.name?.[0]?.toUpperCase() || user?.email[0]?.toUpperCase()}
        </span>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; name: string; email: string; avatar?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Use global sidebar context
  const {
    sidebarCollapsed,
    sidebarOpen,
    // rightSidebarOpen,
    isInitialized: sidebarInitialized,
    setSidebarOpen,
    // setRightSidebarOpen,
    toggleSidebarCollapse,
    toggleSidebarOpen,
    // toggleRightSidebarOpen,
  } = useSidebar();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/v1/users/me`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          credentials: "include",
          cache: "no-store", // Disable caching to get fresh profile data
        });

        if (!res.ok) {
          router.push("/auth/signin");
          return;
        }

        const data = await res.json();

        // API returns { user: {...}, profile: {...} }
        // Check if profile is complete before allowing dashboard access
        const profile = data?.profile;

        const isProfileIncomplete =
          !profile?.username ||
          profile.username === "" ||
          !profile?.bio ||
          profile.bio === "" ||
          !profile?.niche ||
          (Array.isArray(profile.niche) && profile.niche.length === 0);

        if (isProfileIncomplete) {
          // Redirect to profile completion page
          router.push("/profile/complete-profile");
          return;
        }

        // Combine user and profile data for convenience
        setUser({
          ...data.user,
          profile: data.profile,
        });
      } catch (err) {
        console.error("Failed to fetch user", err);
        router.push("/auth/signin");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  if (loading || !user) {
    // Wait for sidebar to be initialized before showing skeleton with correct state
    if (!sidebarInitialized) {
      return <DashboardSkeleton collapsed={false} />; // Default state while initializing
    }
    return <DashboardSkeleton collapsed={sidebarCollapsed} />;
  }

  return (
    <ThemeProvider>
      <div className="overflow-hidden h-screen bg-linear-to-br from-gray-50 via-white to-gray-100 transition-colors duration-200 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        {/* Mobile Header */}
        <div className="fixed top-0 right-0 left-0 z-50 border-b shadow-sm backdrop-blur-lg lg:hidden bg-white/95 dark:bg-gray-900/95 border-gray-200/50 dark:border-gray-700/50">
          <div className="flex justify-between items-center px-4 py-3">
            <div className="flex gap-3 items-center">
              <button
                onClick={toggleSidebarOpen}
                className="p-2 bg-gray-100 rounded-xl transition-colors dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
              <h1 className="text-xl font-bold text-transparent bg-clip-text bg-linear-to-r from-purple-600 to-blue-600">
                HyperBuds
              </h1>
            </div>

            <MobileHeaderButtons user={user} />
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block">
          <Header user={user} onMenuClick={toggleSidebarOpen} />
        </div>

        {/* Main Dashboard Container */}
        <div className="flex pt-16 h-full lg:pt-0">
          {/* Sidebar */}
          <div
            className={`
              fixed inset-y-0 left-0 z-40 w-60 transform transition-all duration-300 ease-in-out
              lg:relative lg:translate-x-0 lg:z-auto lg:pt-0
              ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
              ${sidebarCollapsed ? 'lg:w-16' : 'lg:w-60'}
            `}
          >
            <div className="relative pt-16 h-full bg-white border-r shadow-xl transition-colors duration-200 lg:pt-0 dark:bg-gray-900 border-gray-200/50 dark:border-gray-700/50 lg:shadow-none">
              {/* Mobile close button */}
              <div className="absolute top-4 right-4 z-10 lg:hidden">
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 bg-gray-100 rounded-xl transition-colors dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
              </div>
              <div className="overflow-hidden h-full">
                <Sidebar
                  user={user}
                  activeTab={activeTab}
                  collapsed={false}
                  onTabChange={(tab) => {
                    setActiveTab(tab);
                    setSidebarOpen(false);
                  }}
                  onToggleCollapse={toggleSidebarCollapse}
                  className="lg:hidden"
                />
                <Sidebar
                  user={user}
                  activeTab={activeTab}
                  collapsed={sidebarCollapsed}
                  onTabChange={(tab) => {
                    setActiveTab(tab);
                    setSidebarOpen(false);
                  }}
                  onToggleCollapse={toggleSidebarCollapse}
                  className="hidden lg:flex"
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-col w-full min-w-0 h-full">
            <div className="flex h-full">
              <main className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden transition-colors duration-200">
                <div className="w-full h-full">
                  {children}
                </div>
              </main>

              {/* Right Sidebar */}
              {/* <div className={`
                fixed inset-y-0 right-0 z-40 w-80 transform transition-all duration-300 ease-in-out bg-white dark:bg-gray-900 border-l border-gray-200/50 dark:border-gray-700/50 shadow-xl
                xl:relative xl:translate-x-0 xl:z-auto xl:shadow-none xl:pt-0 xl:h-full
                ${rightSidebarOpen ? 'translate-x-0' : 'translate-x-full xl:translate-x-0'}
              `}>
                <div className="flex flex-col pt-16 h-full xl:pt-0">
                  <div className="absolute top-4 left-4 z-10 xl:hidden">
                    <button
                      onClick={() => setRightSidebarOpen(false)}
                      className="p-2 bg-gray-100 rounded-xl transition-colors dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                      <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                  </div>
                  <div className="overflow-y-auto flex-1 [&::-webkit-scrollbar]:hidden">
                    <RightSidebar />
                  </div>
                </div>
              </div> */}
            </div>
          </div>
        </div>

        {/* Overlays */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 backdrop-blur-sm transition-opacity duration-300 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        {/* {rightSidebarOpen && (
          <div
            className="fixed inset-0 z-30 backdrop-blur-sm transition-opacity duration-300 bg-black/50 xl:hidden"
            onClick={() => setRightSidebarOpen(false)}
          />
        )} */}
      </div>
    </ThemeProvider >
  );
}