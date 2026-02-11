"use client";

import React, { useState, useEffect } from "react";
import { ChatList } from "@/components/messaging/ChatInterface/ChatList";
import { ChatHeader } from "@/components/messaging/ChatInterface/ChatHeader";
import { ChatMessages } from "@/components/messaging/ChatInterface/ChatMessages";
import { ChatInput } from "@/components/messaging/ChatInterface/ChatInput";
import { MessagingSkeleton } from "@/components/messaging/skeletons/MessagingSkeleton";
import { useAuth } from "@/hooks/auth/useAuth";
import { useMessaging } from "@/hooks/messaging/useMessaging";
import { mapStoreMessagesToComponents } from "@/lib/utils/messageMappers";

export const MessagesContent: React.FC = () => {
   const [showSidebar, setShowSidebar] = useState(false);
   const { user, accessToken, loading: authLoading } = useAuth();
   const {
      conversations,
      currentConversation,
      messages,
      typingUsers,
      loadingConversations,
      loadingMessages,
      loadingMoreMessages,
      hasMoreMessages,
      isConnected,
      error,
      selectConversation,
      sendMessage,
      sendMessageWithAttachments,
      archiveConversation,
      deleteMessage,
      loadMoreMessages,
      searchMessages,
      handleTypingStart,
      handleTypingStop,
      refreshConversations
   } = useMessaging(accessToken || '');

   const handleSendMessage = async (content: string) => {
      if (currentConversation) {
         await sendMessage(currentConversation._id, content);
      }
   };

   const handleSendMessageWithAttachments = async (files: File[], textContent?: string) => {
      if (!currentConversation) return;
      await sendMessageWithAttachments(currentConversation._id, textContent || '', files);
   };

   const handleCreateNewConversation = async () => {
      // TODO: Implement create new conversation modal
      console.log('Create new conversation');
   };

   const handleSelectConversation = (conversationId: string) => {
      selectConversation(conversationId);
      // Close sidebar on mobile after selecting a conversation
      setShowSidebar(false);
   };

   const handleArchiveConversation = (conversationId: string) => {
      archiveConversation(conversationId);
   };

   const handleBackToSidebar = () => {
      setShowSidebar(true);
   };

   // Show sidebar by default on mobile when no conversation is selected
   useEffect(() => {
      if (!currentConversation && window.innerWidth < 768) {
         setShowSidebar(true);
      } else if (currentConversation && window.innerWidth < 768) {
         setShowSidebar(false);
      }
   }, [currentConversation]);

   // Show skeleton while loading
   if (authLoading || loadingConversations) {
      return <MessagingSkeleton />;
   }

   // Show error state
   if (error) {
      return (
         <div className="flex justify-center items-center h-full">
            <div className="text-center">
               <div className="mb-4 text-red-500">
                  Error: {error}
               </div>
               <button
                  onClick={() => refreshConversations()}
                  className="px-4 py-2 text-white bg-blue-500 rounded-lg transition-colors hover:bg-blue-600"
               >
                  Retry
               </button>
            </div>
         </div>
      );
   }

   // Show no access token state
   if (!accessToken) {
      return (
         <div className="flex justify-center items-center h-full">
            <div className="text-center">
               <div className="mb-4 text-red-500">
                  Please log in to access messages
               </div>
               <button
                  onClick={() => window.location.href = '/login'}
                  className="px-4 py-2 text-white bg-blue-500 rounded-lg transition-colors hover:bg-blue-600"
               >
                  Go to Login
               </button>
            </div>
         </div>
      );
   }

   // Show connection warning but continue with interface (only in production)
   const showConnectionWarning = !isConnected && !loadingConversations && process.env.NODE_ENV === 'production';

   return (
      <div
         className="flex bg-gray-100 dark:bg-gray-900"
      >
         {/* Connection Warning */}
         {showConnectionWarning && (
            <div className="absolute top-4 right-4 z-50 p-3 max-w-sm bg-yellow-100 rounded-lg border border-yellow-300 dark:bg-yellow-900 dark:border-yellow-700">
               <div className="flex items-center">
                  <div className="flex-shrink-0">
                     <svg className="w-5 h-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                     </svg>
                  </div>
                  <div className="ml-3">
                     <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        Real-time features unavailable. Messages will sync when connection is restored.
                     </p>
                  </div>
               </div>
            </div>
         )}

         {/* Mobile Sidebar Overlay */}
         {showSidebar && (
            <div
               className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
               onClick={() => setShowSidebar(false)}
            />
         )}

         {/* Chat List Sidebar - Mobile overlay or desktop sidebar */}
         <div className={`${showSidebar ? 'fixed inset-y-0 left-0 z-50 w-80' : 'hidden'} md:flex md:w-1/3 h-screen bg-white border-r border-gray-200 dark:border-gray-700 dark:bg-gray-900`}>
            <ChatList
               conversations={conversations}
               selectedConversationId={currentConversation?._id}
               onSelect={handleSelectConversation}
               onCreateNew={handleCreateNewConversation}
               loading={loadingConversations}
               onSearchMessages={searchMessages}
            />
         </div>

         {/* Chat Interface */}
         <div className="flex flex-col flex-1 w-full h-[90vh] md:w-2/3">
            {/* Always show ChatHeader, ChatMessages, and ChatInput */}
            <div className="flex-shrink-0">
               <ChatHeader
                  conversation={currentConversation}
                  onArchive={handleArchiveConversation}
                  onVideoCall={() => {/* TODO: Implement video call */ }}
                  onVoiceCall={() => {/* TODO: Implement voice call */ }}
                  onInfoClick={() => {/* TODO: Implement info modal */ }}
                  showBackButton={true}
                  onBack={handleBackToSidebar}
               />
            </div>
            <div className="overflow-hidden flex-1 min-h-0">
               <ChatMessages
                  messages={currentConversation ? mapStoreMessagesToComponents(messages, user?.id) : []}
                  loading={loadingMessages}
                  typingUsers={(currentConversation ? typingUsers[currentConversation._id] || [] : []).map(user => user.name)}
                  onMessageDelete={currentConversation ? deleteMessage : undefined}
                  onLoadMore={currentConversation ? loadMoreMessages : undefined}
                  hasMoreMessages={currentConversation ? hasMoreMessages : false}
                  loadingMore={currentConversation ? loadingMoreMessages : false}
                  noConversationSelected={!currentConversation}
               />
            </div>
            <div className="flex-shrink-0">
               <ChatInput
                  onSendMessage={handleSendMessage}
                  onAttachment={handleSendMessageWithAttachments}
                  onTypingStart={() => currentConversation && handleTypingStart(currentConversation._id)}
                  onTypingStop={() => currentConversation && handleTypingStop(currentConversation._id)}
                  typingIndicator={{
                     users: (currentConversation ? typingUsers[currentConversation._id] || [] : []).map(user => user.name),
                     isTyping: (currentConversation ? typingUsers[currentConversation._id] || [] : []).length > 0
                  }}
                  disabled={!currentConversation}
                  placeholder={currentConversation ? "Type a message..." : "Select a conversation to start chatting"}
               />
            </div>
         </div>
      </div>
   );
};