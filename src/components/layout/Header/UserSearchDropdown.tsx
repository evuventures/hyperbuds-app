'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Loader2, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { searchUsers, type UserSearchResult } from '@/lib/api/user.api';

interface UserSearchDropdownProps {
  query: string;
  isOpen: boolean;
  onClose: () => void;
  onQueryChange: (query: string) => void;
  anchorRef?: React.RefObject<HTMLElement | null>;
}

export const UserSearchDropdown: React.FC<UserSearchDropdownProps> = ({
  query,
  isOpen,
  onClose,
  onQueryChange,
  anchorRef,
}) => {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Memoize the search function with useCallback to prevent infinite loops
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.trim().length < 1) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const searchResponse = await searchUsers(searchQuery);
      setResults(searchResponse.users || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search users';
      setError(errorMessage);
      console.error('Search error:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce search using the memoized performSearch function
  useEffect(() => {
    if (!isOpen || !query) {
      setResults([]);
      setError(null);
      return;
    }

    const timeoutId = setTimeout(() => {
      if (query.trim().length >= 1) {
        performSearch(query.trim());
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, isOpen, performSearch]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [results]);

  // Handle user click - memoized to prevent recreation
  const handleUserClick = useCallback((user: UserSearchResult) => {
    router.push(`/profile/@${user.username}`);
    onClose();
    onQueryChange(''); // Clear search query
  }, [router, onClose, onQueryChange]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        anchorRef?.current &&
        !anchorRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose, anchorRef]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setSelectedIndex((prev) =>
            prev < results.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
          break;
        case 'Enter':
          event.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < results.length) {
            handleUserClick(results[selectedIndex]);
          }
          break;
        case 'Escape':
          event.preventDefault();
          onClose();
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, selectedIndex, results, onClose, handleUserClick]);

  const getAvatarInitial = (user: UserSearchResult): string => {
    return (user.displayName || user.username || 'U')[0].toUpperCase();
  };

  const renderResultsContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col justify-center items-center py-8">
          <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Searching users...
          </p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="px-4 py-8 text-center">
          <Search className="mx-auto mb-3 w-10 h-10 text-gray-300 dark:text-gray-600" />
          <p className="mb-1 text-sm font-medium text-gray-900 dark:text-gray-100">
            Unable to search users
          </p>
          <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
            {error}
          </p>
        </div>
      );
    }

    const hasQuery = query.length >= 1;
    const noResults = results.length === 0;

    if (hasQuery && noResults) {
      return (
        <div className="px-4 py-8 text-center">
          <UserIcon className="mx-auto mb-2 w-10 h-10 text-gray-300 dark:text-gray-600" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No users found for &quot;{query}&quot;
          </p>
        </div>
      );
    }

    return (
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {results.map((user, index) => {
          const isSelected = selectedIndex === index;
          const baseClasses = 'w-full px-4 py-3 text-left transition-colors';
          const selectedClasses = isSelected
            ? 'bg-purple-50 dark:bg-purple-900/20'
            : 'hover:bg-gray-50 dark:hover:bg-gray-700';

          return (
            <button
              key={user.id}
              onClick={() => handleUserClick(user)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`${baseClasses} ${selectedClasses}`}
            >
              <div className="flex gap-3 items-center">
                {/* Avatar */}
                {user.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user.displayName || user.username}
                    width={40}
                    height={40}
                    className="object-cover w-10 h-10 rounded-full"
                    unoptimized
                  />
                ) : (
                  <div className="flex justify-center items-center w-10 h-10 from-purple-500 to-pink-500 rounded-full bg-linear-to-r">
                    <span className="text-sm font-medium text-white">
                      {getAvatarInitial(user)}
                    </span>
                  </div>
                )}

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate dark:text-gray-100">
                    {user.displayName || user.username}
                  </p>
                  <p className="text-xs text-gray-500 truncate dark:text-gray-400">
                    @{user.username}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    );
  };

  if (!isOpen || !query) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        ref={dropdownRef}
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="absolute left-0 z-50 py-2 mt-2 w-full min-w-[320px] max-w-md bg-white rounded-xl border border-gray-200 shadow-xl dark:bg-gray-800 dark:border-gray-700"
      >
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100 dark:border-gray-700">
          <div className="flex gap-2 items-center">
            <Search className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Search Results
            </h3>
          </div>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto max-h-96">
          {renderResultsContent()}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UserSearchDropdown;
