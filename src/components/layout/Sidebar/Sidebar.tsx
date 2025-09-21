"use client"
import React, { useState } from 'react';
import {
  Heart, Users, ShoppingBag, Video, MessageCircle,
  UserPlus, Calendar, DollarSign, Send, Menu, House
} from 'lucide-react';
import { useRouter } from "next/navigation"

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
    messages: 5
  }
};

export const Sidebar: React.FC<SidebarProps> = ({ user, activeTab, collapsed, onTabChange, onToggleCollapse }) => {
  const router = useRouter()
  const [notifications] = useState(mockData.notifications);

  // ✅ typed arrays
  const mainMenuItems: MenuItem[] = [
    { id: 'home', icon: House, label: 'Home', count: notifications.matches, path: '/dashboard' },
    { id: 'matches', icon: Heart, label: 'AI Matches', count: notifications.matches },
    { id: 'collaborations', icon: Users, label: 'Collaborations', count: notifications.collaborations },
    { id: 'streaming', icon: Video, label: 'Live Streaming' }
  ];

  const businessItems: MenuItem[] = [
    { id: 'marketplace', icon: ShoppingBag, label: 'Marketplace', count: notifications.marketplace },
    { id: 'bookings', icon: Calendar, label: 'Bookings' },
    { id: 'earnings', icon: DollarSign, label: 'Earnings' }
  ];

  const commItems: MenuItem[] = [
    {
      id: 'messages', icon: MessageCircle, label: 'Messages', count: notifications.messages,
      path: '/messages'
    },
    { id: 'invites', icon: Send, label: 'Invites' },
    { id: 'networking', icon: UserPlus, label: 'Network' }
  ];

 

 

  const Tooltip = ({ children, content }: { children: React.ReactNode; content: string }) => (
    <div className="relative group">
      {children}
      {collapsed && (
        <div className="absolute left-full z-50 px-2 py-1 ml-2 text-xs text-white whitespace-nowrap bg-gray-800 rounded opacity-0 transition-opacity duration-200 dark:bg-gray-700 dark:text-gray-100 group-hover:opacity-100">
          {content}
        </div>
      )}
    </div>
  );

  function handleClick(link: string) {
    router.push(link)
  }

  return (
    <div className={`${collapsed ? 'w-16' : 'w-60'} border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden transition-all duration-300 relative  `}>

      {/* Collapse Toggle */}
      <button
        onClick={onToggleCollapse}
        className={`hidden absolute z-10 w-6 h-6 rounded-full border shadow-sm transition-all duration-200 cursor-pointer lg:flex
          ${collapsed
            ? 'top-4 left-1/2 bg-gray-200 -translate-x-1/2 dark:bg-gray-700'
            : 'right-3 top-4 bg-gray-100 dark:bg-gray-800'
          }
            justify-center items-center border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 hover:shadow-md
            `}>
        <Menu className="w-3 h-3 text-gray-600 dark:text-gray-300" />
      </button>


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
              {section.map(item => (
                <Tooltip key={item.id} content={item.label} >
                  <div
                    onClick={() => onTabChange(item.id)}
                    className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-3  py-3 rounded-lg cursor-pointer transition-all duration-200 group relative ${activeTab === item.id
                      ? 'bg-purple-50 dark:bg-purple-900 border-l-4 border-purple-500 text-purple-700 dark:text-purple-300'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400'
                      }`}
                  >
                    <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
                      <item.icon className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                      {/* ✅ safe access to path */}
                      {item.path && <a href={item.path}>{!collapsed && <span className="text-sm font-medium">{item.label}</span>}</a>}
                      {!item.path && !collapsed && <span className="text-sm font-medium">
                        {item.label}
                      </span>}
                    </div>
                    {
                      !collapsed && item.count && item.count > 0 && (
                        <div className="flex justify-center items-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                          {item.count > 9 ? '9+' : item.count}
                        </div>
                      )
                    }
                  </div >
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
