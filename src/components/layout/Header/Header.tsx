"use client"

import React, { useState } from 'react';
import {
  
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
import { useTheme } from '@/context/Theme'; // Adjust path as needed

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

  const mockNotifications = [
    { id: 1, type: 'match', message: 'New collaboration match found!', time: '2m ago', unread: true },
    { id: 2, type: 'message', message: 'Sarah Kim sent you a message', time: '1h ago', unread: true },
    { id: 3, type: 'collab', message: 'Your collaboration request was accepted', time: '2h ago', unread: false },
  ];

  const unreadCount = mockNotifications.filter(n => n.unread).length;

  return (
    <header className="sticky top-0 z-50 border-b shadow-sm backdrop-blur-lg transition-colors duration-200 bg-white/95 dark:bg-gray-900/95 border-gray-200/50 dark:border-gray-700/50">
      <div className="flex justify-between items-center px-6 py-4">

        {/* Left Section */}
        <div className="flex gap-6 items-center">
          {/* Hamburger Menu Button - Mobile Only */}
          <button
            onClick={onMenuClick}
            className="p-2 bg-gray-100 rounded-xl transition-colors lg:hidden dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>

          {/* Logo */}
          <div className="flex gap-3 items-center cursor-pointer" onClick={() => window.location.href = '/'}>
            <div className="flex gap-2 items-center" >
              <div className="flex justify-center items-center w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg cursor-pointer">
                <span className="text-sm font-bold text-white cursor-pointer">H</span>
              </div>
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 cursor-pointer">
                HyperBuds
              </h1>
            </div>
          </div>
        </div>

        {/* Search Bar 
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
        </div>*/}

        {/* Right Section */}
        <div className="flex gap-4 items-center">

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="hidden lg:flex p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 cursor-pointer dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            )}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            >
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              {unreadCount > 0 && (
                <span className="flex absolute -top-1 -right-1 justify-center items-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 z-50 py-2 mt-2 w-80 bg-white rounded-xl border border-gray-200 shadow-xl dark:bg-gray-800 dark:border-gray-700">
                <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Notifications</h3>
                </div>
                <div className="overflow-y-auto max-h-80">
                  {mockNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${notification.unread ? 'bg-purple-50 dark:bg-purple-900/20' : ''
                        }`}
                    >
                      <div className="flex gap-3 items-start">
                        <div className={`w-2 h-2 rounded-full mt-2 ${notification.unread ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-600'
                          }`} />
                        <div className="flex-1">
                          <p className="text-sm text-gray-900 dark:text-gray-100">{notification.message}</p>
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{notification.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700">
                  <button className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <div className="flex gap-2 items-center">
                <div className="flex justify-center items-center w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
                  <span className="text-sm font-medium text-white">
                    {user.username?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
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
                    <div className="flex justify-center items-center w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
                      <span className="font-medium text-white">
                        {user.username?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                      </span>
                    </div>
                    <div className='max-w-[10rem]'>
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
                  <button className="flex gap-3 items-center px-4 py-2 w-full text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-700">
                    <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <a href="/profile"><span className="text-sm text-gray-700 dark:text-gray-300">View Profile</span></a>
                  </button>
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
                  <button className="flex gap-3 items-center px-4 py-2 w-full text-left text-red-600 transition-colors cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-red-400">
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