"use client"
import React, { useState, useRef } from 'react';
import { Send } from 'lucide-react';
import { messagingAPI } from '@/lib/api/messaging.api';
import { useAppDispatch } from '@/store/hooks';
import { addMessage } from '@/store/slices/chatSlice';
import { Message } from '@/types/messaging.types';

interface MessageInputProps {
  conversationId: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({ conversationId }) => {
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const dispatch = useAppDispatch();

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setText(value);

    if (!isTypingRef.current && value.trim().length > 0) {
      isTypingRef.current = true;
      messagingAPI.startTyping(conversationId);
    }

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

    stopTypingIndicator();
    setIsSending(true);

    try {
      const response = await messagingAPI.sendMessage(conversationId, {
        content: text.trim(),
        type: 'text'
      });

      const newMessage: Message = (response as unknown as { message: Message })?.message ?? response;

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
    <form onSubmit={handleSend} className="p-2 bg-white dark:bg-slate-900 transition-colors duration-300">
      <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-2 rounded-2xl border border-slate-200 dark:border-slate-700 transition-all focus-within:border-purple-500/50 focus-within:ring-1 focus-within:ring-purple-500/20">
        <input
          type="text"
          value={text}
          onChange={handleInputChange}
          placeholder="Type a message..."
          className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-2 text-slate-900 dark:text-white placeholder:text-slate-500"
        />
        <button
          type="submit"
          disabled={!text.trim() || isSending}
          className={`
            p-2 rounded-xl transition-all duration-200
            ${text.trim()
              ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-500/20 active:scale-95'
              : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500'}
          `}
        >
          <Send 
            size={18} 
            className={`${isSending ? 'animate-pulse' : ''} ${text.trim() ? 'fill-current' : ''}`} 
          />
        </button>
      </div>
    </form>
  );
};