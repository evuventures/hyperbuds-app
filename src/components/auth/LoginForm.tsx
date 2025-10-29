'use client';

import { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { BASE_URL } from '@/config/baseUrl';
import { getCurrentUser } from '@/lib/api/user.api';

export default function LoginForm() {
  const router = useRouter();
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

    if (!email || !password) return setError('Please enter both email and password.');

    setIsLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.code === 'ACCOUNT_NOT_VERIFIED') router.push('/auth/verify-email');
        else if (res.status === 404) router.push('/auth/register');
        else setError(data.message || 'Invalid credentials');
        return;
      }

      if (data.accessToken) localStorage.setItem('accessToken', data.accessToken);

      const userData = await getCurrentUser();
      const profile = userData?.profile;
      const isProfileIncomplete =
        !profile?.username || !profile?.bio || !profile?.niche?.length;

      if (isProfileIncomplete) router.push('/profile/complete-profile');
      else router.push('/');

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const handleSignUpClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    router.push('/auth/register');
  };

  const handleGoogleLogin = () => {
    const clientId = "YOUR_GOOGLE_CLIENT_ID";
    const redirectUri = "http://localhost:3000";
    const scope = "email profile";
    const responseType = "code";

    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}&access_type=offline&prompt=consent`;
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg space-y-6">
        <h1 className="text-2xl font-bold text-center">Login</h1>

        {message && <p className="text-green-600">{message}</p>}
        {error && <p className="text-red-600">{error}</p>}

        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded"
            required
          />
        </div>

        <div>
          <label>Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded"
              required
            />
            <button type="button" onClick={togglePasswordVisibility} className="absolute right-2 top-2">
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={isLoading} className="w-full py-2 bg-blue-600 text-white rounded">
          {isLoading ? 'Logging in...' : 'Log In'}
        </button>

        <div className="flex justify-between">
          <a href="/auth/forgot-password" className="text-sm text-blue-500">Forgot password?</a>
          <a href="/auth/register" onClick={handleSignUpClick} className="text-sm text-blue-500">Sign up</a>
        </div>

        <button type="button" onClick={handleGoogleLogin} className="w-full py-2 mt-4 bg-red-500 text-white rounded">
          Login with Google
        </button>
      </form>
    </div>
  );
}
