import React from 'react';

interface ConversationPageProps {
   params: {
      conversationId: string;
   };
}

export default function ConversationPage({ params }: ConversationPageProps) {
   return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
         <div className="container px-4 py-8 mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
               Conversation: {params.conversationId}
            </h1>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
               This is a placeholder for the individual conversation page.
            </p>
         </div>
      </div>
   );
}
