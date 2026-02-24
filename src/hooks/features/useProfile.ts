import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/api/client';

interface ApiError {
  message: string;
  status?: number;
}

export type ProfileFormData = {
  username: string;
  displayName: string;
  bio: string;
  location: {
    city: string;
    state: string;
    country: string;
  };
  socialLinks: Record<string, string>;
  niches: string[];
  avatarUrl: string | null;
};

export const useProfileForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  // Image State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState<ProfileFormData>({
    username: '',
    displayName: '',
    bio: '',
    location: { city: '', state: '', country: '' },
    socialLinks: {},
    niches: [],
    avatarUrl: null,
  });

  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null);
 



  // --- Image Handlers ---

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be smaller than 5MB');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError('');
    }
  };

  /**
   * Logic to cancel/remove the selected image
   */

  const clearSelectedFile = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl); // Clear memory
    }
    setSelectedFile(null);
    setPreviewUrl(null);
  }, [previewUrl]);

  const uploadAvatarToUploadThing = async () => {
    if (!selectedFile) return null;
    try {
      const { uploadAvatar } = await import('@/lib/utils/uploadthing');
      const uploadedUrl = await uploadAvatar(selectedFile);
      return uploadedUrl;
    } catch (err) {
      throw err instanceof Error ? err : new Error("Upload failed");
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      let finalAvatarUrl = formData.avatarUrl;

      // Only upload if a file is actually selected
      if (selectedFile) {
        setMessage('Uploading profile picture...');
        finalAvatarUrl = await uploadAvatarToUploadThing();
      }

      setMessage('Saving your profile...');

      const payload = {
        username: formData.username.trim(),
        displayName: formData.displayName.trim(),
        bio: formData.bio.trim(),
        niche: formData.niches,
        socialLinks: formData.socialLinks,
        location: {
          city: formData.location.city.trim(),
          state: formData.location.state.trim(),
          country: formData.location.country.trim()
        },
        avatar: finalAvatarUrl,
      };

      await apiClient.put('/profiles/me', payload);
      setCurrentStep(5);
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.message || 'An error occurred during submission');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Geolocation Logic (Abstract API) ---
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_ABSTRACT_API_KEY;
        if (!apiKey) return;

        const res = await fetch(
          `https://ipgeolocation.abstractapi.com/v1/?api_key=${apiKey}`
        );

        if (!res.ok) return;
        const data = await res.json();

        setFormData(prev => ({
          ...prev,
          location: {
            city: data.city || "",
            state: data.region || "",
            country: data.country || "",
          }
        }));
      } catch {
        console.warn("Location auto-fill unavailable.");
      }
    };

    fetchLocation();
  }, []);

  // --- Username Check Logic ---
  useEffect(() => {
    if (formData.username.length < 3) {
      setIsUsernameAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingUsername(true);
      try {
        await apiClient.get(`/profiles/${formData.username}/public`);
        setIsUsernameAvailable(false);
      } catch (err) {
        const apiErr = err as ApiError;
        if (apiErr.status === 404 || apiErr.status === 500) {
          setIsUsernameAvailable(true);
        } else {
          setIsUsernameAvailable(null);
        }
      } finally {
        setIsCheckingUsername(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.username]);

  // --- State Helpers ---

  const updateField = useCallback((field: keyof ProfileFormData, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateLocation = useCallback((key: keyof ProfileFormData['location'], value: string) => {
    setFormData(prev => ({
      ...prev,
      location: { ...prev.location, [key]: value }
    }));
  }, []);

  const updateSocials = useCallback((platformId: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [platformId]: value }
    }));
  }, []);

  return {
    currentStep,
    formData,
    isLoading,
    error,
    message,
    isCheckingUsername,
    isUsernameAvailable,
    updateField,
    updateLocation,
    updateSocials,
    nextStep: () => setCurrentStep(prev => prev + 1),
    prevStep: () => setCurrentStep(prev => prev - 1),
    setError,
    setMessage,
    handleFileChange,
    clearSelectedFile, 
    previewUrl,
    handleSubmit,
    canProceed: () => {
      switch (currentStep) {
        case 1: return true;
        case 2: return formData.username.length >= 3 && !!formData.displayName;
        case 3: return !!formData.bio && formData.niches.length > 0;
        case 4: return true;
        default: return false;
      }
    },
  };
};