"use client"

import React, { useState, useEffect, useRef } from 'react';
import {
  FaCamera, FaUserCircle, FaUserPlus, FaUserEdit,
  FaLink, FaTiktok, FaInstagram, FaYoutube, FaTwitch, FaTwitter,
  FaCheckCircle, FaSpinner, FaArrowLeft, FaArrowRight, FaSearch
} from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { BASE_URL } from '@/config/baseUrl';
import { LucideAArrowDown, X, Check } from 'lucide-react';
import { useNiches } from '@/hooks/features/useNiches';
import { nicheApi } from '@/lib/api/niche.api';

import { motion, AnimatePresence } from 'framer-motion';
const SOCIAL_PLATFORMS = [
  { id: 'tiktok', name: 'TikTok', icon: FaTiktok, placeholder: 'https://tiktok.com/@username' },
  { id: 'instagram', name: 'Instagram', icon: FaInstagram, placeholder: 'https://instagram.com/username' },
  { id: 'youtube', name: 'YouTube', icon: FaYoutube, placeholder: 'https://youtube.com/@username' },
  { id: 'twitch', name: 'Twitch', icon: FaTwitch, placeholder: 'https://twitch.tv/username' },
  { id: 'twitter', name: 'Twitter', icon: FaTwitter, placeholder: 'https://twitter.com/username' },
];

// Niches are now fetched from API - see useNiches hook below

/**
 * Complete Profile Page - First-time profile setup
 * 
 * IMPORTANT: This page does NOT fetch existing profile data (no GET requests)
 * - We skip GET /users/me or GET /profiles/me because the profile doesn't exist yet
 * - We only use PUT /profiles/me to create the profile
 * - User verification happens in Dashboard/LoginForm, not here
 * 
 * For editing existing profiles, use /profile/edit which fetches profile data first
 */
