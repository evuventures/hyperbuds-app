"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Phone, Video, Info, ArrowLeft, MoreHorizontal } from 'lucide-react';
import { Conversation } from '@/types/messaging.types';
import { getInitials, getOnlineParticipantsCount } from '@/lib/utils/messageMappers';

interface ChatHeaderProps {
   conversation: Conversation | null;
   onArchive?: (conversationId: string) => void;
   onVideoCall?: () => void;
   onVoiceCall?: () => void;
   onInfoClick?: () => void;
   onBack?: () => void;
   showBackButton?: boolean;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
   conversation,
   onArchive,
   onVideoCall,
   onVoiceCall,
   onInfoClick,
   onBack,
   showBackButton = false,
}) => {
   const [showMenu, setShowMenu] = useState(false);

   const getDisplayName = () => {
      if (!conversation) return 'No conversation selected';

      if (conversation.type === 'direct' && conversation.participants.length === 2) {
         const otherParticipant = conversation.participants.find(p => p._id !== 'current-user');
         return otherParticipant?.name || otherParticipant?.email || 'Unknown User';
      }

      const participantNames = conversation.participants.slice(0, 3).map(p => p.name || p.email);
      return participantNames.length > 3
         ? `${participantNames.join(', ')} and ${conversation.participants.length - 3} others`
         : participantNames.join(', ');
   };

   const getAvatar = () => {
      if (!conversation) return null;

      if (conversation.type === 'direct' && conversation.participants.length === 2) {
         return conversation.participants.find(p => p._id !== 'current-user')?.avatar;
      }

      return null;
   };

   const getSubtitle = () => {
      if (!conversation) return 'Choose a conversation to start chatting';

      if (conversation.type === 'direct') {
         const otherParticipant = conversation.participants.find(p => p._id !== 'current-user');
         if (otherParticipant) {
            const statusText = otherParticipant.status === 'online' ? 'Online' :
               otherParticipant.status === 'away' ? 'Away' : 'Offline';
            return statusText;
         }
      } else {
         const onlineCount = getOnlineParticipantsCount(conversation);
         const totalCount = conversation.participants.length;
         return `${onlineCount} of ${totalCount} online`;
      }
      return '';
   };

   const handleMenuAction = (action: string) => {
      setShowMenu(false);
      switch (action) {
         case 'archive':
            if (conversation) {
               onArchive?.(conversation._id);
            }
            break;
         case 'video':
            onVideoCall?.();
            break;
         case 'voice':
            onVoiceCall?.();
            break;
         case 'info':
            onInfoClick?.();
            break;
      }
   };

   const displayName = getDisplayName();
   const avatar = getAvatar();
   const subtitle = getSubtitle();

   return (
      <div className="flex justify-between items-center p-3 bg-white border-b border-gray-300 md:p-4 dark:bg-gray-900 dark:border-gray-700">
         {/* Left side - User info */}
         <div className="flex flex-1 gap-2 items-center min-w-0 md:gap-3">
            {/* Back button for mobile */}
            {showBackButton && (
               <button
                  onClick={onBack}
                  className="flex-shrink-0 p-1.5 md:p-2 text-gray-500 rounded-lg transition-colors dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 md:hidden"
               >
                  <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
               </button>
            )}

            {/* Avatar */}
            <div className="relative flex-shrink-0">
               {avatar ? (
                  <Image
                     src={avatar}
                     alt={displayName}
                     width={40}
                     height={40}
                     className="object-cover w-8 h-8 rounded-full md:w-10 md:h-10"
                  />
               ) : (
                  <div className="flex justify-center items-center w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full md:w-10 md:h-10">
                     <span className="text-xs font-medium text-white md:text-sm">
                        {getInitials(displayName)}
                     </span>
                  </div>
               )}

               {/* Online indicator */}
               {conversation && conversation.type === 'direct' && conversation.participants.length === 2 && (
                  <div className="absolute -right-1 -bottom-1 w-2.5 h-2.5 md:w-3 md:h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
               )}
            </div>

            {/* Name and status */}
            <div className="flex-1 min-w-0">
               <h2 className="text-base font-semibold text-gray-900 truncate md:text-lg dark:text-white">
                  {displayName}
               </h2>
               {subtitle && (
                  <p className="text-xs text-gray-500 truncate md:text-sm dark:text-gray-400">
                     {subtitle}
                  </p>
               )}
            </div>
         </div>

         {/* Right side - Actions */}
         <div className="flex gap-0.5 md:gap-1 items-center">
            {/* Voice call - Hidden on mobile */}
            <button
               onClick={() => handleMenuAction('voice')}
               className="hidden p-2 text-gray-500 rounded-lg transition-colors cursor-pointer md:flex dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
               title="Voice call"
            >
               <Phone className="w-5 h-5" />
            </button>

            {/* Video call - Hidden on mobile */}
            <button
               onClick={() => handleMenuAction('video')}
               className="hidden p-2 text-gray-500 rounded-lg transition-colors cursor-pointer md:flex dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
               title="Video call"
            >
               <Video className="w-5 h-5" />
            </button>

            {/* Info - Hidden on mobile */}
            <button
               onClick={() => handleMenuAction('info')}
               className="hidden p-2 text-gray-500 rounded-lg transition-colors cursor-pointer md:flex dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
               title="Conversation info"
            >
               <Info className="w-5 h-5" />
            </button>

            {/* More options */}
            <div className="relative">
               <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1.5 md:p-2 text-gray-500 rounded-lg transition-colors cursor-pointer dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                  title="More options"
               >
                  <MoreHorizontal className="w-4 h-4 md:w-5 md:h-5" />
               </button>

               {/* Dropdown menu */}
               {showMenu && (
                  <>
                     {/* Backdrop */}
                     <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowMenu(false)}
                     />

                     {/* Menu */}
                     <div className="absolute right-0 top-full z-20 mt-2 w-48 bg-white rounded-lg border border-gray-300 shadow-lg dark:bg-gray-800 dark:border-gray-700">
                        <div className="py-1">
                           <button
                              onClick={() => handleMenuAction('info')}
                              className="px-4 py-2 w-full text-sm text-left text-gray-700 cursor-pointer dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                           >
                              View Info
                           </button>

                           <button
                              onClick={() => handleMenuAction('video')}
                              className="px-4 py-2 w-full text-sm text-left text-gray-700 cursor-pointer dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                           >
                              Start Video Call
                           </button>

                           <button
                              onClick={() => handleMenuAction('voice')}
                              className="px-4 py-2 w-full text-sm text-left text-gray-700 cursor-pointer dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                           >
                              Start Voice Call
                           </button>

                           <div className="my-1 border-t border-gray-300 dark:border-gray-700"></div>

                           <button
                              onClick={() => handleMenuAction('archive')}
                              className="px-4 py-2 w-full text-sm text-left text-red-600 cursor-pointer dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                           >
                              Archive Chat
                           </button>
                        </div>
                     </div>
                  </>
               )}
            </div>
         </div>
      </div>
   );
};
