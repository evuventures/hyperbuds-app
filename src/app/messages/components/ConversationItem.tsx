"use client"
import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { formatDistanceToNow } from 'date-fns';
import { Conversation } from '@/types/messaging.types';

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({ 
  conversation, 
  isActive, 
  onClick 
}) => {
  // 1. Get your own user info from Redux
  const { user: currentUser } = useSelector((state: RootState) => state.auth);

  // 2. Logic to find the other participant (not you)
  // We look for the first participant whose ID doesn't match yours
  const otherUser = conversation.participants.find(
    (p) => p._id !== currentUser?.id
  ) || conversation.participants[0]; 

  return (
    <div 
      onClick={onClick}
      className={`group flex items-center gap-4 p-4 mx-2 mb-1 rounded-2xl cursor-pointer transition-all duration-200 ${
        isActive 
          ? 'bg-slate-800 shadow-lg' 
          : 'hover:bg-slate-800/50'
      }`}
    >
      {/* Avatar Container */}
      <div className="relative shrink-0">
        <div className="w-12 h-12 rounded-full bg-linear-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
          {otherUser?.name?.[0]?.toUpperCase() || otherUser?.email?.[0]?.toUpperCase() || 'H'}
        </div>
        {otherUser?.status === 'online' && (
          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-slate-900 rounded-full" />
        )}
      </div>

      {/* Info Preview */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-1">
          {/* 3. Display the other user's Name or Username instead of your own email */}
          <h4 className={`text-sm font-semibold truncate ${isActive ? 'text-white' : 'text-slate-200 group-hover:text-white'}`}>
            {otherUser?.name || otherUser?.username || otherUser?.email.split('@')[0]}
          </h4>
          <span className="text-[10px] text-slate-500 shrink-0 ml-2">
            {conversation.lastMessage 
              ? formatDistanceToNow(new Date(conversation.lastMessage.createdAt), { addSuffix: false }) 
              : ''}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <p className="text-xs text-slate-500 truncate mr-2">
            {conversation.lastMessage?.content || "Start a new collaboration..."}
          </p>
          {conversation.unreadCount > 0 && (
            <span className="bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
              {conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};