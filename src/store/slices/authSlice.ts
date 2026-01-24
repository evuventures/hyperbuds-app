import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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

export interface AuthState {
  token: string | null;
  user: AuthUser | null;
  loading: boolean;
  initialized: boolean;
  error: string | null;
}

const initialState: AuthState = {
  token: null,
  user: null,
  loading: false,
  initialized: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken(state, action: PayloadAction<string | null>) {
      state.token = action.payload;
    },
    setUser(state, action: PayloadAction<AuthUser | null>) {
      state.user = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setInitialized(state, action: PayloadAction<boolean>) {
      state.initialized = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    clearAuth(state) {
      state.token = null;
      state.user = null;
      state.error = null;
      state.loading = false;
    },
  },
});

export const {
  setToken,
  setUser,
  setLoading,
  setInitialized,
  setError,
  clearAuth,
} = authSlice.actions;

export default authSlice.reducer;
