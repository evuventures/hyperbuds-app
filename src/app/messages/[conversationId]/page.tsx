import React from 'react';
import DashboardLayout from '@/components/layout/Dashboard/Dashboard';
import { ConversationContent } from './components/ConversationContent';

interface ConversationPageProps {
   params: Promise<{
      conversationId: string;
   }>;
}

export default async function ConversationPage({ params }: ConversationPageProps) {
   const { conversationId } = await params;
   
   return (
      <DashboardLayout>
         <div className="min-h-full bg-gray-50 dark:bg-slate-900">
            <div className="p-4 pb-16 lg:p-6 lg:pb-34">
               <ConversationContent conversationId={conversationId} />
            </div>
         </div>
      </DashboardLayout>
   );
}
