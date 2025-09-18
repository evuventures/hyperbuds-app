"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChatHeader } from "@/components/messaging/ChatInterface/ChatHeader";
import { ChatMessages } from "@/components/messaging/ChatInterface/ChatMessages";
import { ChatInput } from "@/components/messaging/ChatInterface/ChatInput";
import { MessagingSkeleton } from "@/components/messaging/skeletons/MessagingSkeleton";
import { useAuth } from "@/hooks/auth/useAuth";
import { useMessaging } from "@/hooks/messaging/useMessaging";
import { mapStoreMessagesToComponents } from "@/lib/utils/messageMappers";

interface ConversationContentProps {
   conversationId: string;
}

export const ConversationContent: React.FC<ConversationContentProps> = ({ conversationId }) => {
   const router = useRouter();
   const { user, accessToken, loading: authLoading } = useAuth();
   const {
      currentConversation,
      messages,
      typingUsers,
      loadingMessages,
      loadingMoreMessages,
      hasMoreMessages,
      isConnected,
      error,
      selectConversation,
      sendMessage,
      sendMessageWithAttachments,
      archiveConversation,
      markAsRead,
      deleteMessage,
      loadMoreMessages,
      handleTypingStart,
      handleTypingStop,
   } = useMessaging(accessToken || '');

   // Load conversation when component mounts
   useEffect(() => {
      if (conversationId && accessToken) {
         selectConversation(conversationId);
      }
   }, [conversationId, accessToken, selectConversation]);

   // Mark messages as read when conversation is selected
   useEffect(() => {
      if (currentConversation && currentConversation._id === conversationId) {
         markAsRead(conversationId);
      }
   }, [currentConversation, conversationId, markAsRead]);

   const handleSendMessage = async (content: string) => {
      if (currentConversation) {
         await sendMessage(currentConversation._id, content);
      }
   };

   const handleSendMessageWithAttachments = async (files: File[], textContent?: string) => {
      if (!currentConversation) return;
      await sendMessageWithAttachments(currentConversation._id, textContent || '', files);
   };

   const handleArchiveConversation = (conversationId: string) => {
      archiveConversation(conversationId);
      router.push('/messages');
   };

   // Show skeleton while loading
   if (authLoading || loadingMessages) {
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
                  onClick={() => selectConversation(conversationId)}
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

   // Show connection status
   if (!isConnected) {
      return (
         <div className="flex justify-center items-center h-full">
            <div className="text-center">
               <div className="mb-4 text-yellow-500">
                  Connecting to messaging service...
               </div>
               <div className="mx-auto w-8 h-8 rounded-full border-b-2 border-blue-500 animate-spin"></div>
            </div>
         </div>
      );
   }

   // Show conversation not found
   if (!currentConversation) {
      return (
         <div className="flex justify-center items-center h-full">
            <div className="text-center">
               <div className="mb-4 text-6xl">❌</div>
               <h3 className="mb-2 text-xl font-semibold">Conversation not found</h3>
               <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                  The conversation you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
               </p>
               <button
                  onClick={() => router.push('/messages')}
                  className="px-4 py-2 text-white bg-blue-500 rounded-lg transition-colors hover:bg-blue-600"
               >
                  Back to Messages
               </button>
            </div>
         </div>
      );
   }

   return (
      <div className="flex flex-col h-[90vh] bg-gray-100 dark:bg-gray-900">
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
            onMessageDelete={deleteMessage}
            onLoadMore={loadMoreMessages}
            hasMoreMessages={hasMoreMessages}
            loadingMore={loadingMoreMessages}
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
      </div>
   );
};
