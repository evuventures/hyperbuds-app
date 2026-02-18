'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/auth/useAuth';
import ForgotPasswordModal from '@/components/auth/ForgotPasswordModal'; // Import your hook

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const[modal, setModal] = useState(false);
  
  // ✅ Use loading and forgotPassword from the hook
  const { forgotPassword, loading } = useAuth();

  useEffect(() => {
    document.documentElement.classList.remove('dark');
    return () => {
      const savedTheme = localStorage.getItem('hyperbuds-theme');
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      // ✅ Call the centralized hook method
      await forgotPassword(email);
      setModal(true);
      setMessage('Password reset link sent! Please check your email.');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'A network error occurred';
      setError(errorMessage);
    }
  };

  return (
    <div className="flex justify-center items-center p-4 min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50">
      <div className="overflow-hidden fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl bg-purple-300/30" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl bg-blue-300/30" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 bg-indigo-200/20" />
      </div>

      <div className="relative z-10 w-full max-w-md bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/30 p-8 space-y-6">
        <div className="text-center">
          <div className="inline-flex justify-center items-center mb-6 w-16 h-16 bg-linear-to-r from-purple-500 to-blue-500 rounded-2xl shadow-lg shadow-purple-500/25">
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1 1 0 0 1-1.06 0L3 7" />
            </svg>
          </div>

          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-gray-900 to-gray-700">
            Forgot Password
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>
        </div>

        {message && (
          <div className="p-4 bg-green-50 rounded-xl border border-green-200">
            <div className="flex items-start gap-3">
              <p className="text-sm text-green-600 font-medium">{message}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 rounded-xl border border-red-200">
            <div className="flex items-start gap-3">
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700">Email Address</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block px-4 py-3 mt-1 w-full rounded-xl border border-gray-300 bg-white shadow-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all text-slate-900"
              placeholder="your.email@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !email}
            className="w-full h-12 bg-linear-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl hover:shadow-purple-500/25 hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Send Reset Link'
            )}
          </button>
        </form>

        <div className="mt-6 text-sm text-center text-gray-600">
          Remember your password?{' '}
          <Link href="/auth/signin" className="font-bold text-purple-600 hover:text-purple-700">
            Log in
          </Link>
        </div>
      </div>
      {/*  Add the Modal here */}
      <ForgotPasswordModal 
        isOpen={modal} 
        onClose={() => setModal(false)} 
        email={email} 
      />
    </div>
  );
}