"use client"
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import DashboardLayout from '@/components/layout/Dashboard/Dashboard';
import { ConversationList } from '../components/ConversationList';
import { ChatWindow } from '../components/ChatWindow';
import { setActiveConversation } from '@/store/slices/chatSlice';

const ConversationPage = () => {
  const params = useParams();
  const dispatch = useDispatch();
  const conversationId = params.conversationId as string;
  const [isLoading, setIsLoading] = useState(true);

  // Access the conversation from Redux to check if it exists
  useSelector((state: RootState) => state.chat);

  useEffect(() => {
    if (conversationId) {
      dispatch(setActiveConversation(conversationId));
      
      // Simulate or handle initial loading state for the skeleton
      const timer = setTimeout(() => setIsLoading(false), 500);
      return () => clearTimeout(timer);
    }
  }, [conversationId, dispatch]);

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-64px)] bg-[#0F172A] overflow-hidden">
        
        {/* SIDEBAR: Always shown on desktop (md:flex), hidden on mobile when in a chat */}
        <div className="hidden md:flex w-80 flex-col border-r border-slate-800/50">
          <ConversationList />
        </div>

        {/* CHAT AREA: Full width on mobile, fills remaining space on desktop */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#0F172A]">
          {isLoading ? (
            <ChatWindowSkeleton />
          ) : (
            <ChatWindow conversationId={conversationId} />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

/**
 * Expert Dashboard Skeleton
 * Mimics the ChatHeader and Message Feed structure
 */
const ChatWindowSkeleton = () => (
  <div className="flex flex-col h-full animate-pulse">
    {/* Header Skeleton */}
    <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-slate-800" />
        <div className="space-y-2">
          <div className="h-3 w-24 bg-slate-800 rounded" />
          <div className="h-2 w-16 bg-slate-800 rounded" />
        </div>
      </div>
      <div className="flex gap-4">
        <div className="w-5 h-5 bg-slate-800 rounded" />
        <div className="w-5 h-5 bg-slate-800 rounded" />
      </div>
    </div>

    {/* Message Feed Skeleton */}
    <div className="flex-1 p-6 space-y-6">
      <div className="flex justify-start">
        <div className="h-10 w-2/3 bg-slate-800 rounded-2xl rounded-tl-none" />
      </div>
      <div className="flex justify-end">
        <div className="h-10 w-1/2 bg-purple-900/20 rounded-2xl rounded-tr-none" />
      </div>
      <div className="flex justify-start">
        <div className="h-10 w-3/4 bg-slate-800 rounded-2xl rounded-tl-none" />
      </div>
    </div>

    {/* Input Skeleton */}
    <div className="p-4">
      <div className="h-12 w-full bg-slate-800 rounded-xl" />
    </div>
  </div>
);

export default ConversationPage;