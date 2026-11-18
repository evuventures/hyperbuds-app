'use client';

import React, { useState } from 'react';
import { Chrome, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/auth/useAuth';
import AuthSplitShowcase from './AuthSplitShowcase';
import EmailVerificationModal from './EmailVerificationModal';

export default function RegisterForm() {
  const router = useRouter();
  const { register, initiateGoogleLogin } = useAuth();
  const [role, setRole] = useState<'talent' | 'founder'>('talent');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email || !password) {
      setError('Email and password are required.');
      setIsLoading(false);
      return;
    }

    if (password.length < 8 || password.length > 128) {
      setError('Password must be between 8 and 128 characters.');
      setIsLoading(false);
      return;
    }

    try {
      await register({ email, password, role });
      setShowVerificationModal(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';

      if (errorMessage.includes('409') || errorMessage.toLowerCase().includes('already in use')) {
        setError('This email is already in use. Please use a different one.');
      } else {
        setError(errorMessage || 'An error occurred during registration.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AuthSplitShowcase
        title={
          <>
            Start your
            <br />
            creator match
          </>
        }
      >
        {/* Connected 3-pill selector / Google quick signup bar */}
        <div className="mt-6 flex justify-center">
          <div
            role="group"
            aria-label="Account options and Google sign up"
            className="inline-flex items-center gap-1 rounded-full bg-[#f1f3f5] p-1.5"
          >
            <button
              type="button"
              onClick={() => setRole('talent')}
              aria-pressed={role === 'talent'}
              className={`rounded-full px-3.5 py-2 text-xs font-semibold transition ${
                role === 'talent'
                  ? 'bg-white text-purple-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Creator
            </button>
            <button
              type="button"
              onClick={initiateGoogleLogin}
              aria-label="Continue with Google"
              title="Continue with Google"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm transition hover:scale-105"
            >
              <Chrome className="h-4 w-4 text-rose-500" />
            </button>
            <button
              type="button"
              onClick={() => setRole('founder')}
              aria-pressed={role === 'founder'}
              className={`rounded-full px-3.5 py-2 text-xs font-semibold transition ${
                role === 'founder'
                  ? 'bg-white text-purple-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Founder
            </button>
          </div>
        </div>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-xs font-medium text-slate-400">or</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        {error && (
          <div
            role="alert"
            className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-center text-xs font-medium text-rose-700"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label htmlFor="signup-email" className="sr-only">
              Email
            </label>
            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              autoComplete="email"
              required
              className="w-full rounded-full border border-transparent bg-[#f1f3f5] px-5 py-3.5 text-sm text-slate-900 placeholder:text-slate-500 outline-none transition focus:border-purple-500 focus:bg-white"
            />
          </div>

          <div className="relative">
            <label htmlFor="signup-password" className="sr-only">
              Password
            </label>
            <input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete="new-password"
              required
              className="w-full rounded-full border border-transparent bg-[#f1f3f5] py-3.5 pl-5 pr-12 text-sm text-slate-900 placeholder:text-slate-500 outline-none transition focus:border-purple-500 focus:bg-white"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute inset-y-0 right-1.5 flex items-center rounded-full px-3 text-slate-500 transition hover:text-slate-800"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-1 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-purple-700 py-3.5 text-sm font-semibold text-white shadow-lg shadow-purple-700/25 transition hover:bg-purple-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-55"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Starting...</span>
              </>
            ) : (
              'Start'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => router.push('/auth/signin')}
            className="cursor-pointer font-bold text-slate-900 hover:text-purple-700"
          >
            Log in
          </button>
        </p>
      </AuthSplitShowcase>

      <EmailVerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        email={email}
      />
    </>
  );
}
