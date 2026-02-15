"use client"
import React, { useState } from 'react';
import Image from 'next/image'; // Import Next.js Image component
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { format, isToday } from 'date-fns';
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
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const [imgError, setImgError] = useState(false); // State to handle broken image links

  const otherUser = (conversation.participants ?? []).find(
    (p) => p._id !== currentUser?.id
  ) || conversation.participants?.[0]; 

  const myUnreadData = (conversation.unreadCounts ?? []).find(
    (u) => u.userId === currentUser?.id
  );
  const unreadCount = myUnreadData?.count || 0;

  const formatLastActivity = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return format(date, 'HH:mm');
    }
    return format(date, 'dd/MM/yyyy');
  };

  return (
    <div 
      onClick={onClick}
      className={`group flex items-center gap-4 p-4 mx-2 mb-1 rounded-2xl cursor-pointer transition-all duration-200 ${
        isActive 
          ? 'bg-slate-800 shadow-lg' 
          : 'hover:bg-slate-800/50'
      }`}
    >
      <div className="relative shrink-0">
        {/* Profile Picture Container */}
        <div className="w-12 h-12 rounded-full overflow-hidden bg-linear-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-md relative">
          {otherUser?.avatar && !imgError ? (
            <Image
              src={otherUser.avatar}
              alt={otherUser.username || "Creator"}
              fill
              sizes="48px"
              className="object-cover"
              onError={() => setImgError(true)} // Switches to initials on error
            />
          ) : (
            <span>
              {otherUser?.fullName?.[0]?.toUpperCase() || otherUser?.username?.[0]?.toUpperCase() || 'H'}
            </span>
          )}
        </div>
        
        {/* Status Indicator */}
        {otherUser?.status === 'online' && (
          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-slate-900 rounded-full z-10" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-1">
          <h4 className={`text-sm font-semibold truncate ${isActive ? 'text-white' : 'text-slate-200 group-hover:text-white'}`}>
            {otherUser?.fullName || otherUser?.username || otherUser?.email.split('@')[0]}
          </h4>
          
          <span className="text-[10px] text-slate-500 shrink-0 ml-2">
            {conversation.lastMessage 
              ? formatLastActivity(conversation.lastMessage.createdAt) 
              : ''}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <p className="text-xs text-slate-500 truncate mr-2 ">
            {/* CHANGED: Updated default text here */}
            {conversation.lastMessage?.content || "Start Collaborating"}
          </p>
          {unreadCount > 0 && (
            <span className="bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
              {unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};