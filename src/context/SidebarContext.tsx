'use client';

import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setRightSidebarOpen,
  setSidebarCollapsed,
  setSidebarInitialized,
  setSidebarOpen,
  toggleRightSidebarOpen,
  toggleSidebarCollapse,
  toggleSidebarOpen,
} from '@/store/slices/uiSlice';

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
  const dispatch = useAppDispatch();
  const sidebar = useAppSelector((state) => state.ui.sidebar);

  return {
    sidebarCollapsed: sidebar.sidebarCollapsed,
    sidebarOpen: sidebar.sidebarOpen,
    rightSidebarOpen: sidebar.rightSidebarOpen,
    isInitialized: sidebar.isInitialized,
    setSidebarCollapsed: (collapsed) => dispatch(setSidebarCollapsed(collapsed)),
    setSidebarOpen: (open) => dispatch(setSidebarOpen(open)),
    setRightSidebarOpen: (open) => dispatch(setRightSidebarOpen(open)),
    toggleSidebarCollapse: () => dispatch(toggleSidebarCollapse()),
    toggleSidebarOpen: () => dispatch(toggleSidebarOpen()),
    toggleRightSidebarOpen: () => dispatch(toggleRightSidebarOpen()),
  };
};

interface SidebarProviderProps {
  children: React.ReactNode;
}

export const SidebarProvider: React.FC<SidebarProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { sidebarCollapsed, isInitialized } = useAppSelector((state) => state.ui.sidebar);

  useEffect(() => {
    const savedCollapsedState = localStorage.getItem('sidebarCollapsed');
    const isLargeScreen = window.innerWidth >= 1280;

    if (savedCollapsedState !== null && isLargeScreen) {
      dispatch(setSidebarCollapsed(JSON.parse(savedCollapsedState)));
    } else if (!isLargeScreen) {
      dispatch(setSidebarCollapsed(true));
    } else {
      dispatch(setSidebarCollapsed(false));
    }

    dispatch(setSidebarInitialized(true));
  }, [dispatch]);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('sidebarCollapsed', JSON.stringify(sidebarCollapsed));
    }
  }, [sidebarCollapsed, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;

    const handleResize = () => {
      if (window.innerWidth >= 1024) dispatch(setSidebarOpen(false));

      if (window.innerWidth < 1280) {
        dispatch(setSidebarCollapsed(true));
      } else {
        const savedCollapsedState = localStorage.getItem('sidebarCollapsed');
        if (savedCollapsedState !== null) {
          dispatch(setSidebarCollapsed(JSON.parse(savedCollapsedState)));
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [dispatch, isInitialized]);

  return <>{children}</>;
};
