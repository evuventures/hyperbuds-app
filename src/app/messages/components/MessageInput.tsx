"use client"
import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { messagingAPI } from '@/lib/api/messaging.api';
import { useDispatch } from 'react-redux';
import { addMessage } from '@/store/slices/chatSlice';

interface MessageInputProps {
  conversationId: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({ conversationId }) => {
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const dispatch = useDispatch();

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!text.trim() || isSending) return;

    setIsSending(true);
    try {
      const newMessage = await messagingAPI.sendMessage(conversationId, {
        content: text.trim(),
        type: 'text'
      });
      
      // Update Redux immediately so the UI is snappy
      dispatch(addMessage(newMessage));
      setText('');
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <form 
      onSubmit={handleSend}
      className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900"
    >
      <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 p-2 rounded-2xl border border-gray-200 dark:border-gray-700">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-2 dark:text-white"
        />
        <button
          type="submit"
          disabled={!text.trim() || isSending}
          className={`
            p-2 rounded-xl transition-all
            ${text.trim() 
              ? 'bg-purple-600 text-white hover:bg-purple-700' 
              : 'bg-gray-200 text-gray-400 dark:bg-gray-700'}
          `}
        >
          <Send size={18} className={isSending ? 'animate-pulse' : ''} />
        </button>
      </div>
    </form>
  );
};