"use client"

import React, { useState, useEffect, useRef } from 'react';
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
import { UserSearchDropdown } from './UserSearchDropdown';
import { useUnreadNotificationCount } from '@/hooks/features/useNotifications';

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
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { logout } = useAuth();
  const router = useRouter();
  const { unreadCount } = useUnreadNotificationCount();
  const notificationButtonRef = React.useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const userMenuButtonRef = useRef<HTMLButtonElement>(null);
  const userMenuDropdownRef = useRef<HTMLDivElement>(null);

  // Reset avatar error when user changes
  useEffect(() => {
    setAvatarError(false);
  }, [user?.avatar]);

  // Handle search input focus to show dropdown
  useEffect(() => {
    if (searchQuery && searchQuery.trim().length >= 1) {
      setShowSearchDropdown(true);
    } else {
      setShowSearchDropdown(false);
    }
  }, [searchQuery]);

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showSearchDropdown &&
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSearchDropdown(false);
      }
    };

    if (showSearchDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSearchDropdown]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showUserMenu &&
        userMenuDropdownRef.current &&
        !userMenuDropdownRef.current.contains(event.target as Node) &&
        userMenuButtonRef.current &&
        !userMenuButtonRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showUserMenu]);

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
              <div className="flex justify-center items-center w-7 h-7 from-purple-600 to-pink-600 rounded-lg cursor-pointer bg-linear-to-r sm:w-8 sm:h-8">
                <span className="text-xs font-bold text-white cursor-pointer sm:text-sm">H</span>
              </div>
              <h1 className="hidden text-xl font-bold text-transparent bg-clip-text bg-linear-to-r from-purple-600 to-blue-600 cursor-pointer min-[400px]:block sm:text-2xl">
                HyperBuds
              </h1>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="hidden relative flex-1 mx-4 max-w-lg md:block" ref={searchContainerRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 w-4 h-4 text-gray-600 transform -translate-y-1/2 dark:text-gray-500" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search HyperBuds"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchQuery && searchQuery.trim().length >= 1) {
                  setShowSearchDropdown(true);
                }
              }}
              className="pl-10 pr-4 py-2.5 w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:bg-white dark:focus:bg-gray-700 transition-all duration-200 text-gray-900 dark:text-gray-100 placeholder-gray-600 dark:placeholder-gray-400"
            />

            {/* Search Dropdown */}
            <UserSearchDropdown
              query={searchQuery}
              isOpen={showSearchDropdown}
              onClose={() => setShowSearchDropdown(false)}
              onQueryChange={setSearchQuery}
              anchorRef={searchInputRef}
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
              ref={userMenuButtonRef}
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <div className="flex gap-2 items-center">
                {user?.avatar && !avatarError ? (
                  <div className="relative flex justify-center items-center w-8 h-8 overflow-hidden rounded-full">
                    <img 
                      src={user.avatar} 
                      alt={user.displayName || user.username || 'User'} 
                      className="object-cover w-full h-full"
                      onError={() => setAvatarError(true)}
                    />
                  </div>
                ) : (
                  <div className="flex justify-center items-center w-8 h-8 from-purple-500 to-pink-500 rounded-full bg-linear-to-r">
                    <span className="text-sm font-medium text-white">
                      {(user.username?.[0] || user.email[0] || 'U').toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="hidden text-left lg:block">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {user.displayName || user.username || 'User'}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Premium Creator</p>
                </div>
                <ChevronDown className="hidden w-4 h-4 text-gray-600 dark:text-gray-500 lg:block" />
              </div>
            </button>

            {/* User Menu Dropdown */}
            {showUserMenu && (
              <div
                ref={userMenuDropdownRef}
                className="absolute right-0 z-50 py-2 mt-2 w-64 bg-white rounded-xl border border-gray-200 shadow-xl dark:bg-gray-800 dark:border-gray-700"
              >
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex gap-3 items-center">
                    {user?.avatar && !avatarError ? (
                      <div className="relative flex justify-center items-center w-10 h-10 overflow-hidden rounded-full">
                        <img 
                          src={user.avatar} 
                          alt={user.displayName || user.username || 'User'} 
                          className="object-cover w-full h-full"
                          onError={() => setAvatarError(true)}
                        />
                      </div>
                    ) : (
                      <div className="flex justify-center items-center w-10 h-10 from-purple-500 to-pink-500 rounded-full bg-linear-to-r">
                        <span className="font-medium text-white">
                          {(user.username?.[0] || user.email[0] || 'U').toUpperCase()}
                        </span>
                      </div>
                    )}
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
          <Search className="absolute left-3 top-1/2 w-4 h-4 text-gray-600 transform -translate-y-1/2 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2.5 w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:bg-white dark:focus:bg-gray-700 transition-all duration-200 text-gray-900 dark:text-gray-100 placeholder-gray-600 dark:placeholder-gray-400"
          />
        </div>
      </div> */}

    </header>
  );
};