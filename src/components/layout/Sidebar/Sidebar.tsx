"use client"
import React, { useState } from 'react';
import {
  Heart, Users, BarChart3, ShoppingBag, Video, MessageCircle,
  Zap, UserPlus, Calendar, DollarSign, Send, Settings, Menu, House
} from 'lucide-react';
import {useRouter} from "next/navigation"

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
  icon: any;
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
    { id: 'messages', icon: MessageCircle, label: 'Messages', count: notifications.messages },
    { id: 'invites', icon: Send, label: 'Invites' },
    { id: 'networking', icon: UserPlus, label: 'Network' }
  ];

  const getRizzScoreColor = (score: number) => {
    if (score >= 80) return 'from-green-400 to-emerald-500';
    if (score >= 60) return 'from-yellow-400 to-orange-500';
    return 'from-red-400 to-pink-500';
  };

  const getSubscriptionBadge = (tier: string) => {
    switch (tier) {
      case 'premium': return '👑';
      case 'pro': return '💎';
      default: return '';
    }
  };

  const Tooltip = ({ children, content }: { children: React.ReactNode; content: string }) => (
    <div className="group relative">
      {children}
      {collapsed && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white dark:bg-gray-700 dark:text-gray-100 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
          {content}
        </div>
      )}
    </div>
  );

  function handleClick(link: string){
    router.push(link)
  }

  return (
    <div className={`${collapsed ? 'w-16' : 'w-60'} border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 h-screen overflow-y-auto [&::-webkit-scrollbar]:hidden transition-all duration-300 relative`}>
      {/* Collapse Toggle */}
      <button
        onClick={onToggleCollapse}
        className="hidden lg:flex absolute top-4 right-3 z-10 w-6 h-6 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full items-center justify-center shadow-sm hover:shadow-md transition-all duration-200"
      >
        <Menu className="w-3 h-3 text-gray-600 dark:text-gray-300" />
      </button>

      {/* Header */}
      {/* … unchanged header code … */}

      {/* Navigation */}
      <div className={`${collapsed ? 'p-2' : 'p-4'} space-y-6`}>
        {[mainMenuItems, businessItems, commItems].map((section, idx) => (
          <div key={idx}>
            {!collapsed && (
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-3">
                {idx === 0 ? "Main" : idx === 1 ? "Business" : "Communication"}
              </h3>
            )}
            <div className="space-y-1">
              {section.map(item => (
                <Tooltip key={item.id} content={item.label}>
                  <div 
                    onClick={() => onTabChange(item.id)}
                    className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-3 py-3 rounded-lg cursor-pointer transition-all duration-200 group relative ${
                      activeTab === item.id 
                        ? 'bg-purple-50 dark:bg-purple-900 border-l-4 border-purple-500 text-purple-700 dark:text-purple-300' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400'
                    }`}
                  >
                    <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
                      <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                      {/* ✅ safe access to path */}
                      {item.path && <a href={item.path}>{!collapsed && <span className="text-sm font-medium">{item.label}</span>}</a>}
                      {!item.path && !collapsed && <span className="text-sm font-medium">{item.label}</span>}
                    </div>
                    {!collapsed && item.count && item.count > 0 && (
                      <div className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {item.count > 9 ? '9+' : item.count}
                      </div>
                    )}
                  </div>
                </Tooltip>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
        <div className={`mt-auto ${collapsed ? 'p-2' : 'p-4'} border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800`}>
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {user.username?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
              </span>
            </div>
            <div>
              <div className="font-medium text-sm text-gray-900 dark:text-gray-100">{user.username || user.email}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{mockData.creator.niche.join(', ')}</div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-xs">
                {user.username?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
