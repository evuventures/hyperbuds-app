'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import apiClient from '@/lib/api/client';
import { uploadFeedMediaToCloudinary } from '@/lib/api/feed.api';
import { formatCompactCount } from '@/lib/utils/formatCount';
import {
  BarChart3,
  Briefcase,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  Film,
  Heart,
  Link2,
  Loader2,
  MessageSquare,
  Plus,
  Repeat2,
  Sparkles,
  Upload,
  X,
} from 'lucide-react';

export type ProfileModalType = 'photo' | 'edit' | 'niches' | 'social' | null;

const SUGGESTED_NICHES = [
  'Gaming', 'Tech & AI', 'Lifestyle', 'Beauty', 'Fashion', 'Fitness',
  'Music', 'Comedy', 'Education', 'Finance', 'Travel', 'Food',
  'Photography', 'Filmmaking', 'Podcasting', 'Startups', 'Sports', 'Art',
];

export interface ProfileModalData {
  userId?: string;
  username?: string;
  displayName?: string;
  bio?: string;
  avatar?: string;
  locationName?: string;
  niche?: string[];
  socialLinks?: Record<string, string>;
  primaryRole?: string;
  availability?: string;
  offerPreference?: string;
  skills?: string[];
  portfolioLinks?: Record<string, string>;
}

interface ProfileModalsProps {
  activeModal: ProfileModalType;
  onClose: () => void;
  profile: ProfileModalData | null;
  onSaved: () => Promise<void> | void;
}

