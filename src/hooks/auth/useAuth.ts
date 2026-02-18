'use client'

import { useCallback } from 'react'
import { googleAuth } from '@/lib/api/auth.api'
import { BASE_URL } from '@/config/baseUrl'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { clearAuth, setError, setLoading, setToken, setUser } from '@/store/slices/authSlice'

interface User {
  id?: string
  _id?: string
  name?: string
  username?: string
  displayName?: string
  email?: string
  avatar?: string
}

export function useAuth() {
  const dispatch = useAppDispatch()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { user, loading, token } = useAppSelector((state: any) => state.auth)

  const login = useCallback(async (email: string, password: string) => {
    dispatch(setLoading(true))
    dispatch(setError(null))

    const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    })

    const data = await res.json()
    if (!res.ok) {
      dispatch(setLoading(false))
      throw new Error(data.message || 'Login failed')
    }

    if (data.accessToken) {
      localStorage.setItem('accessToken', data.accessToken)
      dispatch(setToken(data.accessToken))
    }

    if (data.user) {
      dispatch(setUser(data.user))
    } else if (data.accessToken) {
      try {
        const userRes = await fetch(`${BASE_URL}/api/v1/users/me`, {
          headers: {
            Authorization: `Bearer ${data.accessToken}`,
          },
        })
        if (userRes.ok) {
          const userData = await userRes.json()
          dispatch(setUser(userData.user || userData))
        }
      } catch (err) {
        console.error('Error fetching user data:', err)
      }
    }

    dispatch(setLoading(false))
    return data
  }, [dispatch])

  const googleLogin = useCallback(async (code: string) => {
    dispatch(setLoading(true))
    dispatch(setError(null))

    try {
      const data = await googleAuth(code)
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken)
        dispatch(setToken(data.accessToken))
      }

      if (data.user) {
        dispatch(setUser(data.user))
      } else if (data.accessToken) {
        try {
          const userRes = await fetch(`${BASE_URL}/api/v1/users/me`, {
            headers: {
              Authorization: `Bearer ${data.accessToken}`,
            },
          })
          if (userRes.ok) {
            const userData = await userRes.json()
            dispatch(setUser(userData.user || userData))
          }
        } catch (err) {
          console.error('Error fetching user data:', err)
        }
      }

      dispatch(setLoading(false))
      return data
    } catch (error) {
      dispatch(setLoading(false))
      console.error('Google login failed:', error)
      throw error
    }
  }, [dispatch])

  const logout = useCallback(async () => {
    try {
      await fetch(`${BASE_URL}/api/v1/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      localStorage.removeItem('accessToken')
      dispatch(clearAuth())
    }
  }, [dispatch])

  const register = useCallback(async (userData: Partial<User> & { password: string }) => {
    const res = await fetch(`${BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Registration failed')
    return data
  }, [])

  const refreshSession = async () => {
    console.warn('refreshSession is deprecated - tokens now last 3 days, no refresh needed')
    return null
  }

  // Inside your useAuth hook in useAuth.ts

  const initiateGoogleLogin = () => {
    // Store redirect destination
    const currentPath = typeof window !== "undefined" ? window.location.pathname : "/dashboard";
    sessionStorage.setItem("authRedirect", currentPath);

    // Configuration
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "265404811439-3a6feinek5pckg02bjg7mfrva4esuqh0.apps.googleusercontent.com";
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    const redirectUri = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI || `${baseUrl}/auth/google-callback`;

    const scope = "email profile";
    const responseType = "code";

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=${responseType}&scope=${scope}&access_type=offline&prompt=consent`;

    window.location.href = googleAuthUrl;
  };

  const forgotPassword = useCallback(async (email: string) => {
    dispatch(setLoading(true));
    try {
      const res = await fetch(`${BASE_URL}/api/v1/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send reset link');
      return data;
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const resetPassword = useCallback(async (token: string, newPassword: string) => {
  dispatch(setLoading(true));
  try {
    const res = await fetch(`${BASE_URL}/api/v1/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to reset password');
    return data;
  } finally {
    dispatch(setLoading(false));
  }
}, [dispatch]);

  return {
    user: user as User | null,
    loading,
    accessToken: token,
    login,
    googleLogin,
    logout,
    register,
    refreshSession,
    initiateGoogleLogin,
    forgotPassword,
    resetPassword,
  }
}