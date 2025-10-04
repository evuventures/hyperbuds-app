"use client"
import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Users, ShoppingBag, MessageCircle, Currency, User2,
  Menu, House
} from 'lucide-react';


interface SidebarProps {
  user: {
    username?: string;
    email: string;
    displayName?: string;
    avatar?: string;
    rizzScore?: number;
    subscription?: 'free' | 'premium' | 'pro';
  };
  activeTab: string;
  collapsed: boolean;
  onTabChange: (tab: string) => void;
  onToggleCollapse?: () => void;
}

// ✅ add this type so TS knows path is optional
type MenuItem = {
  id: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  count?: number;
  path?: string;
};

const mockData = {
  creator: {
    name: "Sam Wilson",
    username: "Sam_12",
    niche: ["Gaming", "Tech Reviews"],
    rizzScore: 85,
    subscription: "premium" as "free" | "premium" | "pro"
  },
  stats: {
    totalFollowers: 125000,
    activeCollabs: 8,
    completedCollabs: 47,
    rizzScore: 85
  },
  notifications: {
    matches: 3,
    collaborations: 2,
    marketplace: 1,
    messages: 5,
  
    
  }
};

export const Sidebar: React.FC<SidebarProps> = ({ user, activeTab, collapsed, onTabChange, onToggleCollapse }) => {
  const pathname = usePathname();
  const [notifications] = useState(mockData.notifications);
  // Determine active tab based on current route
  const getActiveTabFromPath = () => {
    // Main menu items
    if (pathname === '/dashboard') return 'home';
    if (pathname === '/ai-matches') return 'matches';
    if (pathname === '/matching') return 'matching';
    if (pathname === '/streaming') return 'streaming';

    // Business items
    if (pathname === '/marketplace') return 'marketplace';
    if (pathname === '/bookings') return 'bookings';
    if (pathname === '/earnings') return 'earnings';

    // Communication items
    if (pathname === '/messages') return 'messages';
    if (pathname === '/invites') return 'invites';
    if (pathname === '/networking') return 'networking';

    // Fallback to prop
    return activeTab;
  };

  const currentActiveTab = getActiveTabFromPath();

  // Handle smooth navigation
  const handleNavigation = (itemId: string) => {
    onTabChange(itemId);
  };

  // ✅ typed arrays
  const mainMenuItems: MenuItem[] = [
    { id: 'home', icon: House, label: 'Home', count: notifications.matches, path: '/dashboard' },
    { id: 'profile', icon: User2, label: 'Profile', path: '/profile' },
    { id: 'matches', icon: Heart, label: 'AI Matches', count: notifications.matches, path: '/ai-matches' },
    { id: 'matching', icon: Users, label: 'Collaborations', count: notifications.collaborations, path: '/matching' },
    { id: 'streaming', icon: Users, label: 'Live Streaming', path: '/streaming' }
  ];

  const businessItems: MenuItem[] = [
    { id: 'marketplace', icon: ShoppingBag, label: 'Marketplace', count: notifications.marketplace, path: '/marketplace' },
    { id: 'Subscription', icon: Currency, label: 'Subscription', path:'/payments/checkout' },
    { id: 'bookings', icon: Users, label: 'Bookings', path: '/bookings' },
    { id: 'earnings', icon: Currency, label: 'Earnings', path: '/earnings' }
  ];

  const commItems: MenuItem[] = [
    {
      id: 'messages', icon: MessageCircle, label: 'Messages', count: notifications.messages,
      path: '/messages'
    },
    { id: 'invites', icon: MessageCircle, label: 'Invites', path: '/invites' },
    { id: 'networking', icon: Users, label: 'Network', path: '/networking' }
  ];





  const Tooltip = ({ children, content }: { children: React.ReactNode; content: string }) => (
    <div className="relative group">
      {children}
      <AnimatePresence>
        {collapsed && (
          <motion.div
            initial={{ opacity: 0, x: -10, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute left-full z-50 px-2 py-1 ml-2 text-xs text-white whitespace-nowrap bg-gray-800 rounded opacity-0 transition-opacity duration-200 dark:bg-gray-700 dark:text-gray-100 group-hover:opacity-100"
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );



  return (
    <div className={`${collapsed ? 'w-16' : 'w-60'} border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden transition-all duration-300 relative  `}>

      {/* Collapse Toggle */}
      <motion.button
        onClick={onToggleCollapse}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className={`hidden absolute z-10 w-6 h-6 rounded-full border shadow-sm transition-all duration-200 cursor-pointer lg:flex
          ${collapsed
            ? 'top-4 left-1/2 bg-gray-200 -translate-x-1/2 dark:bg-gray-700'
            : 'right-3 top-4 bg-gray-100 dark:bg-gray-800'
          }
            justify-center items-center border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 hover:shadow-md
            `}>
        <motion.div
          animate={{ rotate: collapsed ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <Menu className="w-3 h-3 text-gray-600 dark:text-gray-300" />
        </motion.div>
      </motion.button>


      {/* Header */}
      {/* … unchanged header code … */}

      {/* Navigation */}
      <div className={`${collapsed ? 'p-2' : 'p-4'} space-y-6`}>
        {[mainMenuItems, businessItems, commItems].map((section, idx) => (
          <div key={idx}>
            {!collapsed && (
              <h3 className="px-3 mb-3 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                {idx === 0 ? "Main" : idx === 1 ? "Business" : "Communication"}
              </h3>
            )}
            {/* icons and labels */}
            <div className={`${collapsed ? 'mt-10' : 'mt-0'} space-y-1`}>
              {section.map((item) => (
                <Tooltip key={item.id} content={item.label} >
                  {item.path ? (
                    <Link href={item.path}>
                      <motion.div
                        onClick={() => handleNavigation(item.id)}
                        whileHover={{
                          scale: 1.02,
                          x: 4,
                          transition: { duration: 0.2, ease: "easeOut" }
                        }}
                        whileTap={{
                          scale: 0.98,
                          transition: { duration: 0.1 }
                        }}
                        className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-3 py-3 rounded-lg cursor-pointer transition-all duration-300 group relative overflow-hidden ${currentActiveTab === item.id
                          ? 'bg-purple-50 dark:bg-purple-900 border-l-4 border-purple-500 text-purple-700 dark:text-purple-300 shadow-sm'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400'
                          }`}
                      >
                        {/* Active indicator */}
                        {currentActiveTab === item.id && (
                          <div className="absolute inset-0 bg-gradient-to-r rounded-lg from-purple-500/10 to-pink-500/10" />
                        )}

                        <div className={`relative flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
                          <div>
                            <item.icon className="w-5 h-5 transition-all duration-300 group-hover:scale-110 group-hover:text-purple-600 dark:group-hover:text-purple-400" />
                          </div>
                          {!collapsed && (
                            <span className="text-sm font-medium">
                              {item.label}
                            </span>
                          )}
                        </div>
                        {
                          !collapsed && item.count && item.count > 0 && (
                            <div className="flex justify-center items-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                              {item.count > 9 ? '9+' : item.count}
                            </div>
                          )
                        }
                      </motion.div>
                    </Link>
                  ) : (
                    <motion.div
                      onClick={() => handleNavigation(item.id)}
                      whileHover={{
                        scale: 1.02,
                        x: 4,
                        transition: { duration: 0.2, ease: "easeOut" }
                      }}
                      whileTap={{
                        scale: 0.98,
                        transition: { duration: 0.1 }
                      }}
                      className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-3 py-3 rounded-lg cursor-pointer transition-all duration-300 group relative overflow-hidden ${currentActiveTab === item.id
                        ? 'bg-purple-50 dark:bg-purple-900 border-l-4 border-purple-500 text-purple-700 dark:text-purple-300 shadow-sm'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400'
                        }`}
                    >
                      {/* Active indicator */}
                      {currentActiveTab === item.id && (
                        <div className="absolute inset-0 bg-gradient-to-r rounded-lg from-purple-500/10 to-pink-500/10" />
                      )}

                      <div className={`relative flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
                        <div>
                          <item.icon className="w-5 h-5 transition-all duration-300 group-hover:scale-110 group-hover:text-purple-600 dark:group-hover:text-purple-400" />
                        </div>
                        {!collapsed && (
                          <span className="text-sm font-medium">
                            {item.label}
                          </span>
                        )}
                      </div>
                      {
                        !collapsed && item.count && item.count > 0 && (
                          <div className="flex justify-center items-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                            {item.count > 9 ? '9+' : item.count}
                          </div>
                        )
                      }
                    </motion.div>
                  )}
                </Tooltip >
              ))}
            </div >
          </div >
        ))}
      </div >

      {/* Footer */}
      <div className={`mt-auto ${collapsed ? 'p-2' : 'p-4'} border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800`}>
        {!collapsed ? (
          <>
            <div className='flex flex-col gap-3'>
              <div className="flex gap-2 items-center">
                <div className="flex justify-center items-center w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
                  <span className="text-sm font-medium text-white">
                    {user.username?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                  </span>
                </div>
                <div className='max-w-[150px]'>
                  <div className="mb-1 text-xs font-medium text-gray-900 truncate dark:text-gray-100">
                    {user.username || user.email}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {mockData.creator.niche.join(', ')}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex justify-center">
            <div className="flex justify-center items-center w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
              <span className="text-xs font-medium text-white">
                {user.username?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
              </span>
            </div>
          </div>
        )}
      </div>
    </div >
  );
};
