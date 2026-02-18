'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header/Header';
import { Sidebar } from '../Sidebar/Sidebar';
import DashboardSkeleton from '@/components/ui/skeleton';
import { Menu, X, Moon, Sun, Bell } from 'lucide-react';
import { ThemeProvider, useTheme } from '@/context/Theme';
import { useSidebar } from '@/context/SidebarContext';

//  Standardized API and State Imports
import { getCurrentUser, User } from '@/lib/api/auth.api';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setToken, setUser as setUserAction } from '@/store/slices/authSlice';

// Mobile Header Buttons Component
function MobileHeaderButtons({ user }: { user: User | null }) {
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <div className="flex gap-2 items-center">
      <button
        className="relative p-2 bg-gray-100 rounded-xl transition-colors dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      </button>

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

      <div className="flex justify-center items-center w-8 h-8 bg-linear-to-r from-purple-500 to-pink-500 rounded-full">
        <span className="text-sm font-medium text-white">
          {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
        </span>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  //  Initialize Redux hooks
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((state) => state.auth);

  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMounted, setIsMounted] = useState(false);

  const {
    sidebarCollapsed,
    sidebarOpen,
    isInitialized: sidebarInitialized,
    setSidebarOpen,
    toggleSidebarCollapse,
    toggleSidebarOpen,
  } = useSidebar();

  // Handle Initial Mount to prevent Hydration errors
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const initAuthAndFetch = async () => {
      // Hydrate Redux Token from LocalStorage for apiClient
      const savedToken = localStorage.getItem('accessToken');
      if (savedToken && !token) {
        dispatch(setToken(savedToken));
      }

      try {
        //  Fetch user using the standardized getCurrentUser
        const data = await getCurrentUser();

        //  Profile Completion Check
        const profile = data?.profile;
        const isProfileIncomplete =
          !profile?.username ||
          profile.username === "" ||
          !profile?.bio ||
          profile.bio === "" ||
          !profile?.niche ||
          (Array.isArray(profile.niche) && profile.niche.length === 0);

        if (isProfileIncomplete) {
          router.push("/profile/complete-profile");
          return;
        }

      
        //  ensure 'email' and 'id' are valid strings
        const userData: User = {
          ...data.user,
          email: data.user.email || "", 
          id: data.user.id || data.user._id || "", 
          profile: data.profile,
        };

        //Update state and Redux
        setUser(userData);
        dispatch(setUserAction(userData));

      } catch (err) {
        // apiClient Interceptor automatically handles 401 redirects to /auth/signin
        console.error("Dashboard init failed:", err);
      } finally {
        setLoading(false);
      }
    };

    if (isMounted) {
      initAuthAndFetch();
    }
  }, [isMounted, router, dispatch, token]);

  if (!isMounted) return null;

  if (loading || !user) {
    if (!sidebarInitialized) {
      return <DashboardSkeleton collapsed={false} />;
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
        
          <Header
            user={user as { id: string; name: string; email: string; avatar?: string }}
            onMenuClick={toggleSidebarOpen}
          />
        </div>

        {/* Main Dashboard Container */}
        <div className="flex pt-16 h-full lg:pt-0">
          <div
            className={`
              fixed inset-y-0 left-0 z-40 w-60 transform transition-all duration-300 ease-in-out
              lg:relative lg:translate-x-0 lg:z-auto lg:pt-0
              ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
              ${sidebarCollapsed ? 'lg:w-16' : 'lg:w-60'}
            `}
          >
            <div className="relative pt-16 h-full bg-white border-r shadow-xl transition-colors duration-200 lg:pt-0 dark:bg-gray-900 border-gray-200/50 dark:border-gray-700/50 lg:shadow-none">
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
                  user={user as { email: string;[key: string]: unknown }}
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
                  user={user as { email: string;[key: string]: unknown }}
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

          <div className="flex flex-col w-full min-w-0 h-full">
            <div className="flex h-full">
              <main className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden transition-colors duration-200">
                <div className="w-full h-full">
                  {children}
                </div>
              </main>
            </div>
          </div>
        </div>

        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 backdrop-blur-sm transition-opacity duration-300 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </ThemeProvider>
  );
}