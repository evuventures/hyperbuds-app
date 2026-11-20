'use client';

import React, { useState } from 'react';
import { CheckCircle2, Eye, EyeOff, Loader2, Lock, Mail, RefreshCw, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/auth/useAuth';
import { BASE_URL } from '@/config/baseUrl';
import AuthSplitShowcase from './AuthSplitShowcase';

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

export default function LoginForm() {
  const router = useRouter();
  const { login, initiateGoogleLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [unverifiedNotice, setUnverifiedNotice] = useState<string | null>(null);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleResendVerification = async () => {
    const cleanEmail = email.trim();
    if (!cleanEmail || resendingEmail) return;
    setResendingEmail(true);
    try {
      await fetch(`${BASE_URL}/api/v1/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });
      setUnverifiedNotice(
        `A fresh verification link has been sent to ${cleanEmail}. Please check your inbox (and spam folder) and click the link to confirm your email.`,
      );
    } catch {
      setError('Unable to resend verification link right now. Please try again.');
    } finally {
      setResendingEmail(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setUnverifiedNotice(null);
    setIsLoading(true);

    if (!email || !password) {
      setError('Please enter both email and password.');
      setIsLoading(false);
      return;
    }

    try {
      const data = await login(email, password);
      setMessage('Login successful! Redirecting...');

      const profile = data.user?.profile;
      const isProfileIncomplete =
        !profile?.username || profile.username === '' || !profile?.bio;

      if (isProfileIncomplete) {
        router.push('/profile/complete-profile');
      } else {
        router.push('/');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';

      if (/not verified/i.test(errorMessage)) {
        setUnverifiedNotice(
          `Your email (${email.trim()}) is not verified yet. We just sent a new verification link to your inbox — please open your email and confirm your account to sign in.`,
        );
      } else if (errorMessage.includes('404')) {
        setError('Account not found. Please sign up first.');
        setTimeout(() => router.push('/auth/signup'), 2000);
      } else if (errorMessage.includes('PROFILE_INCOMPLETE')) {
        setMessage('Please complete your profile setup.');
        router.push('/profile/complete-profile');
      } else {
        setError(errorMessage || 'Invalid credentials. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthSplitShowcase
      title={
        <>
          Welcome back
          <br />
          <span className="mr-2 font-semibold text-zinc-200">to</span>
        </>
      }
    >
      {/* Prominent white Google button matching Higgsfield */}
      <div className="mt-7">
        <button
          type="button"
          onClick={initiateGoogleLogin}
          aria-label="Continue with Google"
          className="flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-zinc-950 shadow-sm transition hover:bg-zinc-100 active:scale-[0.99]"
        >
          <GoogleMark />
          <span>Continue with Google</span>
        </button>
      </div>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-zinc-800" />
        <span className="text-xs font-medium text-zinc-500">or continue with email</span>
        <div className="h-px flex-1 bg-zinc-800" />
      </div>

      {message && (
        <div
          role="status"
          className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-center text-xs font-medium text-emerald-300"
        >
          {message}
        </div>
      )}

      {unverifiedNotice && (
        <div
          role="alert"
          data-testid="email-unverified-notice"
          className="mb-4 space-y-2.5 rounded-xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-xs text-amber-200"
        >
          <div className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
            <p className="leading-relaxed font-medium">{unverifiedNotice}</p>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              disabled={resendingEmail}
              onClick={() => void handleResendVerification()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-400/40 bg-amber-500/15 px-3 py-1.5 text-[11px] font-semibold text-amber-100 transition hover:bg-amber-500/25 disabled:opacity-50"
            >
              <RefreshCw className={`h-3 w-3 ${resendingEmail ? 'animate-spin' : ''}`} />
              {resendingEmail ? 'Sending link...' : 'Send verification link again'}
            </button>
          </div>
        </div>
      )}

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
          <label htmlFor="email" className="sr-only">
            Email Address
          </label>
          <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            autoComplete="email"
            required
            className="w-full rounded-xl border border-zinc-800 bg-[#151519] py-3 pl-10 pr-4 text-sm text-white placeholder:text-zinc-500 outline-none transition focus:border-purple-500 focus:bg-[#19191f]"
          />
        </div>

        <div className="relative">
          <label htmlFor="password" className="sr-only">
            Password
          </label>
          <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoComplete="current-password"
            required
            className="w-full rounded-xl border border-zinc-800 bg-[#151519] py-3 pl-10 pr-11 text-sm text-white placeholder:text-zinc-500 outline-none transition focus:border-purple-500 focus:bg-[#19191f]"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 right-1.5 flex items-center rounded-lg px-2.5 text-zinc-500 transition hover:text-zinc-200"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <div className="flex justify-end">
          <Link
            href="/auth/forgot-password"
            className="text-xs font-medium text-zinc-400 transition hover:text-purple-400"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-linear-to-r from-purple-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-700/25 transition hover:from-purple-500 hover:to-indigo-500 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-55"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Signing in...</span>
            </>
          ) : (
            'Continue with Email'
          )}
        </button>
      </form>

      <div className="mt-5 flex items-center justify-center gap-1.5 text-xs font-medium text-purple-300">
        <Sparkles className="h-3.5 w-3.5" />
        <span>Live Studio, AI Matching &amp; Creator Reels included</span>
      </div>

      <p className="mt-5 text-center text-xs text-zinc-400">
        Don&apos;t have an account?{' '}
        <Link
          href="/auth/signup"
          className="font-semibold text-white transition hover:text-purple-400"
        >
          Sign up
        </Link>
      </p>
    </AuthSplitShowcase>
  );
}
