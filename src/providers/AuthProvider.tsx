// components/AuthProvider.tsx
'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useAuth } from '@/hooks/auth/useAuth'

interface AuthContextType {
  user: any
  loading: boolean
  login: (email: string, password: string) => Promise<any>
  logout: () => Promise<void>
  register: (userData: any) => Promise<any>
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
