import React from 'react';

interface CreatorPageProps {
   params: Promise<{
      username: string;
   }>;
}

export default async function CreatorPage({ params }: CreatorPageProps) {
   const { username } = await params;
   
   return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
         <div className="container px-4 py-8 mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
               Creator Profile: {username}
            </h1>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
               This is a placeholder for the creator profile page.
            </p>
         </div>
      </div>
   );
}
