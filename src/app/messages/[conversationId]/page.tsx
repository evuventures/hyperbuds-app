import React from 'react';
import DashboardLayout from '@/components/layout/Dashboard/Dashboard';
import { ConversationContent } from './components/ConversationContent';

interface ConversationPageProps {
   params: {
      conversationId: string;
   };
}

export default function ConversationPage({ params }: ConversationPageProps) {
   return (
      <DashboardLayout>
         <ConversationContent conversationId={params.conversationId} />
      </DashboardLayout>
   );
}