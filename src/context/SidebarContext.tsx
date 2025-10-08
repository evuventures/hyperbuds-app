'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

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

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
   const context = useContext(SidebarContext);
   if (context === undefined) {
      throw new Error('useSidebar must be used within a SidebarProvider');
   }
   return context;
};

interface SidebarProviderProps {
   children: React.ReactNode;
}

export const SidebarProvider: React.FC<SidebarProviderProps> = ({ children }) => {
   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
   const [sidebarOpen, setSidebarOpen] = useState(false);
   const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
   const [isInitialized, setIsInitialized] = useState(false);

   // Initialize sidebar state from localStorage
   useEffect(() => {
      const savedCollapsedState = localStorage.getItem('sidebarCollapsed');
      const isLargeScreen = window.innerWidth >= 1280;

      if (savedCollapsedState !== null && isLargeScreen) {
         // On large screens, use saved preference
         const parsedState = JSON.parse(savedCollapsedState);
         setSidebarCollapsed(parsedState);
      } else if (!isLargeScreen) {
         // On small screens, always collapse
         setSidebarCollapsed(true);
      } else {
         // No saved state, use default false
         setSidebarCollapsed(false);
      }

      setIsInitialized(true);
   }, []);

   // Save sidebar state to localStorage
   useEffect(() => {
      if (isInitialized) {
         localStorage.setItem('sidebarCollapsed', JSON.stringify(sidebarCollapsed));
      }
   }, [sidebarCollapsed, isInitialized]);

   // Handle window resize
   useEffect(() => {
      if (!isInitialized) return;

      const handleResize = () => {
         if (window.innerWidth >= 1024) setSidebarOpen(false);

         // Only auto-collapse on small screens, don't override user preference on large screens
         if (window.innerWidth < 1280) {
            setSidebarCollapsed(true);
         } else {
            // On large screens, respect the saved user preference
            const savedCollapsedState = localStorage.getItem('sidebarCollapsed');
            if (savedCollapsedState !== null) {
               setSidebarCollapsed(JSON.parse(savedCollapsedState));
            }
         }
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
   }, [isInitialized]);

   const toggleSidebarCollapse = () => {
      setSidebarCollapsed(!sidebarCollapsed);
   };

   const toggleSidebarOpen = () => {
      setSidebarOpen(!sidebarOpen);
   };

   const toggleRightSidebarOpen = () => {
      setRightSidebarOpen(!rightSidebarOpen);
   };

   return (
      <SidebarContext.Provider
         value={{
            sidebarCollapsed,
            sidebarOpen,
            rightSidebarOpen,
            isInitialized,
            setSidebarCollapsed,
            setSidebarOpen,
            setRightSidebarOpen,
            toggleSidebarCollapse,
            toggleSidebarOpen,
            toggleRightSidebarOpen,
         }}
      >
         {children}
      </SidebarContext.Provider>
   );
};
