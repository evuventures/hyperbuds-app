"use client"
import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import DashboardLayout from '@/components/layout/Dashboard/Dashboard';
import { ConversationList } from '../components/ConversationList';
import { ChatWindow } from '../components/ChatWindow';
import { useChatSocket } from '@/hooks/features/useChatSocket';
import { messagingAPI } from '@/lib/api/messaging.api';
import { setActiveConversation, setConversations } from '@/store/slices/chatSlice';

const ConversationPage = () => {
  useChatSocket();
  const params = useParams();
  const dispatch = useAppDispatch();
  const conversationId = params.conversationId as string;
  const conversations = useAppSelector((state) => state.chat.conversations);

  useEffect(() => {
    if (conversationId) {
      dispatch(setActiveConversation(conversationId));
    }
  }, [conversationId, dispatch]);

  useEffect(() => {
    if (Array.isArray(conversations) && conversations.length > 0) return;
    let cancelled = false;
    messagingAPI
      .getConversations()
      .then((listData) => {
        if (cancelled) return;
        dispatch(setConversations(Array.isArray(listData?.conversations) ? listData.conversations : []));
      })
      .catch((error) => {
        console.error('Failed to load conversations:', error);
      });
    return () => {
      cancelled = true;
    };
  }, [conversations, dispatch]);

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-64px)] bg-white dark:bg-slate-900 overflow-hidden">
        <div className="hidden md:flex w-80 flex-col border-r border-gray-100 dark:border-slate-800/50">
          <ConversationList />
        </div>
        <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900">
          <ChatWindow conversationId={conversationId} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ConversationPage;
