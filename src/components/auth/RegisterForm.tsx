'use client'

import { useState } from 'react';
import { Eye, EyeOff, User, Facebook, Chrome } from 'lucide-react';
import { BASE_URL } from '@/config/baseUrl';

const LoadingSpinner = () => (
  <svg
    className="w-5 h-5 text-white animate-spin"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ✅ type for input change event
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // ✅ type for form submit event
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage('');
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
      const response = await fetch(`${BASE_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        setMessage('Registration successful! Please check your email for a verification link.');
      } else if (response.status === 409) {
        setError('This email is already in use. Please use a different one.');
      } else {
        const data = await response.json();
        setError(data.message || 'An error occurred during registration.');
      }
    } catch (err) {
      console.error('Network error:', err);
      setError('A network error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center p-4 min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="overflow-hidden fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl bg-purple-300/30" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl bg-blue-300/30" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 bg-indigo-200/20" />
      </div>

      <div className="flex relative z-10 mx-auto w-full max-w-6xl">
        <div className="flex justify-center items-center p-4 w-full lg:w-1/2">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center">
              <div className="inline-flex justify-center items-center mb-6 w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl shadow-lg shadow-purple-500/25">
                <User className="w-8 h-8 text-white" />
              </div>
              <h1 className="mb-2 text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600">
                Create Account
              </h1>
              <p className="text-gray-600">Join us and start your journey today</p>
            </div>

            {message && (
              <div className="p-4 mb-6 bg-green-50 rounded-xl border border-green-200">
                <p className="text-sm text-green-600">{message}</p>
              </div>
            )}

            {error && (
              <div className="p-4 mb-6 bg-red-50 rounded-xl border border-red-200">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex gap-3 mb-8">
              <button className="flex flex-1 gap-3 justify-center items-center h-12 rounded-xl border backdrop-blur-sm transition-colors duration-300 bg-white/60 border-white/30 hover:bg-white/80">
                <div className="flex justify-center items-center w-5 h-5 bg-blue-600 rounded">
                  <Facebook className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">Facebook</span>
              </button>
              <button className="flex flex-1 gap-3 justify-center items-center h-12 rounded-xl border backdrop-blur-sm transition-colors duration-300 bg-white/60 border-white/30 hover:bg-white/80">
                <Chrome className="w-5 h-5 text-red-500" />
                <span className="text-sm font-medium text-gray-700">Google</span>
              </button>
            </div>

            <div className="flex items-center mb-8">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent to-gray-300" />
              <span className="px-4 text-sm text-gray-500">or continue with email</span>
              <div className="flex-1 h-px bg-gradient-to-l from-transparent to-gray-300" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700">Email Address</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={handleEmailChange}
                  className="block px-4 py-2 mt-1 w-full rounded-md border border-gray-300 shadow-sm transition-colors duration-200 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                  aria-describedby="email-validation"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">Password</label>
                <div className="relative mt-1">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={handlePasswordChange}
                    className="block px-4 py-2 pr-10 w-full rounded-md border border-gray-300 shadow-sm transition-colors duration-200 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                    aria-describedby="password-validation"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="flex absolute inset-y-0 right-0 items-center pr-3 text-gray-400 transition-colors duration-200 hover:text-gray-600"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className='cursor-pointer' />
                    ) : (
                      <Eye className='cursor-pointer' />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/25 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? <LoadingSpinner /> : 'Sign Up'}
              </button>
            </form>
            <p className='mx-auto mt-4 text-base text-center'>Already have an account? <a href="/auth/signin" className='font-semibold text-blue-600 transition-colors duration-200 hover:text-blue-500'>signin</a></p>
          </div>
        </div>

        <div className="hidden relative w-1/2 lg:block">
          <div className="overflow-hidden absolute inset-4 bg-gradient-to-br rounded-3xl from-purple-600/90 to-blue-600/90">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20" />
            <div className="flex relative justify-center items-center p-12 h-full">
              <div className="text-center text-white">
                <div className="flex justify-center items-center mx-auto mb-8 w-24 h-24 rounded-2xl backdrop-blur-sm bg-white/20">
                  <div className="flex justify-center items-center w-12 h-12 rounded-xl bg-white/30">
                    <User className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h2 className="mb-4 text-3xl font-bold">Welcome to our community</h2>
                <p className="mb-8 text-lg text-white/80">
                  Join thousands of users who trust us with their digital journey.
                </p>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">50K+</div>
                    <div className="text-sm text-white/70">Active Users</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">99.9%</div>
                    <div className="text-sm text-white/70">Uptime</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">24/7</div>
                    <div className="text-sm text-white/70">Support</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
