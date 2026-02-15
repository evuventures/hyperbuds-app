"use client"
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Trash2, Info, X, Check } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { Message } from '@/types/messaging.types';
import { messagingAPI } from '@/lib/api/messaging.api';
import { deleteMessageLocal } from '@/store/slices/chatSlice';

interface MessageBubbleProps {
  message: Message;
  isMe: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isMe }) => {
  const dispatch = useDispatch();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // Hits DELETE /messaging/messages/:id to set isDeleted: true for everyone
      await messagingAPI.deleteMessage(message._id);
      dispatch(deleteMessageLocal({ messageId: message._id }));
    } catch (error) {
      console.error("Failed to delete message:", error);
      setShowConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-2 group relative`}>
      <div className={`max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
        
        <div className="flex items-center gap-2 max-w-full">
          {/* Action Area: Inline Confirm Toggle */}
          {isMe && !message.isDeleted && (
            <div className="flex items-center h-full">
              {!showConfirm ? (
                <button 
                  onClick={() => setShowConfirm(true)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-red-400 transition-all duration-200"
                  title="Delete for everyone"
                >
                  <Trash2 size={14} />
                </button>
              ) : (
                <div className="flex items-center gap-0.5 bg-slate-800 border border-slate-700 rounded-lg p-0.5 shadow-xl animate-in fade-in zoom-in duration-200 z-10">
                  <button 
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="p-1 text-green-500 hover:bg-green-500/10 rounded transition-colors"
                  >
                    <Check size={14} className={isDeleting ? 'animate-pulse' : ''} />
                  </button>
                  <button 
                    onClick={() => setShowConfirm(false)}
                    className="p-1 text-slate-400 hover:bg-slate-700 rounded transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Chat Bubble */}
          <div className={`
            px-4 py-2.5 rounded-2xl text-sm transition-all duration-200
            ${message.isDeleted 
              ? 'bg-slate-900/40 border border-slate-800/60 text-slate-500 italic flex items-center gap-2' 
              : isMe 
                ? 'bg-purple-600 text-white rounded-tr-none shadow-md shadow-purple-900/10' 
                : 'bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700/50'}
          `}>
            {message.isDeleted ? (
              <>
                <Info size={14} className="shrink-0 opacity-70" />
                <span className="text-[13px]">This message was deleted</span>
              </>
            ) : (
              <p className="leading-relaxed whitespace-pre-wrap wrap-break-word">
                {message.content}
              </p>
            )}
          </div>
        </div>

        {/* Footer: Time & Status */}
        <div className="flex items-center gap-1.5 mt-1 px-1">
          <span className="text-[10px] text-slate-500 font-medium">
            {format(new Date(message.createdAt), 'HH:mm')}
          </span>
          {isMe && !message.isDeleted && (
            <span 
              className={`text-[10px] font-bold ${message.isRead ? 'text-purple-400' : 'text-slate-600'}`}
              title={message.isRead ? 'Read' : 'Delivered'}
            >
              {message.isRead ? '✓✓' : '✓'} 
            </span>
          )}
        </div>
      </div>
    </div>
  );
};