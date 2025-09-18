import React from 'react';

export const MessagingSkeleton: React.FC = () => {
   return (
      <div className="flex h-[90vh] bg-gray-100 dark:bg-gray-900">
         {/* Chat List Skeleton */}
         <div className="w-1/3 bg-white border-r border-gray-200 dark:border-gray-700 dark:bg-gray-800">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
               <div className="flex items-center justify-between">
                  <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-32 animate-pulse"></div>
                  <div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>
               </div>
            </div>

            {/* Search Bar */}
            <div className="p-4">
               <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded-lg animate-pulse"></div>
            </div>

            {/* Conversation List */}
            <div className="space-y-2 px-4">
               {Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3">
                     {/* Avatar */}
                     <div className="h-12 w-12 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>

                     {/* Content */}
                     <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                           <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24 animate-pulse"></div>
                           <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-12 animate-pulse"></div>
                        </div>
                        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-32 animate-pulse"></div>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* Chat Interface Skeleton */}
         <div className="flex flex-col flex-1">
            {/* Chat Header Skeleton */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
               <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>
                  <div className="flex-1">
                     <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32 animate-pulse mb-2"></div>
                     <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-20 animate-pulse"></div>
                  </div>
                  <div className="flex space-x-2">
                     <div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>
                     <div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>
                     <div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>
                  </div>
               </div>
            </div>

            {/* Messages Skeleton */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
               {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className={`flex ${index % 3 === 0 ? 'justify-end' : 'justify-start'}`}>
                     <div className={`max-w-xs lg:max-w-md ${index % 3 === 0 ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'} rounded-lg p-3`}>
                        <div className={`h-4 rounded w-48 animate-pulse ${index % 3 === 0 ? 'bg-blue-400' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                        <div className={`h-3 rounded w-16 mt-2 animate-pulse ${index % 3 === 0 ? 'bg-blue-400' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                     </div>
                  </div>
               ))}
            </div>

            {/* Typing Indicator Skeleton */}
            <div className="px-4 py-2">
               <div className="flex items-center space-x-2">
                  <div className="h-6 w-6 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24 animate-pulse"></div>
               </div>
            </div>

            {/* Input Skeleton */}
            <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
               <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>
                  <div className="flex-1 h-10 bg-gray-300 dark:bg-gray-600 rounded-lg animate-pulse"></div>
                  <div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>
                  <div className="h-10 w-20 bg-gray-300 dark:bg-gray-600 rounded-lg animate-pulse"></div>
               </div>
            </div>
         </div>
      </div>
   );
};

export const ConversationListSkeleton: React.FC = () => {
   return (
      <div className="space-y-2">
         {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
               {/* Avatar */}
               <div className="h-12 w-12 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>

               {/* Content */}
               <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                     <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24 animate-pulse"></div>
                     <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-12 animate-pulse"></div>
                  </div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-32 animate-pulse"></div>
               </div>
            </div>
         ))}
      </div>
   );
};

export const MessageListSkeleton: React.FC = () => {
   return (
      <div className="space-y-4">
         {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className={`flex ${index % 3 === 0 ? 'justify-end' : 'justify-start'}`}>
               <div className={`max-w-xs lg:max-w-md ${index % 3 === 0 ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'} rounded-lg p-3`}>
                  <div className={`h-4 rounded w-48 animate-pulse ${index % 3 === 0 ? 'bg-blue-400' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                  <div className={`h-3 rounded w-16 mt-2 animate-pulse ${index % 3 === 0 ? 'bg-blue-400' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
               </div>
            </div>
         ))}
      </div>
   );
};

export const ChatHeaderSkeleton: React.FC = () => {
   return (
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
         <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>
            <div className="flex-1">
               <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32 animate-pulse mb-2"></div>
               <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-20 animate-pulse"></div>
            </div>
            <div className="flex space-x-2">
               <div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>
               <div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>
               <div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>
            </div>
         </div>
      </div>
   );
};

export const ChatInputSkeleton: React.FC = () => {
   return (
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
         <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>
            <div className="flex-1 h-10 bg-gray-300 dark:bg-gray-600 rounded-lg animate-pulse"></div>
            <div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>
            <div className="h-10 w-20 bg-gray-300 dark:bg-gray-600 rounded-lg animate-pulse"></div>
         </div>
      </div>
   );
};
