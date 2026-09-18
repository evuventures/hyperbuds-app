'use client';

import type { ReactNode, ElementType } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Check, Diamond, CircleDot, Lock, ShieldCheck } from 'lucide-react';
import { OnboardingRole } from '@/hooks/onboarding/useOnboardingState';

// ---- Buttons ----

export function PrimaryButton({
  children,
  onClick,
  disabled,
  type = 'button',
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit';
}) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.01 } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className="w-full rounded-xl bg-linear-to-r from-purple-500 to-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-glow transition-shadow duration-300 hover:shadow-glow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none sm:w-auto"
    >
      {children}
    </motion.button>
  );
}

export function SecondaryButton({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className="w-full rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-600 transition-colors duration-200 hover:border-purple-300 hover:text-purple-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-purple-500/60 dark:hover:text-purple-400 sm:w-auto"
    >
      {children}
    </motion.button>
  );
}

// ---- Form controls ----

export const inputClass =
  'w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition-colors duration-200 placeholder:text-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-50 dark:placeholder:text-gray-500 dark:focus:ring-purple-900/40';

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold tracking-wide text-gray-500 dark:text-gray-400">
        {label}
      </label>
      {children}
    </div>
  );
}

export function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      className={`rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors duration-200 ${
        active
          ? 'border-transparent bg-linear-to-r from-purple-500 to-indigo-500 text-white shadow-glow'
          : 'border-gray-200 text-gray-600 hover:border-purple-300 hover:text-purple-600 dark:border-gray-700 dark:text-gray-300 dark:hover:border-purple-500/60'
      }`}
    >
      {label}
    </motion.button>
  );
}

export function RadioRow({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors duration-200 ${
        active
          ? 'border-purple-400 bg-purple-50/70 text-purple-700 dark:border-purple-500/60 dark:bg-purple-900/20 dark:text-purple-300'
          : 'border-gray-200 text-gray-600 hover:border-purple-200 dark:border-gray-700 dark:text-gray-300'
      }`}
    >
      <span
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-200 ${
          active ? 'border-purple-500' : 'border-gray-300 dark:border-gray-600'
        }`}
      >
        {active && <span className="h-2 w-2 rounded-full bg-purple-500" />}
      </span>
      {label}
    </button>
  );
}

export function StatCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="backdrop-blur-xl rounded-2xl border border-gray-200/70 bg-white/80 p-4 dark:border-gray-700/70 dark:bg-gray-900/60">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-50">{value}</p>
      {hint && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{hint}</p>}
    </div>
  );
}

// ---- Stepper ----

