'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { BASE_URL } from '@/config/baseUrl';

export const AuthBootstrap = ({ children }: { children: React.ReactNode }) => {
  const { token, initialized, setToken, setUser, setLoading, setError, setInitialized, clearAuth } = useAuthStore();

  useEffect(() => {
    if (initialized) return;
    const storedToken = localStorage.getItem('accessToken');
    if (storedToken) {
      setToken(storedToken);
    }
    setInitialized(true);
  }, [initialized, setToken, setInitialized]);

  useEffect(() => {
    if (!token) return;

    const fetchUser = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${BASE_URL}/api/v1/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user ?? data);
          setError(null);
        } else if (res.status === 401) {
          localStorage.removeItem('accessToken');
          clearAuth();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load user');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token, setLoading, setUser, setError, clearAuth]);

  return <>{children}</>;
};
