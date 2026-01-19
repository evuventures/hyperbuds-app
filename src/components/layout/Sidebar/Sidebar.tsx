"use client"
import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Users, ShoppingBag, MessageCircle, Currency, User2,
  Menu, House, LogOut, ChevronDown, Search, Mail, History
} from 'lucide-react';
import { useAuth } from '@/hooks/auth/useAuth';

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
  className?: string;
}

type MenuItem = {
  id: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  count?: number;
  path?: string;
  subItems?: MenuItem[]; // Added to support sub-menus
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

export const Sidebar: React.FC<SidebarProps> = ({ user, activeTab, collapsed, onTabChange, onToggleCollapse, className }) => {
  const isCollapsed = collapsed;
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [notifications] = useState(mockData.notifications);

  // State to track if the collaborations dropdown is open
  const [isCollabOpen, setIsCollabOpen] = useState(true);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/auth/signin');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getActiveTabFromPath = () => {
    if (pathname === '/dashboard') return 'home';
    if (pathname.startsWith('/profile')) return 'profile';
    if (pathname === '/matching') return 'matching';

    // Sub-menu path matching
    if (pathname === '/collaboration') return 'collab-all';
    if (pathname === '/collaboration/search') return 'collab-search';
    if (pathname === '/collaboration/invites') return 'collab-invites';
    if (pathname === '/collaboration/history') return 'collab-history';

    if (pathname === '/marketplace' || pathname.startsWith('/marketplace/')) return 'marketplace';
    if (pathname.startsWith('/payments/subscription') || pathname.startsWith('/payments/checkout')) return 'Subscription';
    if (pathname.startsWith('/messages')) return 'messages';

    return activeTab;
  };

  const currentActiveTab = getActiveTabFromPath();

  const handleNavigation = (itemId: string) => {
    onTabChange(itemId);
  };

  const mainMenuItems: MenuItem[] = [
    { id: 'home', icon: House, label: 'Home', count: notifications.matches, path: '/dashboard' },
    { id: 'profile', icon: User2, label: 'Profile', path: '/profile' },
    { id: 'matching', icon: Heart, label: 'Matching', path: '/matching' },
    {
      id: 'collaborations',
      icon: Users,
      label: 'Collaborations',
      subItems: [
        { id: 'collab-all', icon: Users, label: 'All Collaborations', path: '/collaboration' },
        { id: 'collab-search', icon: Search, label: 'Explore', path: '/collaboration/explore' },
        { id: 'collab-invites', icon: Mail, label: 'Invites', count: notifications.collaborations, path: '/collaboration/invites' },
        { id: 'collab-history', icon: History, label: 'History', path: '/collaboration/history' },
      ]
    },
  ];

  const businessItems: MenuItem[] = [
    { id: 'marketplace', icon: ShoppingBag, label: 'Marketplace', count: notifications.marketplace, path: '/marketplace' },
    { id: 'Subscription', icon: Currency, label: 'Subscription', path: '/payments/subscription' },
  ];

  const commItems: MenuItem[] = [
    { id: 'messages', icon: MessageCircle, label: 'Messages', count: notifications.messages, path: '/messages' },
  ];

  const Tooltip = ({ children, content }: { children: React.ReactNode; content: string }) => (
    <div className="relative group">
      {children}
      <AnimatePresence>
        {isCollapsed && (
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
    <>
      <style jsx>{`
        .sidebar-collapsed * {
          visibility: hidden !important;
        }
        .sidebar-collapsed .icon-container,
        .sidebar-collapsed svg,
        .sidebar-collapsed .avatar,
        .sidebar-collapsed .avatar span,
        .sidebar-collapsed .active-indicator,
        .sidebar-collapsed .gradient-bg {
          visibility: visible !important;
        }
      `}</style>
      <div className={`${isCollapsed ? 'w-16' : 'w-60'} flex flex-col border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 h-screen overflow-hidden transition-all duration-300 relative ${isCollapsed ? 'sidebar-collapsed' : ''} ${className || ''}`}>

        {/* Collapse Toggle */}
        <motion.button
          onClick={onToggleCollapse}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className={`hidden absolute z-20 w-6 h-6 rounded-full border shadow-sm transition-all duration-200 cursor-pointer lg:flex
          ${isCollapsed
              ? 'top-4 left-1/2 bg-gray-200 -translate-x-1/2 dark:bg-gray-700'
              : 'right-3 top-4 bg-gray-100 dark:bg-gray-800'
            }
            justify-center items-center border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 hover:shadow-md
            `}>
          <motion.div
            animate={{ rotate: isCollapsed ? 180 : 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <Menu className="w-3 h-3 text-gray-600 dark:text-gray-300" />
          </motion.div>
        </motion.button>

        {/* Navigation */}
        <div className={`${isCollapsed ? 'p-2 pt-12' : 'p-4 pt-12'} space-y-3 flex-1 overflow-y-auto overflow-x-hidden`}>
          {[mainMenuItems, businessItems, commItems].map((section, idx) => (
            <div key={idx}>
              {!isCollapsed && (
                <h3 className="px-3 mb-1 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  {idx === 0 ? "Main" : idx === 1 ? "Business" : "Communication"}
                </h3>
              )}
              <div className={`${isCollapsed ? 'mt-2' : 'mt-0'} space-y-1`}>
                {section.map((item) => {
                  const hasSubItems = item.subItems && item.subItems.length > 0;
                  const isParentActive = hasSubItems && item.subItems?.some(sub => currentActiveTab === sub.id);

                  return (
                    <div key={item.id} className="w-full">
                      <Tooltip content={item.label} >
                        <div
                          onClick={() => {
                            if (hasSubItems && !isCollapsed) {
                              setIsCollabOpen(!isCollabOpen);
                            } else if (item.path) {
                              router.push(item.path);
                              handleNavigation(item.id);
                            }
                          }}
                          className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-300 group relative overflow-hidden ${currentActiveTab === item.id || isParentActive
                              ? 'bg-purple-50 dark:bg-purple-900 border-l-4 border-purple-500 text-purple-700 dark:text-purple-300 shadow-sm gradient-bg'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400'
                            }`}
                        >
                          <div className={`relative flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                            <div className="icon-container">
                              <item.icon className="w-5 h-5 transition-all duration-300 group-hover:scale-110 group-hover:text-purple-600 dark:group-hover:text-purple-400" />
                            </div>
                            {!isCollapsed && (
                              <span className="overflow-hidden text-sm font-medium whitespace-nowrap">
                                {item.label}
                              </span>
                            )}
                          </div>

                          {!isCollapsed && hasSubItems && (
                            <motion.div animate={{ rotate: isCollabOpen ? 180 : 0 }}>
                              <ChevronDown className="w-4 h-4 opacity-50" />
                            </motion.div>
                          )}
                        </div>
                      </Tooltip>

                      {/* Sub-menu Rendering */}
                      <AnimatePresence>
                        {hasSubItems && isCollabOpen && !isCollapsed && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden flex flex-col mt-1"
                          >
                            {item.subItems?.map((sub) => (
                              <Link href={sub.path!} key={sub.id}>
                                <div
                                  className={`flex items-center gap-3 pl-6 pr-3 py-2 rounded-lg cursor-pointer transition-all text-sm font-medium ${currentActiveTab === sub.id
                                      ? 'text-purple-600 dark:text-purple-400'
                                      : 'text-gray-500 hover:text-purple-500 dark:text-gray-400 group/sub'
                                    }`}
                                >
                                  {/* Added the icon here */}
                                  <sub.icon className={`w-4 h-4 transition-colors ${currentActiveTab === sub.id ? 'text-purple-600' : 'group-hover/sub:text-purple-500'
                                    }`} />

                                  <span>{sub.label}</span>
                                </div>
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className={`mt-auto mb-10 lg:mb-20 ${isCollapsed ? 'p-2' : 'p-4'} border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800`}>
          {!isCollapsed ? (
            <>
              <div className='flex flex-col gap-3'>
                <div className="flex gap-2 items-center">
                  <div className="flex justify-center items-center w-10 h-10 bg-linear-to-r from-purple-500 to-pink-500 rounded-full avatar">
                    <span className="text-sm font-medium text-white">
                      {user.username?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                    </span>
                  </div>
                  <div className='max-w-37.5'>
                    <div className="mb-1 text-xs font-medium text-gray-900 truncate dark:text-gray-100">
                      {user.username || user.email}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {mockData.creator.niche.join(', ')}
                    </div>
                  </div>
                </div>

                <motion.button
                  onClick={handleLogout}
                  whileHover={{ scale: 1.02, x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-3 px-3 py-2.5 mt-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg transition-all duration-300 cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30 group lg:hidden"
                >
                  <LogOut className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  <span className="text-sm font-medium">Sign Out</span>
                </motion.button>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-2 items-center">
              <div className="flex justify-center items-center w-10 h-10 bg-linear-to-r from-purple-500 to-pink-500 rounded-full avatar">
                <span className="text-xs font-medium text-white">
                  {user.username?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                </span>
              </div>

              <motion.button
                onClick={handleLogout}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="flex justify-center items-center p-2 text-red-600 bg-red-50 rounded-lg transition-all duration-300 cursor-pointer dark:text-red-400 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};