"use client"

import React from 'react';
import {
  FaUserCircle, FaUserPlus, FaUserEdit, FaLink,
  FaArrowLeft, FaArrowRight, FaCheckCircle, FaSpinner
} from 'react-icons/fa';
import { useProfileForm } from '@/hooks/features/useProfile';

// Import refactored step components
import Step1Avatar from './components/StepOne';
import Step2BasicInfo from './components/StepTwo';
import Step3About from './components/StepThree';
import Step4Socials from './components/StepFour';

const STEPS = [
  { id: 1, title: 'Profile Picture', icon: FaUserCircle },
  { id: 2, title: 'Basic Info', icon: FaUserPlus },
  { id: 3, title: 'About You', icon: FaUserEdit },
  { id: 4, title: 'Social Links', icon: FaLink },
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
    updateSocials,
    nextStep,
    prevStep,
    handleSubmit,
    canProceed,
    clearSelectedFile,
  } = useProfileForm();

  // Success Screen (Step 5)
  if (currentStep === 5) {
    return (
      <div className="flex justify-center items-center p-4 min-h-screen bg-linear-to-br from-purple-50 via-white to-blue-50">
        <div className="w-full max-w-lg">
          <div className="p-12 rounded-3xl border shadow-2xl backdrop-blur-sm bg-white/80 border-white/50 text-center space-y-8">
            <div className="flex justify-center">
              <div className="flex justify-center items-center w-24 h-24 bg-linear-to-r from-purple-500 to-blue-500 rounded-full shadow-2xl">
                <FaCheckCircle className="w-12 h-12 text-white" />
              </div>
            </div>
            <div>
              <h2 className="mb-4 text-4xl font-bold text-transparent bg-clip-text bg-linear-to-r from-purple-600 to-blue-600">
                Profile Complete!
              </h2>
              <p className="mx-auto max-w-md text-lg text-gray-600">
                Your profile has been created successfully! You can now start discovering and collaborating with other creators.
              </p>
            </div>
            <button
              className="px-8 py-4 w-full font-semibold text-white bg-linear-to-r from-purple-500 to-blue-500 rounded-xl shadow-lg transition-all duration-300 transform hover:shadow-xl hover:scale-105"
              onClick={() => {
                setTimeout(() => { window.location.href = '/'; }, 1000);
              }}
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center p-4 min-h-screen bg-linear-to-br from-purple-50 via-white to-blue-50">
      {/* Background decorative elements */}
      <div className="overflow-hidden fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl bg-purple-300/20" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl bg-blue-300/20" />
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        <div className="p-8 rounded-3xl border shadow-2xl backdrop-blur-sm bg-white/80 md:p-12 border-white/50">

          {/* Progress Bar */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-4">
              {STEPS.map((step, index) => (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${currentStep >= step.id
                      ? 'bg-linear-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-500'
                      }`}>
                      <step.icon className="w-5 h-5" />
                    </div>
                    <span className={`text-xs mt-2 font-medium ${currentStep >= step.id ? 'text-purple-600' : 'text-gray-500'
                      }`}>
                      {step.title}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={`flex-1 h-1 mx-4 rounded-full transition-all duration-300 ${currentStep > step.id
                      ? 'bg-linear-to-r from-purple-500 to-blue-500'
                      : 'bg-gray-200'
                      }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Feedback Messages */}
          {message && (
            <div className="p-4 mb-6 bg-green-50 rounded-xl border-2 border-green-200">
              <p className="text-sm font-medium text-green-700">{message}</p>
            </div>
          )}
          {error && (
            <div className="p-4 mb-6 bg-red-50 rounded-xl border-2 border-red-200">
              <p className="text-sm font-medium text-red-700">{error}</p>
            </div>
          )}

          {/* Step Rendering */}
          <div className="mb-8 min-h-87.5">
            {currentStep === 1 && (
              <Step1Avatar previewUrl={previewUrl}
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
            {currentStep === 4 && (
              <Step4Socials
                socialLinks={formData.socialLinks}
                onUpdateSocials={updateSocials}
              />
            )}
          </div>

          {/* Navigation Controls */}
          <div className="flex gap-2 justify-between items-center sm:gap-4">
            <button
              onClick={prevStep}
              disabled={currentStep === 1 || isLoading}
              className="flex gap-1 items-center px-3 py-2 text-sm font-semibold text-gray-600 rounded-xl transition-all hover:bg-gray-100 disabled:opacity-50"
            >
              <FaArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Back</span>
            </button>

            <div className="flex space-x-2 sm:space-x-3">
              {currentStep === 4 ? (
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex gap-1 items-center px-4 py-2 text-sm font-semibold text-white bg-linear-to-r from-purple-500 to-blue-500 rounded-xl shadow-lg transition-all hover:scale-105 disabled:opacity-50"
                >
                  {isLoading ? (
                    <FaSpinner className="w-3 h-3 animate-spin sm:w-4 sm:h-4" />
                  ) : (
                    <>
                      <span className="hidden sm:inline">Complete Profile</span>
                      <span className="sm:hidden">Complete</span>
                      <FaCheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={nextStep}
                  disabled={!canProceed()}
                  className="flex gap-1 items-center px-4 py-2 text-sm font-semibold text-white bg-linear-to-r from-purple-500 to-blue-500 rounded-xl shadow-lg transition-all hover:scale-105 disabled:opacity-50"
                >
                  Next
                  <FaArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}