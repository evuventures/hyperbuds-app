"use client"
import React, { useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { useDispatch } from 'react-redux'
import DashboardLayout from '@/components/layout/Dashboard/Dashboard';
import {ConversationList} from './components/ConversationList';
import { ChatWindow } from './components/ChatWindow';
import { useChatSocket } from '@/hooks/features/useChatSocket';
import { messagingAPI } from '@/lib/api/messaging.api';
import { setActiveConversation, setConversations } from '@/store/slices/chatSlice';

const MessagesPage = () => {
   useChatSocket(); 
   const dispatch = useDispatch();
   const searchParams = useSearchParams();
   const targetUserId = searchParams.get('userId');
   
   // Use a ref to track if we've already initialized to prevent double-firing in Strict Mode
   const hasInitialized = useRef(false);

   useEffect(() => {
      // If we've already run this, don't run it again
      if (hasInitialized.current) return;
      hasInitialized.current = true;

      const initializeData = async () => {
         try {
            // 1. Fetch the primary list of conversations (Page 1, Limit 20)
            // This matches your backend controller's default query params
            const listData = await messagingAPI.getConversations();
            dispatch(setConversations(listData.conversations));

            // 2. If we are redirected from a match, handle the "start conversation" flow
            if (targetUserId && targetUserId !== 'undefined') {
               // This hits your backend POST route to get or create a chat
               const conversation = await messagingAPI.startConversation(targetUserId);
               
               // Set as active chat to open the ChatWindow for Esther
               dispatch(setActiveConversation(conversation._id));
               
               // Refresh the list once more to ensure the new match is at the very top
               const updatedListData = await messagingAPI.getConversations();
               dispatch(setConversations(updatedListData.conversations));
            }
         } catch (error) {
            console.error("Failed to initialize messaging data:", error);
         }
      };

      initializeData();
   }, [targetUserId, dispatch]);

   return (
      <DashboardLayout>
         <div className="flex h-[calc(100vh-64px)] bg-[#0F172A] overflow-hidden">
            {/* PRO TIP: Ensure your <ConversationList /> component 
                DOES NOT have its own useEffect fetching conversations. 
                It should just read them from Redux.
            */}
            <div className="hidden md:flex w-80 flex-col border-r border-slate-800/50">
               <ConversationList />
            </div>

            <div className="flex-1 flex flex-col min-w-0 bg-[#0F172A]">
               <ChatWindow />
            </div>
         </div>
      </DashboardLayout>
   )
}

export default MessagesPage;