'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
   ArrowLeft,
   Filter,
   Trophy,
   Users,
   MapPin,
   Calendar,
   X,
   ChevronDown
} from 'lucide-react';
import DashboardLayout from '@/components/layout/Dashboard/Dashboard';
import RizzLeaderboard from '@/components/matching/RizzLeaderboard';
import type { LeaderboardQuery } from '@/types/matching.types';

// Available niches for filtering
const AVAILABLE_NICHES = [
   'gaming', 'tech', 'music', 'education', 'fitness', 'comedy',
   'lifestyle', 'travel', 'food', 'art', 'photography', 'fashion',
   'beauty', 'sports', 'business', 'finance', 'health', 'diy'
];

// Available locations for filtering
const AVAILABLE_LOCATIONS = [
   'Afghanistan', 'Albania', 'Algeria', 'American Samoa', 'Andorra', 'Angola', 'Antigua and Barbuda',
   'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh',
   'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina',
   'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cambodia', 'Cameroon',
   'Canada', 'Cape Verde', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros',
   'Congo', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti',
   'Dominica', 'Dominican Republic', 'East Timor', 'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea',
   'Eritrea', 'Estonia', 'Ethiopia', 'Fiji', 'Finland', 'France', 'Gabon', 'Gambia', 'Georgia',
   'Germany', 'Ghana', 'Greece', 'Grenada', 'Guam', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana',
   'Haiti', 'Honduras', 'Hong Kong', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq',
   'Ireland', 'Israel', 'Italy', 'Ivory Coast', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya',
   'Kiribati', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya',
   'Liechtenstein', 'Lithuania', 'Luxembourg', 'Macau', 'Macedonia', 'Madagascar', 'Malawi', 'Malaysia',
   'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia',
   'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru',
   'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'Norway',
   'Oman', 'Pakistan', 'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru',
   'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda', 'Saint Kitts and Nevis',
   'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'São Tomé and Príncipe',
   'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia',
   'Solomon Islands', 'Somalia', 'South Africa', 'South Korea', 'South Sudan', 'Spain', 'Sri Lanka',
   'Sudan', 'Suriname', 'Swaziland', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 'Tanzania',
   'Thailand', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu',
   'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan',
   'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'
];

