'use client'

import { useState } from 'react';
// Import the eye icons from react-icons
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useRouter} from 'next/navigation'
import { BASE_URL } from '@/config/baseUrl';

export default function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  // State to manage password visibility
  const [showPassword, setShowPassword] = useState(false);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  // Function to toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: "include", // 🔑 so cookie is set
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Login successful! Redirecting...');
        
        if (data.accessToken) {
          localStorage.setItem('accessToken', data.accessToken);
          console.log(data.user?.profile)
        }

        // Check if user has completed profile/registration
        if (data.user?.profile?.username === "") {
          // Check various conditions that might indicate incomplete profile
          const isProfileIncomplete = 
            !data.username
            

          if (isProfileIncomplete) {
            // Route to registration/profile completion page
            router.push('/complete-profile');
            return;
          }
        }

        // If profile is complete, go to dashboard
        router.push('/');
        console.log(data)
      } else {
        // Handle specific error cases
        if (response.status === 404) {
          setError('Account not found. Please register first.');
          // Optionally auto-redirect to registration after a delay
          setTimeout(() => {
            router.push('/auth/register');
          }, 2000);
        } else if (data.code === 'PROFILE_INCOMPLETE') {
          // Handle case where backend specifically indicates profile is incomplete
          setMessage('Please complete your profile setup.');
          router.push('/auth/complete-profile');
        } else if (data.code === 'ACCOUNT_NOT_VERIFIED') {
          // Handle unverified account
          setError('Please verify your email address first.');
          router.push('/auth/verify-email');
        } else {
          setError(data.message || 'Invalid email or password. Please try again.');
        }
      }
    } catch (err) {
      console.error('Network error:', err);
      setError('A network error occurred. Please try again.');
    }
  };

  // Function to handle "Sign up" link click
  const handleSignUpClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    router.push('/auth/register');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      {/* Background circles for visual effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex w-full max-w-6xl mx-auto">
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-8">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl mb-6 shadow-lg shadow-purple-500/25">
                {/* User icon placeholder */}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user-check w-8 h-8 text-white">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/>
                </svg>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
                Welcome Back
              </h1>
              <p className="text-gray-600">Please log in to your account</p>
            </div>
            
            {message && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                <p className="text-green-600 text-sm">{message}</p>
              </div>
            )}
            
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Social media login buttons placeholder */}
            <div className="flex gap-3 mb-8">
              <button className="flex-1 flex items-center justify-center gap-3 h-12 bg-white/60 backdrop-blur-sm border border-white/30 rounded-xl hover:bg-white/80 transition-colors duration-300">
                <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-facebook w-3 h-3 text-white">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-700">Facebook</span>
              </button>
              <button className="flex-1 flex items-center justify-center gap-3 h-12 bg-white/60 backdrop-blur-sm border border-white/30 rounded-xl hover:bg-white/80 transition-colors duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chrome w-5 h-5 text-red-500">
                  <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="21.17" x2="12" y1="8" y2="8"/><line x1="3.95" x2="8.54" y1="6" y2="14"/><line x1="10.88" x2="15.46" y1="20" y2="12"/>
                </svg>
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
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors duration-200"
                  required
                  aria-describedby="email-validation"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">Password</label>
                <div className="relative mt-1">
                  <input
                    // Dynamically set the input type based on the showPassword state
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={handlePasswordChange}
                    className="block w-full pr-10 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors duration-200"
                    required
                    aria-describedby="password-validation"
                  />
                  {/* The password toggle button */}
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {/* Render the correct icon based on state */}
                    {showPassword ? (
                      <FaEyeSlash className="h-5 w-5" />
                    ) : (
                      <FaEye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-14 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/25 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Log In
              </button>
            </form>
            
            <div className="mt-8 text-center text-sm text-gray-600">
              Don`&apos;`t have an account?{' '}
              <a 
                href="/auth/register" 
                onClick={handleSignUpClick}
                className="font-semibold text-blue-600 hover:text-blue-500 transition-colors duration-200"
              >
                Sign up
              </a>
            </div>
          </div>
        </div>

        {/* Right-hand side marketing content */}
        <div className="hidden lg:block w-1/2 relative">
          <div className="absolute inset-4 bg-gradient-to-br from-purple-600/90 to-blue-600/90 rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20" />
            <div className="relative h-full flex items-center justify-center p-12">
              <div className="text-center text-white">
                <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-8">
                  <div className="w-12 h-12 bg-white/30 rounded-xl flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user-check w-6 h-6 text-white">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/>
                    </svg>
                  </div>
                </div>
                <h2 className="text-3xl font-bold mb-4">Welcome back!</h2>
                <p className="text-lg text-white/80 mb-8">
                  We`&apos;`re excited to see you again.
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