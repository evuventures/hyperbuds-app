'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Check, X } from 'lucide-react';
import {
  useOnboardingState,
  PRIMARY_ROLES,
  ROLE_SKILL_SUGGESTIONS,
  AVAILABILITY_OPTIONS,
  TalentProfileData,
  TalentInvite,
} from '@/hooks/onboarding/useOnboardingState';
import {
  OnboardingWizardShell,
  CollabRoomStep,
  PrimaryButton,
  SecondaryButton,
  Field,
  Chip,
  RadioRow,
  inputClass,
} from './Shared';

const STEP_LABELS = ['Profile Setup', 'My Invites', 'Review Offer', 'Collab Room'];

// ---- Step 1: Profile Setup (3 sub-tabs) ----

function ProfileSetupStep({
  profile,
  onChange,
  onNext,
}: {
  profile: TalentProfileData;
  onChange: (patch: Partial<TalentProfileData>) => void;
  onNext: () => void;
}) {
  const [tab, setTab] = useState(0);
  const [customSkill, setCustomSkill] = useState('');
  const tabs = ['1. About You', '2. Skills', '3. Preferences'];
  const suggestedSkills = ROLE_SKILL_SUGGESTIONS[profile.primaryRole] ?? ROLE_SKILL_SUGGESTIONS['Full-Stack Engineer'];

  const canAdvanceTab0 = profile.fullName.trim().length > 0 && profile.primaryRole.trim().length > 0;
  const canAdvanceTab1 = profile.skills.length >= 2;

  const toggleSkill = (skill: string) => {
    const skills = profile.skills.includes(skill) ? profile.skills.filter((s) => s !== skill) : [...profile.skills, skill];
    onChange({ skills });
  };

  const addCustomSkill = () => {
    const skill = customSkill.trim();
    if (skill && !profile.skills.includes(skill)) onChange({ skills: [...profile.skills, skill] });
    setCustomSkill('');
  };

  return (
    <div className="backdrop-blur-xl rounded-2xl border border-gray-200/70 bg-white/80 p-6 dark:border-gray-700/70 dark:bg-gray-900/60 sm:p-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Set up your profile</h1>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Tell founders who you are so they can match you with the right opportunity.</p>

      <div className="mt-6 grid grid-cols-3 gap-1 rounded-xl bg-gray-100/80 p-1 dark:bg-gray-800/60">
        {tabs.map((label, index) => (
          <button
            key={label}
            type="button"
            onClick={() => index < tab && setTab(index)}
            className={`relative rounded-lg px-2 py-2.5 text-xs font-medium transition-colors duration-200 sm:text-sm ${
              index === tab ? 'text-white' : index < tab ? 'text-gray-600 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400' : 'cursor-not-allowed text-gray-400 dark:text-gray-600'
            }`}
          >
            {index === tab && (
              <motion.span layoutId="profile-tab-highlight" transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }} className="absolute inset-0 rounded-lg bg-linear-to-r from-purple-500 to-indigo-500" />
            )}
            <span className="relative">{label}</span>
          </button>
        ))}
      </div>

      <div className="mt-8 space-y-5">
        {tab === 0 && (
          <>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Full name">
                <input value={profile.fullName} onChange={(e) => onChange({ fullName: e.target.value })} placeholder="e.g. Aria Nakamura" className={inputClass} />
              </Field>
              <Field label="Location">
                <input value={profile.location} onChange={(e) => onChange({ location: e.target.value })} placeholder="e.g. Tokyo, JP" className={inputClass} />
              </Field>
            </div>
            <Field label="Primary role">
              <div className="flex flex-wrap gap-2">
                {PRIMARY_ROLES.map((role) => (
                  <Chip key={role} label={role} active={profile.primaryRole === role} onClick={() => onChange({ primaryRole: role })} />
                ))}
              </div>
            </Field>
          </>
        )}

        {tab === 1 && (
          <>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
              Suggested for {profile.primaryRole || 'your role'}
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestedSkills.map((skill) => (
                <Chip key={skill} label={skill} active={profile.skills.includes(skill)} onClick={() => toggleSkill(skill)} />
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomSkill(); } }}
                placeholder="Add another skill"
                className={inputClass}
              />
              <SecondaryButton onClick={addCustomSkill}>Add</SecondaryButton>
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Selected <span className="text-purple-600 dark:text-purple-400">{profile.skills.length}</span> skills
            </p>
            {profile.skills.length < 2 && <p className="text-xs text-gray-400">Select at least 2 skills above.</p>}
          </>
        )}

        {tab === 2 && (
          <>
            <Field label="Offer preference">
              <div className="grid grid-cols-3 gap-2">
                {(['salary', 'equity', 'hybrid'] as const).map((type) => (
                  <button key={type} type="button" onClick={() => onChange({ compPreference: type })} className={`rounded-xl py-2.5 text-sm font-semibold capitalize transition-colors duration-200 ${profile.compPreference === type ? 'bg-linear-to-r from-purple-500 to-indigo-500 text-white shadow-glow' : 'border border-gray-200 text-gray-600 hover:border-purple-300 dark:border-gray-700 dark:text-gray-300'}`}>
                    {type}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Availability">
              <div className="space-y-2">
                {AVAILABILITY_OPTIONS.map((option) => (
                  <RadioRow key={option} label={option} active={profile.availability === option} onClick={() => onChange({ availability: option })} />
                ))}
              </div>
            </Field>
            <Field label="Short bio">
              <textarea value={profile.bio} onChange={(e) => onChange({ bio: e.target.value })} rows={4} placeholder="Describe your experience, what you're good at, and what kind of startup you want to join..." className={inputClass} />
            </Field>
          </>
        )}
      </div>

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        {tab > 0 ? <SecondaryButton onClick={() => setTab((t) => t - 1)}>← Back</SecondaryButton> : <div />}
        {tab < 2 ? (
          <PrimaryButton disabled={tab === 0 ? !canAdvanceTab0 : !canAdvanceTab1} onClick={() => setTab((t) => t + 1)}>Continue →</PrimaryButton>
        ) : (
          <PrimaryButton onClick={onNext}>View My Invites →</PrimaryButton>
        )}
      </div>
    </div>
  );
}

// ---- Step 2: My Invites ----

const INVITE_FILTERS = ['All', 'Pending', 'Reviewed', 'Accepted', 'Declined'];

const INVITE_STATUS_STYLES: Record<TalentInvite['status'], string> = {
  Pending: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
  Reviewed: 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
  Accepted: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
  Declined: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400',
};

function offerBadges(invite: TalentInvite) {
  const badges: string[] = [];
  if (invite.monthlySalary) badges.push(`$${invite.monthlySalary.toLocaleString()}/mo`);
  if (invite.equityPercent) badges.push(`${invite.equityPercent}% equity`);
  return badges;
}

function MyInvitesStep({
  invites,
  onSeed,
  onOpen,
}: {
  invites: TalentInvite[];
  onSeed: () => void;
  onOpen: (invite: TalentInvite) => void;
}) {
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    onSeed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pendingCount = invites.filter((i) => i.status === 'Pending').length;
  const filtered = invites.filter((i) => filter === 'All' || i.status === filter);

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Your Invites</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Founders matched their opportunity to your profile</p>
        </div>
        <div className="backdrop-blur-xl rounded-xl border border-gray-200/70 bg-white/80 px-4 py-2 text-center dark:border-gray-700/70 dark:bg-gray-900/60">
          <p className="text-xl font-bold text-indigo-500">{pendingCount}</p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">pending</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {INVITE_FILTERS.map((f) => (
          <button key={f} type="button" onClick={() => setFilter(f)} className={`rounded-lg border px-3.5 py-1.5 text-sm font-medium transition-colors duration-200 ${filter === f ? 'border-purple-400 bg-purple-50 text-purple-700 dark:border-purple-500/60 dark:bg-purple-900/20 dark:text-purple-300' : 'border-gray-200 text-gray-500 hover:border-purple-200 dark:border-gray-700 dark:text-gray-400'}`}>
            {f}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-3">
        {filtered.map((invite) => (
          <button
            key={invite.id}
            type="button"
            onClick={() => onOpen(invite)}
            className="backdrop-blur-xl block w-full rounded-2xl border border-gray-200/70 bg-white/80 p-4 text-left transition-colors duration-200 hover:border-purple-200 dark:border-gray-700/70 dark:bg-gray-900/60"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-r from-purple-500 to-indigo-500 text-xs font-semibold text-white">
                  {invite.founderName.split(' ').map((n) => n[0]).join('')}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-gray-900 dark:text-gray-50">
                    {invite.startupName} <span className="font-normal text-gray-400">· {invite.founderName}</span>
                  </p>
                  <p className="truncate text-sm text-gray-500 dark:text-gray-400">{invite.tagline}</p>
                  <p className="mt-1 text-xs text-gray-400">{invite.industry} · {invite.fundingStage} · {invite.receivedAgo}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${INVITE_STATUS_STYLES[invite.status]}`}>{invite.status}</span>
                <div className="flex gap-1.5">
                  {offerBadges(invite).map((badge) => (
                    <span key={badge} className="rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300">{badge}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <span className="text-xs text-gray-400">Match</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                <div className="h-full rounded-full bg-linear-to-r from-purple-500 to-indigo-500" style={{ width: `${invite.matchPercent}%` }} />
              </div>
              <span className="text-xs font-semibold text-indigo-500">{invite.matchPercent}%</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---- Step 3: Review Offer (+ negotiate modal) ----

function NegotiateModal({ onCancel, onSend }: { onCancel: () => void; onSend: (message: string) => void }) {
  const [message, setMessage] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-glow-lg dark:bg-gray-900"
      >
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-50">Negotiate this offer</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Describe what you&apos;d like to change — salary, equity, vesting, or start date. The founder will review and respond.
        </p>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          placeholder="e.g. I'd like to discuss increasing the equity to 3% given the pre-seed risk..."
          className={`${inputClass} mt-4`}
        />
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors duration-200 hover:border-gray-300 dark:border-gray-700 dark:text-gray-300">
            Cancel
          </button>
          <PrimaryButton onClick={() => onSend(message)}>Send Request</PrimaryButton>
        </div>
      </motion.div>
    </div>
  );
}

function ReviewOfferStep({
  invite,
  onDecline,
  onAccept,
  onNegotiate,
  onOpenRoom,
  onBackToInvites,
}: {
  invite: TalentInvite;
  onDecline: () => void;
  onAccept: () => void;
  onNegotiate: (message: string) => void;
  onOpenRoom: () => void;
  onBackToInvites: () => void;
}) {
  const [showModal, setShowModal] = useState(false);

  return (
    <div>
      <div className="backdrop-blur-xl rounded-2xl border border-gray-200/70 bg-white/80 p-6 dark:border-gray-700/70 dark:bg-gray-900/60">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-lg font-bold text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300">
              {invite.startupName[0]}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-50">{invite.startupName}</h1>
                <span className="rounded-full border border-gray-200 px-2 py-0.5 text-[11px] font-medium text-gray-500 dark:border-gray-700 dark:text-gray-400">{invite.industry}</span>
                <span className="rounded-full border border-gray-200 px-2 py-0.5 text-[11px] font-medium text-gray-500 dark:border-gray-700 dark:text-gray-400">{invite.fundingStage}</span>
              </div>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{invite.tagline}</p>
            </div>
          </div>
          <div className="backdrop-blur-xl rounded-2xl border border-gray-200/70 bg-white/80 px-5 py-3 text-center dark:border-gray-700/70 dark:bg-gray-900/60">
            <p className="text-2xl font-bold text-indigo-500">{invite.matchPercent}%</p>
            <p className="text-[11px] text-gray-400">match</p>
          </div>
        </div>

        <p className="mt-4 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-600 dark:bg-gray-800/60 dark:text-gray-300">
          Invited by <span className="font-semibold text-gray-800 dark:text-gray-100">{invite.founderName}</span> · Received {invite.receivedAgo}
        </p>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="backdrop-blur-xl rounded-2xl border border-gray-200/70 bg-white/80 p-5 dark:border-gray-700/70 dark:bg-gray-900/60">
          <h2 className="font-semibold text-gray-900 dark:text-gray-50">Role</h2>
          <p className="mt-2 text-lg font-semibold text-gray-900 dark:text-gray-50">{invite.role}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">at {invite.startupName}</p>
        </div>
        <div className="backdrop-blur-xl rounded-2xl border border-gray-200/70 bg-white/80 p-5 dark:border-gray-700/70 dark:bg-gray-900/60">
          <h2 className="font-semibold text-gray-900 dark:text-gray-50">Offer</h2>
          <dl className="mt-2 space-y-1.5 text-sm">
            <div className="flex justify-between"><dt className="text-gray-500 dark:text-gray-400">Type</dt><dd className="font-medium capitalize text-gray-900 dark:text-gray-50">{invite.compType}</dd></div>
            {invite.monthlySalary && <div className="flex justify-between"><dt className="text-gray-500 dark:text-gray-400">Salary</dt><dd className="font-semibold text-indigo-600 dark:text-indigo-400">${invite.monthlySalary.toLocaleString()}/mo</dd></div>}
            {invite.equityPercent && <div className="flex justify-between"><dt className="text-gray-500 dark:text-gray-400">Equity</dt><dd className="font-semibold text-indigo-600 dark:text-indigo-400">{invite.equityPercent}%</dd></div>}
          </dl>
        </div>
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-2xl border border-purple-100 bg-purple-50/70 px-5 py-4 text-sm text-purple-700 dark:border-purple-900/40 dark:bg-purple-900/20 dark:text-purple-300">
        <Lock className="mt-0.5 h-4 w-4 shrink-0" />
        <div>
          <p className="font-semibold">HyperBuds Protection</p>
          <p className="mt-0.5 text-purple-700/80 dark:text-purple-300/80">
            Accepting locks the terms above into a protected agreement. Any changes after acceptance require
            mutual consent and go through HyperBuds dispute review.
          </p>
        </div>
      </div>

      {invite.status === 'Accepted' && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 dark:border-emerald-800 dark:bg-emerald-900/20">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
            <Check className="h-4 w-4" />
            <div>
              <p className="font-semibold">Offer accepted</p>
              <p className="text-sm text-emerald-700/80 dark:text-emerald-400/80">The founder has been notified. Your collaboration room is ready.</p>
            </div>
          </div>
          <PrimaryButton onClick={onOpenRoom}>Open Room →</PrimaryButton>
        </div>
      )}

      {invite.status === 'Declined' && (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 dark:border-red-900/40 dark:bg-red-900/20">
          <p className="flex items-center gap-2 font-semibold text-red-700 dark:text-red-400"><X className="h-4 w-4" />Invite declined</p>
          <p className="mt-1 text-sm text-red-700/80 dark:text-red-400/80">This invite has been declined. The founder has been notified.</p>
          <button type="button" onClick={onBackToInvites} className="mt-3 text-sm font-medium text-gray-500 underline-offset-2 hover:underline dark:text-gray-400">
            Back to invites
          </button>
        </div>
      )}

      {(invite.status === 'Pending' || invite.status === 'Reviewed') && (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button type="button" onClick={onDecline} className="flex-1 rounded-xl border border-red-200 py-3 text-sm font-semibold text-red-600 transition-colors duration-200 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20">
            Decline
          </button>
          <button type="button" onClick={() => setShowModal(true)} className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-700 transition-colors duration-200 hover:border-gray-300 dark:border-gray-700 dark:text-gray-200">
            Negotiate
          </button>
          <div className="flex-[1.4]">
            <PrimaryButton onClick={onAccept}>Accept Offer →</PrimaryButton>
          </div>
        </div>
      )}

      {invite.negotiationSent && invite.status !== 'Accepted' && invite.status !== 'Declined' && (
        <p className="mt-3 text-sm text-indigo-600 dark:text-indigo-400">Negotiation request sent — the founder will respond soon.</p>
      )}

      <AnimatePresence>
        {showModal && (
          <NegotiateModal
            onCancel={() => setShowModal(false)}
            onSend={(message) => { onNegotiate(message); setShowModal(false); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ---- Orchestrator ----

export default function TalentOnboardingWizard({
  onExitToChooser,
}: {
  /** Called instead of navigating away when Back is pressed on step 0.
   *  Used to return to the role chooser during a live walkthrough. */
  onExitToChooser?: () => void;
} = {}) {
  const router = useRouter();
  const {
    state, setStep, updateTalentProfile, seedInvitesIfEmpty,
    updateInvite, setActiveInvite, complete, hydrated,
  } = useOnboardingState();

  if (!hydrated) return null;

  const { currentStep, talent } = state;
  const goTo = (step: number) => setStep(step);
  const activeInvite = talent.invites.find((i) => i.id === talent.activeInviteId) ?? null;

  const openInvite = (invite: TalentInvite) => {
    if (invite.status === 'Pending') updateInvite(invite.id, { status: 'Reviewed' });
    setActiveInvite(invite.id);
    goTo(2);
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
      {currentStep === 0 && (
        <ProfileSetupStep profile={talent} onChange={updateTalentProfile} onNext={() => goTo(1)} />
      )}
      {currentStep === 1 && (
        <MyInvitesStep invites={talent.invites} onSeed={seedInvitesIfEmpty} onOpen={openInvite} />
      )}
      {currentStep === 2 && activeInvite && (
        <ReviewOfferStep
          invite={activeInvite}
          onDecline={() => updateInvite(activeInvite.id, { status: 'Declined' })}
          onAccept={() => updateInvite(activeInvite.id, { status: 'Accepted' })}
          onNegotiate={() => updateInvite(activeInvite.id, { negotiationSent: true })}
          onOpenRoom={() => goTo(3)}
          onBackToInvites={() => goTo(1)}
        />
      )}
      {currentStep === 3 && (
        <CollabRoomStep startupName={activeInvite?.startupName ?? talent.fullName} onComplete={handleFinish} />
      )}
    </OnboardingWizardShell>
  );
}