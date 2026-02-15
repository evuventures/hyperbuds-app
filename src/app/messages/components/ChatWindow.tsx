"use client"
import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { setMessages, setActiveConversation } from '@/store/slices/chatSlice';
import { messagingAPI } from '@/lib/api/messaging.api';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { ChatHeader } from './ChatHeader';

interface ChatWindowProps {
  conversationId?: string; 
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ conversationId }) => {
  const dispatch = useDispatch();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // 1. Pull messaging state from Redux
  const { messages, conversations } = useSelector(
    (state: RootState) => state.chat
  );
  
  const { user: currentUser } = useSelector((state: RootState) => state.auth);

  // 2. Determine the EFFECTIVE ID (Prop takes priority over global state)
  // This ensures the window updates immediately when the URL changes
  const activeId = conversationId; 

  // 3. Effect: Sync Redux and Fetch messages
  useEffect(() => {
    if (!activeId) return;

    // Set global active ID so sidebar and other components stay in sync
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

  // 4. Effect: Automatic scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // 5. Effect: Mark as read logic using activeId
  useEffect(() => {
    if (activeId && messages.length > 0) {
      const unreadIds = messages
        .filter(m => !m.isRead && m.sender._id !== currentUser?.id)
        .map(m => m._id);

      if (unreadIds.length > 0) {
        messagingAPI.markAsRead(activeId, unreadIds);
      }
    }
  }, [activeId, messages, currentUser?.id]);

  // --- EMPTY STATE UI ---
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
          <h3 className="text-xl font-bold text-white mb-2 tracking-tight">
            No conversation selected
          </h3>
          <p className="text-sm text-slate-500 leading-relaxed px-6">
            Choose a conversation from the sidebar to start chatting with your fellow Hyperbuds
          </p>
        </div>
      </div>
    );
  }

  // --- ACTIVE CHAT LOGIC ---
  const activeChat = conversations.find(c => c._id === activeId);

  const recipient = activeChat?.participants.find(
    (p) => p._id !== currentUser?.id
  ) || activeChat?.participants[0];

  return (
    <div className="flex flex-col h-full bg-[#0F172A] relative border-l border-slate-800/50">
      <ChatHeader recipient={recipient} />

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth 
                   scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent"
      >
        {messages.map((msg) => (
          <MessageBubble 
            key={msg._id} 
            message={msg} 
            isMe={msg.sender._id === currentUser?.id} 
          />
        ))}
        <div className="h-2" />
      </div>

      <div className="p-4 bg-[#0F172A]">
        <MessageInput conversationId={activeId} />
      </div>
    </div>
  );
};