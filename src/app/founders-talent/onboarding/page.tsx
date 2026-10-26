'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/Dashboard/Dashboard';
import { useOnboardingState, OnboardingRole } from '@/hooks/onboarding/useOnboardingState';
import { RoleChooser } from '@/components/founders/onboarding/Shared';
import FounderOnboardingWizard from '@/components/founders/onboarding/FounderFlow';
import TalentOnboardingWizard from '@/components/founders/onboarding/TalentFlow';

export default function OnboardingPage() {
  const { setRole, hydrated } = useOnboardingState();

  // Local, session-only choice — the chooser always shows first on every
  // visit/refresh, regardless of any role already saved from a previous
  // session. This is deliberate for now, so the flow can be presented
  // repeatedly (founder, then talent, then founder again) without having
  // to clear localStorage between walkthroughs.
  //
  // Once the real API is wired in and you want a returning user's role
  // to stick, swap this for the persisted value instead:
  //   const { state } = useOnboardingState();
  //   const [activeRole, setActiveRole] = useState<OnboardingRole | null>(state.role);
  const [activeRole, setActiveRole] = useState<OnboardingRole | null>(null);

  if (!hydrated) return null;

  const chooseRole = (role: OnboardingRole) => {
    setRole(role); // still persisted, so the wizard's own step/pitch state works as before
    setActiveRole(role); // but what renders here is driven by this local pick
  };

  return (
    <DashboardLayout>
      {!activeRole ? (
        <RoleChooser onSelect={chooseRole} />
      ) : activeRole === 'founder' ? (
        <FounderOnboardingWizard onExitToChooser={() => setActiveRole(null)} />
      ) : (
        <TalentOnboardingWizard onExitToChooser={() => setActiveRole(null)} />
      )}
    </DashboardLayout>
  );
}