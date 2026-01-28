import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface ThemeState {
  isDarkMode: boolean;
  preference: 'light' | 'dark' | 'system';
  isLoaded: boolean;
}

interface SidebarState {
  sidebarCollapsed: boolean;
  sidebarOpen: boolean;
  rightSidebarOpen: boolean;
  isInitialized: boolean;
}

interface UiState {
  theme: ThemeState;
  sidebar: SidebarState;
  // Theme actions
  setThemeMode: (mode: 'light' | 'dark' | 'system') => void;
  setSystemTheme: (isDark: boolean) => void;
  setThemeLoaded: (loaded: boolean) => void;
  toggleDarkMode: () => void;
  // Sidebar actions
  setSidebarCollapsed: (collapsed: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  setRightSidebarOpen: (open: boolean) => void;
  setSidebarInitialized: (initialized: boolean) => void;
  toggleSidebarCollapse: () => void;
  toggleSidebarOpen: () => void;
  toggleRightSidebarOpen: () => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      theme: {
        isDarkMode: false,
        preference: 'system',
        isLoaded: false,
      },
      sidebar: {
        sidebarCollapsed: false,
        sidebarOpen: false,
        rightSidebarOpen: false,
        isInitialized: false,
      },
      // Theme actions
      setThemeMode: (mode) => set((state) => ({
        theme: { ...state.theme, preference: mode, isDarkMode: mode === 'dark' ? true : mode === 'light' ? false : state.theme.isDarkMode },
      })),
      setSystemTheme: (isDark) => set((state) => ({
        theme: { ...state.theme, isDarkMode: isDark },
      })),
      setThemeLoaded: (loaded) => set((state) => ({
        theme: { ...state.theme, isLoaded: loaded },
      })),
      toggleDarkMode: () => set((state) => ({
        theme: { ...state.theme, isDarkMode: !state.theme.isDarkMode },
      })),
      // Sidebar actions
      setSidebarCollapsed: (collapsed) => set((state) => ({
        sidebar: { ...state.sidebar, sidebarCollapsed: collapsed },
      })),
      setSidebarOpen: (open) => set((state) => ({
        sidebar: { ...state.sidebar, sidebarOpen: open },
      })),
      setRightSidebarOpen: (open) => set((state) => ({
        sidebar: { ...state.sidebar, rightSidebarOpen: open },
      })),
      setSidebarInitialized: (initialized) => set((state) => ({
        sidebar: { ...state.sidebar, isInitialized: initialized },
      })),
      toggleSidebarCollapse: () => set((state) => ({
        sidebar: { ...state.sidebar, sidebarCollapsed: !state.sidebar.sidebarCollapsed },
      })),
      toggleSidebarOpen: () => set((state) => ({
        sidebar: { ...state.sidebar, sidebarOpen: !state.sidebar.sidebarOpen },
      })),
      toggleRightSidebarOpen: () => set((state) => ({
        sidebar: { ...state.sidebar, rightSidebarOpen: !state.sidebar.rightSidebarOpen },
      })),
    }),
    {
      name: 'ui-storage',
      storage: typeof window !== 'undefined' ? createJSONStorage(() => localStorage) : undefined,
      partialize: (state) => ({
        theme: { preference: state.theme.preference },
        sidebar: { sidebarCollapsed: state.sidebar.sidebarCollapsed },
      }),
      skipHydration: true, // Skip SSR hydration to avoid issues
    }
  )
);
