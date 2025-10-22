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
         <ConversationContent conversationId={conversationId} />
      </DashboardLayout>
   );
}