"use client"
import React, { useState, useRef } from 'react';
import { Send } from 'lucide-react';
import { messagingAPI } from '@/lib/api/messaging.api';
import { useAppDispatch } from '@/store/hooks';
import { addMessage } from '@/store/slices/chatSlice';

interface MessageInputProps {
  conversationId: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({ conversationId }) => {
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const dispatch = useAppDispatch();

  // Refs to manage typing state without triggering re-renders
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setText(value);

    // Trigger "Start Typing" via API
    if (!isTypingRef.current && value.trim().length > 0) {
      isTypingRef.current = true;
      messagingAPI.startTyping(conversationId); 
    }

    //  Reset the "Stop Typing" timeout
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      stopTypingIndicator();
    }, 2000); 
  };

  const stopTypingIndicator = () => {
    if (isTypingRef.current) {
      messagingAPI.stopTyping(conversationId); 
      isTypingRef.current = false;
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!text.trim() || isSending) return;

    // Immediately stop typing indicator when sending
    stopTypingIndicator();
    setIsSending(true);

    try {
      // Call API to save message
      
      const newMessage = await messagingAPI.sendMessage(conversationId, {
        content: text.trim(),
        type: 'text'
      });
      
     
      if (newMessage) {
        dispatch(addMessage(newMessage));
        setText('');
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <form onSubmit={handleSend} className="p-2 bg-[#0F172A]">
      <div className="flex items-center gap-2 bg-[#1E293B] p-2 rounded-2xl border border-slate-800  transition-all">
        <input
          type="text"
          value={text}
          onChange={handleInputChange}
          placeholder="Type a message..."
          className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-2 text-white placeholder:text-slate-500"
        />
        <button
          type="submit"
          disabled={!text.trim() || isSending}
          className={`
            p-2 rounded-xl transition-all
            ${text.trim() 
              ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-500/20' 
              : 'bg-slate-700 text-slate-500'}
          `}
        >
          <Send size={18} className={isSending ? 'animate-pulse' : ''} />
        </button>
      </div>
    </form>
  );
};