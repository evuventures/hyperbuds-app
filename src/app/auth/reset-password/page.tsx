'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { BASE_URL } from '@/config/baseUrl'
import { Eye, EyeOff } from 'lucide-react'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, text: '', color: '' })

  // Check if token exists
  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token. Please request a new password reset link.')
    }
  }, [token])

  // Password strength validator
  useEffect(() => {
    if (!newPassword) {
      setPasswordStrength({ score: 0, text: '', color: '' })
      return
    }

    let score = 0
    let text = ''
    let color = ''

    // Length check
    if (newPassword.length >= 8) score += 1
    if (newPassword.length >= 12) score += 1

    // Character variety checks
    if (/[a-z]/.test(newPassword)) score += 1
    if (/[A-Z]/.test(newPassword)) score += 1
    if (/[0-9]/.test(newPassword)) score += 1
    if (/[^a-zA-Z0-9]/.test(newPassword)) score += 1

    // Determine strength
    if (score <= 2) {
      text = 'Weak'
      color = 'bg-red-500'
    } else if (score <= 4) {
      text = 'Medium'
      color = 'bg-yellow-500'
    } else {
      text = 'Strong'
      color = 'bg-green-500'
    }

    setPasswordStrength({ score, text, color })
  }, [newPassword])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMessage('')
    setError('')

    // Validation
    if (!token) {
      setError('Invalid reset token. Please request a new password reset link.')
      return
    }

    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields.')
      return
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (passwordStrength.score < 3) {
      setError('Please choose a stronger password with a mix of uppercase, lowercase, numbers, and symbols.')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${BASE_URL}/api/v1/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('✅ Password has been reset successfully! Redirecting to login...')
        setNewPassword('')
        setConfirmPassword('')
        setTimeout(() => router.push('/auth/signin'), 2500)
      } else {
        setError(data.message || 'Failed to reset password. The link may have expired. Please request a new one.')
      }
    } catch (err) {
      console.error(err)
      setError('A network error occurred. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex justify-center items-center p-4 min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Background glow effects */}
      <div className="overflow-hidden fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl bg-purple-300/30 dark:bg-purple-500/20" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl bg-blue-300/30 dark:bg-blue-500/20" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 bg-indigo-200/20 dark:bg-indigo-500/10" />
      </div>

      <div className="relative z-10 w-full max-w-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/30 dark:border-gray-700/50 p-8 space-y-6">
        <div className="text-center">
          <div className="inline-flex justify-center items-center mb-6 w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl shadow-lg shadow-purple-500/25">
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white lucide lucide-lock">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>

          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300">
            Reset Password
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Create a new strong password for your account.
          </p>
        </div>

        {/* Feedback messages */}
        {message && (
          <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-xl border border-green-200 dark:border-green-700">
            <p className="text-sm text-green-600 dark:text-green-400">{message}</p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/30 rounded-xl border border-red-200 dark:border-red-700">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* New password */}
          <div>
            <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              New Password
            </label>
            <div className="relative mt-1">
              <input
                id="newPassword"
                name="newPassword"
                type={showPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="block px-4 py-2.5 pr-12 w-full rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm transition-colors duration-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                placeholder="Enter new password"
                disabled={!token}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="flex absolute inset-y-0 right-0 items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {newPassword && (
              <div className="mt-2 space-y-2">
                <div className="flex gap-1">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        i < passwordStrength.score ? passwordStrength.color : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Password strength: <span className={passwordStrength.score <= 2 ? 'text-red-600' : passwordStrength.score <= 4 ? 'text-yellow-600' : 'text-green-600'}>{passwordStrength.text}</span>
                </p>
                <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                  <li className={newPassword.length >= 8 ? 'text-green-600' : ''}>
                    ✓ At least 8 characters
                  </li>
                  <li className={/[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword) ? 'text-green-600' : ''}>
                    ✓ Uppercase and lowercase letters
                  </li>
                  <li className={/[0-9]/.test(newPassword) ? 'text-green-600' : ''}>
                    ✓ At least one number
                  </li>
                  <li className={/[^a-zA-Z0-9]/.test(newPassword) ? 'text-green-600' : ''}>
                    ✓ At least one special character
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* Confirm password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Confirm Password
            </label>
            <div className="relative mt-1">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block px-4 py-2.5 pr-12 w-full rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm transition-colors duration-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                placeholder="Confirm new password"
                disabled={!token}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="flex absolute inset-y-0 right-0 items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !token || passwordStrength.score < 3}
            className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/25 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="w-5 h-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Resetting Password...
              </>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>

        {/* Request new link if token is invalid */}
        {!token && (
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-700">
            <p className="text-sm text-yellow-800 dark:text-yellow-300 mb-2">
              Missing or invalid reset token.
            </p>
            <a
              href="/auth/forgot-password"
              className="inline-block text-sm font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
            >
              Request a new password reset link →
            </a>
          </div>
        )}

        {/* Back to login */}
        <div className="mt-6 text-sm text-center text-gray-600 dark:text-gray-400">
          Remember your password?{' '}
          <a
            href="/auth/signin"
            className="font-semibold text-purple-600 dark:text-purple-400 transition-colors duration-200 hover:text-purple-700 dark:hover:text-purple-300"
          >
            Log in
          </a>
        </div>
      </div>
    </div>
  )
}
