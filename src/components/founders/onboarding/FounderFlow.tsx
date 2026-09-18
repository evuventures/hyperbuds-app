'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Check, ArrowLeft, ExternalLink } from 'lucide-react';
import {
  useOnboardingState,
  AI_ROLE_SUGGESTIONS,
  MOCK_MATCHED_TALENTS,
  FounderPitch,
  RoleOffer,
  MatchedTalent,
} from '@/hooks/onboarding/useOnboardingState';
import {
  OnboardingWizardShell,
  CollabRoomStep,
  PrimaryButton,
  SecondaryButton,
  Field,
  Chip,
  RadioRow,
  StatCard,
  inputClass,
} from './Shared';

const STEP_LABELS = ['Pitch Idea', 'AI Roles', 'Role & Offer', 'Matched Talents', 'Invite Tracking', 'Collab Room'];

const INDUSTRIES = [
  'FinTech', 'HealthTech', 'EdTech', 'E-Commerce', 'SaaS / B2B',
  'AI / ML', 'CleanTech', 'Creator Economy', 'Logistics', 'Other',
];
const FUNDING_STAGES = ['Just an idea', 'Pre-seed', 'MVP built', 'Seed', 'Series A+'];

// ---- Step 1: Pitch Idea (3 sub-tabs) ----

function PitchIdeaStep({
  pitch,
  onChange,
  onNext,
}: {
  pitch: FounderPitch;
  onChange: (patch: Partial<FounderPitch>) => void;
  onNext: () => void;
}) {
  const [tab, setTab] = useState(0);
  const tabs = ['1. Core Idea', '2. Problem & Market', '3. Stage & Team'];

  const canAdvanceTab0 = pitch.startupName.trim().length > 0 && pitch.description.trim().length > 0;
  const canAdvanceTab1 = pitch.industry.trim().length > 0;
  const canFinish = pitch.fundingStage.trim().length > 0;

  return (
    <div className="backdrop-blur-xl rounded-2xl border border-gray-200/70 bg-white/80 p-6 dark:border-gray-700/70 dark:bg-gray-900/60 sm:p-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Describe your idea</h1>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        HyperBuds AI will analyze your pitch and suggest the exact roles and talents you need.
      </p>

      <div className="mt-6 grid grid-cols-3 gap-1 rounded-xl bg-gray-100/80 p-1 dark:bg-gray-800/60">
        {tabs.map((label, index) => (
          <button
            key={label}
            type="button"
            onClick={() => index < tab && setTab(index)}
            className={`relative rounded-lg px-2 py-2.5 text-xs font-medium transition-colors duration-200 sm:text-sm ${
              index === tab
                ? 'text-white'
                : index < tab
                ? 'text-gray-600 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400'
                : 'cursor-not-allowed text-gray-400 dark:text-gray-600'
            }`}
          >
            {index === tab && (
              <motion.span
                layoutId="pitch-tab-highlight"
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                className="absolute inset-0 rounded-lg bg-linear-to-r from-purple-500 to-indigo-500"
              />
            )}
            <span className="relative">{label}</span>
          </button>
        ))}
      </div>

      <div className="mt-8 space-y-5">
        {tab === 0 && (
          <>
            <Field label="Startup / idea name">
              <input value={pitch.startupName} onChange={(e) => onChange({ startupName: e.target.value })} placeholder="e.g. NeuroShop" className={inputClass} />
            </Field>
            <Field label="One-line tagline">
              <input value={pitch.tagline} onChange={(e) => onChange({ tagline: e.target.value })} placeholder="e.g. AI-powered shopping assistant that learns your style" className={inputClass} />
            </Field>
            <Field label="Full description">
              <textarea value={pitch.description} onChange={(e) => onChange({ description: e.target.value })} placeholder="Describe what your startup does, who it serves, and the problem you're solving..." rows={5} className={inputClass} />
            </Field>
          </>
        )}

        {tab === 1 && (
          <>
            <Field label="Industry / category">
              <div className="flex flex-wrap gap-2">
                {INDUSTRIES.map((industry) => (
                  <Chip key={industry} label={industry} active={pitch.industry === industry} onClick={() => onChange({ industry })} />
                ))}
              </div>
            </Field>
            <Field label="Website / deck URL — optional">
              <input value={pitch.websiteUrl} onChange={(e) => onChange({ websiteUrl: e.target.value })} placeholder="https://mypitch.com" className={inputClass} />
            </Field>
          </>
        )}

        {tab === 2 && (
          <Field label="Funding stage">
            <div className="space-y-2">
              {FUNDING_STAGES.map((stage) => (
                <RadioRow key={stage} label={stage} active={pitch.fundingStage === stage} onClick={() => onChange({ fundingStage: stage })} />
              ))}
            </div>
          </Field>
        )}
      </div>

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <SecondaryButton>Save Draft</SecondaryButton>
        {tab < 2 ? (
          <PrimaryButton disabled={tab === 0 ? !canAdvanceTab0 : !canAdvanceTab1} onClick={() => setTab((t) => t + 1)}>
            Next →
          </PrimaryButton>
        ) : (
          <PrimaryButton disabled={!canFinish} onClick={onNext}>Analyze My Pitch →</PrimaryButton>
        )}
      </div>
    </div>
  );
}