const LeaderboardPage: React.FC = () => {
   const router = useRouter();
   const [showFilters, setShowFilters] = useState(false);
   const [filters, setFilters] = useState<LeaderboardQuery>({
      timeframe: 'current',
      limit: 10
   });
   const [openDropdowns, setOpenDropdowns] = useState<{
      timeframe: boolean;
      niche: boolean;
      location: boolean;
      limit: boolean;
   }>({
      timeframe: false,
      niche: false,
      location: false,
      limit: false
   });

   const [dropdownPositions, setDropdownPositions] = useState<{
      [key: string]: { top: number; left: number; width: number }
   }>({});

   const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

   const handleBack = () => {
      router.back();
   };

   const handleFilterChange = (newFilters: Partial<LeaderboardQuery>) => {
      setFilters(prev => ({ ...prev, ...newFilters }));
   };

   const toggleDropdown = (dropdown: keyof typeof openDropdowns) => {
      const isOpening = !openDropdowns[dropdown];

      if (isOpening) {
         const ref = dropdownRefs.current[dropdown];
         if (ref) {
            const rect = ref.getBoundingClientRect();
            setDropdownPositions(prev => ({
               ...prev,
               [dropdown]: {
                  top: rect.bottom + window.scrollY + 8,
                  left: rect.left + window.scrollX,
                  width: rect.width
               }
            }));
         }
      }

      setOpenDropdowns(prev => ({
         ...prev,
         [dropdown]: isOpening
      }));
   };

   const closeAllDropdowns = () => {
      setOpenDropdowns({
         timeframe: false,
         niche: false,
         location: false,
         limit: false
      });
   };

   // Close dropdowns when clicking outside
   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
         const target = event.target as Element;

         // Don't close dropdowns if clicking on sidebar navigation or other navigation elements
         if (target.closest('[data-sidebar]') ||
            target.closest('.sidebar') ||
            target.closest('[data-navigation]') ||
            target.closest('nav') ||
            target.closest('a[href]') ||
            target.closest('button[data-navigation]') ||
            target.closest('[role="navigation"]') ||
            target.closest('[aria-label*="navigation"]')) {
            return;
         }

         if (!target.closest('.dropdown-container')) {
            closeAllDropdowns();
         }
      };

      // Use a small delay to allow navigation clicks to process first
      const timeoutId = setTimeout(() => {
         document.addEventListener('mousedown', handleClickOutside);
      }, 100);

      return () => {
         clearTimeout(timeoutId);
         document.removeEventListener('mousedown', handleClickOutside);
      };
   }, []);

   const resetFilters = () => {
      setFilters({
         timeframe: 'current',
         limit: 10
      });
   };

   const hasActiveFilters = () => {
      return Boolean(
         filters.niche ||
         filters.location ||
         (filters.timeframe && filters.timeframe !== 'current') ||
         (filters.limit && filters.limit !== 10)
      );
   };

   return (
      <DashboardLayout>
         <div className="min-h-full bg-gradient-to-br from-gray-50 via-white to-gray-100 transition-colors duration-200 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
            <div className="px-3 py-4 pb-16 mx-auto max-w-7xl sm:px-4 sm:py-6 lg:px-8 lg:pb-34">
               {/* Header */}
               <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 sm:mb-8"
               >
                  {/* Mobile Layout */}
                  <div className="block sm:hidden">
                     <div className="flex justify-between items-center mb-4">
                        <motion.button
                           onClick={handleBack}
                           className="flex flex-shrink-0 gap-2 items-center px-3 py-2 text-gray-700 bg-gray-100 rounded-lg transition-all duration-200 cursor-pointer dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                           whileHover={{ scale: 1.02 }}
                           whileTap={{ scale: 0.98 }}
                        >
                           <ArrowLeft className="w-4 h-4" />
                           <span className="hidden text-sm font-medium xs:inline">Back</span>
                        </motion.button>

                        <motion.button
                           onClick={() => setShowFilters(!showFilters)}
                           className="flex flex-shrink-0 gap-2 items-center px-3 py-2 text-gray-700 bg-gray-100 rounded-lg transition-all duration-200 cursor-pointer dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                           whileHover={{ scale: 1.02 }}
                           whileTap={{ scale: 0.98 }}
                        >
                           <Filter className="w-4 h-4" />
                           <span className="hidden text-sm font-medium xs:inline">Filter</span>
                        </motion.button>
                     </div>

                     <div className="text-center">
                        <div className="flex gap-3 justify-center items-center mb-3">
                           <div className="p-2 bg-gradient-to-r from-yellow-100 to-amber-100 rounded-lg dark:from-yellow-900/20 dark:to-amber-900/20">
                              <Trophy className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                           </div>
                           <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                              Rizz Score Leaderboard
                           </h1>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                           Top creators ranked by their Rizz Score
                        </p>
                     </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden justify-between items-center sm:flex">
                     <div className="flex flex-1 gap-4 items-center min-w-0">
                        <motion.button
                           onClick={handleBack}
                           className="flex flex-shrink-0 gap-2 items-center px-3 py-2 text-gray-700 bg-gray-100 rounded-lg transition-all duration-200 cursor-pointer dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                           whileHover={{ scale: 1.02 }}
                           whileTap={{ scale: 0.98 }}
                        >
                           <ArrowLeft className="w-4 h-4" />
                           <span className="text-sm font-medium">Back</span>
                        </motion.button>

                        <div className="flex gap-3 items-center min-w-0">
                           <div className="flex-shrink-0 p-2 bg-gradient-to-r from-yellow-100 to-amber-100 rounded-lg dark:from-yellow-900/20 dark:to-amber-900/20">
                              <Trophy className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                           </div>
                           <div className="min-w-0">
                              <h1 className="text-2xl font-bold text-gray-900 truncate lg:text-3xl dark:text-white">
                                 Rizz Score Leaderboard
                              </h1>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                 Top creators ranked by their Rizz Score
                              </p>
                           </div>
                        </div>
                     </div>

                     {/* Filter Button */}
                     <motion.button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer flex-shrink-0
                  ${hasActiveFilters()
                              ? 'text-purple-700 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400'
                              : 'text-gray-700 bg-gray-100 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                           }
                `}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                     >
                        <Filter className="w-4 h-4" />
                        <span className="hidden text-sm font-medium md:inline">Filters</span>
                        {hasActiveFilters() && (
                           <div className="flex-shrink-0 w-2 h-2 bg-purple-500 rounded-full"></div>
                        )}
                     </motion.button>
                  </div>
               </motion.div>

               {/* Filters Panel */}
               <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{
                     opacity: showFilters ? 1 : 0,
                     height: showFilters ? 'auto' : 0
                  }}
                  className="overflow-hidden"
               >
                  <div className="relative z-10 p-4 mb-6 bg-white rounded-xl border border-gray-200 shadow-sm transition-all duration-300 sm:p-6 dark:bg-gray-800 dark:border-gray-700">
                     <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:justify-between sm:items-center sm:gap-4">
                        <h3 className="flex-shrink-0 text-base font-semibold text-gray-900 sm:text-lg dark:text-white">
                           Filter Leaderboard
                        </h3>
                        <div className="flex flex-col gap-2 items-stretch sm:flex-row sm:items-center sm:justify-end">
                           {hasActiveFilters() && (
                              <motion.button
                                 onClick={resetFilters}
                                 className="px-3 py-2 text-sm font-medium text-orange-700 bg-orange-100 rounded-lg border border-orange-200 transition-all duration-200 cursor-pointer hover:text-orange-800 hover:bg-orange-200 hover:border-orange-300 dark:text-orange-300 dark:bg-orange-900/30 dark:border-orange-700 dark:hover:text-orange-200 dark:hover:bg-orange-900/50 dark:hover:border-orange-600 sm:px-4"
                                 whileHover={{ scale: 1.02 }}
                                 whileTap={{ scale: 0.98 }}
                                 transition={{ type: "spring", stiffness: 300, damping: 20 }}
                              >
                                 <div className="flex gap-2 justify-center items-center">
                                    <svg className="flex-shrink-0 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    <span>Reset</span>
                                 </div>
                              </motion.button>
                           )}
                           <motion.button
                              onClick={() => setShowFilters(false)}
                              className="px-3 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg border border-red-200 transition-all duration-200 cursor-pointer hover:text-red-800 hover:bg-red-200 hover:border-red-300 dark:text-red-300 dark:bg-red-900/30 dark:border-red-700 dark:hover:text-red-200 dark:hover:bg-red-900/50 dark:hover:border-red-600 sm:px-4"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              transition={{ type: "spring", stiffness: 300, damping: 20 }}
                           >
                              <div className="flex gap-2 justify-center items-center">
                                 <X className="flex-shrink-0 w-4 h-4" />
                                 <span>Close</span>
                              </div>
                           </motion.button>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Timeframe Filter */}
                        <div
                           className="relative dropdown-container"
                           ref={(el) => { dropdownRefs.current.timeframe = el; }}
                        >
                           <label className="block mb-2 text-xs font-medium text-gray-700 sm:text-sm dark:text-gray-300">
                              <Calendar className="inline mr-1 w-3 h-3 sm:w-4 sm:h-4" />
                              Timeframe
                           </label>
                           <div className="relative">
                              <button
                                 onClick={() => {
                                    toggleDropdown('timeframe');
                                    closeAllDropdowns();
                                    if (!openDropdowns.timeframe) toggleDropdown('timeframe');
                                 }}
                                 className={`w-full flex items-center justify-between px-4 py-3 text-xs sm:text-sm rounded-lg transition-all duration-200 cursor-pointer ${openDropdowns.timeframe
                                    ? 'bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-400 dark:border-purple-500 shadow-md'
                                    : 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:border-purple-400'
                                    } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                              >
                                 <span className="text-gray-900 dark:text-white">
                                    {filters.timeframe === 'current' ? 'Current' :
                                       filters.timeframe === 'weekly' ? 'Weekly' : 'Monthly'}
                                 </span>
                                 <motion.div
                                    animate={{ rotate: openDropdowns.timeframe ? 180 : 0 }}
                                    transition={{ duration: 0.2 }}
                                 >
                                    <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                 </motion.div>
                              </button>

                              {openDropdowns.timeframe && (
                                 <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="dropdown-menu-enhanced custom-scrollbar"
                                    style={{
                                       top: dropdownPositions.timeframe?.top || 0,
                                       left: dropdownPositions.timeframe?.left || 0,
                                       width: dropdownPositions.timeframe?.width || 'auto'
                                    }}
                                 >
                                    {['current', 'weekly', 'monthly'].map((option) => (
                                       <button
                                          key={option}
                                          onClick={() => {
                                             handleFilterChange({ timeframe: option as 'current' | 'weekly' | 'monthly' });
                                             toggleDropdown('timeframe');
                                          }}
                                          data-selected={filters.timeframe === option}
                                       >
                                          {option === 'current' ? 'Current' :
                                             option === 'weekly' ? 'Weekly' : 'Monthly'}
                                       </button>
                                    ))}
                                 </motion.div>
                              )}
                           </div>
                        </div>

                        {/* Niche Filter */}
                        <div
                           className="relative dropdown-container"
                           ref={(el) => { dropdownRefs.current.niche = el; }}
                        >
                           <label className="block mb-2 text-xs font-medium text-gray-700 sm:text-sm dark:text-gray-300">
                              <Users className="inline mr-1 w-3 h-3 sm:w-4 sm:h-4" />
                              Niche
                           </label>
                           <div className="relative">
                              <button
                                 onClick={() => {
                                    toggleDropdown('niche');
                                    closeAllDropdowns();
                                    if (!openDropdowns.niche) toggleDropdown('niche');
                                 }}
                                 className={`w-full flex items-center justify-between px-4 py-3 text-xs sm:text-sm rounded-lg transition-all duration-200 cursor-pointer ${openDropdowns.niche
                                    ? 'bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-400 dark:border-purple-500 shadow-md'
                                    : 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:border-purple-400'
                                    } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                              >
                                 <span className="text-gray-900 dark:text-white">
                                    {filters.niche ? filters.niche.charAt(0).toUpperCase() + filters.niche.slice(1) : 'All Niches'}
                                 </span>
                                 <motion.div
                                    animate={{ rotate: openDropdowns.niche ? 180 : 0 }}
                                    transition={{ duration: 0.2 }}
                                 >
                                    <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                 </motion.div>
                              </button>

                              {openDropdowns.niche && (
                                 <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="dropdown-menu-enhanced custom-scrollbar"
                                    style={{
                                       top: dropdownPositions.niche?.top || 0,
                                       left: dropdownPositions.niche?.left || 0,
                                       width: dropdownPositions.niche?.width || 'auto'
                                    }}
                                 >
                                    <button
                                       onClick={() => {
                                          handleFilterChange({ niche: undefined });
                                          toggleDropdown('niche');
                                       }}
                                       data-selected={!filters.niche}
                                    >
                                       All Niches
                                    </button>
                                    {AVAILABLE_NICHES.map(niche => (
                                       <button
                                          key={niche}
                                          onClick={() => {
                                             handleFilterChange({ niche });
                                             toggleDropdown('niche');
                                          }}
                                          data-selected={filters.niche === niche}
                                       >
                                          {niche.charAt(0).toUpperCase() + niche.slice(1)}
                                       </button>
                                    ))}
                                 </motion.div>
                              )}
                           </div>
                        </div>

                        {/* Location Filter */}
                        <div
                           className="relative dropdown-container"
                           ref={(el) => { dropdownRefs.current.location = el; }}
                        >
                           <label className="block mb-2 text-xs font-medium text-gray-700 sm:text-sm dark:text-gray-300">
                              <MapPin className="inline mr-1 w-3 h-3 sm:w-4 sm:h-4" />
                              Location
                           </label>
                           <div className="relative">
                              <button
                                 onClick={() => {
                                    toggleDropdown('location');
                                    closeAllDropdowns();
                                    if (!openDropdowns.location) toggleDropdown('location');
                                 }}
                                 className={`w-full flex items-center justify-between px-4 py-3 text-xs sm:text-sm rounded-lg transition-all duration-200 cursor-pointer ${openDropdowns.location
                                    ? 'bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-400 dark:border-purple-500 shadow-md'
                                    : 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:border-purple-400'
                                    } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                              >
                                 <span className="text-gray-900 dark:text-white">
                                    {filters.location || 'All Locations'}
                                 </span>
                                 <motion.div
                                    animate={{ rotate: openDropdowns.location ? 180 : 0 }}
                                    transition={{ duration: 0.2 }}
                                 >
                                    <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                 </motion.div>
                              </button>

                              {openDropdowns.location && (
                                 <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="dropdown-menu-enhanced custom-scrollbar"
                                    style={{
                                       top: dropdownPositions.location?.top || 0,
                                       left: dropdownPositions.location?.left || 0,
                                       width: dropdownPositions.location?.width || 'auto'
                                    }}
                                 >
                                    <button
                                       onClick={() => {
                                          handleFilterChange({ location: undefined });
                                          toggleDropdown('location');
                                       }}
                                       data-selected={!filters.location}
                                    >
                                       All Locations
                                    </button>
                                    {AVAILABLE_LOCATIONS.map(location => (
                                       <button
                                          key={location}
                                          onClick={() => {
                                             handleFilterChange({ location });
                                             toggleDropdown('location');
                                          }}
                                          data-selected={filters.location === location}
                                       >
                                          {location}
                                       </button>
                                    ))}
                                 </motion.div>
                              )}
                           </div>
                        </div>

                        {/* Limit Filter */}
                        <div
                           className="relative dropdown-container"
                           ref={(el) => { dropdownRefs.current.limit = el; }}
                        >
                           <label className="block mb-2 text-xs font-medium text-gray-700 sm:text-sm dark:text-gray-300">
                              <Users className="inline mr-1 w-3 h-3 sm:w-4 sm:h-4" />
                              Show Top
                           </label>
                           <div className="relative">
                              <button
                                 onClick={() => {
                                    toggleDropdown('limit');
                                    closeAllDropdowns();
                                    if (!openDropdowns.limit) toggleDropdown('limit');
                                 }}
                                 className={`w-full flex items-center justify-between px-4 py-3 text-xs sm:text-sm rounded-lg transition-all duration-200 cursor-pointer ${openDropdowns.limit
                                    ? 'bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-400 dark:border-purple-500 shadow-md'
                                    : 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:border-purple-400'
                                    } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                              >
                                 <span className="text-gray-900 dark:text-white">
                                    Top {filters.limit || 10}
                                 </span>
                                 <motion.div
                                    animate={{ rotate: openDropdowns.limit ? 180 : 0 }}
                                    transition={{ duration: 0.2 }}
                                 >
                                    <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                 </motion.div>
                              </button>

                              {openDropdowns.limit && (
                                 <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="dropdown-menu-enhanced custom-scrollbar"
                                    style={{
                                       top: dropdownPositions.limit?.top || 0,
                                       left: dropdownPositions.limit?.left || 0,
                                       width: dropdownPositions.limit?.width || 'auto'
                                    }}
                                 >
                                    {[5, 10, 25, 50].map((limit) => (
                                       <button
                                          key={limit}
                                          onClick={() => {
                                             handleFilterChange({ limit });
                                             toggleDropdown('limit');
                                          }}
                                          data-selected={filters.limit === limit}
                                       >
                                          Top {limit}
                                       </button>
                                    ))}
                                 </motion.div>
                              )}
                           </div>
                        </div>
                     </div>
                  </div>
               </motion.div>

               {/* Active Filters Display */}
               {hasActiveFilters() && (
                  <motion.div
                     initial={{ opacity: 0, y: -10 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="flex flex-wrap gap-2 mb-6"
                  >
                     {filters.niche && (
                        <span className="inline-flex gap-1 items-center px-3 py-1 text-sm text-purple-700 bg-purple-100 rounded-full dark:bg-purple-900/30 dark:text-purple-400">
                           <Users className="w-3 h-3" />
                           {filters.niche.charAt(0).toUpperCase() + filters.niche.slice(1)}
                           <button
                              onClick={() => handleFilterChange({ niche: undefined })}
                              className="ml-1 transition-colors duration-200 cursor-pointer hover:text-red-500 dark:hover:text-red-400"
                           >
                              <X className="w-3 h-3" />
                           </button>
                        </span>
                     )}
                     {filters.location && (
                        <span className="inline-flex gap-1 items-center px-3 py-1 text-sm text-blue-700 bg-blue-100 rounded-full dark:bg-blue-900/30 dark:text-blue-400">
                           <MapPin className="w-3 h-3" />
                           {filters.location}
                           <button
                              onClick={() => handleFilterChange({ location: undefined })}
                              className="ml-1 transition-colors duration-200 cursor-pointer hover:text-red-500 dark:hover:text-red-400"
                           >
                              <X className="w-3 h-3" />
                           </button>
                        </span>
                     )}
                     {filters.timeframe && filters.timeframe !== 'current' && (
                        <span className="inline-flex gap-1 items-center px-3 py-1 text-sm text-green-700 bg-green-100 rounded-full dark:bg-green-900/30 dark:text-green-400">
                           <Calendar className="w-3 h-3" />
                           {filters.timeframe.charAt(0).toUpperCase() + filters.timeframe.slice(1)}
                           <button
                              onClick={() => handleFilterChange({ timeframe: 'current' })}
                              className="ml-1 transition-colors duration-200 cursor-pointer hover:text-red-500 dark:hover:text-red-400"
                           >
                              <X className="w-3 h-3" />
                           </button>
                        </span>
                     )}
                  </motion.div>
               )}

               {/* Leaderboard */}
               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="relative z-0 bg-white rounded-xl border border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700"
               >
                  <div className="p-3 sm:p-4 lg:p-6">
                     <RizzLeaderboard
                        query={filters}
                        compact={false}
                        maxItems={filters.limit || 10}
                     />
                  </div>
               </motion.div>

               {/* Info Section */}
               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="p-6 mt-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 dark:from-purple-900/20 dark:to-pink-900/20 dark:border-purple-700"
               >
                  <div className="flex gap-4 items-start">
                     <div className="flex-shrink-0 p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                        <Trophy className="w-5 h-5 text-white" />
                     </div>
                     <div>
                        <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                           About Rizz Score Rankings
                        </h3>
                        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                           <p>
                              The leaderboard ranks creators based on their comprehensive Rizz Score,
                              which combines engagement, growth, collaboration success, and content quality metrics.
                           </p>
                           <p>
                              Rankings are updated every 5 minutes and reflect the most recent performance data
                              across all connected social media platforms.
                           </p>
                           <p>
                              Use filters to explore top performers in specific niches, locations, or timeframes
                              to find the best collaboration partners for your content.
                           </p>
                        </div>
                     </div>
                  </div>
               </motion.div>
            </div>
         </div>
      </DashboardLayout>
   );
};

export default LeaderboardPage;
