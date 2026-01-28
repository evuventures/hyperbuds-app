import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface AuthUser {
  id?: string;
  _id?: string;
  name?: string;
  username?: string;
  displayName?: string;
  email?: string;
  avatar?: string;
  [key: string]: unknown;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  loading: boolean;
  initialized: boolean;
  error: string | null;
  setToken: (token: string | null) => void;
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  setError: (error: string | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      loading: false,
      initialized: false,
      error: null,
      setToken: (token) => {
        set({ token });
        if (token) {
          localStorage.setItem('accessToken', token);
        } else {
          localStorage.removeItem('accessToken');
        }
      },
      setUser: (user) => set({ user }),
      setLoading: (loading) => set({ loading }),
      setInitialized: (initialized) => set({ initialized }),
      setError: (error) => set({ error }),
      clearAuth: () => {
        set({ token: null, user: null, error: null, loading: false });
        localStorage.removeItem('accessToken');
      },
    }),
    {
      name: 'auth-storage',
      storage: typeof window !== 'undefined' ? createJSONStorage(() => localStorage) : undefined,
      partialize: (state) => ({ token: state.token }), // Only persist token
      skipHydration: true, // Skip SSR hydration to avoid issues
    }
  )
);

// Selector function matching Redux API
export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') {
    // SSR: return null, token will be loaded on client
    return null;
  }
  const token = useAuthStore.getState().token;
  return token || localStorage.getItem('accessToken');
};
