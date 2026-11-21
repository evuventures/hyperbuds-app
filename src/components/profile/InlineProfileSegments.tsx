'use client';

import React, { useEffect, useState } from 'react';
import apiClient from '@/lib/api/client';
import { uploadFeedMediaToCloudinary } from '@/lib/api/feed.api';
import {
  Camera,
  Check,
  CheckCircle2,
  Globe,
  Loader2,
  MapPin,
  Pencil,
  Sparkles,
  Tag,
  UploadCloud,
  User,
  X,
} from 'lucide-react';

const CREATOR_NICHES = [
  'Lifestyle', 'Tech', 'Beauty', 'Finance', 'Vlogging', 'Comedy', 'Business',
  'Travel', 'Fashion', 'Food', 'Music', 'Gaming', 'Fitness', 'Education',
  'Photography', 'Motivation', 'AI', 'Startups', 'Podcasts', 'Design', 'Editing',
];

export type ProfileSegmentModal = 'photo' | 'intro' | 'niches' | 'socials' | null;

export interface InlineProfileData {
  username?: string;
  displayName?: string;
  bio?: string;
  avatar?: string;
  coverImage?: string;
  niche?: string[];
  location?: { city?: string; state?: string; country?: string } | null;
  locationName?: string;
  socialLinks?: Record<string, string>;
}

export interface ProfileCompletionInfo {
  percent: number;
  completedCount: number;
  totalCount: number;
  missingSections: Array<{ key: string; label: string }>;
}

interface InlineProfileSegmentsProps {
  profile: InlineProfileData | null;
  completion?: ProfileCompletionInfo | null;
  onProfileUpdated: () => void | Promise<void>;
}

function computeLocalCompletion(profile: InlineProfileData | null): ProfileCompletionInfo {
  if (!profile) {
    return {
      percent: 0,
      completedCount: 0,
      totalCount: 6,
      missingSections: [
        { key: 'avatar', label: 'Add a profile photo' },
        { key: 'displayName', label: 'Set your display name' },
        { key: 'bio', label: 'Write a short bio' },
        { key: 'niches', label: 'Pick creator niches' },
        { key: 'location', label: 'Add your location' },
        { key: 'socials', label: 'Link a social profile' },
      ],
    };
  }
  const hasAvatar = Boolean(profile.avatar && profile.avatar.trim());
  const hasName = Boolean(profile.displayName && profile.displayName.trim().length >= 2);
  const hasBio = Boolean(profile.bio && profile.bio.trim().length >= 10);
  const hasNiches = Array.isArray(profile.niche) && profile.niche.length > 0;
  const hasLoc = Boolean(
    profile.locationName?.trim() ||
      profile.location?.city?.trim() ||
      profile.location?.country?.trim(),
  );
  const hasSocial = Object.values(profile.socialLinks || {}).some(
    (v) => typeof v === 'string' && v.trim().length > 0,
  );
  const checks = [
    { key: 'avatar', label: 'Add a profile photo', done: hasAvatar },
    { key: 'displayName', label: 'Set your display name', done: hasName },
    { key: 'bio', label: 'Write a short bio', done: hasBio },
    { key: 'niches', label: 'Pick creator niches', done: hasNiches },
    { key: 'location', label: 'Add your location', done: hasLoc },
    { key: 'socials', label: 'Link a social profile', done: hasSocial },
  ];
  const doneCount = checks.filter((c) => c.done).length;
  return {
    percent: Math.round((doneCount / checks.length) * 100),
    completedCount: doneCount,
    totalCount: checks.length,
    missingSections: checks.filter((c) => !c.done).map((c) => ({ key: c.key, label: c.label })),
  };
}

