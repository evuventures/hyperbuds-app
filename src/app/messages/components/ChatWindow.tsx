"use client"
import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { setMessages } from '@/store/slices/chatSlice';
import { messagingAPI } from '@/lib/api/messaging.api';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { ChatHeader } from './ChatHeader';

export const ChatWindow = () => {
  const dispatch = useDispatch();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // 1. Pull messaging state from Redux
  const { activeConversationId, messages, conversations } = useSelector(
    (state: RootState) => state.chat
  );
  
  // 2. Identify Esther (the logged-in user) to filter herself out of the header
  const { user: currentUser } = useSelector((state: RootState) => state.auth);

  // 3. Effect: Fetch messages whenever the active conversation changes
  useEffect(() => {
    if (!activeConversationId) return;

    const fetchMessages = async () => {
      try {
        // Uses GET /messaging/conversations/:id/messages from your backend
        const data = await messagingAPI.getMessages(activeConversationId);
        dispatch(setMessages(data.messages));
      } catch (error) {
        console.error("Failed to load messages:", error);
      }
    };

    fetchMessages();
  }, [activeConversationId, dispatch]);

  // 4. Effect: Automatic scroll to bottom when new messages arrive or are loaded
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // --- EMPTY STATE UI ---
  if (!activeConversationId) {
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

  // Find the conversation object to get participant details
  const activeChat = conversations.find(c => c._id === activeConversationId);

  // FIX: Identify the Recipient (the person who is NOT Esther/Current User)
  // This ensures the header shows "Esther" or "@creaster" instead of your own details
  const recipient = activeChat?.participants.find(
    (p) => p._id !== currentUser?.id
  ) || activeChat?.participants[0];

  return (
    <div className="flex flex-col h-full bg-[#0F172A] relative border-l border-slate-800/50">
      {/* Top Bar: Pass the specific recipient to the header 
         We pass the full participant object to handle names and online status
      */}
      <ChatHeader recipient={recipient} />

      {/* Message Feed */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth 
                   scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent"
      >
        {messages.map((msg) => (
          <MessageBubble 
            key={msg._id} 
            message={msg} 
            // isMe logic correctly determines alignment (Right for you, Left for them)
            isMe={msg.sender._id === currentUser?.id} 
          />
        ))}
        <div className="h-2" />
      </div>

      {/* Input Bar */}
      <div className="p-4 bg-[#0F172A]">
        {/* Pass ID for sendMessage controller: POST /conversations/:id/messages */}
        <MessageInput conversationId={activeConversationId} />
      </div>
    </div>
  );
};