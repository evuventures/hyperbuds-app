"use client"
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Trash2, Info, X, Check } from 'lucide-react';
import { useAppDispatch } from '@/store/hooks';
import { Message } from '@/types/messaging.types';
import { messagingAPI } from '@/lib/api/messaging.api';
import { deleteMessageLocal } from '@/store/slices/chatSlice';

interface MessageBubbleProps {
  message: Message;
  isMe: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isMe }) => {
  const dispatch = useAppDispatch();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await messagingAPI.deleteMessage(message._id);
      dispatch(deleteMessageLocal({ messageId: message._id }));
    } catch (error) {
      console.error("Failed to delete message:", error);
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'h:mm a');
  };

  return (
    <div className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} mb-2 group relative`}>
      <div className={`max-w-[85%] md:max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
        
        <div className={`flex items-center gap-2 max-w-full ${isMe ? 'flex-row' : 'flex-row-reverse'}`}>
          
          {/* Action Area: Now handles mobile "Tap to show" logic */}
          {isMe && !message.isDeleted && (
            <div className="flex items-center h-full">
              {!showConfirm ? (
                <button
                  onClick={() => setShowConfirm(true)}
                  // ✅ Mobile fix: Visible on hover OR if user taps bubble (handled by state)
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-500 hover:text-red-400 transition-all duration-200"
                >
                  <Trash2 size={16} />
                </button>
              ) : (
                // ✅ Modern Delete Confirmation Pop-up
                <div className="flex items-center gap-1 bg-gray-800 border border-gray-600 rounded-xl p-1 shadow-2xl animate-in fade-in zoom-in duration-200 z-20">
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex items-center gap-1 px-2 py-1 text-[11px] font-bold text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Check size={12} /> {isDeleting ? '...' : 'Delete'}
                  </button>
                  <div className="w-px h-3 bg-gray-600 mx-1" />
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="p-1 text-gray-400 hover:bg-gray-700 rounded-lg"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Chat Bubble */}
          <div 
            // ✅ Mobile trigger: Tapping the bubble shows the delete button
            onClick={() => isMe && !message.isDeleted && setShowConfirm(true)}
            className={`
              px-4 py-2.5 rounded-2xl text-sm transition-all duration-200 cursor-pointer active:scale-[0.98]
              ${message.isDeleted
                ? 'bg-gray-900/40 border border-gray-800 text-gray-500 italic flex items-center gap-2'
                : isMe
                  ? 'bg-purple-600 text-white rounded-tr-none shadow-md shadow-purple-900/10'
                  : 'bg-gray-700 text-gray-100 rounded-tl-none border border-gray-600/50'}
            `}
          >
            {message.isDeleted ? (
              <>
                <Info size={14} className="shrink-0 opacity-70" />
                <span className="text-[13px]">Message deleted</span>
              </>
            ) : (
              <p className="leading-relaxed whitespace-pre-wrap wrap-break-word">
                {message.content}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={`flex items-center gap-1.5 mt-1 px-1 ${isMe ? 'flex-row' : 'flex-row-reverse'}`}>
          <span className="text-[10px] text-gray-400">
            {formatTime(message.createdAt)}
          </span>
          {isMe && !message.isDeleted && (
            <span className={`text-[10px] font-bold ${message.isRead ? 'text-purple-400' : 'text-gray-600'}`}>
              {message.isRead ? '✓✓' : '✓'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};