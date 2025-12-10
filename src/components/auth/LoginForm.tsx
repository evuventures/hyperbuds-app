'use client'

import { useState } from 'react';
// Import the eye icons from react-icons
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useRouter } from 'next/navigation'
import { BASE_URL } from '@/config/baseUrl';

const handleGoogleLogin = () => {
  // Store redirect destination for after login
  const currentPath = window.location.pathname;
  sessionStorage.setItem("authRedirect", currentPath || "/dashboard");

  // Get Google OAuth configuration from environment variables or use defaults
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "265404811439-3a6feinek5pckg02bjg7mfrva4esuqh0.apps.googleusercontent.com";
  
  // Get redirect URI from environment or construct from current origin
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
  const redirectUri = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI || `${baseUrl}/auth/google-callback`;
  
  const scope = "email profile";
  const responseType = "code";

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=${responseType}&scope=${scope}&access_type=offline&prompt=consent`;

  window.location.href = googleAuthUrl;
};

export default function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
    setIsLoading(true);

    if (!email || !password) {
      setError('Please enter both email and password.');
      setIsLoading(false);
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
        }

        // Fetch full user data including profile from /users/me
        try {
          const userRes = await fetch(`${BASE_URL}/api/v1/users/me`, {
            headers: {
              'Authorization': `Bearer ${data.accessToken}`,
            },
            credentials: 'include',
          });

          if (userRes.ok) {
            const userData = await userRes.json();
            
            // Check if user has completed profile/registration
            // A profile is incomplete if critical fields are missing
            const profile = userData?.profile;
            const isProfileIncomplete =
              !profile?.username ||
              profile.username === "" ||
              !profile?.bio ||
              profile.bio === "" ||
              !profile?.niche ||
              (Array.isArray(profile.niche) && profile.niche.length === 0);

            if (isProfileIncomplete) {
              // Route to profile completion page
              setMessage('Please complete your profile to continue.');
              setTimeout(() => {
                router.push('/profile/complete-profile');
              }, 500);
              return;
            }

            // If profile is complete, go to dashboard
            router.push('/');
          } else {
            // If we can't fetch user data, just go to dashboard
            // Dashboard will handle profile completion check
            router.push('/');
          }
        } catch (err) {
          console.error('Failed to fetch user profile:', err);
          // On error, go to dashboard and let it handle the check
          router.push('/');
        }
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
          router.push('/profile/complete-profile');
        } else if (data.code === 'ACCOUNT_NOT_VERIFIED') {
          // Handle unverified account
          setError('Please verify your email address first.');
          router.push('/auth/verify-email');
        } else {
          setError(data.message || 'Invalid email or password. Please try again.');
        }
      }
    } catch {
      setError('A network error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle "Sign up" link click
  const handleSignUpClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    router.push('/auth/register');
  };

  return (
    <div className="flex justify-center items-center p-4 min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50">
      {/* Background circles for visual effect */}
      <div className="overflow-hidden fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl bg-purple-300/30" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl bg-blue-300/30" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 bg-indigo-200/20" />
      </div>

      <div className="flex relative z-10 mx-auto w-full max-w-6xl">
        <div className="flex justify-center items-center p-4 w-full lg:w-1/2 lg:p-8">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center">
              <div className="inline-flex justify-center items-center mb-6 w-16 h-16 bg-linear-to-r from-purple-500 to-blue-500 rounded-2xl shadow-lg shadow-purple-500/25">
                {/* User icon placeholder */}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-white lucide lucide-user-check">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><polyline points="16 11 18 13 22 9" />
                </svg>
              </div>
              <h1 className="mb-2 text-4xl font-bold text-transparent bg-clip-text bg-linear-to-r from-gray-900 to-gray-600">
                Welcome Back
              </h1>
              <p className="text-gray-600">Please log in to your account</p>
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

            {/* Social media login buttons placeholder */}
            <div className="flex gap-3 mb-8">
              <button className="flex flex-1 gap-3 justify-center items-center h-12 rounded-xl border backdrop-blur-sm transition-colors duration-300 bg-white/60 border-white/30 hover:bg-white/80">
                <div className="flex justify-center items-center w-5 h-5 bg-blue-600 rounded">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 text-white lucide lucide-facebook">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-700">Facebook</span>
              </button>
              <button
                onClick={handleGoogleLogin}
                className="flex flex-1 gap-3 justify-center items-center h-12 rounded-xl border backdrop-blur-sm transition-colors duration-300 cursor-pointer bg-white/60 border-white/30 hover:bg-white/80">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-red-500 lucide lucide-chrome">
                  <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="4" /><line x1="21.17" x2="12" y1="8" y2="8" /><line x1="3.95" x2="8.54" y1="6" y2="14" /><line x1="10.88" x2="15.46" y1="20" y2="12" />
                </svg>
                <span className="text-sm font-medium text-gray-700">Google</span>
              </button>
            </div>

            <div className="flex items-center mb-8">
              <div className="flex-1 h-px bg-linear-to-r from-transparent to-gray-300" />
              <span className="px-4 text-sm text-gray-500">or continue with email</span>
              <div className="flex-1 h-px bg-linear-to-l from-transparent to-gray-300" />
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
                    // Dynamically set the input type based on the showPassword state
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={handlePasswordChange}
                    className="block px-4 py-2 pr-10 w-full rounded-md border border-gray-300 shadow-sm transition-colors duration-200 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                    aria-describedby="password-validation"
                  />
                  {/* The password toggle button */}
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="flex absolute inset-y-0 right-0 items-center pr-3 text-gray-400 transition-colors duration-200 hover:text-gray-600"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {/* Render the correct icon based on state */}
                    {showPassword ? (
                      <FaEyeSlash className="w-5 h-5 cursor-pointer" />
                    ) : (
                      <FaEye className="w-5 h-5 cursor-pointer" />
                    )}
                  </button>
                </div>
              </div>
              <div className="text-right">
                <a
                  href="/auth/forgot-password"
                  className="text-sm font-medium text-red-500 transition-colors duration-200 hover:text-red-600"
                >
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 bg-linear-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/25 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <svg className="w-5 h-5 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Logging in...</span>
                  </>
                ) : (
                  'Log In'
                )}
              </button>
            </form>

            <div className="mt-8 text-sm text-center text-gray-600">
              Don&apos;t have an account?{' '}
              <a
                href="/auth/register"
                onClick={handleSignUpClick}
                className="font-semibold text-blue-600 transition-colors duration-200 cursor-pointer hover:text-blue-500"
              >
                Sign up
              </a>
            </div>
          </div>
        </div>

        {/* Right-hand side marketing content */}
        <div className="hidden relative w-1/2 lg:block">
          <div className="overflow-hidden absolute inset-4 bg-linear-to-br rounded-3xl from-purple-600/90 to-blue-600/90">
            <div className="absolute inset-0 bg-linear-to-br from-purple-500/20 to-blue-500/20" />
            <div className="flex relative justify-center items-center p-12 h-full">
              <div className="text-center text-white">
                <div className="flex justify-center items-center mx-auto mb-8 w-24 h-24 rounded-2xl backdrop-blur-sm bg-white/20">
                  <div className="flex justify-center items-center w-12 h-12 rounded-xl bg-white/30">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-white lucide lucide-user-check">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><polyline points="16 11 18 13 22 9" />
                    </svg>
                  </div>
                </div>
                <h2 className="mb-4 text-3xl font-bold">Welcome back!</h2>
                <p className="mb-8 text-lg text-white/80">
                  We&apos;re excited to see you again.
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