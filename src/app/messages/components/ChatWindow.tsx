"use client"
import React, { useEffect, useRef } from 'react';
//  Use your standardized hooks
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setMessages, setActiveConversation } from '@/store/slices/chatSlice';
import { messagingAPI } from '@/lib/api/messaging.api';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { ChatHeader } from './ChatHeader';
import { format, isToday, isYesterday } from 'date-fns';

interface ChatWindowProps {
  conversationId?: string; 
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ conversationId }) => {
  //  Switched to typed hooks
  const dispatch = useAppDispatch();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Selector using typed state
  const { messages, conversations } = useAppSelector((state) => state.chat);
  const { user: currentUser } = useAppSelector((state) => state.auth);

  const activeId = conversationId; 

  const formatDividerDate = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMMM d, yyyy');
  };

  useEffect(() => {
    if (!activeId) return;
    dispatch(setActiveConversation(activeId));

    const fetchMessages = async () => {
      try {
        const data = await messagingAPI.getMessages(activeId);
        dispatch(setMessages(data.messages));
      } catch (error) {
        console.error("Failed to load messages:", error);
      }
    };
    fetchMessages();
  }, [activeId, dispatch]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Stable Mark-as-Read Logic
  useEffect(() => {
    // Determine the ID outside the dependency array to keep it stable
    const currentUserId = currentUser?.id || currentUser?._id;

    if (activeId && messages.length > 0 && currentUserId) {
      const unreadIds = messages
        .filter(m => !m.isRead && m.sender._id !== currentUserId)
        .map(m => m._id);

      if (unreadIds.length > 0) {
        messagingAPI.markAsRead(activeId, unreadIds);
      }
    }
    //  Dependency on currentUser (the object) is stable with useAppSelector
  }, [activeId, messages, currentUser]);

  if (!activeId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#0F172A] text-slate-400">
        <div className="flex flex-col items-center max-w-sm text-center">
          <div className="relative mb-6">
            <div className="bg-white rounded-2xl p-5 shadow-2xl transform transition-transform hover:scale-105">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-slate-800 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-slate-800 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 bg-slate-800 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 rounded-sm" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-white mb-2 tracking-tight">No conversation selected</h3>
          <p className="text-sm text-slate-500 leading-relaxed px-6">
            Choose a conversation from the sidebar to start chatting with your fellow Hyperbuds
          </p>
        </div>
      </div>
    );
  }

  const activeChat = conversations.find(c => c._id === activeId);
  const currentUserId = currentUser?.id || currentUser?._id;
  
  const recipient = activeChat?.participants.find(
    (p) => p._id !== currentUserId
  ) || activeChat?.participants[0];

  return (
    <div className="flex flex-col h-full bg-[#0F172A] relative border-l border-slate-800/50">
      <ChatHeader recipient={recipient} />

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth 
                   scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent"
      >
        {messages.map((msg, index) => {
          const currentDate = new Date(msg.createdAt);
          const prevDate = index > 0 ? new Date(messages[index - 1].createdAt) : null;
          
          const isNewDay = !prevDate || 
            currentDate.toDateString() !== prevDate.toDateString();

          return (
            <React.Fragment key={msg._id}>
              {isNewDay && (
                <div className="flex justify-center my-8">
                  <span className="px-4 py-1.5 rounded-full bg-slate-800/40 border border-slate-700/50 text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                    {formatDividerDate(currentDate)}
                  </span>
                </div>
              )}

              <MessageBubble 
                message={msg} 
                isMe={msg.sender._id === currentUserId} 
              />
            </React.Fragment>
          );
        })}
        <div className="h-2" />
      </div>

      <div className="p-4 bg-[#0F172A]">
        <MessageInput conversationId={activeId} />
      </div>
    </div>
  );
};