// hooks/useAuth.ts
'use client'

import { useEffect, useState } from 'react'

const BASE_URL = 'https://api-hyperbuds-backend.onrender.com'

interface User {
  id: string;
  name: string;
  email: string;
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
        } else {
          localStorage.removeItem('accessToken')
        }
      } catch (err) {
        console.error('Error loading user:', err)
        // For demo purposes, set a mock user if API fails
        setUser({
          id: 'current-user',
          name: 'Demo User',
          email: 'demo@example.com'
        })
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
      credentials: 'include' // ensures refresh token cookie is set
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Login failed')

    localStorage.setItem('accessToken', data.accessToken)
    setUser(data.user)
    return data
  }

  const logout = async () => {
    await fetch(`${BASE_URL}/api/v1/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    })
    localStorage.removeItem('accessToken')
    setUser(null)
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

  const refreshSession = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
        method: 'POST',
        credentials: 'include'
      })
      const data = await res.json()

      if (res.ok) {
        localStorage.setItem('accessToken', data.accessToken)
        return data.accessToken
      } else {
        setUser(null)
        localStorage.removeItem('accessToken')
        return null
      }
    } catch (err) {
      console.error('Refresh session failed:', err)
      setUser(null)
      localStorage.removeItem('accessToken')
      return null
    }
  }

  const accessToken = isClient ? localStorage.getItem('accessToken') : null

  return { user, loading, accessToken, login, logout, register, refreshSession }
}