export function InlineProfileSegments({
  profile,
  completion,
  onProfileUpdated,
}: InlineProfileSegmentsProps) {
  const [activeModal, setActiveModal] = useState<ProfileSegmentModal>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Photo modal state
  const [photoTarget, setPhotoTarget] = useState<'avatar' | 'coverImage'>('avatar');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [uploadedUrl, setUploadedUrl] = useState<string>('');

  // Intro & Location state
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');

  // Niches state
  const [selectedNiches, setSelectedNiches] = useState<string[]>([]);

  // Social links state
  const [socials, setSocials] = useState<Record<string, string>>({
    instagram: '',
    tiktok: '',
    youtube: '',
    twitch: '',
    twitter: '',
  });

  useEffect(() => {
    if (!profile) return;
    setDisplayName(profile.displayName || '');
    setUsername(profile.username || '');
    setBio(profile.bio || '');
    setCity(profile.location?.city || '');
    setCountry(profile.location?.country || '');
    setSelectedNiches(Array.isArray(profile.niche) ? profile.niche : []);
    setSocials({
      instagram: profile.socialLinks?.instagram || '',
      tiktok: profile.socialLinks?.tiktok || '',
      youtube: profile.socialLinks?.youtube || '',
      twitch: profile.socialLinks?.twitch || '',
      twitter: profile.socialLinks?.twitter || '',
    });
  }, [profile]);

  const progress = completion ?? computeLocalCompletion(profile);

  const openModal = (modal: ProfileSegmentModal, defaultPhotoTarget: 'avatar' | 'coverImage' = 'avatar') => {
    setStatusMsg(null);
    if (modal === 'photo') {
      setPhotoTarget(defaultPhotoTarget);
      const current =
        defaultPhotoTarget === 'avatar' ? profile?.avatar || '' : profile?.coverImage || '';
      setPreviewUrl(current);
      setUploadedUrl(current);
    }
    setActiveModal(modal);
  };

  const openForMissingKey = (key: string) => {
    if (key === 'avatar') openModal('photo', 'avatar');
    else if (key === 'niches') openModal('niches');
    else if (key === 'socials') openModal('socials');
    else openModal('intro');
  };

  const handlePhotoFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setStatusMsg({ type: 'error', text: 'Please select an image file (JPG, PNG, WebP).' });
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setStatusMsg({ type: 'error', text: 'Image must be smaller than 15 MB.' });
      return;
    }
    setStatusMsg(null);
    setPreviewUrl(URL.createObjectURL(file));
    setUploading(true);
    try {
      const uploaded = await uploadFeedMediaToCloudinary(file, { kind: 'post' });
      setUploadedUrl(uploaded.url);
      setPreviewUrl(uploaded.url);
    } catch (err) {
      setStatusMsg({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to upload photo. Please try again.',
      });
    } finally {
      setUploading(false);
    }
  };

  const saveSegment = async (payload: Record<string, unknown>, successText: string) => {
    setSaving(true);
    setStatusMsg(null);
    try {
      await apiClient.put('/profiles/me', payload);
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('skipped_profile_completion');
        localStorage.setItem('profileUpdated', 'true');
      }
      setActiveModal(null);
      setStatusMsg({ type: 'success', text: successText });
      await onProfileUpdated();
    } catch (err) {
      const msg =
        (err as { data?: { message?: string }; message?: string })?.data?.message ||
        (err as { message?: string })?.message ||
        'Could not save profile update.';
      setStatusMsg({ type: 'error', text: msg });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Facebook-style Profile Strength / Match-Boost Coach (when < 100%) */}
      {progress.percent < 100 && (
        <section className="rounded-2xl border border-purple-200/80 bg-gradient-to-r from-purple-50 via-white to-indigo-50/70 p-5 shadow-sm dark:border-purple-900/50 dark:from-purple-950/40 dark:via-slate-900 dark:to-indigo-950/30">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#8B3DFF] to-[#A855F7] text-white shadow-md">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-slate-900 dark:text-white sm:text-base">
                  Finish setting up your creator profile for better AI matches
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Update any section right here — no need to leave your profile.
                </p>
              </div>
            </div>
            <span className="rounded-full bg-purple-600 px-3 py-1 text-xs font-extrabold text-white shadow-xs">
              {progress.percent}% Complete
            </span>
          </div>

          <div className="mt-3.5 h-2 w-full overflow-hidden rounded-full bg-purple-100 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#8B3DFF] to-[#EC4899] transition-all duration-500"
              style={{ width: `${Math.max(8, progress.percent)}%` }}
            />
          </div>

          {progress.missingSections.length > 0 && (
            <div className="mt-3.5 flex flex-wrap gap-2">
              {progress.missingSections.map((step) => (
                <button
                  key={step.key}
                  type="button"
                  onClick={() => openForMissingKey(step.key)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-white px-3.5 py-1.5 text-xs font-bold text-purple-700 shadow-2xs transition hover:border-purple-400 hover:bg-purple-50 dark:border-purple-800 dark:bg-slate-900 dark:text-purple-300 dark:hover:bg-purple-950/60"
                >
                  <span>+</span>
                  {step.label}
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Always-available Quick-Edit Segment Bar (Facebook-style inline section editing) */}
      <section className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Quick Edit Profile
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => openModal('photo', 'avatar')}
            className="inline-flex items-center gap-1.5 rounded-full bg-purple-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-purple-700"
          >
            <Camera className="h-3.5 w-3.5" />
            Update Photo
          </button>
          <button
            type="button"
            onClick={() => openModal('intro')}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <Pencil className="h-3.5 w-3.5" />
            Bio & Location
          </button>
          <button
            type="button"
            onClick={() => openModal('niches')}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <Tag className="h-3.5 w-3.5" />
            Niches ({selectedNiches.length})
          </button>
          <button
            type="button"
            onClick={() => openModal('socials')}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <Globe className="h-3.5 w-3.5" />
            Social Links
          </button>
        </div>
      </section>

      {statusMsg && !activeModal && (
        <div
          role="status"
          className={`flex items-center justify-between rounded-xl border px-4 py-2.5 text-xs font-semibold ${
            statusMsg.type === 'error'
              ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200'
              : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200'
          }`}
        >
          <span className="inline-flex items-center gap-1.5">
            {statusMsg.type === 'success' && <CheckCircle2 className="h-4 w-4" />}
            {statusMsg.text}
          </span>
          <button type="button" onClick={() => setStatusMsg(null)} className="underline">
            Dismiss
          </button>
        </div>
      )}

      {/* ============================================================
          MODAL 1: UPLOAD PROFILE / COVER PHOTO (Direct Cloudinary Upload)
         ============================================================ */}
      {activeModal === 'photo' && (
        <div
          onClick={() => setActiveModal(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Update Profile Photo
              </h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 flex justify-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setPhotoTarget('avatar');
                  setPreviewUrl(profile?.avatar || '');
                  setUploadedUrl(profile?.avatar || '');
                }}
                className={`rounded-full px-3.5 py-1.5 font-bold ${
                  photoTarget === 'avatar'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                Profile Picture
              </button>
              <button
                type="button"
                onClick={() => {
                  setPhotoTarget('coverImage');
                  setPreviewUrl(profile?.coverImage || '');
                  setUploadedUrl(profile?.coverImage || '');
                }}
                className={`rounded-full px-3.5 py-1.5 font-bold ${
                  photoTarget === 'coverImage'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                Cover Photo
              </button>
            </div>

            <div className="mt-5 flex flex-col items-center">
              <div
                className={`relative overflow-hidden border-2 border-dashed border-purple-300 bg-purple-50/50 dark:border-purple-800 dark:bg-slate-800 ${
                  photoTarget === 'avatar'
                    ? 'h-36 w-36 rounded-full'
                    : 'h-36 w-full rounded-2xl'
                }`}
              >
                {previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center text-purple-400">
                    <User className="h-10 w-10" />
                  </div>
                )}
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                )}
              </div>

              <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-full bg-purple-600 px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-purple-700">
                <UploadCloud className="h-4 w-4" />
                {uploading ? 'Uploading to Cloudinary...' : 'Choose Photo (up to 15 MB)'}
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    e.target.value = '';
                    if (f) void handlePhotoFile(f);
                  }}
                />
              </label>

              {statusMsg?.type === 'error' && (
                <p className="mt-3 text-center text-xs font-medium text-rose-600">{statusMsg.text}</p>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving || uploading || !uploadedUrl}
                onClick={() =>
                  void saveSegment(
                    { [photoTarget]: uploadedUrl },
                    photoTarget === 'avatar' ? 'Profile picture updated!' : 'Cover photo updated!',
                  )
                }
                className="rounded-full bg-purple-600 px-5 py-2 text-xs font-bold text-white disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Photo'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL 2: EDIT INTRO (Name, Username, Bio, Location)
         ============================================================ */}
      {activeModal === 'intro' && (
        <div
          onClick={() => setActiveModal(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Edit Bio, Name & Location
              </h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const loc =
                  city.trim() || country.trim()
                    ? { city: city.trim(), country: country.trim() }
                    : undefined;
                void saveSegment(
                  {
                    displayName: displayName.trim(),
                    ...(username.trim() ? { username: username.trim() } : {}),
                    bio: bio.trim(),
                    ...(loc ? { location: loc, locationName: [city.trim(), country.trim()].filter(Boolean).join(', ') } : {}),
                  },
                  'Profile bio & location updated!',
                );
              }}
              className="mt-4 space-y-3.5 text-xs"
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-semibold text-slate-700 dark:text-slate-300">
                    Display Name
                  </label>
                  <input
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your Creator Name"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-purple-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-semibold text-slate-700 dark:text-slate-300">
                    Username
                  </label>
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="creator_handle"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-purple-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block font-semibold text-slate-700 dark:text-slate-300">
                  Bio
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell creators what you make and who you want to collab with..."
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-purple-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                    <MapPin className="h-3.5 w-3.5 text-purple-500" />
                    City
                  </label>
                  <input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Lagos, London, New York..."
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-purple-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-semibold text-slate-700 dark:text-slate-300">
                    Country
                  </label>
                  <input
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Nigeria, United States, UK..."
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-purple-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              {statusMsg?.type === 'error' && (
                <p className="font-medium text-rose-600">{statusMsg.text}</p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="rounded-full border border-slate-200 px-4 py-2 font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-full bg-purple-600 px-5 py-2 font-bold text-white disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL 3: EDIT CREATOR NICHES (Tap Pills for Better AI Matches)
         ============================================================ */}
      {activeModal === 'niches' && (
        <div
          onClick={() => setActiveModal(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Choose Your Creator Niches
                </h3>
                <p className="text-xs text-slate-500">
                  Pick up to 5 niches so AI Matching pairs you with the right collaborators.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {CREATOR_NICHES.map((niche) => {
                const active = selectedNiches.includes(niche);
                return (
                  <button
                    key={niche}
                    type="button"
                    onClick={() => {
                      setSelectedNiches((prev) =>
                        prev.includes(niche)
                          ? prev.filter((n) => n !== niche)
                          : prev.length < 5
                            ? [...prev, niche]
                            : prev,
                      );
                    }}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold transition ${
                      active
                        ? 'border-purple-600 bg-purple-600 text-white shadow-xs'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-purple-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {active && <Check className="h-3.5 w-3.5" />}
                    {niche}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() =>
                  void saveSegment(
                    { niche: selectedNiches },
                    'Creator niches saved — your AI matches just got smarter!',
                  )
                }
                className="rounded-full bg-purple-600 px-5 py-2 text-xs font-bold text-white disabled:opacity-50"
              >
                {saving ? 'Saving...' : `Save Niches (${selectedNiches.length})`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL 4: EDIT SOCIAL LINKS
         ============================================================ */}
      {activeModal === 'socials' && (
        <div
          onClick={() => setActiveModal(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Link Your Social Profiles
              </h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const cleaned: Record<string, string> = {};
                for (const [k, v] of Object.entries(socials)) {
                  if (v.trim()) cleaned[k] = v.trim();
                }
                void saveSegment({ socialLinks: cleaned }, 'Social links updated!');
              }}
              className="mt-4 space-y-3 text-xs"
            >
              {(['instagram', 'tiktok', 'youtube', 'twitch', 'twitter'] as const).map((plat) => (
                <div key={plat}>
                  <label className="mb-1 block font-semibold capitalize text-slate-700 dark:text-slate-300">
                    {plat === 'twitter' ? 'X / Twitter' : plat}
                  </label>
                  <input
                    value={socials[plat] || ''}
                    onChange={(e) => setSocials((prev) => ({ ...prev, [plat]: e.target.value }))}
                    placeholder={`@your_${plat}_handle or URL`}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-purple-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              ))}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="rounded-full border border-slate-200 px-4 py-2 font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-full bg-purple-600 px-5 py-2 font-bold text-white disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Links'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
