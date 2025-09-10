'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header/Header';
import { Sidebar } from '../Sidebar/Sidebar';
import { RightSidebar } from '../RightSideBar/RightSidebar';
import DashboardSkeleton from '@/components/ui/skeleton';
import { BASE_URL } from '../../../config/baseUrl';
import { Menu, X } from 'lucide-react';
import { ThemeProvider } from '@/context/Theme';


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/v1/auth/me`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          credentials: "include",
        });

        if (!res.ok) {
          router.push("/auth/signin");
          return;
        }

        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error("Failed to fetch user", err);
        router.push("/auth/signin");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setSidebarOpen(false);
      if (window.innerWidth < 1280) {
        setSidebarCollapsed(true);
      } else {
        setSidebarCollapsed(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const savedCollapsedState = localStorage.getItem('sidebarCollapsed');
    if (savedCollapsedState !== null && window.innerWidth >= 1280) {
      setSidebarCollapsed(JSON.parse(savedCollapsedState));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  if (loading || !user) return <DashboardSkeleton />;

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 transition-colors duration-200">
        {/* Mobile Header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                HyperBuds
              </h1>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
                className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors xl:hidden"
              >
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zM12 13a1 1 0 110-2 1 1 0 010 2zM12 20a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {user.username?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block">
          <Header user={user} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        </div>

        {/* Main Dashboard Container */}
        <div className="flex h-screen overflow-hidden pt-16 lg:pt-0">
          {/* Sidebar */}
          <div
            className={`
              fixed inset-y-0 left-0 z-40 transform transition-all duration-300 ease-in-out
              lg:relative lg:translate-x-0 lg:z-auto lg:pt-0
              ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
              ${sidebarCollapsed && window.innerWidth >= 1024 ? 'w-16' : 'w-60'}
            `}
          >
            <div className="h-full pt-16 lg:pt-0 bg-white dark:bg-gray-900 border-r border-gray-200/50 dark:border-gray-700/50 shadow-xl lg:shadow-none relative transition-colors duration-200">
              {/* Mobile close button */}
              <div className="lg:hidden absolute top-4 right-4 z-10">
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
              </div>
              <div className="h-full overflow-y-auto [&::-webkit-scrollbar]:hidden">
                <Sidebar
                  user={user}
                  activeTab={activeTab}
                  collapsed={sidebarCollapsed && window.innerWidth >= 1024}
                  onTabChange={(tab) => {
                    setActiveTab(tab);
                    setSidebarOpen(false);
                  }}
                  onToggleCollapse={toggleSidebarCollapse}
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-col min-w-0 w-full">
            <div className="flex overflow-hidden">
              <main className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden transition-colors duration-200">
                <div className=" py-6 max-w-full">
                  <div className="min-h-full w-full">
                    {children}
                  </div>
                </div>
              </main>

              {/* Right Sidebar */}
              <div className={`
                fixed inset-y-0 right-0 z-40 w-80 transform transition-all duration-300 ease-in-out bg-white dark:bg-gray-900 border-l border-gray-200/50 dark:border-gray-700/50 shadow-xl
                xl:relative xl:translate-x-0 xl:z-auto xl:shadow-none xl:pt-0
                ${rightSidebarOpen ? 'translate-x-0' : 'translate-x-full xl:translate-x-0'}
              `}>
                <div className="h-full pt-16 xl:pt-0">
                  <div className="xl:hidden absolute top-4 left-4 z-10">
                    <button
                      onClick={() => setRightSidebarOpen(false)}
                      className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                  </div>
                  <div className="h-full overflow-y-auto scrollbar-hide">
                    <RightSidebar />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Overlays */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden transition-opacity duration-300"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        {rightSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 xl:hidden transition-opacity duration-300"
            onClick={() => setRightSidebarOpen(false)}
          />
        )}
      </div>
    </ThemeProvider>
  );
}