export function ProfileEditorModals({
  activeModal,
  onClose,
  profile,
  onSaved,
}: ProfileModalsProps) {
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit Bio & Professional / Startup Hub fields
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [locationName, setLocationName] = useState('');
  const [primaryRole, setPrimaryRole] = useState('');
  const [availability, setAvailability] = useState('immediately');
  const [offerPreference, setOfferPreference] = useState('hybrid');
  const [skillsCsv, setSkillsCsv] = useState('');
  const [portfolioWebsite, setPortfolioWebsite] = useState('');
  const [portfolioGithub, setPortfolioGithub] = useState('');
  const [portfolioLinkedin, setPortfolioLinkedin] = useState('');

  // Niches
  const [niches, setNiches] = useState<string[]>([]);
  const [customNiche, setCustomNiche] = useState('');

  // Social links
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({});

  // Photo
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!activeModal) return;
    setError(null);
    setDisplayName(profile?.displayName || '');
    setBio(profile?.bio || '');
    setLocationName(profile?.locationName || '');
    setPrimaryRole(profile?.primaryRole || '');
    setAvailability(profile?.availability || 'immediately');
    setOfferPreference(profile?.offerPreference || 'hybrid');
    setSkillsCsv(Array.isArray(profile?.skills) ? profile!.skills.join(', ') : '');
    setPortfolioWebsite(profile?.portfolioLinks?.website || '');
    setPortfolioGithub(profile?.portfolioLinks?.github || '');
    setPortfolioLinkedin(profile?.portfolioLinks?.linkedin || '');
    setNiches(Array.isArray(profile?.niche) ? profile!.niche : []);
    setSocialLinks({ ...(profile?.socialLinks || {}) });
    setPreviewUrl(profile?.avatar || null);
  }, [activeModal, profile]);

  if (!activeModal) return null;

  const savePayload = async (payload: Record<string, unknown>) => {
    setSaving(true);
    setError(null);
    try {
      await apiClient.put('/profiles/me', payload);
      await onSaved();
      onClose();
    } catch (err) {
      setError((err as { message?: string })?.message || 'Could not save changes.');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG, or WebP).');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setError('Image must be under 15 MB.');
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const uploaded = await uploadFeedMediaToCloudinary(file, { kind: 'post' });
      setPreviewUrl(uploaded.url);
      await apiClient.put('/profiles/me', { avatar: uploaded.url });
      await onSaved();
      onClose();
    } catch (err) {
      setError((err as { message?: string })?.message || 'Could not upload photo.');
    } finally {
      setUploading(false);
    }
  };

  const toggleNiche = (tag: string) => {
    setNiches((prev) =>
      prev.includes(tag) ? prev.filter((n) => n !== tag) : prev.length < 8 ? [...prev, tag] : prev,
    );
  };

  const addCustomNiche = () => {
    const cleaned = customNiche.trim();
    if (!cleaned) return;
    if (!niches.includes(cleaned) && niches.length < 8) {
      setNiches((prev) => [...prev, cleaned]);
    }
    setCustomNiche('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <h3 className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
            {activeModal === 'photo' && (
              <>
                <Camera className="h-4 w-4 text-purple-600" />
                Update Profile Picture
              </>
            )}
            {activeModal === 'edit' && (
              <>
                <Briefcase className="h-4 w-4 text-purple-600" />
                Edit Profile &amp; Startup Hub
              </>
            )}
            {activeModal === 'niches' && (
              <>
                <Sparkles className="h-4 w-4 text-purple-600" />
                Content Specializations
              </>
            )}
            {activeModal === 'social' && (
              <>
                <Link2 className="h-4 w-4 text-purple-600" />
                Add Social Media Links
              </>
            )}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200">
            {error}
          </div>
        )}

        {/* MODAL: PHOTO */}
        {activeModal === 'photo' && (
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-3">
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt="Profile preview"
                  className="h-28 w-28 rounded-2xl border-2 border-purple-200 object-cover shadow-sm"
                />
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 text-slate-400 dark:border-slate-700 dark:bg-slate-800">
                  <Camera className="h-8 w-8" />
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handlePhotoFile}
              />
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-500 disabled:opacity-50"
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {uploading ? 'Uploading photo...' : 'Choose Photo (up to 15 MB)'}
              </button>
            </div>
          </div>
        )}

        {/* MODAL: EDIT BIO + PROFESSIONAL & STARTUP HUB PROFILE */}
        {activeModal === 'edit' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Display Name
                </span>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-purple-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Location
                </span>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="Lagos, London, New York..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-purple-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Bio
              </span>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell creators & brands what you create and what collaborations you're open to..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-purple-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </label>

            <div className="border-t border-slate-100 pt-3 dark:border-slate-800">
              <p className="mb-2.5 text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
                Professional &amp; Startup Hub Profile
              </p>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Primary Role
                  </span>
                  <input
                    type="text"
                    value={primaryRole}
                    onChange={(e) => setPrimaryRole(e.target.value)}
                    placeholder="e.g. Video Editor, Product Designer, Founder"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-purple-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Availability
                  </span>
                  <select
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-purple-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="immediately">Available Immediately</option>
                    <option value="2_weeks">Available in 2 Weeks</option>
                    <option value="1_month">Available in 1 Month</option>
                    <option value="part_time">Part-Time / Advisory</option>
                    <option value="not_looking">Not Looking</option>
                  </select>
                </label>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Compensation / Offer Preference
                  </span>
                  <select
                    value={offerPreference}
                    onChange={(e) => setOfferPreference(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-purple-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="hybrid">Hybrid (Salary + Equity)</option>
                    <option value="salary_only">Salary / Cash Only</option>
                    <option value="equity_only">Equity Only</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Skills (comma separated)
                  </span>
                  <input
                    type="text"
                    value={skillsCsv}
                    onChange={(e) => setSkillsCsv(e.target.value)}
                    placeholder="React, Video Editing, Growth, Figma"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-purple-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </label>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                <input
                  type="url"
                  value={portfolioWebsite}
                  onChange={(e) => setPortfolioWebsite(e.target.value)}
                  placeholder="Portfolio URL"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none focus:border-purple-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <input
                  type="url"
                  value={portfolioGithub}
                  onChange={(e) => setPortfolioGithub(e.target.value)}
                  placeholder="GitHub URL"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none focus:border-purple-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <input
                  type="url"
                  value={portfolioLinkedin}
                  onChange={(e) => setPortfolioLinkedin(e.target.value)}
                  placeholder="LinkedIn URL"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none focus:border-purple-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => {
                  const skills = skillsCsv
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean)
                    .slice(0, 15);
                  const portfolioLinks: Record<string, string> = {};
                  if (portfolioWebsite.trim()) portfolioLinks.website = portfolioWebsite.trim();
                  if (portfolioGithub.trim()) portfolioLinks.github = portfolioGithub.trim();
                  if (portfolioLinkedin.trim()) portfolioLinks.linkedin = portfolioLinkedin.trim();
                  void savePayload({
                    displayName: displayName.trim(),
                    bio: bio.trim(),
                    locationName: locationName.trim(),
                    primaryRole: primaryRole.trim(),
                    availability,
                    offerPreference,
                    skills,
                    portfolioLinks,
                  });
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-5 py-2 text-xs font-semibold text-white hover:bg-purple-500 disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                Save Profile
              </button>
            </div>
          </div>
        )}

        {/* MODAL: NICHES */}
        {activeModal === 'niches' && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_NICHES.map((tag) => {
                const selected = niches.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleNiche(tag)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                      selected
                        ? 'border-purple-600 bg-purple-600 text-white'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-purple-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {selected ? '✓ ' : '+ '}
                    {tag}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={customNiche}
                onChange={(e) => setCustomNiche(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomNiche())}
                placeholder="Add custom niche..."
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none focus:border-purple-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              <button
                type="button"
                onClick={addCustomNiche}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <Plus className="h-3.5 w-3.5" /> Add
              </button>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => void savePayload({ niche: niches })}
                className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-5 py-2 text-xs font-semibold text-white hover:bg-purple-500 disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                Save Niches ({niches.length})
              </button>
            </div>
          </div>
        )}

        {/* MODAL: SOCIAL LINKS */}
        {activeModal === 'social' && (
          <div className="space-y-3">
            {(['tiktok', 'instagram', 'youtube', 'twitter', 'twitch', 'linkedin'] as const).map((platform) => (
              <label key={platform} className="block">
                <span className="mb-1 block text-xs font-semibold capitalize text-slate-700 dark:text-slate-300">
                  {platform === 'twitter' ? 'X / Twitter' : platform}
                </span>
                <input
                  type="url"
                  value={socialLinks[platform] || ''}
                  onChange={(e) =>
                    setSocialLinks((prev) => ({ ...prev, [platform]: e.target.value }))
                  }
                  placeholder={`https://${platform}.com/yourhandle`}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none focus:border-purple-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </label>
            ))}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => {
                  const cleaned: Record<string, string> = {};
                  Object.entries(socialLinks).forEach(([k, v]) => {
                    if (v && v.trim()) cleaned[k] = v.trim();
                  });
                  void savePayload({ socialLinks: cleaned });
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-5 py-2 text-xs font-semibold text-white hover:bg-purple-500 disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                Save Links
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface ProfilePostItem {
  _id: string;
  id?: string;
  kind?: string;
  body?: string;
  caption?: string;
  media?: Array<{ type: string; url: string; thumbnailUrl?: string }>;
  likesCount?: number;
  commentsCount?: number;
  repostsCount?: number;
  viewsCount?: number;
  createdAt?: string;
}

export function ProfilePostsPaginated({
  authorId,
  refreshKey = 0,
  onCreatePost,
}: {
  authorId: string;
  refreshKey?: number;
  onCreatePost?: () => void;
}) {
  const [posts, setPosts] = useState<ProfilePostItem[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [openAnalyticsId, setOpenAnalyticsId] = useState<string | null>(null);
  const limit = 5;

  const loadPosts = useCallback(async () => {
    if (!authorId) return;
    setLoading(true);
    try {
      const res = await apiClient.get(
        `/feed/posts?authorId=${encodeURIComponent(authorId)}&page=${page}&limit=${limit}`,
      );
      setPosts(Array.isArray(res.data?.posts) ? res.data.posts : []);
      setTotal(Number(res.data?.total ?? 0));
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [authorId, page]);

  useEffect(() => {
    void loadPosts();
  }, [loadPosts, refreshKey]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <section
      id="my-posts"
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            My Posts ({formatCompactCount(total)})
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Showing 5 posts per page with per-post views &amp; engagement analytics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/analytics"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <BarChart3 className="h-3.5 w-3.5 text-purple-600" />
            28d / 7d / 24h Analytics
          </Link>
          {onCreatePost && (
            <button
              type="button"
              onClick={onCreatePost}
              className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-purple-500"
            >
              <Plus className="h-3.5 w-3.5" />
              New Post
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center dark:border-slate-700">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">No posts yet</p>
          <p className="mt-1 text-xs text-slate-500">Share your first post or reel directly from your profile.</p>
          {onCreatePost && (
            <button
              type="button"
              onClick={onCreatePost}
              className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-500"
            >
              <Plus className="h-3.5 w-3.5" />
              Create Post
            </button>
          )}
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {posts.map((post) => {
            const views = Number(post.viewsCount ?? 0);
            const likes = Number(post.likesCount ?? 0);
            const comments = Number(post.commentsCount ?? 0);
            const reposts = Number(post.repostsCount ?? 0);
            const engagements = likes + comments + reposts;
            const rate = views > 0 ? ((engagements / views) * 100).toFixed(1) : engagements > 0 ? '100' : '0';
            const firstMedia = post.media?.[0];
            const showAnalytics = openAnalyticsId === post._id;

            return (
              <div key={post._id} className="py-3.5">
                <div className="flex items-start gap-3">
                  {firstMedia?.url && (
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-900">
                      {firstMedia.type === 'video' ? (
                        <div className="flex h-full w-full items-center justify-center bg-purple-950 text-purple-200">
                          <Film className="h-5 w-5" />
                        </div>
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={firstMedia.url} alt="" className="h-full w-full object-cover" />
                      )}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-400">
                        {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ''}
                        {post.kind === 'reel' ? ' · Reel' : ''}
                      </span>
                      <button
                        type="button"
                        onClick={() => setOpenAnalyticsId(showAnalytics ? null : post._id)}
                        className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                          showAnalytics
                            ? 'bg-purple-600 text-white'
                            : 'bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-950/50 dark:text-purple-300'
                        }`}
                      >
                        <BarChart3 className="h-3 w-3" />
                        Post Analytics
                      </button>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-800 dark:text-slate-200">
                      {post.body || post.caption || '(Media post)'}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                      <span className="inline-flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" /> {formatCompactCount(views)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Heart className="h-3.5 w-3.5" /> {formatCompactCount(likes)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MessageSquare className="h-3.5 w-3.5" /> {formatCompactCount(comments)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Repeat2 className="h-3.5 w-3.5" /> {formatCompactCount(reposts)}
                      </span>
                    </div>
                  </div>
                </div>

                {showAnalytics && (
                  <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl border border-purple-100 bg-purple-50/50 p-3 sm:grid-cols-4 dark:border-purple-900/40 dark:bg-purple-950/20">
                    <div>
                      <p className="text-[10px] font-medium uppercase text-slate-500">Total Views</p>
                      <p className="text-base font-bold text-slate-900 dark:text-white">
                        {formatCompactCount(views)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium uppercase text-slate-500">Total Likes</p>
                      <p className="text-base font-bold text-rose-600 dark:text-rose-400">
                        {formatCompactCount(likes)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium uppercase text-slate-500">Engagements</p>
                      <p className="text-base font-bold text-purple-700 dark:text-purple-300">
                        {formatCompactCount(engagements)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium uppercase text-slate-500">Engagement Rate</p>
                      <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">{rate}%</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {total > limit && (
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs dark:border-slate-800">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 disabled:opacity-40 dark:border-slate-700 dark:text-slate-200"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Previous
          </button>
          <span className="font-medium text-slate-500">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 disabled:opacity-40 dark:border-slate-700 dark:text-slate-200"
          >
            Next <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </section>
  );
}
