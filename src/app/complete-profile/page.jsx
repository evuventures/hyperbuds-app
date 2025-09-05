"use client"

import React, { useState, useEffect } from 'react';
import { FaCamera, FaUserCircle, FaUserPlus, FaUserEdit, FaLink, FaTiktok, FaInstagram, FaYoutube, FaTwitch, FaTwitter, FaLinkedin, FaCheckCircle, FaSpinner, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { BASE_URL } from '@/config/baseUrl';

const SOCIAL_PLATFORMS = [
  { id: 'tiktok', name: 'TikTok', icon: FaTiktok, placeholder: 'https://tiktok.com/@username' },
  { id: 'instagram', name: 'Instagram', icon: FaInstagram, placeholder: 'https://instagram.com/username' },
  { id: 'youtube', name: 'YouTube', icon: FaYoutube, placeholder: 'https://youtube.com/@username' },
  { id: 'twitch', name: 'Twitch', icon: FaTwitch, placeholder: 'https://twitch.tv/username' },
  { id: 'twitter', name: 'Twitter', icon: FaTwitter, placeholder: 'https://twitter.com/username' },
  { id: 'linkedin', name: 'LinkedIn', icon: FaLinkedin, placeholder: 'https://linkedin.com/in/username' },
];

const MOCK_NICHES = [
  'gaming', 'tech', 'fashion', 'beauty', 'food', 'travel', 'fitness', 'art', 'music',
  'lifestyle', 'finance', 'education', 'comedy', 'diy', 'sports', 'science'
];

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
  const [selectedNiches, setSelectedNiches] = useState([]);
  const [location, setLocation] = useState({
    city: '',
    state: '',
    country: ''
  });
  
  // Step 4 - Social Links
  const [socialLinks, setSocialLinks] = useState({});
  
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

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
      }
    } catch (error) {
      console.error('Username check error:', error);
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
    } else if (selectedNiches.length < 5) { // Max 5 niches from API
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
    
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('type', 'avatar');
    
    try {
      const response = await fetch(`${BASE_URL}/api/v1/profiles/upload-media`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.url;
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
    }
    return null;
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
        username: username || undefined,
        displayName: displayName || undefined,
        bio: bio || undefined,
        niche: selectedNiches.length > 0 ? selectedNiches : undefined,
        socialLinks: Object.keys(socialLinks).length > 0 ? 
          Object.fromEntries(
            Object.entries(socialLinks).filter(([, value]) => value && value.trim())
          ) : undefined,
        location: (location.city || location.state || location.country) ? {
          city: location.city || undefined,
          state: location.state || undefined,
          country: location.country || undefined
        } : undefined,
        avatar: avatarUrl || undefined,
      
      };
      
      // Remove undefined values
      const cleanedProfileData = Object.fromEntries(
        Object.entries(profileData).filter(([, value]) => value !== undefined)
      );
      
      const response = await fetch(`${BASE_URL}/api/v1/profiles/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(cleanedProfileData)
      });
      
      if (response.ok) {
        setMessage('Profile created successfully!');
        setCurrentStep(5); // Success screen
        
        // Trigger social sync for platforms with valid URLs
        const validSocialLinks = Object.entries(socialLinks).filter(([, url]) => url && url.trim());
        if (validSocialLinks.length > 0) {
          // Note: Social sync would require platform access tokens
          // This is typically handled through OAuth flows
          console.log('Social links to sync:', validSocialLinks);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to create profile');
      }
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
        return username && displayName && (isUsernameAvailable === true || isUsernameAvailable === null);
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
      <div className="flex items-center justify-between mb-4">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                currentStep >= step.id
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                  : 'bg-gray-200 text-gray-500'
              }`}>
                <step.icon className="w-5 h-5" />
              </div>
              <span className={`text-xs mt-2 font-medium ${
                currentStep >= step.id ? 'text-purple-600' : 'text-gray-500'
              }`}>
                {step.title}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-1 mx-4 rounded-full transition-all duration-300 ${
                currentStep > step.id 
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500' 
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
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
          Add Your Profile Picture
        </h2>
        <p className="text-gray-600">This will be your public profile photo (Max 5MB)</p>
      </div>
      
      <div className="flex justify-center">
        <div className="relative w-32 h-32 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 flex items-center justify-center border-4 border-white shadow-xl overflow-hidden transition-all duration-300 hover:scale-105">
          {previewUrl ? (
            <img src={previewUrl} alt="Profile Preview" className="w-full h-full object-cover" />
          ) : (
            <FaCamera className="w-8 h-8 text-purple-400" />
          )}
        </div>
      </div>

      <div className="text-center">
        <label htmlFor="file-upload" className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer">
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
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
          Basic Information
        </h2>
        <p className="text-gray-600">Choose your username and display name</p>
      </div>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
          <div className="relative">
            <input
              type="text"
              value={username}
              onChange={handleUsernameChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
              placeholder="coolcreator123"
              maxLength={30}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {isCheckingUsername ? (
                <FaSpinner className="h-4 w-4 text-gray-400 animate-spin" />
              ) : isUsernameAvailable === true ? (
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <FaCheckCircle className="w-3 h-3 text-white" />
                </div>
              ) : isUsernameAvailable === false ? (
                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✕</span>
                </div>
              ) : null}
            </div>
          </div>
          <p className={`mt-1 text-xs ${isUsernameAvailable === false ? 'text-red-500' : 'text-gray-500'}`}>
            {isUsernameAvailable === false ? 'Username is not available' : '3-30 characters, letters, numbers, and underscores only'}
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Display Name</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
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
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
          Tell Us About You
        </h2>
        <p className="text-gray-600">Share your story and interests</p>
      </div>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
          <textarea
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={500}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 resize-none"
            placeholder="Tell us about yourself and your content..."
          />
          <p className="mt-1 text-xs text-gray-500 text-right">
            {bio.length} / 500 characters
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Select your niches (max 5)
          </label>
          <div className="flex flex-wrap gap-2">
            {MOCK_NICHES.map(niche => (
              <button
                key={niche}
                type="button"
                onClick={() => handleNicheToggle(niche)}
                disabled={!selectedNiches.includes(niche) && selectedNiches.length >= 5}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                  selectedNiches.includes(niche)
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                    : selectedNiches.length >= 5
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {niche}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-gray-500">
            {selectedNiches.length} / 5 niches selected
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
            <input
              type="text"
              value={location.city}
              onChange={(e) => setLocation(prev => ({ ...prev, city: e.target.value }))}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
              placeholder="San Francisco"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">State</label>
            <input
              type="text"
              value={location.state}
              onChange={(e) => setLocation(prev => ({ ...prev, state: e.target.value }))}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
              placeholder="CA"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Country</label>
            <input
              type="text"
              value={location.country}
              onChange={(e) => setLocation(prev => ({ ...prev, country: e.target.value }))}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
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
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
          Connect Your Socials
        </h2>
        <p className="text-gray-600">Link your profiles to showcase your work</p>
      </div>
      
      <div className="space-y-4">
        {SOCIAL_PLATFORMS.map(platform => (
          <div key={platform.id}>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{platform.name}</label>
            <div className="flex rounded-xl shadow-sm overflow-hidden">
              <span className="inline-flex items-center px-4 bg-gray-50 border-2 border-r-0 border-gray-200 text-gray-500">
                <platform.icon className="h-5 w-5" />
              </span>
              <input
                type="url"
                value={socialLinks[platform.id] || ''}
                onChange={(e) => handleSocialInputChange(platform.id, e.target.value)}
                className="flex-1 px-4 py-3 border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                placeholder={platform.placeholder}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSuccessScreen = () => (
    <div className="text-center space-y-8">
      <div className="flex justify-center">
        <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-2xl">
          <FaCheckCircle className="h-12 w-12 text-white" />
        </div>
      </div>
      
      <div>
        <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
          Profile Complete!
        </h2>
        <p className="text-gray-600 text-lg max-w-md mx-auto">
          Your profile has been created successfully! You can now start discovering and collaborating with other creators.
        </p>
      </div>

      <button
        className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-4 px-8 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        onClick={() => router.push('/dashboard')}
      >
        Go to Dashboard
      </button>
    </div>
  );

  if (currentStep === 5) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <div className="bg-white/80 backdrop-blur-sm p-12 rounded-3xl shadow-2xl border border-white/50">
            {renderSuccessScreen()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-200/10 to-blue-200/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        <div className="bg-white/80 backdrop-blur-sm p-8 md:p-12 rounded-3xl shadow-2xl border border-white/50">
          {renderProgressBar()}
          
          {message && (
            <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
              <p className="text-green-700 text-sm font-medium">{message}</p>
            </div>
          )}
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="mb-8">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
          </div>

          <div className="flex items-center justify-between space-x-4">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center gap-2 px-6 py-3 text-gray-600 font-semibold rounded-xl transition-all duration-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaArrowLeft className="w-4 h-4" />
              Back
            </button>

            <div className="flex space-x-3">
              {currentStep === 4 ? (
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold py-3 px-8 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <FaSpinner className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      Complete Profile
                      <FaCheckCircle className="w-4 h-4" />
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={nextStep}
                  disabled={!canProceed()}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold py-3 px-8 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                  <FaArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Skip option for optional steps */}
          {(currentStep === 1 || currentStep === 4) && (
            <div className="text-center mt-4">
              <button
                onClick={currentStep === 4 ? handleSubmit : nextStep}
                className="text-gray-500 font-medium hover:text-gray-700 transition-colors duration-200"
              >
                Skip for now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}