// components/AuthProvider.tsx
'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useAuth } from '@/hooks/auth/useAuth'

interface AuthContextType {
  user: { id: string; name: string; email: string; avatar?: string } | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; user: { id: string; name: string; email: string } }>
  logout: () => Promise<void>
  register: (userData: { name: string; email: string; password: string }) => Promise<{ success: boolean; user: { id: string; name: string; email: string } }>
  refreshSession: () => Promise<string | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth()

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}
