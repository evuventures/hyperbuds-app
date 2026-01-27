'use client';

import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSystemTheme, setThemeLoaded, setThemeMode, toggleDarkMode as toggleDarkModeAction } from '@/store/slices/uiSlice';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (isDark: boolean) => void;
}

export const useTheme = (): ThemeContextType => {
  const dispatch = useAppDispatch();
  const { isDarkMode } = useAppSelector((state) => state.ui.theme);

  return {
    isDarkMode,
    toggleDarkMode: () => dispatch(toggleDarkModeAction()),
    setDarkMode: (isDark: boolean) => dispatch(setThemeMode(isDark ? 'dark' : 'light')),
  };
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { isDarkMode, preference, isLoaded } = useAppSelector((state) => state.ui.theme);

  useEffect(() => {
    const savedTheme = localStorage.getItem('hyperbuds-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || savedTheme === 'light') {
      dispatch(setThemeMode(savedTheme));
    } else {
      dispatch(setSystemTheme(prefersDark));
    }
    dispatch(setThemeLoaded(true));
  }, [dispatch]);

  useEffect(() => {
    if (!isLoaded) return;

    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    if (preference === 'system') {
      localStorage.removeItem('hyperbuds-theme');
    } else {
      localStorage.setItem('hyperbuds-theme', preference);
    }
  }, [isDarkMode, preference, isLoaded]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      if (preference === 'system') {
        dispatch(setSystemTheme(e.matches));
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [dispatch, preference]);

  return <>{children}</>;
};