export function OnboardingStepper({
  steps,
  currentStep,
  onStepClick,
}: {
  steps: string[];
  currentStep: number;
  onStepClick?: (index: number) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {steps.map((label, index) => {
        const isDone = index < currentStep;
        const isActive = index === currentStep;
        const clickable = isDone && !!onStepClick;

        return (
          <motion.button
            key={label}
            type="button"
            disabled={!clickable}
            onClick={() => clickable && onStepClick?.(index)}
            whileHover={clickable ? { scale: 1.04 } : undefined}
            whileTap={clickable ? { scale: 0.97 } : undefined}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={`flex items-center justify-center rounded-full border transition-all duration-300 ${
              isActive
                ? 'gap-1.5 border-transparent bg-linear-to-r from-purple-500 to-indigo-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-glow'
                : isDone
                ? 'h-7 w-7 border-emerald-300 bg-emerald-50 text-emerald-600 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                : 'h-7 w-7 border-gray-200 bg-white text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-500'
            } ${clickable ? 'cursor-pointer' : 'cursor-default'}`}
          >
            {isActive ? (
              <>
                <span>{index + 1}</span>
                <span>{label}</span>
              </>
            ) : isDone ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <span className="text-xs font-medium">{index + 1}</span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

// ---- Wizard shell ----

export function OnboardingWizardShell({
  steps,
  currentStep,
  onBack,
  onStepClick,
  children,
}: {
  steps: string[];
  currentStep: number;
  onBack?: () => void;
  onStepClick?: (index: number) => void;
  children: ReactNode;
}) {
  return (
    <div className="relative min-h-full bg-linear-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-purple-900/10">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-purple-300/30 blur-3xl dark:bg-purple-500/20" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-blue-300/30 blur-3xl dark:bg-blue-500/20" />
      </div>

      <div className="relative z-10 px-4 py-6 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors duration-200 hover:bg-white/70 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800/70 dark:hover:text-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <OnboardingStepper steps={steps} currentStep={currentStep} onStepClick={onStepClick} />
        </div>

        <div className="mx-auto mt-8 max-w-3xl pb-24">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ---- Role chooser (landing screen for /onboarding) ----

const ROLE_CARDS: { role: OnboardingRole; icon: ElementType; title: string; subtitle: string }[] = [
  { role: 'founder', icon: Diamond, title: "I'm a Founder", subtitle: 'I have an idea and need a team' },
  { role: 'talent', icon: CircleDot, title: "I'm a Talent", subtitle: 'I want to join promising startups' },
];

export function RoleChooser({ onSelect }: { onSelect: (role: OnboardingRole) => void }) {
  return (
    <div className="relative min-h-full bg-linear-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-purple-900/10">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-purple-300/30 blur-3xl dark:bg-purple-500/20" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-blue-300/30 blur-3xl dark:bg-blue-500/20" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center px-4 py-20 text-center">
        <p className="text-xs font-semibold tracking-wide text-purple-600 dark:text-purple-400">
          Welcome to HyperBuds
        </p>
        <h1 className="mt-3 text-3xl font-bold text-gray-900 dark:text-gray-50 sm:text-4xl">
          Build your dream team{' '}
          <span className="bg-linear-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">fast.</span>
        </h1>
        <p className="mt-3 max-w-md text-sm text-gray-500 dark:text-gray-400">
          Match with verified talent, set real offers, and collaborate inside a structured room
          designed to protect both sides.
        </p>

        <div className="mt-10 grid w-full max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
          {ROLE_CARDS.map(({ role, icon: Icon, title, subtitle }) => (
            <motion.button
              key={role}
              type="button"
              onClick={() => onSelect(role)}
              whileHover={{ y: -4, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="backdrop-blur-xl flex flex-col items-center gap-3 rounded-2xl border border-gray-200/70 bg-white/80 px-6 py-10 text-center transition-colors duration-200 hover:border-purple-300 dark:border-gray-700/70 dark:bg-gray-900/60 dark:hover:border-purple-500/60"
            >
              <Icon className="h-7 w-7 text-indigo-500" />
              <span className="text-lg font-semibold text-gray-900 dark:text-gray-50">{title}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---- Shared final step: collaboration room ----

/** Presentational room content, shared by the onboarding wizard's final
 *  step and the always-visible dashboard section. No completion action. */
export function CollabRoomPanel({ startupName }: { startupName: string }) {
  return (
    <div className="backdrop-blur-xl overflow-hidden rounded-2xl border border-gray-200/70 bg-white/80 dark:border-gray-700/70 dark:bg-gray-900/60">
      <div className="border-b border-gray-100 p-6 dark:border-gray-800">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-50">
          {startupName || 'Your Startup'} · Core Team
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Collaboration room</p>
      </div>

      <div className="flex items-center gap-2 border-b border-purple-100 bg-purple-50/70 px-6 py-3 text-sm text-purple-700 dark:border-purple-900/40 dark:bg-purple-900/20 dark:text-purple-300">
        <Lock className="h-3.5 w-3.5 shrink-0" />
        Collaboration room created. All interactions are protected by HyperBuds terms.
      </div>

      <div className="space-y-4 p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-r from-purple-500 to-indigo-500 text-xs font-semibold text-white">
            AN
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-50">
              Team member <span className="ml-1 text-xs font-normal text-gray-400">10:14 AM</span>
            </p>
            <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-300">
              Excited to be working with you! Looking forward to getting started.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-gray-100 p-4 dark:border-gray-800">
        <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-500" />
        <p className="text-xs text-gray-500 dark:text-gray-400">Your agreement terms are locked and protected.</p>
      </div>
    </div>
  );
}

/** Onboarding-wizard version of the room: the panel above, plus the
 *  "Go to Dashboard" action that finishes onboarding. */
export function CollabRoomStep({ startupName, onComplete }: { startupName: string; onComplete: () => void }) {
  return (
    <div>
      <CollabRoomPanel startupName={startupName} />
      <div className="mt-4 rounded-2xl border border-gray-200/70 bg-white/80 p-6 backdrop-blur-xl dark:border-gray-700/70 dark:bg-gray-900/60">
        <PrimaryButton onClick={onComplete}>Go to Dashboard →</PrimaryButton>
      </div>
    </div>
  );
}