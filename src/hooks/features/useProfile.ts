import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/api/client';

// 1. Define the error shape based on your apiClient's normalized output
interface ApiError {
  message: string;
  status?: number;
  data?: unknown;
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
  // ✅ Removed accessToken since apiClient handles it automatically
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
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

  // --- Handlers ---

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

  const uploadAvatarToUploadThing = async () => {
    if (!selectedFile) return null;
    try {
      const { uploadAvatar } = await import('@/lib/utils/uploadthing');
      const uploadedUrl = await uploadAvatar(selectedFile);
      if (!uploadedUrl) throw new Error("Failed to get URL from UploadThing");
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
        location: formData.location,
        avatar: finalAvatarUrl,
      };

      await apiClient.put('/profiles/me', payload);
      setCurrentStep(5);
    } catch (err) {
      // ✅ Type-safe error handling instead of 'any'
      const apiErr = err as ApiError;
      setError(apiErr.message || 'An error occurred during submission');
    } finally {
      setIsLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return true; 
      case 2: return formData.username.length >= 3 && !!formData.displayName && isUsernameAvailable === true;
      case 3: return !!formData.bio && formData.niches.length > 0;
      case 4: return true;
      default: return false;
    }
  };

  // --- Effects ---

  useEffect(() => {
    const fetchLocation = async () => {
      const apiKey = process.env.NEXT_PUBLIC_ABSTRACT_API_KEY;
      if (!apiKey || apiKey === "your_abstract_api_key_here") return;
      try {
        const res = await fetch(`https://ipgeolocation.abstractapi.com/v1/?api_key=${apiKey}`);
        if (res.ok) {
          const data = await res.json();
          setFormData(prev => ({
            ...prev,
            location: {
              city: data.city || "",
              state: data.region || "",
              country: data.country || "",
            }
          }));
        }
      } catch {
        console.warn("Location auto-fill unavailable.");
      }
    };
    fetchLocation();
  }, []);

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
        // ✅ Type-safe error handling
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

  // --- Helpers ---

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

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
    setError('');
    setMessage('');
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
    setError('');
    setMessage('');
  };

  return {
    currentStep,
    formData,
    isLoading,
    setIsLoading,
    error,
    message,
    isCheckingUsername,
    isUsernameAvailable,
    updateField,
    updateLocation,
    nextStep,
    prevStep,
    setError,
    setMessage,
    setCurrentStep,
    handleFileChange,
    previewUrl,
    handleSubmit,
    updateSocials,
    canProceed,
  };
};