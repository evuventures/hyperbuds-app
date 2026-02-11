"use client";

import React from "react";
import Link from "next/link";
import { Calendar, Users } from "lucide-react";
import type { Collaboration } from "@/types/collaboration.types";

const statusStyles: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-200",
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-200",
  accepted: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-200",
  in_progress: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200",
  completed: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-200",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200",
};

const typeLabel = (type?: string) =>
  type ? type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "Collaboration";

const formatDate = (value?: string) => {
  if (!value) return "TBD";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "TBD";
  return date.toLocaleDateString();
};

const getUserLabel = (creator: Collaboration["creator"]) => {
  if (!creator) return "Creator";
  if (typeof creator === "string") return "Creator";
  return (
    creator.displayName ||
    creator.username ||
    creator.email ||
    "Creator"
  );
};

interface CollaborationListProps {
  items: Collaboration[];
  emptyTitle: string;
  emptyDescription: string;
}

const CollaborationList: React.FC<CollaborationListProps> = ({
  items,
  emptyTitle,
  emptyDescription,
}) => {
  if (!items.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
        <div className="p-5 mb-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full sm:p-6 dark:from-purple-900/30 dark:to-pink-900/30">
          <Users className="w-12 h-12 text-purple-600 sm:w-16 sm:h-16 dark:text-purple-400" />
        </div>
        <h3 className="mb-2 text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
          {emptyTitle}
        </h3>
        <p className="px-4 text-sm text-gray-600 sm:text-base dark:text-gray-400">
          {emptyDescription}
        </p>
      </div>
    );
  }

  return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((collab) => (
        <Link
          key={collab._id}
          href={`/collaborations/${collab._id}`}
          className="group relative overflow-hidden rounded-2xl border border-gray-300 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
        >
          <div className="absolute inset-0 opacity-0 transition-opacity duration-300 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10 group-hover:opacity-100" />
          <div className="relative space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {collab.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {getUserLabel(collab.creator)}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[collab.status] || statusStyles.draft}`}
              >
                {collab.status.replace(/_/g, " ")}
              </span>
            </div>

            <p className="text-sm text-gray-600 line-clamp-2 dark:text-gray-400">
              {collab.description}
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-600 dark:bg-gray-700 dark:text-gray-200">
                {typeLabel(collab.type)}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(collab.details?.scheduledDate)}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {collab.collaborators?.length || 0} collaborators
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default CollaborationList;
