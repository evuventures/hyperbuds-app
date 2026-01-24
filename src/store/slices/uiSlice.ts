import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ThemePreference = 'system' | 'dark' | 'light';

interface ThemeState {
  isDarkMode: boolean;
  preference: ThemePreference;
  isLoaded: boolean;
}

interface SidebarState {
  sidebarCollapsed: boolean;
  sidebarOpen: boolean;
  rightSidebarOpen: boolean;
  isInitialized: boolean;
}

export interface UiState {
  theme: ThemeState;
  sidebar: SidebarState;
}

const initialState: UiState = {
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
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setThemeMode(state, action: PayloadAction<'dark' | 'light'>) {
      state.theme.isDarkMode = action.payload === 'dark';
      state.theme.preference = action.payload;
    },
    setSystemTheme(state, action: PayloadAction<boolean>) {
      state.theme.isDarkMode = action.payload;
      state.theme.preference = 'system';
    },
    toggleDarkMode(state) {
      state.theme.isDarkMode = !state.theme.isDarkMode;
      state.theme.preference = state.theme.isDarkMode ? 'dark' : 'light';
    },
    setThemeLoaded(state, action: PayloadAction<boolean>) {
      state.theme.isLoaded = action.payload;
    },
    setSidebarCollapsed(state, action: PayloadAction<boolean>) {
      state.sidebar.sidebarCollapsed = action.payload;
    },
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.sidebar.sidebarOpen = action.payload;
    },
    setRightSidebarOpen(state, action: PayloadAction<boolean>) {
      state.sidebar.rightSidebarOpen = action.payload;
    },
    setSidebarInitialized(state, action: PayloadAction<boolean>) {
      state.sidebar.isInitialized = action.payload;
    },
    toggleSidebarCollapse(state) {
      state.sidebar.sidebarCollapsed = !state.sidebar.sidebarCollapsed;
    },
    toggleSidebarOpen(state) {
      state.sidebar.sidebarOpen = !state.sidebar.sidebarOpen;
    },
    toggleRightSidebarOpen(state) {
      state.sidebar.rightSidebarOpen = !state.sidebar.rightSidebarOpen;
    },
  },
});

export const {
  setThemeMode,
  setSystemTheme,
  toggleDarkMode,
  setThemeLoaded,
  setSidebarCollapsed,
  setSidebarOpen,
  setRightSidebarOpen,
  setSidebarInitialized,
  toggleSidebarCollapse,
  toggleSidebarOpen,
  toggleRightSidebarOpen,
} = uiSlice.actions;

export default uiSlice.reducer;
