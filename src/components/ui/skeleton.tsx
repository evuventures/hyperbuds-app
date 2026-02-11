import React from "react";

// Reusable Skeleton component - base primitive for all skeleton UIs
export interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = "" }) => (
  <div className={`bg-gray-200 rounded animate-pulse dark:bg-gray-700 ${className}`} />
);

// Header Skeleton
const HeaderSkeleton: React.FC = () => (
  <div className="px-6 py-4 bg-white border-b border-gray-300 dark:bg-gray-800 dark:border-gray-700">
    <div className="flex justify-between items-center">
      {/* Logo/Brand */}
      <div className="flex items-center space-x-3">
        <Skeleton className="w-8 h-8 rounded-full" />
        <Skeleton className="w-24 h-6" />
      </div>

      {/* Search bar (desktop) */}
      <div className="hidden flex-1 mx-8 max-w-md md:block">
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
const SidebarSkeleton: React.FC<{ collapsed?: boolean }> = ({ collapsed = false }) => (
  <div className={`${collapsed ? 'p-2' : 'p-4'} transition-all duration-300`}>
    {/* User profile section */}
    <div className={`flex items-center ${collapsed ? 'justify-center p-2' : 'p-3 space-x-3'} mb-6 bg-gray-50 rounded-lg dark:bg-gray-700`}>
      <Skeleton className="w-10 h-10 rounded-full" />
      {!collapsed && (
        <div className="flex-1">
          <Skeleton className="mb-1 w-20 h-4" />
          <Skeleton className="w-16 h-3" />
        </div>
      )}
    </div>

    {/* Navigation items */}
    <div className={`${collapsed ? 'space-y-3' : 'space-y-2'}`}>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className={`flex items-center ${collapsed ? 'justify-center p-2' : 'p-3 space-x-3'} rounded-lg`}>
          <Skeleton className="w-5 h-5 rounded" />
          {!collapsed && <Skeleton className="w-20 h-4" />}
        </div>
      ))}
    </div>

    {/* Bottom section */}
    <div className="pt-4 mt-8 border-t border-gray-300 dark:border-gray-700">
      <div className={`flex items-center ${collapsed ? 'justify-center p-2' : 'p-3 space-x-3'}`}>
        <Skeleton className="w-5 h-5 rounded" />
        {!collapsed && <Skeleton className="w-16 h-4" />}
      </div>
    </div>
  </div>
);

// Page Content Skeleton - generic page layout (header + cards + table)
export const PageContentSkeleton: React.FC = () => (
  <div className="flex-1 p-6">
    {/* Page header */}
    <div className="mb-6">
      <Skeleton className="mb-2 w-48 h-8" />
      <Skeleton className="w-64 h-4" />
    </div>

    {/* Stats cards */}
    <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="p-6 bg-white rounded-lg border border-gray-300 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <Skeleton className="w-6 h-6 rounded" />
            <Skeleton className="w-4 h-4 rounded" />
          </div>
          <Skeleton className="mb-2 w-16 h-8" />
          <Skeleton className="w-24 h-4" />
        </div>
      ))}
    </div>

    {/* Main chart/content area */}
    <div className="p-6 mb-6 bg-white rounded-lg border border-gray-300 dark:bg-gray-800 dark:border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="w-32 h-6" />
        <div className="flex space-x-2">
          <Skeleton className="w-20 h-8 rounded-md" />
          <Skeleton className="w-20 h-8 rounded-md" />
        </div>
      </div>
      <Skeleton className="w-full h-64 rounded" />
    </div>

    {/* Data table */}
    <div className="bg-white rounded-lg border border-gray-300 dark:bg-gray-800 dark:border-gray-700">
      <div className="p-6 border-b border-gray-300 dark:border-gray-700">
        <div className="flex justify-between items-center">
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

// Alias for backward compatibility
const MainContentSkeleton = PageContentSkeleton;

// Card Grid Skeleton - for marketplace, dashboard cards
export const CardGridSkeleton: React.FC<{ count?: number; columns?: 2 | 3 | 4 }> = ({
  count = 6,
  columns = 4,
}) => {
  const colClass =
    columns === 2 ? "lg:grid-cols-2" : columns === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4";
  return (
  <div className={`grid grid-cols-1 gap-6 md:grid-cols-2 ${colClass}`}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="p-6 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="w-6 h-6 rounded" />
          <Skeleton className="w-4 h-4 rounded" />
        </div>
        <Skeleton className="mb-2 w-16 h-8" />
        <Skeleton className="w-24 h-4" />
      </div>
    ))}
  </div>
  );
};

