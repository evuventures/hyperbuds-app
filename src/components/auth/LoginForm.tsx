'use client';

import React, { useState } from 'react';
import { Chrome, Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/auth/useAuth';
import AuthSplitShowcase from './AuthSplitShowcase';

export default function LoginForm() {
  const router = useRouter();
  const { login, initiateGoogleLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage('');
    setError('');
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

      if (errorMessage.includes('404')) {
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
          creator
        </>
      }
    >
      {/* Sleek Google quick sign-in pill */}
      <div className="mt-6 flex justify-center">
        <button
          type="button"
          onClick={initiateGoogleLogin}
          aria-label="Continue with Google"
          className="inline-flex cursor-pointer items-center gap-2.5 rounded-full bg-[#f1f3f5] px-5 py-2.5 text-xs font-semibold text-slate-800 transition hover:bg-slate-200"
        >
          <Chrome className="h-4 w-4 text-rose-500" />
          <span>Continue with Google</span>
        </button>
      </div>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs font-medium text-slate-400">or</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      {message && (
        <div
          role="status"
          className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-center text-xs font-medium text-emerald-700"
        >
          {message}
        </div>
      )}

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
          <label htmlFor="email" className="sr-only">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            autoComplete="email"
            required
            className="w-full rounded-full border border-transparent bg-[#f1f3f5] px-5 py-3.5 text-sm text-slate-900 placeholder:text-slate-500 outline-none transition focus:border-purple-500 focus:bg-white"
          />
        </div>

        <div className="relative">
          <label htmlFor="password" className="sr-only">
            Password
          </label>
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoComplete="current-password"
            required
            className="w-full rounded-full border border-transparent bg-[#f1f3f5] py-3.5 pl-5 pr-12 text-sm text-slate-900 placeholder:text-slate-500 outline-none transition focus:border-purple-500 focus:bg-white"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 right-1.5 flex items-center rounded-full px-3 text-slate-500 transition hover:text-slate-800"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <div className="flex justify-end px-1">
          <Link
            href="/auth/forgot-password"
            className="text-xs font-medium text-slate-500 transition hover:text-purple-700"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-purple-700 py-3.5 text-sm font-semibold text-white shadow-lg shadow-purple-700/25 transition hover:bg-purple-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-55"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Logging in...</span>
            </>
          ) : (
            'Log In'
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-slate-500">
        Don&apos;t have an account?{' '}
        <Link
          href="/auth/signup"
          className="font-bold text-slate-900 transition hover:text-purple-700"
        >
          Sign up
        </Link>
      </p>
    </AuthSplitShowcase>
  );
}
