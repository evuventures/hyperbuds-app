"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from "react";

const STORAGE_KEY = "marketplace_archived_bookings";

interface BookingArchiveContextType {
  archiveBooking: (bookingId: string) => void;
  unarchiveBooking: (bookingId: string) => void;
  isArchived: (bookingId: string) => boolean;
  getArchivedBookings: () => Set<string>;
  archivedCount: number;
  archiveVersion: number; // Version counter to force re-renders
}

const BookingArchiveContext = createContext<BookingArchiveContextType | undefined>(undefined);

export function BookingArchiveProvider({ children }: { children: ReactNode }) {
  const [archivedIds, setArchivedIds] = useState<Set<string>>(new Set());
  const [archiveVersion, setArchiveVersion] = useState(0);

  // Load archived bookings from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const ids = JSON.parse(stored) as string[];
        setArchivedIds(new Set(ids));
      }
    } catch (error) {
      console.error("Failed to load archived bookings:", error);
    }
  }, []);

  // Save to localStorage whenever archivedIds changes
  useEffect(() => {
    try {
      const idsArray = Array.from(archivedIds);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(idsArray));
    } catch (error) {
      console.error("Failed to save archived bookings:", error);
    }
  }, [archivedIds]);

  const archiveBooking = useCallback((bookingId: string) => {
    setArchivedIds((prev) => {
      if (prev.has(bookingId)) return prev; // Already archived
      setArchiveVersion((v) => v + 1); // Increment version to force re-render
      return new Set([...prev, bookingId]);
    });
  }, []);

  const unarchiveBooking = useCallback((bookingId: string) => {
    setArchivedIds((prev) => {
      if (!prev.has(bookingId)) return prev; // Not archived
      setArchiveVersion((v) => v + 1); // Increment version to force re-render
      const next = new Set(prev);
      next.delete(bookingId);
      return next;
    });
  }, []);

  const isArchived = useCallback(
    (bookingId: string) => {
      return archivedIds.has(bookingId);
    },
    [archivedIds]
  );

  const getArchivedBookings = useCallback(() => {
    return archivedIds;
  }, [archivedIds]);

  // Convert Set to array for dependency tracking - ensures React detects changes
  const archivedIdsArray = useMemo(() => Array.from(archivedIds).sort(), [archivedIds]);

  const contextValue = useMemo(
    () => ({
      archiveBooking,
      unarchiveBooking,
      isArchived,
      getArchivedBookings,
      archivedCount: archivedIds.size,
      archiveVersion,
    }),
    [archiveBooking, unarchiveBooking, isArchived, getArchivedBookings, archivedIdsArray, archivedIds.size, archiveVersion]
  );

  return (
    <BookingArchiveContext.Provider value={contextValue}>
      {children}
    </BookingArchiveContext.Provider>
  );
}

export function useBookingArchive() {
  const context = useContext(BookingArchiveContext);
  if (context === undefined) {
    throw new Error("useBookingArchive must be used within a BookingArchiveProvider");
  }
  return context;
}
