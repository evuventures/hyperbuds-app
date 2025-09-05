import React from "react";

// Reusable Skeleton component with typed props
interface SkeletonProps {
  className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({ className = "" }) => (
  <div className={`bg-gray-200 animate-pulse rounded ${className}`} />
);

// Header Skeleton
const HeaderSkeleton: React.FC = () => (
  <div className="bg-white border-b border-gray-200 px-6 py-4">
    <div className="flex items-center justify-between">
      {/* Logo/Brand */}
      <div className="flex items-center space-x-3">
        <Skeleton className="w-8 h-8 rounded-full" />
        <Skeleton className="w-24 h-6" />
      </div>

      {/* Search bar (desktop) */}
      <div className="hidden md:block flex-1 max-w-md mx-8">
        <Skeleton className="w-full h-10 rounded-lg" />
      </div>

      {/* Right side - notifications, profile */}
      <div className="flex items-center space-x-4">
        <Skeleton className="w-6 h-6 rounded" />
        <Skeleton className="w-6 h-6 rounded" />
        <Skeleton className="w-8 h-8 rounded-full" />
      </div>
    </div>
  </div>
);

// Sidebar Skeleton
const SidebarSkeleton: React.FC = () => (
  <div className="w-64 bg-white border-r border-gray-200 p-4">
    {/* User profile section */}
    <div className="flex items-center space-x-3 mb-6 p-3 rounded-lg bg-gray-50">
      <Skeleton className="w-10 h-10 rounded-full" />
      <div className="flex-1">
        <Skeleton className="w-20 h-4 mb-1" />
        <Skeleton className="w-16 h-3" />
      </div>
    </div>

    {/* Navigation items */}
    <div className="space-y-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-3 p-3 rounded-lg">
          <Skeleton className="w-5 h-5 rounded" />
          <Skeleton className="w-20 h-4" />
        </div>
      ))}
    </div>

    {/* Bottom section */}
    <div className="mt-8 pt-4 border-t border-gray-200">
      <div className="flex items-center space-x-3 p-3">
        <Skeleton className="w-5 h-5 rounded" />
        <Skeleton className="w-16 h-4" />
      </div>
    </div>
  </div>
);

// Main Content Skeleton
const MainContentSkeleton: React.FC = () => (
  <div className="flex-1 p-6">
    {/* Page header */}
    <div className="mb-6">
      <Skeleton className="w-48 h-8 mb-2" />
      <Skeleton className="w-64 h-4" />
    </div>

    {/* Stats cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="w-6 h-6 rounded" />
            <Skeleton className="w-4 h-4 rounded" />
          </div>
          <Skeleton className="w-16 h-8 mb-2" />
          <Skeleton className="w-24 h-4" />
        </div>
      ))}
    </div>

    {/* Main chart/content area */}
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="w-32 h-6" />
        <div className="flex space-x-2">
          <Skeleton className="w-20 h-8 rounded-md" />
          <Skeleton className="w-20 h-8 rounded-md" />
        </div>
      </div>
      <Skeleton className="w-full h-64 rounded" />
    </div>

    {/* Data table */}
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <Skeleton className="w-28 h-6" />
          <Skeleton className="w-24 h-8 rounded-md" />
        </div>
      </div>
      <div className="p-6">
        {/* Table header */}
        <div className="grid grid-cols-5 gap-4 mb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-4" />
          ))}
        </div>
        {/* Table rows */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="grid grid-cols-5 gap-4 mb-3">
            {Array.from({ length: 5 }).map((_, j) => (
              <Skeleton key={j} className="h-4" />
            ))}
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Right Sidebar Skeleton
const RightSidebarSkeleton: React.FC = () => (
  <div className="lg:w-80 bg-white border-l border-gray-200 p-4">
    {/* Notifications section */}
    <div className="mb-6">
      <Skeleton className="w-24 h-5 mb-4" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
            <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
            <div className="flex-1">
              <Skeleton className="w-full h-4 mb-1" />
              <Skeleton className="w-16 h-3" />
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Activity section */}
    <div className="mb-6">
      <Skeleton className="w-20 h-5 mb-4" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-3">
            <Skeleton className="w-6 h-6 rounded-full" />
            <div className="flex-1">
              <Skeleton className="w-full h-4 mb-1" />
              <Skeleton className="w-12 h-3" />
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Quick actions */}
    <div>
      <Skeleton className="w-28 h-5 mb-4" />
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="w-full h-10 rounded-md" />
        ))}
      </div>
    </div>
  </div>
);

// Main Dashboard Skeleton Component
const DashboardSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <HeaderSkeleton />

      {/* Body layout */}
      <div className="md:flex h-[calc(100vh-120px)]">
        {/* Sidebar */}
        <div className="overflow-y-auto no-scrollbar">
          <SidebarSkeleton />
        </div>

        {/* Main Content */}
        <div className="overflow-y-auto flex-1 no-scrollbar">
          <MainContentSkeleton />
        </div>

        {/* Right Sidebar */}
        <div className="overflow-y-auto lg:w-80 no-scrollbar">
          <RightSidebarSkeleton />
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
