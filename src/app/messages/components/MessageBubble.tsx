"use client"
import React from 'react';
import { format } from 'date-fns';
import { Message } from '@/types/messaging.types';

interface MessageBubbleProps {
  message: Message;
  isMe: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isMe }) => {
  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className={`max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
        
        {/* The Chat Bubble */}
        <div className={`
          px-4 py-2.5 rounded-2xl text-sm shadow-xs
          ${isMe 
            ? 'bg-purple-600 text-white rounded-tr-none' 
            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-none'}
        `}>
          <p className="leading-relaxed whitespace-pre-wrap wrap-break-word">
            {message.content}
          </p>
        </div>

        {/* Timestamp and Status */}
        <div className="flex items-center gap-1 mt-1 px-1">
          <span className="text-[10px] text-gray-400">
            {format(new Date(message.createdAt), 'HH:mm')}
          </span>
          {isMe && (
            <span className={`text-[10px] ${message.isRead ? 'text-purple-500' : 'text-gray-400'}`}>
              {message.isRead ? '••' : '•'} 
            </span>
          )}
        </div>
      </div>
    </div>
  );
};