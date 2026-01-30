"use client";

import React, { useEffect, useMemo, useState } from "react";
import CollaborationList from "@/components/collaboration/CollaborationList";
import { collaborationApi } from "@/lib/api/collaboration.api";
import type { Collaboration } from "@/types/collaboration.types";
import { useRouter } from "next/navigation";
import BackLink from "@/components/collaboration/BackLink";
import CollaborationNav from "@/components/collaboration/CollaborationNav";

export default function ActiveCollaborationsPage() {
  const router = useRouter();
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCollaborations = async () => {
    try {
      setIsLoading(true);
      const all = await collaborationApi.getCollaborations({ limit: 50 });
      setCollaborations(all);
      setError(null);
    } catch (err) {
      console.error("Failed to load active collaborations:", err);
      setError(err instanceof Error ? err.message : "Failed to load collaborations");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCollaborations();
  }, []);

  const activeCollaborations = useMemo(
    () => collaborations.filter((collab) => ["accepted", "in_progress"].includes(collab.status)),
    [collaborations]
  );

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
        <div className="max-w-6xl mx-auto px-6 py-12 space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <BackLink onClick={() => router.back()} />
            <CollaborationNav />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">
              Active Collaborations
            </h1>
            <p className="text-sm text-gray-500 sm:text-base dark:text-gray-400">
              Projects currently in progress or accepted.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              {isLoading ? (
                <div className="flex flex-col justify-center items-center py-12 sm:py-16">
                  <div className="mb-4 w-12 h-12 text-purple-600 animate-spin sm:w-16 sm:h-16">
                    <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                  </div>
                  <p className="text-base font-medium text-gray-600 sm:text-lg dark:text-gray-400">Loading active collaborations...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col justify-center items-center py-12 sm:py-16">
                  <div className="p-5 mb-4 bg-red-50 rounded-xl sm:p-6 dark:bg-red-900/20">
                    <p className="text-base font-semibold text-red-600 sm:text-lg dark:text-red-400">
                      Failed to load collaborations
                    </p>
                    <p className="mt-1 text-xs text-red-500 sm:text-sm dark:text-red-400">
                      {error}
                    </p>
                  </div>
                </div>
              ) : (
                <CollaborationList
                  items={activeCollaborations}
                  emptyTitle="No Active Collaborations"
                  emptyDescription="Accept an invite or start a new collaboration to see it here."
                />
              )}
          </div>
        </div>
      </div>
  );
}
