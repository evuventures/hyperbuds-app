'use client';

import { useCallback, useSyncExternalStore } from 'react';

export type SidebarAppearance = 'brand' | 'classic' | 'glass';

export const SIDEBAR_APPEARANCE_STORAGE_KEY = 'hyperbuds-sidebar-appearance';
const DEFAULT_APPEARANCE: SidebarAppearance = 'brand';
const VALID: SidebarAppearance[] = ['brand', 'classic', 'glass'];

const listeners = new Set<() => void>();
let memoryAppearance: SidebarAppearance | null = null;

function readAppearance(): SidebarAppearance {
  if (typeof window === 'undefined') return DEFAULT_APPEARANCE;
  try {
    const stored = window.localStorage.getItem(SIDEBAR_APPEARANCE_STORAGE_KEY);
    if (VALID.includes(stored as SidebarAppearance)) return stored as SidebarAppearance;
  } catch {
    // fall through to in-memory value
  }
  return memoryAppearance ?? DEFAULT_APPEARANCE;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === SIDEBAR_APPEARANCE_STORAGE_KEY) listener();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

/** Shared, persisted sidebar style (brand purple, classic, or glassmorphism). */
export function useSidebarAppearance() {
  const appearance = useSyncExternalStore(subscribe, readAppearance, () => DEFAULT_APPEARANCE);

  const setAppearance = useCallback((next: SidebarAppearance) => {
    memoryAppearance = next;
    try {
      window.localStorage.setItem(SIDEBAR_APPEARANCE_STORAGE_KEY, next);
    } catch {
      // Storage may be unavailable (private mode); the in-memory notify still applies for this tab.
    }
    listeners.forEach((listener) => listener());
  }, []);

  return { appearance, setAppearance };
}