// Table Skeleton - for data tables
export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({
  rows = 6,
  cols = 5,
}) => (
  <div className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
    <div className="p-6 border-b border-gray-300 dark:border-gray-700">
      <div className="flex justify-between items-center">
        <Skeleton className="w-28 h-6" />
        <Skeleton className="w-24 h-8 rounded-md" />
      </div>
    </div>
    <div className="p-6">
      <div
        className="grid gap-4 mb-4"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="grid gap-4 mb-3"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className="h-4" />
          ))}
        </div>
      ))}
    </div>
  </div>
);

// Form Skeleton - for form layouts
export const FormSkeleton: React.FC<{ fields?: number }> = ({ fields = 5 }) => (
  <div className="space-y-6">
    {Array.from({ length: fields }).map((_, i) => (
      <div key={i}>
        <Skeleton className="mb-2 w-1/4 h-4 max-w-[8rem]" />
        <Skeleton className="w-full h-10 rounded" />
      </div>
    ))}
    <Skeleton className="w-full h-12 rounded-lg" />
  </div>
);

// Right Sidebar Skeleton - Commented out (right sidebar removed)
/* const RightSidebarSkeleton: React.FC = () => (
  <div className="p-4 bg-white border-l border-gray-300 lg:w-80 dark:bg-gray-800 dark:border-gray-700">
    {/* Notifications section *\/}
    <div className="mb-6">
      <Skeleton className="mb-4 w-24 h-5" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-start p-3 space-x-3 bg-gray-50 rounded-lg dark:bg-gray-700">
            <Skeleton className="flex-shrink-0 w-8 h-8 rounded-full" />
            <div className="flex-1">
              <Skeleton className="mb-1 w-full h-4" />
              <Skeleton className="w-16 h-3" />
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Activity section *\/}
    <div className="mb-6">
      <Skeleton className="mb-4 w-20 h-5" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-3">
            <Skeleton className="w-6 h-6 rounded-full" />
            <div className="flex-1">
              <Skeleton className="mb-1 w-full h-4" />
              <Skeleton className="w-12 h-3" />
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Quick actions *\/}
    <div>
      <Skeleton className="mb-4 w-28 h-5" />
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="w-full h-10 rounded-md" />
        ))}
      </div>
    </div>
  </div>
); */

// Main Dashboard Skeleton Component
const DashboardSkeleton: React.FC<{ collapsed?: boolean }> = ({ collapsed = false }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 transition-colors duration-200 overflow-y-clip dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Mobile Header Skeleton */}
      <div className="fixed top-0 right-0 left-0 z-50 border-b shadow-sm backdrop-blur-lg lg:hidden bg-white/95 dark:bg-gray-900/95 border-gray-300 dark:border-gray-700/50">
        <div className="flex justify-between items-center px-4 py-3">
          <div className="flex gap-3 items-center">
            <Skeleton className="w-9 h-9 rounded-xl" />
            <Skeleton className="w-24 h-6" />
          </div>
          <div className="flex gap-2 items-center">
            <Skeleton className="w-9 h-9 rounded-xl xl:hidden" />
            <Skeleton className="w-8 h-8 rounded-full" />
          </div>
        </div>
      </div>

      {/* Desktop Header Skeleton */}
      <div className="hidden lg:block">
        <HeaderSkeleton />
      </div>

      {/* Main Dashboard Container */}
      <div className="flex overflow-hidden pt-16 lg:h-[90vh] lg:pt-0">
        {/* Sidebar */}
        <div
          className={`
            fixed inset-y-0 left-0 z-40 transform transition-all duration-300 ease-in-out
            lg:relative lg:translate-x-0 lg:z-auto lg:pt-0
            translate-x-0 hidden md:flex
            ${collapsed ? 'lg:w-16' : 'w-60'}
          `}
        >
          <div className="relative pt-16 h-full bg-white border-r shadow-xl transition-colors duration-200 lg:pt-0 dark:bg-gray-900 border-gray-300 dark:border-gray-700/50 lg:shadow-none">
            <div className="h-full overflow-y-auto [&::-webkit-scrollbar]:hidden">
              <SidebarSkeleton collapsed={collapsed} />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col w-full min-w-0">
          <div className="flex overflow-hidden">
            <main className="flex-1 overflow-auto [&::-webkit-scrollbar]:hidden transition-colors duration-200">
              <div className="max-w-full h-[90vh]">
                <div className="w-full min-h-full">
                  <MainContentSkeleton />
                </div>
              </div>
            </main>

            {/* Right Sidebar */}
            {/* <div className="fixed inset-y-0 right-0 z-40 w-80 bg-white border-l shadow-xl transition-all duration-300 ease-in-out transform translate-x-0 dark:bg-gray-900 border-gray-300 dark:border-gray-700/50 xl:relative xl:translate-x-0 xl:z-auto xl:shadow-none xl:pt-0">
              <div className="pt-16 h-full xl:pt-0">
                <div className="overflow-y-auto h-full scrollbar-hide">
                  <RightSidebarSkeleton />
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export { MainContentSkeleton };
export default DashboardSkeleton;