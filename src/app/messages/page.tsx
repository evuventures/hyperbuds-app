"use client"
import React, { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
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
   const targetConversationId = searchParams.get('conversationId');
   const activeConversationId = useAppSelector((state) => state.chat.activeConversationId);

   useEffect(() => {
      if (targetConversationId && targetConversationId !== 'undefined') {
         dispatch(setActiveConversation(targetConversationId));
      } else if (!targetUserId) {
         dispatch(setActiveConversation(null));
      }
   }, [dispatch, targetUserId, targetConversationId]);

   useEffect(() => {
      let cancelled = false;

      const initializeData = async () => {
         try {
            const listData = await messagingAPI.getConversations();
            if (cancelled) return;
            const list = Array.isArray(listData?.conversations) ? listData.conversations : [];
            dispatch(setConversations(list));

            if (targetConversationId && targetConversationId !== 'undefined') {
               dispatch(setActiveConversation(targetConversationId));
            } else if (targetUserId && targetUserId !== 'undefined') {
               const conversation = await messagingAPI.startConversation(targetUserId);
               if (cancelled) return;
               const cid = conversation?._id || (conversation as unknown as { id?: string })?.id;
               if (cid) dispatch(setActiveConversation(cid));

               const updatedListData = await messagingAPI.getConversations();
               if (cancelled) return;
               dispatch(setConversations(Array.isArray(updatedListData?.conversations) ? updatedListData.conversations : []));
            }
         } catch (error) {
            console.error("Failed to initialize messaging data:", error);
         }
      };

      void initializeData();
      return () => {
         cancelled = true;
      };
   }, [targetUserId, targetConversationId, dispatch]);

   const hasSelected = Boolean(activeConversationId);

   return (
      <DashboardLayout>
         <div className="flex h-[calc(100vh-64px)] bg-white dark:bg-slate-900 overflow-hidden transition-colors duration-300">
            <div className={`${hasSelected ? 'hidden md:flex' : 'flex'} w-full md:w-80 flex-col border-r border-gray-100 dark:border-slate-800/50`}>
               <ConversationList />
            </div>

            <div className={`${hasSelected ? 'flex' : 'hidden md:flex'} flex-1 flex-col min-w-0 bg-white dark:bg-slate-900`}>
               <ChatWindow />
            </div>
         </div>
      </DashboardLayout>
   )
}

export default MessagesPage;
