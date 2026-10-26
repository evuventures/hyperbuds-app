'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, Rocket } from 'lucide-react';
import {
  useOnboardingState,
  OnboardingState,
  OnboardingRole,
  MOCK_MATCHED_TALENTS,
  MOCK_RECENT_ACTIVITY,
} from '@/hooks/onboarding/useOnboardingState';
import { PrimaryButton, CollabRoomPanel } from '@/components/founders/onboarding/Shared';

// ---- Onboarding prompt (shown while !completed) ----

export function OnboardingPrompt({ role }: { role: OnboardingRole | null }) {
  const router = useRouter();
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="backdrop-blur-xl mx-auto mt-16 max-w-lg rounded-2xl border border-gray-200/70 bg-white/80 p-8 text-center dark:border-gray-700/70 dark:bg-gray-900/60"
    >
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-r from-purple-500 to-indigo-500 shadow-glow">
        <Sparkles className="h-6 w-6 text-white" />
      </div>
      <h2 className="mt-4 text-xl font-bold text-gray-900 dark:text-gray-50">
        {role === 'talent' ? 'Finish setting up your profile' : "Let's build your dream team"}
      </h2>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        {role === 'talent'
          ? "You're almost there — a couple more steps and founders can start matching with you."
          : 'A few quick steps and HyperBuds AI will match you with the right talent.'}
      </p>
      <div className="mt-6 flex justify-center">
        <PrimaryButton onClick={() => router.push('/founders-talent/onboarding')}>Continue onboarding →</PrimaryButton>
      </div>
    </motion.div>
  );
}

// ---- Founder dashboard ----

