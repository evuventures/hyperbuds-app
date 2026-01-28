'use client';

import React, { useEffect } from 'react';
import { useUiStore } from '@/stores/ui.store';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (isDark: boolean) => void;
}

export const useTheme = (): ThemeContextType => {
  const isDarkMode = useUiStore((state) => state.theme.isDarkMode);
  const toggleDarkMode = useUiStore((state) => state.toggleDarkMode);
  const setThemeMode = useUiStore((state) => state.setThemeMode);

  return {
    isDarkMode,
    toggleDarkMode,
    setDarkMode: (isDark: boolean) => setThemeMode(isDark ? 'dark' : 'light'),
  };
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { isDarkMode, preference, isLoaded } = useUiStore((state) => state.theme);
  const setThemeMode = useUiStore((state) => state.setThemeMode);
  const setSystemTheme = useUiStore((state) => state.setSystemTheme);
  const setThemeLoaded = useUiStore((state) => state.setThemeLoaded);

  useEffect(() => {
    const savedTheme = localStorage.getItem('hyperbuds-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || savedTheme === 'light') {
      setThemeMode(savedTheme);
    } else {
      setSystemTheme(prefersDark);
    }
    setThemeLoaded(true);
  }, [setThemeMode, setSystemTheme, setThemeLoaded]);

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
        setSystemTheme(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [preference, setSystemTheme]);

  return <>{children}</>;
};
