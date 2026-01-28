'use client';

import React, { useEffect } from 'react';
import { useUiStore } from '@/stores/ui.store';

interface SidebarContextType {
  sidebarCollapsed: boolean;
  sidebarOpen: boolean;
  rightSidebarOpen: boolean;
  isInitialized: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  setRightSidebarOpen: (open: boolean) => void;
  toggleSidebarCollapse: () => void;
  toggleSidebarOpen: () => void;
  toggleRightSidebarOpen: () => void;
}

export const useSidebar = (): SidebarContextType => {
  const sidebar = useUiStore((state) => state.sidebar);
  const setSidebarCollapsed = useUiStore((state) => state.setSidebarCollapsed);
  const setSidebarOpen = useUiStore((state) => state.setSidebarOpen);
  const setRightSidebarOpen = useUiStore((state) => state.setRightSidebarOpen);
  const toggleSidebarCollapse = useUiStore((state) => state.toggleSidebarCollapse);
  const toggleSidebarOpen = useUiStore((state) => state.toggleSidebarOpen);
  const toggleRightSidebarOpen = useUiStore((state) => state.toggleRightSidebarOpen);

  return {
    sidebarCollapsed: sidebar.sidebarCollapsed,
    sidebarOpen: sidebar.sidebarOpen,
    rightSidebarOpen: sidebar.rightSidebarOpen,
    isInitialized: sidebar.isInitialized,
    setSidebarCollapsed,
    setSidebarOpen,
    setRightSidebarOpen,
    toggleSidebarCollapse,
    toggleSidebarOpen,
    toggleRightSidebarOpen,
  };
};

interface SidebarProviderProps {
  children: React.ReactNode;
}

export const SidebarProvider: React.FC<SidebarProviderProps> = ({ children }) => {
  const sidebarCollapsed = useUiStore((state) => state.sidebar.sidebarCollapsed);
  const isInitialized = useUiStore((state) => state.sidebar.isInitialized);
  const setSidebarCollapsed = useUiStore((state) => state.setSidebarCollapsed);
  const setSidebarOpen = useUiStore((state) => state.setSidebarOpen);
  const setSidebarInitialized = useUiStore((state) => state.setSidebarInitialized);

  useEffect(() => {
    const savedCollapsedState = localStorage.getItem('sidebarCollapsed');
    const isLargeScreen = window.innerWidth >= 1280;

    if (savedCollapsedState !== null && isLargeScreen) {
      setSidebarCollapsed(JSON.parse(savedCollapsedState));
    } else if (!isLargeScreen) {
      setSidebarCollapsed(true);
    } else {
      setSidebarCollapsed(false);
    }

    setSidebarInitialized(true);
  }, [setSidebarCollapsed, setSidebarInitialized]);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('sidebarCollapsed', JSON.stringify(sidebarCollapsed));
    }
  }, [sidebarCollapsed, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;

    const handleResize = () => {
      if (window.innerWidth >= 1024) setSidebarOpen(false);

      if (window.innerWidth < 1280) {
        setSidebarCollapsed(true);
      } else {
        const savedCollapsedState = localStorage.getItem('sidebarCollapsed');
        if (savedCollapsedState !== null) {
          setSidebarCollapsed(JSON.parse(savedCollapsedState));
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isInitialized, setSidebarOpen, setSidebarCollapsed]);

  return <>{children}</>;
};
