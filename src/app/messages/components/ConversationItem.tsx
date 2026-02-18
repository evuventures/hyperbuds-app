"use client"
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAppSelector } from '@/store/hooks'; 
import { format, isToday } from 'date-fns';
import { Conversation } from '@/types/messaging.types';

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick?: () => void;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({ 
  conversation, 
  isActive 
}) => {
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const [imgError, setImgError] = useState(false);

  // Standardized ID logic
  const currentUserId = currentUser?.id || currentUser?._id;

  // Identify the other participant
  const otherUser = (conversation.participants ?? []).find(
    (p) => p._id !== currentUserId && p.id !== currentUserId
  ) || conversation.participants?.[0]; 

  // Calculate unread count for the current user
  const myUnreadData = (conversation.unreadCounts ?? []).find(
    (u) => u.userId === currentUserId
  );
  const unreadCount = myUnreadData?.count || 0;

  const formatLastActivity = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) return format(date, 'h:mm a');
    return format(date, 'dd/MM/yyyy');
  };

  return (
    <Link 
      href={`/messages/${conversation._id}`}
      prefetch={true}
      className={`group flex items-center gap-4 p-4 mx-2 mb-1 rounded-2xl cursor-pointer transition-all duration-200 ${
        isActive ? 'bg-slate-800 shadow-lg' : 'hover:bg-slate-800/50'
      }`}
    >
      <div className="relative shrink-0">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-linear-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-md relative">
          {otherUser?.avatar && !imgError ? (
            <Image
              src={otherUser.avatar}
              alt={otherUser.username || "Creator"}
              fill
              sizes="48px"
              className="object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <span className="capitalize text-white">
              {otherUser?.username?.[0] || otherUser?.email?.[0] || 'H'}
            </span>
          )}
        </div>
        
        {otherUser?.status === 'online' && (
          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-slate-900 rounded-full z-10" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-1">
          <h4 className={`text-sm font-semibold truncate ${isActive ? 'text-white' : 'text-slate-200 group-hover:text-white'}`}>
            {otherUser?.username || otherUser?.fullName || otherUser?.email?.split('@')[0]}
          </h4>
          
          <span className={`text-[10px] shrink-0 ml-2 ${unreadCount > 0 ? 'text-purple-400 font-bold' : 'text-slate-500'}`}>
            {conversation.lastMessage 
              ? formatLastActivity(conversation.lastMessage.createdAt) 
              : ''}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <p className={`text-xs truncate mr-2 ${unreadCount > 0 ? 'text-white font-medium' : 'text-slate-500'}`}>
            {conversation.lastMessage?.content || "start collaborating"}
          </p>
          
          {unreadCount > 0 && (
            <span className="flex items-center justify-center min-w-5 h-5 px-1.5 bg-purple-600 text-white text-[10px] font-bold rounded-full shadow-lg animate-in zoom-in duration-300">
              {unreadCount}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};