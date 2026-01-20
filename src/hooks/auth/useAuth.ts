// hooks/useAuth.ts
'use client'

import { useEffect, useState } from 'react'
import { googleAuth } from '@/lib/api/auth.api'

const BASE_URL = 'https://api-hyperbuds-backend.onrender.com'

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isClient, setIsClient] = useState(false)

  // Fix hydration issue by ensuring we're on the client
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Load user on mount
  useEffect(() => {
    if (!isClient) return

    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('accessToken')
        if (!token) {
          setLoading(false)
          return
        }

        const res = await fetch(`${BASE_URL}/api/v1/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (res.ok) {
          const data = await res.json()
          setUser(data.user)
        } else if (res.status === 401) {
          // Token expired or invalid - clear it and set user to null
          // No refresh attempt since tokens now last 3 days
          localStorage.removeItem('accessToken')
          setUser(null)
        }
      } catch (err) {
        console.error('Error loading user:', err)
        // Don't set mock user on error - just clear auth state
        localStorage.removeItem('accessToken')
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [isClient])

  const login = async (email: string, password: string) => {
    const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include'
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Login failed')

    localStorage.setItem('accessToken', data.accessToken)
    
    // Fetch user data if not in response
    if (data.user) {
      setUser(data.user)
    } else {
      // Fetch user data separately
      try {
        const userRes = await fetch(`${BASE_URL}/api/v1/users/me`, {
          headers: {
            'Authorization': `Bearer ${data.accessToken}`
          }
        })
        if (userRes.ok) {
          const userData = await userRes.json()
          setUser(userData.user || userData)
        }
      } catch (err) {
        console.error('Error fetching user data:', err)
      }
    }
    
    return data
  }

  const googleLogin = async (code: string) => {
    try {
      const data = await googleAuth(code)
      localStorage.setItem('accessToken', data.accessToken)
      
      if (data.user) {
        setUser(data.user)
      } else {
        // Fetch user data separately
        try {
          const userRes = await fetch(`${BASE_URL}/api/v1/users/me`, {
            headers: {
              'Authorization': `Bearer ${data.accessToken}`
            }
          })
          if (userRes.ok) {
            const userData = await userRes.json()
            setUser(userData.user || userData)
          }
        } catch (err) {
          console.error('Error fetching user data:', err)
        }
      }
      
      return data
    } catch (error) {
      console.error('Google login failed:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await fetch(`${BASE_URL}/api/v1/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      })
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      localStorage.removeItem('accessToken')
      setUser(null)
    }
  }

  const register = async (userData: Partial<User> & { password: string }) => {
    const res = await fetch(`${BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Registration failed')
    return data
  }

  // Note: refreshSession is deprecated - tokens now last 3 days, no refresh needed
  // Keeping for backward compatibility but it should not be used
  const refreshSession = async () => {
    console.warn('refreshSession is deprecated - tokens now last 3 days, no refresh needed')
    return null
  }

  const accessToken = isClient ? localStorage.getItem('accessToken') : null

  return { user, loading, accessToken, login, googleLogin, logout, register, refreshSession }
}