export default function MultiStepProfileForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Step 1 - Avatar Upload
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Step 2 - Profile Info
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(null);

  // Step 3 - Profile Details
  const [bio, setBio] = useState('');

  const [location, setLocation] = useState({
    city: '',
    state: '',
    country: ''
  });

  // Fetch user's location
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_ABSTRACT_API_KEY;

        // Skip if no API key configured
        if (!apiKey) {
          return;
        }

        const res = await fetch(
          `https://ipgeolocation.abstractapi.com/v1/?api_key=${apiKey}`
        );

        // Silently fail for rate limit errors (429) or other API errors
        if (!res.ok) {
          if (res.status === 429) {
            // API quota exceeded - silently skip location fetch
            console.log("Location API quota exceeded. Location will need to be entered manually.");
          }
          return;
        }

        const data = await res.json();

        setLocation({
          city: data.city || "",
          state: data.region || "",
          country: data.country || "",
        });
      } catch (error) {
        // Silently fail - location is optional
        console.log("Location auto-fill unavailable. Please enter manually.");
      }
    };

    fetchLocation();
  }, []);


  // Step 4 - Social Links
  const [socialLinks, setSocialLinks] = useState({});

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // niche - Fetch from API
  const { data: availableNiches = [], isLoading: isLoadingNiches, error: nichesError } = useNiches();
  const [selectedNiches, setSelectedNiches] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Filter niches (case-insensitive search, niches are capitalized from API)
  const filteredNiches = (availableNiches || []).filter(n =>
    n.toLowerCase().includes(search.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearch(""); // Clear search when closing
      }
    };

    if (isOpen) {
      // Use setTimeout to avoid immediate closure
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
        // Auto-focus search input when dropdown opens
        searchInputRef.current?.focus();
      }, 0);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setSearch("");
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const MAX_NICHES = 100; // Backend supports 100+ niches (no hard limit)

  const toggleNiche = (niche) => {
    if (selectedNiches.includes(niche)) {
      setSelectedNiches(prev => prev.filter(n => n !== niche));
    } else if (selectedNiches.length < MAX_NICHES) {
      setSelectedNiches(prev => [...prev, niche]);
      // Clear search after selection for better UX
      setSearch("");
    }
  };

  const removeNiche = (niche) => {
    setSelectedNiches(prev => prev.filter(n => n !== niche));
  };

  // Niches from API are already capitalized, but keep this for safety
  const capitalizeFirst = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };


  const steps = [
    { id: 1, title: 'Profile Picture', icon: FaUserCircle },
    { id: 2, title: 'Basic Info', icon: FaUserPlus },
    { id: 3, title: 'About You', icon: FaUserEdit },
    { id: 4, title: 'Social Links', icon: FaLink },
  ];

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      setMessage('');
      setError('');
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setMessage('');
      setError('');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit from API
        setError('Image must be smaller than 5MB');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError('');
    } else {
      setSelectedFile(null);
      setPreviewUrl(null);
      setError('Please select a valid image file.');
    }
  };

  const checkUsernameAvailability = async (username) => {
    if (username.length < 3) return;

    setIsCheckingUsername(true);
    try {
      const response = await fetch(`${BASE_URL}/api/v1/users?q=${username}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // If no users found with this username, it's available
        const isAvailable = !data.users?.some(user =>
          user.profile?.username?.toLowerCase() === username.toLowerCase()
        );
        setIsUsernameAvailable(isAvailable);
      } else if (response.status === 404) {
        // Endpoint doesn't exist - treat as available (will be validated on submit)
        console.log('Username check endpoint not available, will validate on submit');
        setIsUsernameAvailable(null); // Unknown state
      } else {
        // Other error - don't block user
        setIsUsernameAvailable(null);
      }
    } catch (error) {
      console.error('Username check error:', error);
      // Don't block user if check fails - will be validated on submit
      setIsUsernameAvailable(null);
    } finally {
      setIsCheckingUsername(false);
    }
  };

  const handleUsernameChange = (e) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''); // Only allow alphanumeric and underscore
    if (value.length <= 30) { // Max length from API
      setUsername(value);
      setIsUsernameAvailable(null);
    }
  };

  // Debounce username checking
  useEffect(() => {
    if (username.length >= 3) {
      const timer = setTimeout(() => {
        checkUsernameAvailability(username);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setIsUsernameAvailable(null);
      setIsCheckingUsername(false);
    }
  }, [username]);

  const handleNicheToggle = (niche) => {
    if (selectedNiches.includes(niche)) {
      setSelectedNiches(selectedNiches.filter(item => item !== niche));
    } else if (selectedNiches.length < MAX_NICHES) {
      setSelectedNiches([...selectedNiches, niche]);
    }
  };

  const handleSocialInputChange = (platformId, value) => {
    setSocialLinks(prev => ({
      ...prev,
      [platformId]: value,
    }));
  };

  const uploadAvatar = async () => {
    if (!selectedFile) return null;

    try {
      // Import UploadThing utility
      const { uploadAvatar: uploadToUploadThing } = await import('@/lib/utils/uploadthing');

      // Step 1: Upload to UploadThing to get CDN URL
      setMessage('Uploading image to UploadThing...');
      const avatarUrl = await uploadToUploadThing(selectedFile);
      console.log('UploadThing URL received:', avatarUrl);

      // Step 2: Send URL to backend to save in profile
      // This will be done in handleSubmit when profile is created/updated
      return avatarUrl;
    } catch (error) {
      console.error('Avatar upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload avatar';
      setError(errorMessage);
      return null;
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setMessage('Creating your profile...');
    setError('');

    try {
      // Step 1: Upload avatar if selected
      let avatarUrl = null;
      if (selectedFile) {
        setMessage('Uploading profile picture...');
        avatarUrl = await uploadAvatar();
      }

      // Step 2: Create/update profile
      setMessage('Saving profile information...');

      const profileData = {
        username: username?.trim() || undefined,
        displayName: displayName?.trim() || undefined,
        bio: bio?.trim() || undefined,
        niche: selectedNiches.length > 0 ? selectedNiches : undefined,
        socialLinks: Object.keys(socialLinks).length > 0 ?
          Object.fromEntries(
            Object.entries(socialLinks)
              .filter(([, value]) => value && value.trim())
              .map(([key, value]) => [key, value.trim()])
          ) : undefined,
        location: (location.city || location.state || location.country) ? {
          city: location.city?.trim() || undefined,
          state: location.state?.trim() || undefined,
          country: location.country?.trim() || undefined
        } : undefined,
        avatar: avatarUrl || undefined,

      };

      // Remove undefined values and empty strings
      const cleanedProfileData = Object.fromEntries(
        Object.entries(profileData).filter(([, value]) => {
          if (value === undefined) return false;
          if (typeof value === 'string' && value.trim() === '') return false;
          if (Array.isArray(value) && value.length === 0) return false;
          if (typeof value === 'object' && value !== null && Object.keys(value).length === 0) return false;
          return true;
        })
      );

      // Use PUT /profiles/me to create/update profile
      // NOTE: We do NOT fetch profile data first (no GET request) because:
      // 1. This is first-time profile creation - profile doesn't exist yet
      // 2. User verification happens in Dashboard/LoginForm, not here
      // 3. For editing existing profiles, use /profile/edit which fetches data first
      //
      // If backend returns "Profile not found", it means the profile record needs to be initialized first
      // This should be handled by the backend during user registration or by implementing upsert logic
      const response = await fetch(`${BASE_URL}/api/v1/profiles/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(cleanedProfileData)
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: 'Failed to create profile' };
        }

        console.error('❌ Profile creation failed:', {
          status: response.status,
          errorData,
          endpoint: 'PUT /api/v1/profiles/me'
        });

        // Handle "Profile not found" error - backend needs to support upsert or initialize profile
        const errorMessage = errorData.message || errorData.error || '';
        const errorMessageLower = errorMessage.toLowerCase();
        const isProfileNotFound =
          response.status === 404 ||
          errorData.error === 'Profile not found' ||
          errorMessageLower.includes('profile not found');

        if (isProfileNotFound) {
          setError(
            'Profile not found. Please contact support - your profile needs to be initialized. ' +
            'The backend should automatically create a profile record when you register or support creating profiles via PUT request.'
          );
          return;
        }

        // Handle username conflicts
        if (errorMessageLower.includes('username')) {
          setError('This username is already taken. Please choose another one.');
          setIsUsernameAvailable(false);
          setCurrentStep(2);
          return;
        }

        // Handle other errors
        const errorMsg = errorData.message || errorData.error || 'Failed to create profile. Please try again.';
        setError(errorMsg);
        return;
      }

      // Success - profile created/updated
      const responseData = await response.json();
      console.log('✅ Profile created/updated successfully:', responseData);
      setMessage('Profile created successfully!');
      setCurrentStep(5); // Success screen
    } catch (error) {
      console.error('Profile creation error:', error);
      setError('Network error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };


  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return true; // Avatar is optional
      case 2:
        // Allow proceeding if username is valid length, availability check is optional
        return username && displayName && username.length >= 3;
      case 3:
        return bio && selectedNiches.length > 0;
      case 4:
        return true; // Social links are optional
      default:
        return false;
    }
  };

  const renderProgressBar = () => (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-4">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${currentStep >= step.id
                ? 'bg-linear-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                : 'bg-gray-200 text-gray-500'
                }`}>
                <step.icon className="w-5 h-5" />
              </div>
              <span className={`text-xs mt-2 font-medium ${currentStep >= step.id ? 'text-purple-600' : 'text-gray-500'
                }`}>
                {step.title}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-1 mx-4 rounded-full transition-all duration-300 ${currentStep > step.id
                ? 'bg-linear-to-r from-purple-500 to-blue-500'
                : 'bg-gray-200'
                }`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="mb-2 text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-purple-600 to-blue-600">
          Add Your Profile Picture
        </h2>
        <p className="text-gray-600">This will be your public profile photo (Max 5MB)</p>
      </div>

      <div className="flex justify-center">
        <div className="flex overflow-hidden relative justify-center items-center w-32 h-32 bg-linear-to-r from-purple-100 to-blue-100 rounded-full border-4 border-white shadow-xl transition-all duration-300 hover:scale-105">
          {previewUrl ? (
            <img src={previewUrl} alt="Profile Preview" className="object-cover w-full h-full" />
          ) : (
            <FaCamera className="w-8 h-8 text-purple-400" />
          )}
        </div>
      </div>

      <div className="text-center">
        <label htmlFor="file-upload" className="inline-flex gap-2 items-center px-6 py-3 font-semibold text-white bg-linear-to-r from-purple-500 to-blue-500 rounded-xl shadow-lg transition-all duration-300 cursor-pointer hover:shadow-xl hover:scale-105">
          <FaCamera className="w-4 h-4" />
          Choose Photo
        </label>
        <input
          id="file-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="mb-2 text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-purple-600 to-blue-600">
          Basic Information
        </h2>
        <p className="text-gray-600">Choose your username and display name</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block mb-2 text-sm font-semibold text-gray-700">Username</label>
          <div className="relative">
            <input
              type="text"
              value={username}
              onChange={handleUsernameChange}
              className="px-4 py-3 w-full rounded-xl border-2 border-gray-200 transition-all duration-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
              placeholder="coolcreator123"
              maxLength={30}
            />
            <div className="flex absolute inset-y-0 right-0 items-center pr-3">
              {isCheckingUsername ? (
                <FaSpinner className="w-4 h-4 text-gray-400 animate-spin" />
              ) : isUsernameAvailable === true ? (
                <div className="flex justify-center items-center w-6 h-6 bg-green-500 rounded-full">
                  <FaCheckCircle className="w-3 h-3 text-white" />
                </div>
              ) : isUsernameAvailable === false ? (
                <div className="flex justify-center items-center w-6 h-6 bg-red-500 rounded-full">
                  <span className="text-xs text-white">✕</span>
                </div>
              ) : null}
            </div>
          </div>
          <p className={`mt-1 text-xs ${isUsernameAvailable === false ? 'text-red-500' : 'text-gray-500'}`}>
            {isUsernameAvailable === false ? 'Username is not available' : '3-30 characters, letters, numbers, and underscores only'}
          </p>
        </div>

        <div>
          <label className="block mb-2 text-sm font-semibold text-gray-700">Display Name</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="px-4 py-3 w-full rounded-xl border-2 border-gray-200 transition-all duration-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
            placeholder="Cool Creator"
            maxLength={50}
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="mb-2 text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-purple-600 to-blue-600">
          Tell Us About You
        </h2>
        <p className="text-gray-600">Share your story and interests</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block mb-2 text-sm font-semibold text-gray-700">Bio</label>
          <textarea
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={500}
            className="px-4 py-3 w-full rounded-xl border-2 border-gray-200 transition-all duration-200 resize-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
            placeholder="Tell us about yourself and your content..."
          />
          <p className="mt-1 text-xs text-right text-gray-500">
            {bio.length} / 500 characters
          </p>
        </div>

        <div className="relative w-full mx-auto" ref={dropdownRef}>
          <label className="block mb-2 text-sm font-semibold text-gray-700">
            Select your niches
          </label>
          <p className='text-xs text-gray-500 mb-3'>
            Select up to {MAX_NICHES} niches to help us match you with the right opportunities.
          </p>

          {/* Selected Chips Container */}
          <div
            onClick={() => setIsOpen(!isOpen)}
            className={`relative border-2 rounded-xl bg-white px-4 py-3 min-h-14 flex flex-wrap items-center gap-2 cursor-pointer transition-all duration-200 ${isOpen
                ? "border-purple-500 ring-2 ring-purple-200"
                : "border-gray-300 hover:border-purple-400"
              }`}
          >
            {selectedNiches.length > 0 ? (
              selectedNiches.map(niche => (
                <motion.span
                  key={niche}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="bg-linear-to-r from-purple-500 to-blue-500 text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-sm"
                >
                  <span>{niche}</span>
                  <button
                    type="button"
                    onClick={() => handleNicheToggle(niche)}
                    disabled={!selectedNiches.includes(niche) && selectedNiches.length >= 5}
                    className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${selectedNiches.includes(niche)
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                      : selectedNiches.length >= 5
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </motion.span>
              ))
            ) : (
              <span className="text-gray-400 text-sm">
                Click to select niches...
              </span>
            )}
            <div className="flex items-center gap-2 ml-auto pl-2">
              {selectedNiches.length > 0 && (
                <span className="text-xs text-gray-500 font-medium">
                  {selectedNiches.length}/{MAX_NICHES}
                </span>
              )}
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center"
              >
                <LucideAArrowDown className="h-5 w-5 text-gray-400" />
              </motion.div>
            </div>
          </div>

          {/* Loading State */}
          {isLoadingNiches && (
            <div className="text-center py-8">
              <FaSpinner className="animate-spin mx-auto h-6 w-6 text-purple-500 mb-2" />
              <p className="text-sm text-gray-500">Loading niches...</p>
            </div>
          )}

          {/* Error State */}
          {nichesError && !isLoadingNiches && (
            <div className="p-3 mb-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">
                Failed to load niches. Please refresh the page.
              </p>
            </div>
          )}

          {/* Dropdown Menu */}
          <AnimatePresence>
            {isOpen && !isLoadingNiches && !nichesError && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute z-50 mt-2 w-full bg-white border-2 border-gray-200 rounded-xl shadow-xl max-h-80 overflow-hidden"
              >
                {/* Search Bar */}
                <div className="sticky top-0 bg-white z-10 p-3 border-b border-gray-200">
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search niches..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Niche List */}
                <div className="p-2 max-h-64 overflow-y-auto custom-scrollbar">
                  {filteredNiches.length > 0 ? (
                    filteredNiches.map(niche => {
                      const isSelected = selectedNiches.includes(niche);
                      const isDisabled = !isSelected && selectedNiches.length >= MAX_NICHES;

                      return (
                        <motion.div
                          key={niche}
                          onClick={() => !isDisabled && toggleNiche(niche)}
                          className={`group relative px-4 py-2.5 rounded-lg cursor-pointer text-sm mb-1 flex items-center justify-between transition-all ${isSelected
                              ? "bg-linear-to-r from-purple-500 to-blue-500 text-white shadow-sm"
                              : isDisabled
                                ? "bg-gray-50 text-gray-400 cursor-not-allowed opacity-60"
                                : "hover:bg-purple-50 text-gray-700 active:bg-purple-100"
                            }`}
                          whileHover={!isDisabled ? { scale: 1.02 } : {}}
                          whileTap={!isDisabled ? { scale: 0.98 } : {}}
                        >
                          <span className="font-medium">{niche}</span>
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="flex items-center"
                            >
                              <Check className="h-4 w-4" />
                            </motion.div>
                          )}
                          {isDisabled && (
                            <span className="text-xs opacity-75">Max reached</span>
                          )}
                        </motion.div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-400 text-sm">
                        No niches found
                      </p>
                      <p className="text-gray-300 text-xs mt-1">
                        Try a different search term
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer with count */}
                {selectedNiches.length > 0 && (
                  <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-4 py-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">
                        {selectedNiches.length} of {MAX_NICHES} selected
                      </span>
                      {selectedNiches.length >= MAX_NICHES && (
                        <span className="text-orange-600 font-semibold">
                          Maximum reached
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Helper Text */}
          <div className="mt-2 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              {selectedNiches.length === 0 && "Select at least 1 niche"}
              {selectedNiches.length > 0 && selectedNiches.length < MAX_NICHES && `${MAX_NICHES - selectedNiches.length} more can be selected`}
              {selectedNiches.length >= MAX_NICHES && "Maximum niches selected"}
            </p>
            {selectedNiches.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedNiches([])}
                className="text-xs text-red-500 hover:text-red-600 font-medium transition-colors cursor-pointer"
              >
                Clear all
              </button>
            )}
          </div>
        </div>


        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">City</label>
            <input
              type="text"
              value={location.city}
              onChange={(e) => setLocation(prev => ({ ...prev, city: e.target.value }))}
              className="px-4 py-3 w-full rounded-xl border-2 border-gray-200 transition-all duration-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
              placeholder="San Francisco"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">State</label>
            <input
              type="text"
              value={location.state}
              onChange={(e) => setLocation(prev => ({ ...prev, state: e.target.value }))}
              className="px-4 py-3 w-full rounded-xl border-2 border-gray-200 transition-all duration-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
              placeholder="CA"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">Country</label>
            <input
              type="text"
              value={location.country}
              onChange={(e) => setLocation(prev => ({ ...prev, country: e.target.value }))}
              className="px-4 py-3 w-full rounded-xl border-2 border-gray-200 transition-all duration-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
              placeholder="USA"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="mb-2 text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-purple-600 to-blue-600">
          Connect Your Socials
        </h2>
        <p className="text-gray-600">Link your profiles to showcase your work</p>
      </div>

      <div className="space-y-4">
        {SOCIAL_PLATFORMS.map(platform => (
          <div key={platform.id}>
            <label className="block mb-2 text-sm font-semibold text-gray-700">{platform.name}</label>
            <div className="flex overflow-hidden rounded-xl shadow-sm">
              <span className="inline-flex items-center px-4 text-gray-500 bg-gray-50 border-2 border-r-0 border-gray-200">
                <platform.icon className="w-5 h-5" />
              </span>
              <input
                type="url"
                value={socialLinks[platform.id] || ''}
                onChange={(e) => handleSocialInputChange(platform.id, e.target.value)}
                className="flex-1 px-4 py-3 border-2 border-gray-200 transition-all duration-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                placeholder={platform.placeholder}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSuccessScreen = () => (
    <div className="space-y-8 text-center">
      <div className="flex justify-center">
        <div className="flex justify-center items-center w-24 h-24 bg-linear-to-r from-purple-500 to-blue-500 rounded-full shadow-2xl">
          <FaCheckCircle className="w-12 h-12 text-white" />
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-4xl font-bold text-transparent bg-clip-text bg-linear-to-r from-purple-600 to-blue-600">
          Profile Complete!
        </h2>
        <p className="mx-auto max-w-md text-lg text-gray-600">
          Your profile has been created successfully! You can now start discovering and collaborating with other creators.
        </p>
      </div>

      <button
        className="px-8 py-4 w-full font-semibold text-white bg-linear-to-r from-purple-500 to-blue-500 rounded-xl shadow-lg transition-all duration-300 transform hover:shadow-xl hover:scale-105"
        onClick={() => {
          // Force redirect with page reload to refresh profile data
          setTimeout(() => {
            window.location.href = '/';
          }, 1000);
        }}
      >
        Go to Dashboard
      </button>
    </div>
  );

  if (currentStep === 5) {
    return (
      <div className="flex justify-center items-center p-4 min-h-screen bg-linear-to-br from-purple-50 via-white to-blue-50">
        <div className="w-full max-w-lg">
          <div className="p-12 rounded-3xl border shadow-2xl backdrop-blur-sm bg-white/80 border-white/50">
            {renderSuccessScreen()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center p-4 min-h-screen bg-linear-to-br from-purple-50 via-white to-blue-50">
      {/* Background decorative elements */}
      <div className="overflow-hidden fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl bg-purple-300/20" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl bg-blue-300/20" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-linear-to-r rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 from-purple-200/10 to-blue-200/10" />
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        <div className="p-8 rounded-3xl border shadow-2xl backdrop-blur-sm bg-white/80 md:p-12 border-white/50">
          {renderProgressBar()}

          {message && (
            <div className="p-4 mb-6 bg-green-50 rounded-xl border-2 border-green-200">
              <p className="text-sm font-medium text-green-700">{message}</p>
            </div>
          )}

          {error && (
            <div className="p-4 mb-6 bg-red-50 rounded-xl border-2 border-red-200">
              <p className="text-sm font-medium text-red-700">{error}</p>
            </div>
          )}

          <div className="mb-8">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
          </div>

          <div className="flex gap-2 justify-between items-center sm:gap-4">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex gap-1 items-center px-3 py-2 text-sm font-semibold text-gray-600 rounded-xl transition-all duration-200 cursor-pointer sm:gap-2 sm:px-6 sm:py-3 sm:text-base hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Back</span>
            </button>

            <div className="flex space-x-2 sm:space-x-3">
              {currentStep === 4 ? (
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex gap-1 items-center px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl shadow-lg transition-all duration-300 sm:gap-2 sm:px-8 sm:py-3 sm:text-base hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <FaSpinner className="w-3 h-3 animate-spin sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Creating...</span>
                      <span className="sm:hidden">...</span>
                    </>
                  ) : (
                    <>
                      <span className="hidden sm:inline">Complete Profile</span>
                      <span className="sm:hidden">Complete</span>
                      <FaCheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={nextStep}
                  disabled={!canProceed()}
                  className="flex gap-1 items-center px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl shadow-lg transition-all duration-300 cursor-pointer sm:gap-2 sm:px-8 sm:py-3 sm:text-base hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <FaArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}