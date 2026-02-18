'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link' // ✅ Standardized routing
import { useAuth } from '@/hooks/auth/useAuth' // ✅ Centralized hook
import { Eye, EyeOff } from 'lucide-react'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''
  
  // ✅ Use hook actions and global loading state
  const { resetPassword, loading } = useAuth()

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, text: '', color: '' })

  useEffect(() => {
    document.documentElement.classList.remove('dark');
    return () => {
      const savedTheme = localStorage.getItem('hyperbuds-theme');
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      }
    };
  }, []);

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token. Please request a new password reset link.')
    }
  }, [token])

  useEffect(() => {
    if (!newPassword) {
      setPasswordStrength({ score: 0, text: '', color: '' })
      return
    }

    let score = 0
    let text = ''
    let color = ''

    if (newPassword.length >= 8) score += 1
    if (newPassword.length >= 12) score += 1
    if (/[a-z]/.test(newPassword)) score += 1
    if (/[A-Z]/.test(newPassword)) score += 1
    if (/[0-9]/.test(newPassword)) score += 1
    if (/[^a-zA-Z0-9]/.test(newPassword)) score += 1

    if (score <= 2) {
      text = 'Weak'; color = 'bg-red-500'
    } else if (score <= 4) {
      text = 'Medium'; color = 'bg-yellow-500'
    } else {
      text = 'Strong'; color = 'bg-green-500'
    }
    setPasswordStrength({ score, text, color })
  }, [newPassword])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMessage('')
    setError('')

    if (!token) {
      setError('Invalid reset token. Please request a new link.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (passwordStrength.score < 3) {
      setError('Please choose a stronger password.')
      return
    }

    try {
      // ✅ Use hook method
      await resetPassword(token, newPassword)
      setMessage('✅ Password has been reset successfully! Redirecting to login...')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => router.push('/auth/signin'), 2500)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'A network error occurred'
      setError(errorMessage)
    }
  }

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
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>

          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-gray-900 to-gray-700">
            Reset Password
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Create a new strong password for your account.
          </p>
        </div>

        {message && (
          <div className="p-4 bg-green-50 rounded-xl border border-green-200">
            <p className="text-sm text-green-600 font-medium">{message}</p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 rounded-xl border border-red-200">
            <p className="text-sm text-red-600 font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700">New Password</label>
            <div className="relative mt-1">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="block px-4 py-2.5 pr-12 w-full rounded-xl border border-gray-300 bg-white shadow-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all text-slate-900"
                placeholder="Enter new password"
                disabled={!token || loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {newPassword && (
              <div className="mt-2 space-y-2">
                <div className="flex gap-1">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < passwordStrength.score ? passwordStrength.color : 'bg-gray-200'}`}
                    />
                  ))}
                </div>
                <p className="text-xs font-medium text-gray-600">
                  Strength: <span className={passwordStrength.score <= 2 ? 'text-red-600' : passwordStrength.score <= 4 ? 'text-yellow-600' : 'text-green-600'}>{passwordStrength.text}</span>
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">Confirm Password</label>
            <div className="relative mt-1">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block px-4 py-2.5 pr-12 w-full rounded-xl border border-gray-300 bg-white shadow-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all text-slate-900"
                placeholder="Confirm new password"
                disabled={!token || loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !token || passwordStrength.score < 3}
            className="w-full h-12 bg-linear-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Reset Password'
            )}
          </button>
        </form>

        {!token && (
          <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
             <Link href="/auth/forgot-password" className="text-sm font-semibold text-purple-600 hover:underline">
              Request a new link →
            </Link>
          </div>
        )}

        <div className="mt-6 text-sm text-center text-gray-600">
          Remember your password?{' '}
          <Link href="/auth/signin" className="font-bold text-purple-600 hover:text-purple-700">
            Log in
          </Link>
        </div>
      </div>
    </div>
  )
}