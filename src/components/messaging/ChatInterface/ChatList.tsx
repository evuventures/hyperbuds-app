"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Search, Plus, Filter, MoreHorizontal, MessageSquare } from 'lucide-react';
import { Conversation, MessageSearchResult } from '@/types/messaging.types';
import { formatConversationTimestamp, getInitials, truncateMessageContent } from '@/lib/utils/messageMappers';
import { MessageSearch } from './MessageSearch';

interface ChatListProps {
   conversations: Conversation[];
   selectedConversationId?: string;
   onSelect: (conversationId: string) => void;
   onCreateNew?: () => void;
   loading?: boolean;
   onSearchMessages?: (query: string) => Promise<MessageSearchResult[]>;
}

export const ChatList: React.FC<ChatListProps> = ({
   conversations,
   selectedConversationId,
   onSelect,
   onCreateNew,
   loading = false,
   onSearchMessages,
}) => {
   const [searchQuery, setSearchQuery] = useState('');
   const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'archived'>('all');
   const [showMessageSearch, setShowMessageSearch] = useState(false);

   // Filter conversations based on search and tab
   const filteredConversations = conversations.filter(conversation => {
      const matchesSearch = searchQuery === '' ||
         conversation.participants.some(p => p.email.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesTab =
         (activeTab === 'all') ||
         (activeTab === 'unread' && conversation.unreadCount > 0) ||
         (activeTab === 'archived'); // Note: archived not supported in current API

      return matchesSearch && matchesTab;
   });

   // Sort conversations by last message time
   const sortedConversations = [...filteredConversations].sort((a, b) => {
      const timeA = new Date(a.lastActivity).getTime();
      const timeB = new Date(b.lastActivity).getTime();
      return timeB - timeA;
   });

   const getConversationDisplayName = (conversation: Conversation) => {
      if (conversation.type === 'direct' && conversation.participants.length === 2) {
         // For direct messages, show the other participant's email
         return conversation.participants.find(p => p._id !== 'current-user')?.email || 'Unknown User';
      }

      return 'Unknown Conversation';
   };

   const getConversationAvatar = (conversation: Conversation) => {
      if (conversation.type === 'direct' && conversation.participants.length === 2) {
         return conversation.participants.find(p => p._id !== 'current-user')?.avatar;
      }

      return null;
   };

   const getOnlineParticipantsCount = (conversation: Conversation) => {
      return conversation.participants.filter(p => p.status === 'online').length;
   };

   if (loading) {
      return (
         <div className="flex flex-col h-full w-full bg-white dark:bg-gray-900">
            <div className="p-4 border-b border-gray-300 dark:border-gray-700">
               <div className="mb-4 h-8 bg-gray-200 rounded animate-pulse dark:bg-gray-700"></div>
               <div className="h-10 bg-gray-200 rounded animate-pulse dark:bg-gray-700"></div>
            </div>
            <div className="flex-1 p-4 space-y-4">
               {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                     <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse dark:bg-gray-700"></div>
                     <div className="flex-1">
                        <div className="mb-2 h-4 bg-gray-200 rounded animate-pulse dark:bg-gray-700"></div>
                        <div className="w-3/4 h-3 bg-gray-200 rounded animate-pulse dark:bg-gray-700"></div>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      );
   }

   return (
      <div className="flex flex-col h-full w-full bg-white dark:bg-gray-900">
         {/* Header */}
         <div className="p-3 md:p-4 w-full border-b border-gray-300 dark:border-gray-700">
            <div className="flex justify-between items-center mb-3 md:mb-4">
               <h1 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                  Messages
               </h1>
               <button
                  onClick={onCreateNew}
                  className="p-1.5 md:p-2 text-gray-500 rounded-lg transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
               >
                  <Plus className="w-4 h-4 md:w-5 md:h-5" />
               </button>
            </div>

            {/* Search Bar */}
            <div className="relative mb-3 md:mb-4">
               <Search className="absolute left-3 top-1/2 w-4 h-4 text-gray-400 transform -translate-y-1/2 dark:text-gray-500" />
               <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="py-2 pr-16 md:pr-20 pl-10 w-full text-sm placeholder-gray-500 text-gray-900 bg-gray-50 rounded-lg border border-gray-300 transition-all duration-200 dark:bg-gray-800 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:bg-white dark:focus:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
               />
               <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex space-x-1">
                  <button
                     onClick={() => setShowMessageSearch(true)}
                     className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                     title="Search messages"
                  >
                     <MessageSquare className="w-4 h-4" />
                  </button>
                  <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                     <Filter className="w-4 h-4" />
                  </button>
               </div>
            </div>

            {/* Tabs */}
            <div className="flex p-1 bg-gray-100 rounded-lg dark:bg-gray-800">
               <button
                  onClick={() => setActiveTab('all')}
                  className={`flex-1 cursor-pointer py-1.5 md:py-2 px-2 md:px-3 text-xs md:text-sm font-medium rounded-md transition-colors ${activeTab === 'all'
                     ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                     : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                     }`}
               >
                  All
               </button>
               <button
                  onClick={() => setActiveTab('unread')}
                  className={`flex-1 cursor-pointer py-1.5 md:py-2 px-2 md:px-3 text-xs md:text-sm font-medium rounded-md transition-colors ${activeTab === 'unread'
                     ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                     : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                     }`}
               >
                  Unread
               </button>
               <button
                  onClick={() => setActiveTab('archived')}
                  className={`flex-1 cursor-pointer py-1.5 md:py-2 px-2 md:px-3 text-xs md:text-sm font-medium rounded-md transition-colors ${activeTab === 'archived'
                     ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                     : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                     }`}
               >
                  Archived
               </button>
            </div>
         </div>

         {/* Conversation List */}
         <div className="overflow-y-auto flex-1 w-full scrollbar-hide hover:scrollbar-thin hover:scrollbar-thumb-gray-300 hover:dark:scrollbar-thumb-gray-600">
            {sortedConversations.length === 0 ? (
               <div className="flex flex-col justify-center items-center h-full text-gray-500 dark:text-gray-400">
                  <div className="text-center">
                     <div className="flex justify-center items-center mx-auto mb-4 w-16 h-16 bg-gray-200 rounded-full dark:bg-gray-700">
                        <Search className="w-8 h-8" />
                     </div>
                     <p className="mb-2 text-lg font-medium">No conversations found</p>
                     <p className="text-sm">
                        {searchQuery ? 'Try adjusting your search terms' : 'Start a new conversation'}
                     </p>
                  </div>
               </div>
            ) : (
               <div className="divide-y divide-gray-300 dark:divide-gray-700 w-full">
                  {sortedConversations.map((conversation) => {
                     const isSelected = conversation._id === selectedConversationId;
                     const displayName = getConversationDisplayName(conversation);
                     const avatar = getConversationAvatar(conversation);
                     const onlineCount = getOnlineParticipantsCount(conversation);
                     const lastMessage = conversation.lastMessage?.content || 'No messages yet';

                     return (
                        <div
                           key={conversation._id}
                           onClick={() => onSelect(conversation._id)}
                           className={`flex items-center gap-2 md:gap-3 p-3 md:p-4 w-full cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${isSelected ? 'bg-blue-50 border-r-2 border-blue-500 dark:bg-blue-900/20' : ''}`}
                        >
                           {/* Avatar */}
                           <div className="relative flex-shrink-0">
                              {avatar ? (
                                 <Image
                                    src={avatar}
                                    alt={displayName}
                                    width={48}
                                    height={48}
                                    className="object-cover w-10 h-10 md:w-12 md:h-12 rounded-full"
                                 />
                              ) : (
                                 <div className="flex justify-center items-center w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full">
                                    <span className="text-xs md:text-sm font-medium text-white">
                                       {getInitials(displayName)}
                                    </span>
                                 </div>
                              )}

                              {/* Online indicator for direct messages */}
                              {conversation.type === 'direct' && conversation.participants.length === 2 && (
                                 <div className="absolute -right-1 -bottom-1 w-3 h-3 md:w-4 md:h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                              )}

                              {/* Online count for group chats */}
                              {conversation.type === 'direct' && onlineCount > 0 && (
                                 <div className="flex absolute -right-1 -bottom-1 justify-center items-center w-3 h-3 md:w-4 md:h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900">
                                    <span className="text-[8px] md:text-[10px] font-medium text-white">{onlineCount}
                                    </span>
                                 </div>
                              )}
                           </div>

                           {/* Content */}
                           <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-center mb-1">
                                 <h3 className={`text-sm font-semibold truncate ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
                                    }`}>
                                    {displayName}
                                 </h3>
                                 <div className="flex gap-1 md:gap-2 items-center">
                                    {conversation.unreadCount > 0 && (
                                       <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-blue-500 rounded-full"></div>
                                    )}
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                       {formatConversationTimestamp(conversation.lastActivity)}
                                    </span>
                                 </div>
                              </div>

                              <p className="text-xs md:text-sm text-gray-600 truncate dark:text-gray-400">
                                 {truncateMessageContent(lastMessage)}
                              </p>

                              {conversation.unreadCount > 0 && (
                                 <div className="flex justify-between items-center mt-1">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                       {conversation.type === 'direct' ? 'Direct' : 'Group'}
                                    </span>
                                    <div className="bg-blue-500 text-white text-xs rounded-full px-1.5 md:px-2 py-0.5 md:py-1 min-w-[16px] md:min-w-[20px] text-center">
                                       {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                                    </div>
                                 </div>
                              )}
                           </div>

                           {/* More options - Hidden on mobile */}
                           <button
                              onClick={(e) => {
                                 e.stopPropagation();
                                 // Handle more options
                              }}
                              className="hidden md:block p-1 text-gray-400 rounded-full cursor-pointer group-hover:opacity-100 hover:text-gray-700 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600">
                              <MoreHorizontal className="w-4 h-4 rounded-full" />
                           </button>
                        </div>
                     );
                  })}
               </div>
            )}
         </div>

         {/* Message Search Modal */}
         {showMessageSearch && onSearchMessages && (
            <MessageSearch
               onSearch={onSearchMessages}
               onClose={() => setShowMessageSearch(false)}
               onMessageClick={(conversationId) => {
                  onSelect(conversationId);
                  // TODO: Scroll to specific message
               }}
            />
         )}
      </div>
   );
};
