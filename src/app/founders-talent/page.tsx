'use client';

import DashboardLayout from '@/components/layout/Dashboard/Dashboard';
import { useOnboardingState } from '@/hooks/onboarding/useOnboardingState';
import { OnboardingPrompt, FounderDashboardHome, TalentDashboardHome } from '@/components/founders/onboarding/DashboardHome';

export default function FoundersAppsDashboardPage() {
  const { state, hydrated } = useOnboardingState();

  return (
    <DashboardLayout>
      <div className="relative min-h-full bg-linear-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-purple-900/10">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-purple-300/30 blur-3xl dark:bg-purple-500/20" />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-blue-300/30 blur-3xl dark:bg-blue-500/20" />
        </div>

        <div className="relative z-10">
          {!hydrated ? null : !state.completed ? (
            <OnboardingPrompt role={state.role} />
          ) : state.role === 'talent' ? (
            <TalentDashboardHome state={state} />
          ) : (
            <FounderDashboardHome state={state} />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}