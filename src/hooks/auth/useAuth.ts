'use client'

import { useCallback } from 'react'
import { googleAuth } from '@/lib/api/auth.api'
import { BASE_URL } from '@/config/baseUrl'
import { useAuthStore } from '@/stores/auth.store'

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
  const { user, loading, token, setToken, setUser, setLoading, setError, clearAuth } = useAuthStore()

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true)
    setError(null)

    const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    })

    const data = await res.json()
    if (!res.ok) {
      setLoading(false)
      throw new Error(data.message || 'Login failed')
    }

    if (data.accessToken) {
      setToken(data.accessToken)
    }

    if (data.user) {
      setUser(data.user)
    } else if (data.accessToken) {
      try {
        const userRes = await fetch(`${BASE_URL}/api/v1/users/me`, {
          headers: {
            Authorization: `Bearer ${data.accessToken}`,
          },
        })
        if (userRes.ok) {
          const userData = await userRes.json()
          setUser(userData.user || userData)
        }
      } catch (err) {
        console.error('Error fetching user data:', err)
      }
    }

    setLoading(false)
    return data
  }, [setToken, setUser, setLoading, setError])

  const googleLogin = useCallback(async (code: string) => {
    setLoading(true)
    setError(null)

    try {
      const data = await googleAuth(code)
      if (data.accessToken) {
        setToken(data.accessToken)
      }

      if (data.user) {
        setUser(data.user)
      } else if (data.accessToken) {
        try {
          const userRes = await fetch(`${BASE_URL}/api/v1/users/me`, {
            headers: {
              Authorization: `Bearer ${data.accessToken}`,
            },
          })
          if (userRes.ok) {
            const userData = await userRes.json()
            setUser(userData.user || userData)
          }
        } catch (err) {
          console.error('Error fetching user data:', err)
        }
      }

      setLoading(false)
      return data
    } catch (error) {
      setLoading(false)
      console.error('Google login failed:', error)
      throw error
    }
  }, [setToken, setUser, setLoading, setError])

  const logout = useCallback(async () => {
    try {
      await fetch(`${BASE_URL}/api/v1/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      clearAuth()
    }
  }, [clearAuth])

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

  return {
    user: user as User | null,
    loading,
    accessToken: token,
    login,
    googleLogin,
    logout,
    register,
    refreshSession,
  }
}