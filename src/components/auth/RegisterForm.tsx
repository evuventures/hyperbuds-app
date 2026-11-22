'use client';

import React, { useEffect, useState } from 'react';
import { Eye, EyeOff, Gift, Loader2, Lock, Mail, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/auth/useAuth';
import AuthSplitShowcase from './AuthSplitShowcase';
import EmailVerificationModal from './EmailVerificationModal';

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

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
  const [referralCode, setReferralCode] = useState<string>('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const ref = (params.get('ref') || params.get('referral') || '').trim();
    if (ref) {
      setReferralCode(ref);
      window.localStorage.setItem('hb_pending_ref', ref);
    }
  }, []);

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
            Get started
            <br />
            <span className="mr-2 font-semibold text-zinc-200">with</span>
          </>
        }
      >
        {/* Prominent white Google button */}
        <div className="mt-7 space-y-2.5">
          {referralCode && (
            <div className="flex items-center gap-2 rounded-xl border border-purple-500/40 bg-purple-600/20 px-3.5 py-2.5 text-xs font-medium text-purple-100">
              <Gift className="h-4 w-4 shrink-0 text-amber-300" />
              <span>
                Creator Invite Active (<strong className="text-white">{referralCode}</strong>) — Sign up &amp; verify to unlock <strong>+15 Bonus Credits</strong>!
              </span>
            </div>
          )}
          <button
            type="button"
            onClick={initiateGoogleLogin}
            aria-label="Continue with Google"
            className="flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-zinc-950 shadow-sm transition hover:bg-zinc-100 active:scale-[0.99]"
          >
            <GoogleMark />
            <span>Continue with Google</span>
          </button>

          {/* Sleek dark role selector */}
          <div
            role="group"
            aria-label="Select account role"
            className="grid grid-cols-2 gap-1.5 rounded-xl border border-zinc-800 bg-[#151519] p-1"
          >
            <button
              type="button"
              onClick={() => setRole('talent')}
              aria-pressed={role === 'talent'}
              className={`rounded-lg py-2 text-xs font-semibold transition ${
                role === 'talent'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Creator / Talent
            </button>
            <button
              type="button"
              onClick={() => setRole('founder')}
              aria-pressed={role === 'founder'}
              className={`rounded-lg py-2 text-xs font-semibold transition ${
                role === 'founder'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Startup Founder
            </button>
          </div>
        </div>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-zinc-800" />
          <span className="text-xs font-medium text-zinc-500">or continue with email</span>
          <div className="h-px flex-1 bg-zinc-800" />
        </div>

        {error && (
          <div
            role="alert"
            className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-center text-xs font-medium text-rose-300"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <label htmlFor="signup-email" className="sr-only">
              Email
            </label>
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              autoComplete="email"
              required
              className="w-full rounded-xl border border-zinc-800 bg-[#151519] py-3 pl-10 pr-4 text-sm text-white placeholder:text-zinc-500 outline-none transition focus:border-purple-500 focus:bg-[#19191f]"
            />
          </div>

          <div className="relative">
            <label htmlFor="signup-password" className="sr-only">
              Password
            </label>
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (8+ characters)"
              autoComplete="new-password"
              required
              className="w-full rounded-xl border border-zinc-800 bg-[#151519] py-3 pl-10 pr-11 text-sm text-white placeholder:text-zinc-500 outline-none transition focus:border-purple-500 focus:bg-[#19191f]"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute inset-y-0 right-1.5 flex items-center rounded-lg px-2.5 text-zinc-500 transition hover:text-zinc-200"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-1 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-linear-to-r from-purple-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-700/25 transition hover:from-purple-500 hover:to-indigo-500 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-55"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Creating account...</span>
              </>
            ) : (
              'Create Free Account'
            )}
          </button>
        </form>

        <div className="mt-5 flex items-center justify-center gap-1.5 text-xs font-medium text-purple-300">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Unlock Live Co-Streaming &amp; AI Creator Matching</span>
        </div>

        <p className="mt-5 text-center text-xs text-zinc-400">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => router.push('/auth/signin')}
            className="cursor-pointer font-semibold text-white transition hover:text-purple-400"
          >
            Sign in
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
