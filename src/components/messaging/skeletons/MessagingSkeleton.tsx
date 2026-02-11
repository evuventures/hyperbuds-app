import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const MessagingSkeleton: React.FC = () => {
  return (
    <div className="flex h-[90vh] bg-gray-100 dark:bg-gray-900">
      {/* Chat List Skeleton */}
      <div className="w-1/3 bg-white border-r border-gray-200 dark:border-gray-700 dark:bg-gray-800">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-32 rounded" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
        <div className="p-4">
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
        <div className="space-y-2 px-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="flex items-center space-x-3 p-3">
              <Skeleton className="h-12 w-12 flex-shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24 rounded" />
                  <Skeleton className="h-3 w-12 rounded" />
                </div>
                <Skeleton className="h-3 w-32 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Interface Skeleton */}
      <div className="flex flex-1 flex-col">
        <div className="border-b border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-10 w-10 flex-shrink-0 rounded-full" />
            <div className="flex-1">
              <Skeleton className="mb-2 h-4 w-32 rounded" />
              <Skeleton className="h-3 w-20 rounded" />
            </div>
            <div className="flex space-x-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className={`flex ${index % 3 === 0 ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs rounded-lg p-3 lg:max-w-md ${
                  index % 3 === 0
                    ? "bg-blue-500/20 dark:bg-blue-500/20"
                    : "bg-gray-100 dark:bg-gray-700"
                }`}
              >
                <Skeleton
                  className={`h-4 w-48 rounded ${
                    index % 3 === 0
                      ? "bg-blue-400/50 dark:bg-blue-400/50"
                      : ""
                  }`}
                />
                <Skeleton
                  className={`mt-2 h-3 w-16 rounded ${
                    index % 3 === 0
                      ? "bg-blue-400/50 dark:bg-blue-400/50"
                      : ""
                  }`}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="px-4 py-2">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-4 w-24 rounded" />
          </div>
        </div>

        <div className="border-t border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-8 w-8 flex-shrink-0 rounded-full" />
            <Skeleton className="h-10 flex-1 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-10 w-20 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const ConversationListSkeleton: React.FC = () => (
  <div className="space-y-2">
    {Array.from({ length: 5 }).map((_, index) => (
      <div
        key={index}
        className="flex items-center space-x-3 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-700"
      >
        <Skeleton className="h-12 w-12 flex-shrink-0 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-3 w-12 rounded" />
          </div>
          <Skeleton className="h-3 w-32 rounded" />
        </div>
      </div>
    ))}
  </div>
);

export const MessageListSkeleton: React.FC = () => (
  <div className="space-y-4">
    {Array.from({ length: 8 }).map((_, index) => (
      <div
        key={index}
        className={`flex ${index % 3 === 0 ? "justify-end" : "justify-start"}`}
      >
        <div
          className={`max-w-xs rounded-lg p-3 lg:max-w-md ${
            index % 3 === 0
              ? "bg-blue-500/20 dark:bg-blue-500/20"
              : "bg-gray-100 dark:bg-gray-700"
          }`}
        >
          <Skeleton
            className={`h-4 w-48 rounded ${
              index % 3 === 0 ? "bg-blue-400/50 dark:bg-blue-400/50" : ""
            }`}
          />
          <Skeleton
            className={`mt-2 h-3 w-16 rounded ${
              index % 3 === 0 ? "bg-blue-400/50 dark:bg-blue-400/50" : ""
            }`}
          />
        </div>
      </div>
    ))}
  </div>
);

export const ChatHeaderSkeleton: React.FC = () => (
  <div className="border-b border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
    <div className="flex items-center space-x-3">
      <Skeleton className="h-10 w-10 flex-shrink-0 rounded-full" />
      <div className="flex-1">
        <Skeleton className="mb-2 h-4 w-32 rounded" />
        <Skeleton className="h-3 w-20 rounded" />
      </div>
      <div className="flex space-x-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </div>
  </div>
);

export const ChatInputSkeleton: React.FC = () => (
  <div className="border-t border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
    <div className="flex items-center space-x-3">
      <Skeleton className="h-8 w-8 flex-shrink-0 rounded-full" />
      <Skeleton className="h-10 flex-1 rounded-lg" />
      <Skeleton className="h-8 w-8 rounded-full" />
      <Skeleton className="h-10 w-20 rounded-lg" />
    </div>
  </div>
);
