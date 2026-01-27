'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setError, setInitialized, setLoading, setToken, setUser } from '@/store/slices/authSlice';
import { BASE_URL } from '@/config/baseUrl';

export const AuthBootstrap = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);
  const initialized = useAppSelector((state) => state.auth.initialized);

  useEffect(() => {
    if (initialized) return;
    const storedToken = localStorage.getItem('accessToken');
    if (storedToken) {
      dispatch(setToken(storedToken));
    }
    dispatch(setInitialized(true));
  }, [dispatch, initialized]);

  useEffect(() => {
    if (!token) return;

    const fetchUser = async () => {
      try {
        dispatch(setLoading(true));
        const res = await fetch(`${BASE_URL}/api/v1/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          dispatch(setUser(data.user ?? data));
          dispatch(setError(null));
        } else if (res.status === 401) {
          localStorage.removeItem('accessToken');
          dispatch(setToken(null));
          dispatch(setUser(null));
        }
      } catch (err) {
        dispatch(setError(err instanceof Error ? err.message : 'Failed to load user'));
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchUser();
  }, [dispatch, token]);

  return <>{children}</>;
};
