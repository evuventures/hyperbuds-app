'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Camera, CheckCircle2, Loader2, Sparkles, UserCheck } from 'lucide-react';
import { useProfileForm } from '@/hooks/features/useProfile';

import Step1Avatar from './components/StepOne';
import Step2BasicInfo from './components/StepTwo';
import Step3About from './components/StepThree';

const STEPS = [
  { id: 1, title: 'Photo', icon: Camera },
  { id: 2, title: 'Identity', icon: UserCheck },
  { id: 3, title: 'Story & Niches', icon: Sparkles },
];

export default function MultiStepProfileForm() {
  const {
    currentStep,
    formData,
    isLoading,
    error,
    message,
    isCheckingUsername,
    isUsernameAvailable,
    previewUrl,
    handleFileChange,
    updateField,
    updateLocation,
    nextStep,
    prevStep,
    handleSubmit,
    canProceed,
    clearSelectedFile,
    suggestions,
  } = useProfileForm();

  const handleSkip = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('skipped_profile_completion', 'true');
      window.location.href = '/';
    }
  };

  // Success screen (Step 4) matching Onboarding completion style
  if (currentStep === 4) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6 font-sans">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-xl sm:p-12"
        >
          <div className="mb-6 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/25">
              <CheckCircle2 className="h-10 w-10" />
            </div>
          </div>
          <h2 className="mb-3 text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Profile Complete!
          </h2>
          <p className="mb-8 text-base text-gray-600 sm:text-lg">
            You&apos;re all set to discover ideal collaborators, share posts and reels, and start co-streaming.
          </p>
          <button
            type="button"
            onClick={() => {
              window.location.href = '/';
            }}
            className="w-full cursor-pointer rounded-full bg-gradient-to-r from-purple-600 to-blue-600 py-4 text-lg font-bold text-white shadow-lg transition-all hover:scale-[1.01] hover:from-purple-700 hover:to-blue-700"
          >
            Go to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  const activeMeta = STEPS.find((s) => s.id === currentStep) ?? STEPS[0];
  const ActiveIcon = activeMeta.icon;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 font-sans sm:p-6">
      <div className="w-full max-w-xl rounded-3xl border border-gray-200 bg-white p-6 shadow-xl sm:p-10">
        {/* Top Onboarding-style Icon + Step Meta */}
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 shadow-xs ring-1 ring-purple-100">
            <ActiveIcon className="h-8 w-8" />
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-600">
            <span>Step {currentStep} of {STEPS.length}</span>
            <span>·</span>
            <span>{activeMeta.title}</span>
          </div>
        </div>

        {/* Feedback Banners */}
        {message && (
          <div role="status" className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm font-medium text-emerald-700">
            {message}
          </div>
        )}
        {error && (
          <div role="alert" className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-center text-sm font-medium text-rose-700">
            {error}
          </div>
        )}

        {/* Step Content */}
        <div key={currentStep} className="min-h-[340px]">
          {currentStep === 1 && (
            <Step1Avatar
              previewUrl={previewUrl}
              handleFileChange={handleFileChange}
              onClear={clearSelectedFile}
            />
          )}
          {currentStep === 2 && (
            <Step2BasicInfo
              username={formData.username}
              displayName={formData.displayName}
              isChecking={isCheckingUsername}
              isAvailable={isUsernameAvailable}
              onUpdateField={updateField}
              suggestions={suggestions}
            />
          )}
          {currentStep === 3 && (
            <Step3About
              bio={formData.bio}
              selectedNiches={formData.niches}
              location={formData.location}
              onUpdateField={updateField}
              onUpdateLocation={updateLocation}
            />
          )}
        </div>

        {/* Onboarding-inspired Progress Dots */}
        <div className="my-7 flex justify-center gap-2" aria-label="Profile setup progress">
          {STEPS.map((step) => (
            <div
              key={step.id}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                step.id === currentStep
                  ? 'w-8 bg-purple-600'
                  : step.id < currentStep
                    ? 'w-3 bg-purple-300'
                    : 'w-3 bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Primary Pill CTA + Minimal Secondary Navigation */}
        <div className="space-y-3">
          {currentStep === 3 ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading || !canProceed()}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 py-4 text-base font-bold text-white shadow-lg transition-all hover:scale-[1.01] hover:from-purple-700 hover:to-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:text-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Completing Profile...</span>
                </>
              ) : (
                'Complete Profile'
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={nextStep}
              disabled={!canProceed()}
              className="w-full cursor-pointer rounded-full bg-gradient-to-r from-purple-600 to-blue-600 py-4 text-base font-bold text-white shadow-lg transition-all hover:scale-[1.01] hover:from-purple-700 hover:to-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:text-lg"
            >
              Next
            </button>
          )}

          <div className="flex items-center justify-center gap-6 pt-1">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                disabled={isLoading}
                className="cursor-pointer py-1.5 text-sm font-semibold text-gray-500 transition-colors hover:text-gray-900 disabled:opacity-50"
              >
                Back
              </button>
            )}
            <button
              type="button"
              onClick={handleSkip}
              disabled={isLoading}
              className="cursor-pointer py-1.5 text-sm font-semibold text-purple-600 transition-colors hover:text-purple-800 disabled:opacity-50"
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
