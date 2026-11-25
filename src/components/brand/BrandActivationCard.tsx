'use client';

import React, { useState } from 'react';
import apiClient from '@/lib/api/client';
import toast from 'react-hot-toast';
import { Building2, CheckCircle2, Globe, Loader2, Sparkles } from 'lucide-react';

interface BrandActivationCardProps {
  onActivated: () => void;
}

export function BrandActivationCard({ onActivated }: BrandActivationCardProps) {
  const [brandName, setBrandName] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState('');
  const [countryCode, setCountryCode] = useState('NG');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (brandName.trim().length < 2) {
      toast.error('Please enter your Brand or Company name.');
      return;
    }
    setSubmitting(true);
    try {
      await apiClient.post('/users/me/brand-role', {
        brandName: brandName.trim(),
        website: website.trim(),
        industry: industry.trim(),
        countryCode,
      });
      toast.success('Brand Workspace activated! Your Creator/Founder profile remains intact.');
      onActivated();
    } catch (err) {
      const msg =
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
        (err as { message?: string })?.message ||
        'Could not activate Brand Workspace.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl overflow-hidden rounded-3xl border border-purple-200/80 bg-white shadow-sm dark:border-purple-900/50 dark:bg-slate-900">
      <div className="bg-gradient-to-br from-[#3B0F7A] via-[#5B21B6] to-[#1E0A3C] p-6 text-white sm:p-8">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-purple-100">
          <Sparkles className="h-3.5 w-3.5 text-amber-300" />
          Brand &amp; Sponsor Role
        </span>
        <h2 className="mt-3 text-2xl font-extrabold tracking-tight">
          Activate Your Brand Challenge Studio
        </h2>
        <p className="mt-1.5 text-sm text-purple-100/85">
          Launch AI-generated or manual micro-influencer challenges, fund verified credit prize pools, and track every creator&apos;s views, engagements, and post click-through rates.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 p-6 sm:p-8">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Brand / Company Name *
            </label>
            <div className="relative">
              <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="e.g. PayWave Africa"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none focus:border-purple-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Industry
            </label>
            <input
              type="text"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="Fintech, Fashion, Music, SaaS..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-purple-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Brand Website / Landing URL
            </label>
            <div className="relative">
              <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://yourbrand.com"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none focus:border-purple-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Primary Market
            </label>
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-purple-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            >
              <option value="NG">Nigeria (NG)</option>
              <option value="US">United States (US)</option>
              <option value="GB">United Kingdom (GB)</option>
              <option value="GH">Ghana (GH)</option>
              <option value="ZA">South Africa (ZA)</option>
              <option value="KE">Kenya (KE)</option>
              <option value="CA">Canada (CA)</option>
            </select>
          </div>
        </div>

        <div className="rounded-2xl bg-purple-50/70 p-3.5 text-xs text-purple-900 dark:bg-purple-950/30 dark:text-purple-200">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-purple-600 dark:text-purple-400" />
            <span>
              Activating Brand Mode adds a dedicated Brand Workspace to your account without modifying your existing Creator or Founder profile.
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-purple-500 disabled:opacity-50"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {submitting ? 'Activating Brand Workspace...' : 'Activate Brand Role & Enter Studio'}
        </button>
      </form>
    </div>
  );
}
