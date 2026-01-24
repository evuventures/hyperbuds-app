"use client"

import React, { useState } from 'react';
import {
  Search,
  Bell,
  Settings,
  ChevronDown,
  Sun,
  Moon,
  User,
  LogOut,
  CreditCard,
  Menu,
} from 'lucide-react';
import { useTheme } from '@/context/Theme';
import { useAuth } from '@/hooks/auth/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { NotificationDropdown } from './NotificationDropdown';
import { useUnreadNotificationCount } from '@/hooks/features/useNotifications';
import { useNotificationSocket } from '@/hooks/features/useNotificationSocket';

interface HeaderProps {
  user: {
    username?: string;
    email: string;
    displayName?: string;
    avatar?: string;
  };
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onMenuClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { logout } = useAuth();
  const router = useRouter();
  const { unreadCount } = useUnreadNotificationCount();
  const notificationButtonRef = React.useRef<HTMLButtonElement>(null);

  // Connect to notification WebSocket for real-time updates
  useNotificationSocket({
    enabled: true,
  });

  const handleLogout = async () => {
    try {
      await logout();
      setShowUserMenu(false);
      router.push('/auth/signin');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };


  return (
    <header className="sticky top-0 z-50 border-b shadow-sm backdrop-blur-lg transition-colors duration-200 bg-white/95 dark:bg-gray-900/95 border-gray-200/50 dark:border-gray-700/50">
      <div className="flex justify-between items-center px-3 py-3 sm:px-6 sm:py-4">

        {/* Left Section */}
        <div className="flex gap-2 items-center sm:gap-6">
          {/* Hamburger Menu Button - Mobile Only */}
          <button
            onClick={onMenuClick}
            className="p-2 bg-gray-100 rounded-xl transition-colors lg:hidden dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label="Open menu"
          >
            <Menu className="w-4 h-4 text-gray-600 dark:text-gray-300 sm:w-5 sm:h-5" />
          </button>

          {/* Logo */}
          <div className="flex gap-2 items-center cursor-pointer sm:gap-3" onClick={() => window.location.href = '/'}>
            <div className="flex gap-2 items-center" >
              <div className="flex justify-center items-center w-7 h-7 bg-linear-to-r from-purple-600 to-pink-600 rounded-lg cursor-pointer sm:w-8 sm:h-8">
                <span className="text-xs font-bold text-white cursor-pointer sm:text-sm">H</span>
              </div>
              <h1 className="hidden text-xl font-bold text-transparent bg-clip-text bg-linear-to-r from-purple-600 to-blue-600 cursor-pointer min-[400px]:block sm:text-2xl">
                HyperBuds
              </h1>
            </div>
          </div>
        </div>

        {/* Search Bar  */}
        <div className="hidden relative md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 w-4 h-4 text-gray-400 transform -translate-y-1/2 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search creators, collaborations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 w-80 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:bg-white dark:focus:bg-gray-700 transition-all duration-200 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex gap-2 items-center sm:gap-4">

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="flex p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 cursor-pointer dark:hover:bg-gray-700 transition-colors sm:p-2.5"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-gray-600 dark:text-gray-300 sm:w-5 sm:h-5" />
            ) : (
              <Moon className="w-4 h-4 text-gray-600 dark:text-gray-300 sm:w-5 sm:h-5" />
            )}
          </button>

          {/* Notifications */}
          <div className="relative hidden min-[380px]:block">
            <button
              ref={notificationButtonRef}
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer sm:p-2.5"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4 text-gray-600 dark:text-gray-300 sm:w-5 sm:h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
              )}
            </button>

            {/* Notifications Dropdown */}
            <NotificationDropdown
              isOpen={showNotifications}
              onClose={() => setShowNotifications(false)}
              anchorRef={notificationButtonRef}
            />
          </div>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <div className="flex gap-2 items-center">
                <div className="flex justify-center items-center w-8 h-8 bg-linear-to-r from-purple-500 to-pink-500 rounded-full">
                  <span className="text-sm font-medium text-white">
                    {/* {user.username?.[0]?.toUpperCase() || user.email[0].toUpperCase()} */}
                    <img src={user?.avatar} alt="User-img" />
                  </span>
                </div>
                <div className="hidden text-left lg:block">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {user.displayName || user.username || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Premium Creator</p>
                </div>
                <ChevronDown className="hidden w-4 h-4 text-gray-400 dark:text-gray-500 lg:block" />
              </div>
            </button>

            {/* User Menu Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 z-50 py-2 mt-2 w-64 bg-white rounded-xl border border-gray-200 shadow-xl dark:bg-gray-800 dark:border-gray-700">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex gap-3 items-center">
                    <div className="flex justify-center items-center w-10 h-10 bg-linear-to-r from-purple-500 to-pink-500 rounded-full">
                      <span className="font-medium text-white">
                        {user.username?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                      </span>
                    </div>
                    <div className='max-w-40'>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {user.displayName || user.username || 'User'}
                      </p>
                      <p className="text-sm text-gray-500 truncate dark:text-gray-400">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="py-2">
                  <Link href="/profile" className="flex gap-3 items-center px-4 py-2 w-full text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-700">
                    <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">View Profile</span>
                  </Link>
                  <button className="flex gap-3 items-center px-4 py-2 w-full text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-700">
                    <Settings className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm text-gray-700 cursor-pointer dark:text-gray-300">Account Settings</span>
                  </button>
                  <button
                    onClick={() => window.location.href = '/payments/subscription'}
                    className="flex gap-3 items-center px-4 py-2 w-full text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <CreditCard className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm text-gray-700 cursor-pointer dark:text-gray-300">Billing & Payments</span>
                  </button>
                </div>

                <div className="py-2 border-t border-gray-100 dark:border-gray-700">
                  <button
                    onClick={handleLogout}
                    className="flex gap-3 items-center px-4 py-2 w-full text-left text-red-600 transition-colors cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-red-400"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Bar 
      <div className="px-6 pb-4 md:hidden">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 w-4 h-4 text-gray-400 transform -translate-y-1/2 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2.5 w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:bg-white dark:focus:bg-gray-700 transition-all duration-200 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>
      </div> */}

      {/* Click outside to close dropdowns */}
      {(showUserMenu || showNotifications) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowUserMenu(false);
            setShowNotifications(false);
          }}
        />
      )}
    </header>
  );
};