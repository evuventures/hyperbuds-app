"use client"
import React, { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAppDispatch } from '@/store/hooks'
import DashboardLayout from '@/components/layout/Dashboard/Dashboard';
import { ConversationList } from './components/ConversationList';
import { ChatWindow } from './components/ChatWindow';
import { useChatSocket } from '@/hooks/features/useChatSocket';
import { messagingAPI } from '@/lib/api/messaging.api';
import { setActiveConversation, setConversations } from '@/store/slices/chatSlice';

const MessagesPage = () => {
   useChatSocket();
   const dispatch = useAppDispatch();
   const searchParams = useSearchParams();
   const targetUserId = searchParams.get('userId');

   // Clear selection only when there is no deep-linked user (avoid wiping state before `userId` flow runs).
   useEffect(() => {
      if (!targetUserId) {
         dispatch(setActiveConversation(null));
      }
   }, [dispatch, targetUserId]);

   // Re-run when `userId` query changes (e.g. from AI matches) — do not use a one-shot ref
   // or navigation to a different user will keep the previous conversation.
   useEffect(() => {
      let cancelled = false;

      const initializeData = async () => {
         try {
            const listData = await messagingAPI.getConversations();
            if (cancelled) return;
            dispatch(setConversations(listData.conversations));

            if (targetUserId && targetUserId !== 'undefined') {
               const conversation = await messagingAPI.startConversation(targetUserId);
               if (cancelled) return;
               dispatch(setActiveConversation(conversation._id));

               const updatedListData = await messagingAPI.getConversations();
               if (cancelled) return;
               dispatch(setConversations(updatedListData.conversations));
            }
         } catch (error) {
            console.error("Failed to initialize messaging data:", error);
         }
      };

      void initializeData();
      return () => {
         cancelled = true;
      };
   }, [targetUserId, dispatch]);

   return (
      <DashboardLayout>
         
         <div className="flex h-[calc(100vh-64px)] bg-white dark:bg-slate-900 overflow-hidden transition-colors duration-300">
            
            
            <div className="w-full md:w-80 flex flex-col border-r border-gray-100 dark:border-slate-800/50">
               <ConversationList />
            </div>

            
            <div className="hidden flex-1 md:flex flex-col min-w-0 bg-white dark:bg-slate-900">
               <ChatWindow />
            </div>
            
         </div>
      </DashboardLayout>
   )
}

export default MessagesPage;