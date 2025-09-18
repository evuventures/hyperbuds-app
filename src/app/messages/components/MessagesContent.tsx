"use client";

import React from "react";
import { ChatList } from "@/components/messaging/ChatInterface/ChatList";
import { ChatHeader } from "@/components/messaging/ChatInterface/ChatHeader";
import { ChatMessages } from "@/components/messaging/ChatInterface/ChatMessages";
import { ChatInput } from "@/components/messaging/ChatInterface/ChatInput";
import { MessagingSkeleton } from "@/components/messaging/skeletons/MessagingSkeleton";
import { useAuth } from "@/hooks/auth/useAuth";
import { useMessaging } from "@/hooks/messaging/useMessaging";
import { mapStoreMessagesToComponents } from "@/lib/utils/messageMappers";

export const MessagesContent: React.FC = () => {
   const { user, accessToken, loading: authLoading } = useAuth();
   const {
      conversations,
      currentConversation,
      messages,
      typingUsers,
      loadingConversations,
      loadingMessages,
      isConnected,
      error,
      selectConversation,
      sendMessage,
      sendMessageWithAttachments,
      archiveConversation,
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
   };

   const handleArchiveConversation = (conversationId: string) => {
      archiveConversation(conversationId);
   };

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
                  onClick={() => {
                     localStorage.setItem('accessToken', 'demo-token-12345');
                     window.location.reload();
                  }}
                  className="px-4 py-2 text-white bg-blue-500 rounded-lg transition-colors hover:bg-blue-600"
               >
                  Use Demo Mode
               </button>
            </div>
         </div>
      );
   }

   // Show connection warning but continue with interface (only in production)
   const showConnectionWarning = !isConnected && !loadingConversations && process.env.NODE_ENV === 'production';

   return (
      <div className="flex h-[90vh] bg-gray-100 dark:bg-gray-900">
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

         {/* Chat List Sidebar */}
         <div className="w-1/3 bg-white border-r border-gray-200 dark:border-gray-700 dark:bg-gray-800">
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
         <div className="flex flex-col flex-1">
            {currentConversation ? (
               <>
                  <ChatHeader
                     conversation={currentConversation}
                     onArchive={handleArchiveConversation}
                     onVideoCall={() => console.log("Video call clicked")}
                     onVoiceCall={() => console.log("Voice call clicked")}
                     onInfoClick={() => console.log("Info clicked")}
                  />
                  <ChatMessages
                     messages={mapStoreMessagesToComponents(messages, user?.id)}
                     loading={loadingMessages}
                     typingUsers={(typingUsers[currentConversation._id] || []).map(user => user.name)}
                  />
                  <ChatInput
                     onSendMessage={handleSendMessage}
                     onAttachment={handleSendMessageWithAttachments}
                     onTypingStart={() => handleTypingStart(currentConversation._id)}
                     onTypingStop={() => handleTypingStop(currentConversation._id)}
                     typingIndicator={{
                        users: (typingUsers[currentConversation._id] || []).map(user => user.name),
                        isTyping: (typingUsers[currentConversation._id] || []).length > 0
                     }}
                  />
               </>
            ) : (
               <div className="flex justify-center items-center h-full text-gray-500 dark:text-gray-400">
                  <div className="text-center">
                     <div className="mb-4 text-6xl">💬</div>
                     <h3 className="mb-2 text-xl font-semibold">No conversation selected</h3>
                     <p className="text-sm">Choose a conversation from the sidebar to start chatting</p>
                  </div>
               </div>
            )}
         </div>
      </div>
   );
};