export function FounderDashboardHome({ state }: { state: OnboardingState }) {
  const router = useRouter();
  const { startNewPitch, openPitch } = useOnboardingState();
  const pitches = state.founder.pitches;
  const mostRecentPitch = pitches[pitches.length - 1];

  const talentsMatchedTotal = pitches.reduce((sum, p) => sum + (p.selectedRoleIds.length > 0 ? MOCK_MATCHED_TALENTS.length : 0), 0);
  const invitesSentTotal = pitches.reduce((sum, p) => sum + p.invitedTalentIds.length, 0);
  const activeCollabs = pitches.filter((p) => p.invitedTalentIds.length > 0).length;

  const stats = [
    { label: 'Active Pitches', value: pitches.length, hint: pitches.length > 0 ? `${pitches.length} in progress` : 'Launch your first pitch' },
    { label: 'Talents Matched', value: talentsMatchedTotal, hint: 'Across your pitches' },
    { label: 'Invites Sent', value: invitesSentTotal, hint: invitesSentTotal > 0 ? `${invitesSentTotal} total` : 'None yet' },
    { label: 'Active Collabs', value: activeCollabs, hint: activeCollabs > 0 ? `${mostRecentPitch?.startupName} team` : 'None yet' },
  ];

  const goLaunchPitch = () => { startNewPitch(); router.push('/founders-talent/onboarding'); };
  const goToPitch = (pitchId: string, step: number) => { openPitch(pitchId, step); router.push('/founders-talent/onboarding'); };

  return (
    <div className="p-4 sm:p-6 lg:p-8 pb-24">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Welcome back</p>
      <h1 className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-50">Your startups</h1>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Here is what is happening with your startups today.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="backdrop-blur-xl rounded-2xl border border-gray-200/70 bg-white/80 p-4 dark:border-gray-700/70 dark:bg-gray-900/60">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">{s.label}</p>
            <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-50">{s.value}</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{s.hint}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="backdrop-blur-xl rounded-2xl border border-gray-200/70 bg-white/80 p-5 dark:border-gray-700/70 dark:bg-gray-900/60 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-gray-50">Active Pitches</h2>
            <button type="button" onClick={goLaunchPitch} className="text-sm font-medium text-purple-600 hover:underline dark:text-purple-400">+ New pitch</button>
          </div>
          <div className="mt-3 space-y-2">
            {pitches.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400">No pitches yet — launch your first one.</p>}
            {pitches.map((pitch) => (
              <button
                key={pitch.id}
                type="button"
                onClick={() => goToPitch(pitch.id, 0)}
                className="flex w-full items-center justify-between gap-3 rounded-xl border border-gray-100 px-3 py-3 text-left transition-colors duration-200 hover:border-purple-200 dark:border-gray-800"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-xs font-semibold text-purple-600 dark:bg-purple-900/40 dark:text-purple-300">
                    {(pitch.startupName || 'New')[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-medium text-gray-900 dark:text-gray-50">{pitch.startupName || 'Untitled pitch'}</p>
                      {pitch.fundingStage && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-500 dark:bg-gray-800 dark:text-gray-400">{pitch.fundingStage}</span>}
                    </div>
                    <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                      {pitch.industry || 'Industry not set'} · {pitch.selectedRoleIds.length > 0 ? `${MOCK_MATCHED_TALENTS.length} talents matched` : 'No roles selected yet'}
                    </p>
                  </div>
                </div>
                <span className="shrink-0 text-xs text-gray-400">{pitch.lastActivity}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="backdrop-blur-xl rounded-2xl border border-gray-200/70 bg-white/80 p-5 dark:border-gray-700/70 dark:bg-gray-900/60">
            <Rocket className="h-5 w-5 text-indigo-500" />
            <h3 className="mt-2 font-semibold text-gray-900 dark:text-gray-50">Launch a New Pitch</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Describe your idea and let AI surface the exact roles you need.</p>
            <div className="mt-3">
              <PrimaryButton onClick={goLaunchPitch}>Start New Pitch</PrimaryButton>
            </div>
          </div>

          {mostRecentPitch && (
            <div className="backdrop-blur-xl rounded-2xl border border-gray-200/70 bg-white/80 p-5 dark:border-gray-700/70 dark:bg-gray-900/60">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Quick links</h3>
              <div className="mt-3 space-y-1">
                <button type="button" onClick={() => goToPitch(mostRecentPitch.id, 3)} className="block w-full text-left text-sm text-gray-600 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400">View Matched Talents →</button>
                <button type="button" onClick={() => goToPitch(mostRecentPitch.id, 4)} className="block w-full text-left text-sm text-gray-600 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400">Track Invites →</button>
                {activeCollabs > 0 ? (
                  <a href="#collab-room" className="block w-full text-left text-sm text-gray-600 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400">Collaboration Room →</a>
                ) : (
                  <button type="button" onClick={() => goToPitch(mostRecentPitch.id, 5)} className="block w-full text-left text-sm text-gray-600 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400">Collaboration Room →</button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="backdrop-blur-xl mt-6 rounded-2xl border border-gray-200/70 bg-white/80 p-5 dark:border-gray-700/70 dark:bg-gray-900/60">
        <h2 className="font-semibold text-gray-900 dark:text-gray-50">Recent Activity</h2>
        <div className="mt-3 divide-y divide-gray-100 dark:divide-gray-800">
          {MOCK_RECENT_ACTIVITY.map((a) => (
            <div key={a.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">{a.company[0]}</div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-50">{a.company} <span className="ml-1 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">{a.tag}</span></p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{a.description}</p>
                </div>
              </div>
              <span className="shrink-0 text-xs text-gray-400">{a.time}</span>
            </div>
          ))}
        </div>
      </div>

      {activeCollabs > 0 && mostRecentPitch && (
        <div id="collab-room" className="mt-6 scroll-mt-24">
          <h2 className="mb-3 font-semibold text-gray-900 dark:text-gray-50">Collaboration Room</h2>
          <CollabRoomPanel startupName={mostRecentPitch.startupName} />
        </div>
      )}
    </div>
  );
}

// ---- Talent dashboard ----

export function TalentDashboardHome({ state }: { state: OnboardingState }) {
  const router = useRouter();
  const { setWizardActive, setActiveInvite } = useOnboardingState();
  const { talent } = state;
  const invites = talent.invites;

  const pending = invites.filter((i) => i.status === 'Pending').length;
  const accepted = invites.filter((i) => i.status === 'Accepted').length;
  const acceptedInvite = invites.find((i) => i.status === 'Accepted') ?? null;
  const topMatch = invites.reduce<typeof invites[number] | null>((max, i) => (!max || i.matchPercent > max.matchPercent ? i : max), null);

  const filledChecks = [
    talent.fullName.trim().length > 0,
    talent.location.trim().length > 0,
    talent.primaryRole.trim().length > 0,
    talent.skills.length >= 2,
    talent.availability.trim().length > 0,
    talent.bio.trim().length > 0,
  ];
  const profileStrength = Math.round((filledChecks.filter(Boolean).length / filledChecks.length) * 100);

  const goToInvites = () => { setWizardActive(true, 1); router.push('/founders-talent/onboarding'); };
  const openInvite = (inviteId: string) => { setActiveInvite(inviteId); setWizardActive(true, 2); router.push('/founders-talent/onboarding'); };
  const goToProfile = () => { setWizardActive(true, 0); router.push('/founders-talent/onboarding'); };

  const stats = [
    { label: 'New Invites', value: pending, hint: `${pending} need response` },
    { label: 'Profile Views', value: 28, hint: 'This week' },
    { label: 'Active Collabs', value: accepted, hint: accepted > 0 ? 'Active' : 'None yet' },
    { label: 'Top Match Score', value: topMatch ? `${topMatch.matchPercent}%` : '—', hint: topMatch?.startupName ?? 'No invites yet' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 pb-24">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Welcome back</p>
      <h1 className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-50">Your Opportunities</h1>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {pending} founder{pending === 1 ? '' : 's'} want to collaborate with you. Review and respond.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="backdrop-blur-xl rounded-2xl border border-gray-200/70 bg-white/80 p-4 dark:border-gray-700/70 dark:bg-gray-900/60">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">{s.label}</p>
            <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-50">{s.value}</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{s.hint}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="backdrop-blur-xl rounded-2xl border border-gray-200/70 bg-white/80 p-5 dark:border-gray-700/70 dark:bg-gray-900/60 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-gray-50">Recent Invites</h2>
            <button type="button" onClick={goToInvites} className="text-sm font-medium text-purple-600 hover:underline dark:text-purple-400">View all →</button>
          </div>
          <div className="mt-3 space-y-2">
            {invites.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400">No invites yet — complete your profile to start matching.</p>}
            {invites.slice(0, 3).map((invite) => (
              <button
                key={invite.id}
                type="button"
                onClick={() => openInvite(invite.id)}
                className="flex w-full items-center justify-between gap-3 rounded-xl border border-gray-100 px-3 py-3 text-left transition-colors duration-200 hover:border-purple-200 dark:border-gray-800"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-r from-purple-500 to-indigo-500 text-xs font-semibold text-white">
                    {invite.founderName.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-gray-900 dark:text-gray-50">
                      {invite.startupName} {invite.status === 'Pending' && <span className="ml-1 rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold text-red-500 dark:bg-red-900/30">NEW</span>}
                    </p>
                    <p className="truncate text-sm text-gray-500 dark:text-gray-400">{invite.industry}</p>
                  </div>
                </div>
                <span className="shrink-0 text-sm font-bold text-indigo-500">{invite.matchPercent}%</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="backdrop-blur-xl rounded-2xl border border-gray-200/70 bg-white/80 p-5 dark:border-gray-700/70 dark:bg-gray-900/60">
            <h3 className="font-semibold text-gray-900 dark:text-gray-50">{pending} Invites Waiting</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Founders are waiting for your response.</p>
            <div className="mt-3">
              <PrimaryButton onClick={goToInvites}>Review Invites</PrimaryButton>
            </div>
          </div>

          <div className="backdrop-blur-xl rounded-2xl border border-gray-200/70 bg-white/80 p-5 dark:border-gray-700/70 dark:bg-gray-900/60">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-gray-50">Profile Strength</h3>
              <span className="text-sm font-semibold text-emerald-500">{profileStrength}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
              <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${profileStrength}%` }} />
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Complete your profile to boost your visibility.</p>
            <button type="button" onClick={goToProfile} className="mt-3 text-sm font-semibold text-emerald-600 hover:underline dark:text-emerald-400">Complete Profile</button>
          </div>

          {accepted > 0 ? (
            <a
              href="#collab-room"
              className="backdrop-blur-xl block rounded-2xl border border-gray-200/70 bg-white/80 p-5 transition-colors duration-200 hover:border-purple-300 dark:border-gray-700/70 dark:bg-gray-900/60"
            >
              <p className="font-semibold text-gray-900 dark:text-gray-50">Collaboration Room</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Join your active workspace</p>
            </a>
          ) : (
            <div className="backdrop-blur-xl cursor-default rounded-2xl border border-gray-200/70 bg-white/80 p-5 opacity-60 dark:border-gray-700/70 dark:bg-gray-900/60">
              <p className="font-semibold text-gray-900 dark:text-gray-50">Collaboration Room</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">No active room yet</p>
            </div>
          )}
        </div>
      </div>

      {acceptedInvite && (
        <div id="collab-room" className="mt-6 scroll-mt-24">
          <h2 className="mb-3 font-semibold text-gray-900 dark:text-gray-50">Collaboration Room</h2>
          <CollabRoomPanel startupName={acceptedInvite.startupName} />
        </div>
      )}
    </div>
  );
}