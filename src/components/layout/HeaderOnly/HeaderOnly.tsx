'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header/Header';
import DashboardSkeleton from '@/components/ui/skeleton';
import { useSidebar } from '@/context/SidebarContext';
import { BASE_URL } from '../../../config/baseUrl';
import { ThemeProvider } from '@/context/Theme';
import { getAccessToken } from '@/store/authSelectors';

interface HeaderOnlyLayoutProps {
   children: React.ReactNode;
}

export default function HeaderOnlyLayout({ children }: HeaderOnlyLayoutProps) {
   const router = useRouter();
   const [user, setUser] = useState<{ id: string; name: string; email: string; avatar?: string } | null>(null);
   const [loading, setLoading] = useState(true);

   // Use global sidebar context for skeleton
   const { sidebarCollapsed, isInitialized: sidebarInitialized } = useSidebar();

   useEffect(() => {
      const fetchUser = async () => {
         try {
            const res = await fetch(`${BASE_URL}/api/v1/auth/me`, {
               headers: {
                  Authorization: `Bearer ${getAccessToken()}`,
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

   if (loading || !user) {
      // Wait for sidebar to be initialized before showing skeleton with correct state
      if (!sidebarInitialized) {
         return <DashboardSkeleton collapsed={false} />; // Default state while initializing
      }
      return <DashboardSkeleton collapsed={sidebarCollapsed} />;
   }

   return (
      <ThemeProvider>
         <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 transition-colors duration-200 overflow-y-clip dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
            {/* Mobile Header */}
            <div className="fixed top-0 right-0 left-0 z-50 border-b shadow-sm backdrop-blur-lg lg:hidden bg-white/95 dark:bg-gray-900/95 border-gray-200/50 dark:border-gray-700/50">
               <div className="flex justify-between items-center px-4 py-3">
                  <div className="flex gap-3 items-center">
                     <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                        HyperBuds
                     </h1>
                  </div>

                  <div className="flex gap-2 items-center">
                     <div className="flex justify-center items-center w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
                        <span className="text-sm font-medium text-white">
                           {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                        </span>
                     </div>
                  </div>
               </div>
            </div>

            {/* Desktop Header */}
            <div className="hidden lg:block">
               <Header user={user} onMenuClick={() => { }} />
            </div>

            {/* Main Content */}
            <div className="pt-16 lg:pt-0">
               <main className="w-full min-h-screen">
                  {children}
               </main>
            </div>
         </div>
      </ThemeProvider>
   );
}
