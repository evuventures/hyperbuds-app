import React from 'react';

interface CreatorPageProps {
   params: {
      username: string;
   };
}

export default function CreatorPage({ params }: CreatorPageProps) {
   return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
         <div className="container px-4 py-8 mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
               Creator Profile: {params.username}
            </h1>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
               This is a placeholder for the creator profile page.
            </p>
         </div>
      </div>
   );
}
