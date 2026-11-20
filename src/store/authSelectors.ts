import { store } from './store';

export const getAccessToken = (): string | null => {
  const reduxToken = store.getState().auth.token;
  if (reduxToken && typeof reduxToken === 'string' && reduxToken.trim()) {
    return reduxToken;
  }
  if (typeof window !== 'undefined') {
    try {
      const stored = window.localStorage.getItem('accessToken');
      if (stored && stored.trim()) return stored;
    } catch {
      // Storage may be restricted in private webviews
    }
  }
  return null;
};