// ---- Step 2: AI Roles ----

const PRIORITY_STYLES: Record<string, string> = {
  Critical: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  High: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
  Medium: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
};

function AIRolesStep({
  selectedRoleIds,
  onToggle,
  onNext,
}: {
  selectedRoleIds: string[];
  onToggle: (roleId: string) => void;
  onNext: () => void;
}) {
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-500">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            AI analysis complete
          </p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-50">Recommended roles</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Based on your startup pitch. Select the roles to proceed with.
          </p>
        </div>
        <div className="backdrop-blur-xl flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl border border-gray-200/70 bg-white/80 dark:border-gray-700/70 dark:bg-gray-900/60">
          <span className="text-xl font-bold text-indigo-500">{selectedRoleIds.length}</span>
          <span className="text-[10px] text-gray-500 dark:text-gray-400">selected</span>
        </div>
      </div>

      <div className="space-y-4">
        {AI_ROLE_SUGGESTIONS.map((role) => {
          const active = selectedRoleIds.includes(role.id);
          return (
            <motion.button
              key={role.id}
              type="button"
              onClick={() => onToggle(role.id)}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className={`w-full rounded-2xl border p-5 text-left transition-colors duration-200 ${
                active
                  ? 'border-purple-400 bg-purple-50/60 dark:border-purple-500/60 dark:bg-purple-900/20'
                  : 'border-gray-200 bg-white/80 hover:border-purple-200 dark:border-gray-700 dark:bg-gray-900/60'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-200 ${active ? 'border-purple-500 bg-purple-500' : 'border-gray-300 dark:border-gray-600'}`}>
                  {active && <Check className="h-3 w-3 text-white" />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-50">{role.title}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${PRIORITY_STYLES[role.priority]}`}>{role.priority}</span>
                    <span className="rounded-full border border-gray-200 px-2 py-0.5 text-[11px] font-medium text-gray-500 dark:border-gray-700 dark:text-gray-400">Hire #{role.hireNumber}</span>
                  </div>
                  <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">{role.reason}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {role.skills.map((skill) => (
                      <span key={skill} className="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-600 dark:border-gray-700 dark:text-gray-300">{skill}</span>
                    ))}
                  </div>
                  <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                    Suggested: <span className="font-semibold text-gray-800 dark:text-gray-100">{role.suggestedComp}</span>
                  </p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      <div className="mt-8 flex justify-end">
        <PrimaryButton disabled={selectedRoleIds.length === 0} onClick={onNext}>
          Confirm {selectedRoleIds.length || ''} Role{selectedRoleIds.length === 1 ? '' : 's'} & Set Offers →
        </PrimaryButton>
      </div>
    </div>
  );
}

// ---- Step 3: Role & Offer ----

const VESTING_OPTIONS = ['4yr cliff 1yr', '3yr cliff 6mo', 'Milestone-based'];
const COMP_TYPES: RoleOffer['compType'][] = ['salary', 'equity', 'hybrid'];
const COMP_LABELS: Record<RoleOffer['compType'], string> = { salary: 'Salary', equity: 'Equity', hybrid: 'Hybrid' };

function RoleOfferStep({
  pitch,
  onChangeOffer,
  onNext,
}: {
  pitch: FounderPitch;
  onChangeOffer: (roleId: string, patch: Partial<RoleOffer>) => void;
  onNext: () => void;
}) {
  const roles = AI_ROLE_SUGGESTIONS.filter((r) => pitch.selectedRoleIds.includes(r.id));
  const [activeRoleId, setActiveRoleId] = useState(roles[0]?.id);
  const activeRole = roles.find((r) => r.id === activeRoleId) ?? roles[0];
  const offer: RoleOffer = pitch.offers[activeRole?.id ?? ''] ?? { compType: 'salary', vesting: VESTING_OPTIONS[0] };
  const allSet = roles.every((r) => pitch.offers[r.id]);

  if (!activeRole) return null;

  return (
    <div className="backdrop-blur-xl rounded-2xl border border-gray-200/70 bg-white/80 p-6 dark:border-gray-700/70 dark:bg-gray-900/60 sm:p-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Set compensation terms</h1>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Configure offers for each role. Clear terms attract better talent faster.</p>

      <div className="mt-6 flex gap-1 overflow-x-auto rounded-xl bg-gray-100/80 p-1 dark:bg-gray-800/60 sm:grid" style={{ gridTemplateColumns: `repeat(${roles.length}, minmax(0, 1fr))` }}>
        {roles.map((role, index) => (
          <button key={role.id} type="button" onClick={() => setActiveRoleId(role.id)} className={`relative min-w-30 shrink-0 rounded-lg px-2 py-3 text-xs font-medium transition-colors duration-200 sm:min-w-0 sm:shrink ${activeRole.id === role.id ? 'text-white' : 'text-gray-500 hover:text-purple-600 dark:text-gray-400'}`}>
            {activeRole.id === role.id && (
              <motion.span layoutId="offer-tab-highlight" transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }} className="absolute inset-0 rounded-lg bg-linear-to-r from-purple-500 to-indigo-500" />
            )}
            <span className="relative block">
              <span className="block text-[10px] opacity-70">{String(index + 1).padStart(2, '0')}</span>
              {role.title}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">{activeRole.title}</h2>

        <div className="mt-4">
          <label className="mb-1.5 block text-xs font-semibold tracking-wide text-gray-500 dark:text-gray-400">Compensation type</label>
          <div className="grid grid-cols-3 gap-2">
            {COMP_TYPES.map((type) => (
              <button key={type} type="button" onClick={() => onChangeOffer(activeRole.id, { compType: type })} className={`rounded-xl py-2.5 text-sm font-semibold transition-colors duration-200 ${offer.compType === type ? 'bg-linear-to-r from-purple-500 to-indigo-500 text-white shadow-glow' : 'border border-gray-200 text-gray-600 hover:border-purple-300 dark:border-gray-700 dark:text-gray-300'}`}>
                {COMP_LABELS[type]}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          {(offer.compType === 'salary' || offer.compType === 'hybrid') && (
            <Field label="Monthly salary (USD)">
              <input type="number" value={offer.monthlySalary ?? ''} onChange={(e) => onChangeOffer(activeRole.id, { monthlySalary: Number(e.target.value) })} className={inputClass} />
            </Field>
          )}
          {(offer.compType === 'equity' || offer.compType === 'hybrid') && (
            <Field label="Equity %">
              <input type="number" value={offer.equityPercent ?? ''} onChange={(e) => onChangeOffer(activeRole.id, { equityPercent: Number(e.target.value) })} className={inputClass} />
            </Field>
          )}
        </div>

        {offer.compType !== 'salary' && (
          <div className="mt-5">
            <label className="mb-1.5 block text-xs font-semibold tracking-wide text-gray-500 dark:text-gray-400">Vesting schedule</label>
            <div className="grid grid-cols-3 gap-2">
              {VESTING_OPTIONS.map((v) => (
                <button key={v} type="button" onClick={() => onChangeOffer(activeRole.id, { vesting: v })} className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors duration-200 ${offer.vesting === v ? 'border-purple-400 bg-purple-50/70 text-purple-700 dark:border-purple-500/60 dark:bg-purple-900/20 dark:text-purple-300' : 'border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-300'}`}>
                  {v}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-end">
        <PrimaryButton disabled={!allSet} onClick={onNext}>Save Offers & Browse Talents →</PrimaryButton>
      </div>
    </div>
  );
}

// ---- Step 4: Matched Talents (+ detail panel) ----

function TalentDetailPanel({ talent, invited, onInvite, onBack }: { talent: MatchedTalent; invited: boolean; onInvite: () => void; onBack: () => void }) {
  return (
    <div>
      <button type="button" onClick={onBack} className="mb-4 flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors duration-200 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400">
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to matches
      </button>

      <div className="backdrop-blur-xl rounded-2xl border border-gray-200/70 bg-white/80 p-6 dark:border-gray-700/70 dark:bg-gray-900/60">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-purple-100 text-lg font-bold text-purple-600 dark:bg-purple-900/40 dark:text-purple-300">
              {talent.name.split(' ').map((n) => n[0]).join('')}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-50">{talent.name}</h1>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">{talent.tag}</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{talent.role}</p>
              <p className="mt-1 text-xs text-gray-400">
                {talent.location} · {talent.timezone} · Available {talent.availability}
              </p>
            </div>
          </div>
          <div className="backdrop-blur-xl flex flex-col items-center rounded-2xl border border-gray-200/70 bg-white/80 px-5 py-3 text-center dark:border-gray-700/70 dark:bg-gray-900/60">
            <p className="text-2xl font-bold text-emerald-500">{talent.trust}</p>
            <p className="text-[11px] text-gray-400">Trust Score</p>
            <p className="mt-1 text-xs font-medium text-amber-500">★ {talent.rating} ({talent.reviewCount})</p>
          </div>
        </div>

        <p className="mt-5 text-sm text-gray-600 dark:text-gray-300">{talent.bio}</p>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="backdrop-blur-xl rounded-2xl border border-gray-200/70 bg-white/80 p-5 dark:border-gray-700/70 dark:bg-gray-900/60">
          <h2 className="font-semibold text-gray-900 dark:text-gray-50">Skills</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {talent.skills.map((skill) => (
              <span key={skill} className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-300">{skill}</span>
            ))}
          </div>
        </div>
        <div className="backdrop-blur-xl rounded-2xl border border-gray-200/70 bg-white/80 p-5 dark:border-gray-700/70 dark:bg-gray-900/60">
          <h2 className="font-semibold text-gray-900 dark:text-gray-50">Details</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-gray-500 dark:text-gray-400">Availability</dt><dd className="font-medium text-gray-900 dark:text-gray-50">{talent.availability}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500 dark:text-gray-400">Offer preference</dt><dd className="font-medium text-emerald-600 dark:text-emerald-400">{talent.tag}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500 dark:text-gray-400">Languages</dt><dd className="font-medium text-gray-900 dark:text-gray-50">{talent.languages.join(', ')}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500 dark:text-gray-400">Timezone</dt><dd className="font-medium text-gray-900 dark:text-gray-50">{talent.timezone}</dd></div>
          </dl>
        </div>
      </div>

      <div className="backdrop-blur-xl mt-4 rounded-2xl border border-gray-200/70 bg-white/80 p-5 dark:border-gray-700/70 dark:bg-gray-900/60">
        <h2 className="font-semibold text-gray-900 dark:text-gray-50">Experience</h2>
        <div className="mt-3 divide-y divide-gray-100 dark:divide-gray-800">
          {talent.experience.map((job) => (
            <div key={`${job.company}-${job.title}`} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">{job.company[0]}</div>
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-50">{job.title}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{job.company} · {job.duration}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {talent.portfolio.length > 0 && (
        <div className="backdrop-blur-xl mt-4 rounded-2xl border border-gray-200/70 bg-white/80 p-5 dark:border-gray-700/70 dark:bg-gray-900/60">
          <h2 className="font-semibold text-gray-900 dark:text-gray-50">Portfolio & Links</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {talent.portfolio.map((link) => (
              <a key={link.label} href={link.url} className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 transition-colors duration-200 hover:border-purple-300 hover:text-purple-600 dark:border-gray-700 dark:text-gray-300">
                <ExternalLink className="h-3.5 w-3.5" />
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6">
        <button
          type="button"
          onClick={onInvite}
          disabled={invited}
          className={`w-full rounded-xl py-3.5 text-sm font-semibold transition-colors duration-200 ${
            invited
              ? 'cursor-default bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
              : 'bg-linear-to-r from-purple-500 to-indigo-500 text-white shadow-glow'
          }`}
        >
          {invited ? 'Invited' : `Invite ${talent.name.split(' ')[0]} to collaborate`}
        </button>
      </div>
    </div>
  );
}

const TALENT_FILTERS = ['All', 'Salary', 'Equity', 'Hybrid'];

function MatchedTalentsStep({
  invitedIds,
  onInvite,
  onNext,
}: {
  invitedIds: string[];
  onInvite: (talentId: string) => void;
  onNext: () => void;
}) {
  const [filter, setFilter] = useState('All');
  const [viewingId, setViewingId] = useState<string | null>(null);
  const talents = MOCK_MATCHED_TALENTS.filter((t) => filter === 'All' || t.tag === filter);
  const viewing = MOCK_MATCHED_TALENTS.find((t) => t.id === viewingId);

  if (viewing) {
    return (
      <TalentDetailPanel
        talent={viewing}
        invited={invitedIds.includes(viewing.id)}
        onInvite={() => onInvite(viewing.id)}
        onBack={() => setViewingId(null)}
      />
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Your recommendations</h1>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{MOCK_MATCHED_TALENTS.length} talents matched to your startup profile.</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {TALENT_FILTERS.map((f) => (
          <button key={f} type="button" onClick={() => setFilter(f)} className={`rounded-lg border px-3.5 py-1.5 text-sm font-medium transition-colors duration-200 ${filter === f ? 'border-purple-400 bg-purple-50 text-purple-700 dark:border-purple-500/60 dark:bg-purple-900/20 dark:text-purple-300' : 'border-gray-200 text-gray-500 hover:border-purple-200 dark:border-gray-700 dark:text-gray-400'}`}>
            {f}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-3">
        {talents.map((talent) => {
          const invited = invitedIds.includes(talent.id);
          return (
            <div key={talent.id} onClick={() => setViewingId(talent.id)} className="backdrop-blur-xl flex cursor-pointer flex-col items-start justify-between gap-4 rounded-2xl border border-gray-200/70 bg-white/80 p-4 transition-colors duration-200 hover:border-purple-200 dark:border-gray-700/70 dark:bg-gray-900/60 sm:flex-row sm:items-center">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-linear-to-r from-purple-500 to-indigo-500 text-sm font-semibold text-white">
                  {talent.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-semibold text-gray-900 dark:text-gray-50">{talent.name}</p>
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">{talent.tag}</span>
                  </div>
                  <p className="truncate text-sm text-gray-500 dark:text-gray-400">{talent.role} · {talent.location}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-4">
                <div className="text-right">
                  <p className="text-lg font-bold text-emerald-500">{talent.trust}</p>
                  <p className="text-[11px] text-gray-400">trust</p>
                </div>
                <motion.button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onInvite(talent.id); }}
                  whileTap={{ scale: 0.96 }}
                  disabled={invited}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors duration-200 ${invited ? 'cursor-default bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-linear-to-r from-purple-500 to-indigo-500 text-white shadow-glow'}`}
                >
                  {invited ? 'Invited' : 'Invite'}
                </motion.button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex justify-end">
        <PrimaryButton disabled={invitedIds.length === 0} onClick={onNext}>Track Invites →</PrimaryButton>
      </div>
    </div>
  );
}

// ---- Step 5: Invite Tracking ----

const STATUS_STYLES: Record<string, string> = {
  Accepted: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
  Negotiating: 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
  Pending: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
  Declined: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400',
};

function InviteTrackingStep({ invitedIds, onFinish }: { invitedIds: string[]; onFinish: () => void }) {
  const invites = MOCK_MATCHED_TALENTS.filter((t) => invitedIds.includes(t.id)).map((t, i) => ({
    ...t,
    status: i === 0 ? 'Accepted' : i === 1 ? 'Negotiating' : 'Pending',
  }));

  const accepted = invites.filter((i) => i.status === 'Accepted').length;
  const negotiating = invites.filter((i) => i.status === 'Negotiating').length;
  const declined = invites.filter((i) => i.status === 'Declined').length;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Team pipeline</h1>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Monitor your outbound invites and respond to negotiations.</p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Sent" value={invites.length} />
        <StatCard label="Accepted" value={accepted} />
        <StatCard label="Negotiating" value={negotiating} />
        <StatCard label="Declined" value={declined} />
      </div>

      <div className="backdrop-blur-xl mt-6 divide-y divide-gray-100 rounded-2xl border border-gray-200/70 bg-white/80 dark:divide-gray-800 dark:border-gray-700/70 dark:bg-gray-900/60">
        {invites.map((invite) => (
          <div key={invite.id} className="flex items-center justify-between gap-4 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-r from-purple-500 to-indigo-500 text-xs font-semibold text-white">
                {invite.name.split(' ').map((n) => n[0]).join('')}
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-50">{invite.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{invite.role}</p>
              </div>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[invite.status]}`}>{invite.status}</span>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <PrimaryButton onClick={onFinish}>Open Collaboration Room →</PrimaryButton>
      </div>
    </div>
  );
}

// ---- Orchestrator ----

export default function FounderOnboardingWizard({
  onExitToChooser,
}: {
  /** Called instead of navigating away when Back is pressed on step 0.
   *  Used to return to the role chooser during a live walkthrough. */
  onExitToChooser?: () => void;
} = {}) {
  const router = useRouter();
  const { state, currentPitch, setStep, updateCurrentPitch, complete, hydrated } = useOnboardingState();

  if (!hydrated || !currentPitch) return null;

  const { currentStep } = state;
  const goTo = (step: number) => setStep(step);

  const toggleRole = (roleId: string) => {
    const selected = currentPitch.selectedRoleIds.includes(roleId)
      ? currentPitch.selectedRoleIds.filter((id) => id !== roleId)
      : [...currentPitch.selectedRoleIds, roleId];
    updateCurrentPitch({ selectedRoleIds: selected });
  };

  const updateOffer = (roleId: string, patch: Partial<RoleOffer>) => {
    const existing: RoleOffer = currentPitch.offers[roleId] ?? { compType: 'salary', vesting: '4yr cliff 1yr' };
    updateCurrentPitch({
      offers: {
        ...currentPitch.offers,
        [roleId]: { ...existing, ...patch },
      },
    });
  };

  const toggleInvite = (talentId: string) => {
    if (currentPitch.invitedTalentIds.includes(talentId)) return;
    updateCurrentPitch({ invitedTalentIds: [...currentPitch.invitedTalentIds, talentId], lastActivity: 'just now' });
  };

  const handleFinish = () => {
    complete();
    router.push('/founders-talent');
  };

  return (
    <OnboardingWizardShell
      steps={STEP_LABELS}
      currentStep={currentStep}
      onBack={() => (currentStep === 0 ? (onExitToChooser ? onExitToChooser() : router.push('/founders-talent')) : goTo(currentStep - 1))}
      onStepClick={goTo}
    >
      {currentStep === 0 && <PitchIdeaStep pitch={currentPitch} onChange={updateCurrentPitch} onNext={() => goTo(1)} />}
      {currentStep === 1 && <AIRolesStep selectedRoleIds={currentPitch.selectedRoleIds} onToggle={toggleRole} onNext={() => goTo(2)} />}
      {currentStep === 2 && <RoleOfferStep pitch={currentPitch} onChangeOffer={updateOffer} onNext={() => goTo(3)} />}
      {currentStep === 3 && <MatchedTalentsStep invitedIds={currentPitch.invitedTalentIds} onInvite={toggleInvite} onNext={() => goTo(4)} />}
      {currentStep === 4 && <InviteTrackingStep invitedIds={currentPitch.invitedTalentIds} onFinish={() => goTo(5)} />}
      {currentStep === 5 && <CollabRoomStep startupName={currentPitch.startupName} onComplete={handleFinish} />}
    </OnboardingWizardShell>
  );
}