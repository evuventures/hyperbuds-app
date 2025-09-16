"use client";

import React, { useState, useEffect } from "react";
import { ChatList } from "@/components/messaging/ChatInterface/ChatList";
import { ChatHeader } from "@/components/messaging/ChatInterface/ChatHeader";
import { ChatMessages } from "@/components/messaging/ChatInterface/ChatMessages";
import { ChatInput } from "@/components/messaging/ChatInterface/ChatInput";
import { useAuth } from "@/hooks/auth/useAuth";
import { mapStoreMessagesToComponents } from "@/lib/utils/messageMappers";
import { Conversation, Message } from "@/types/messaging.types";

export const MessagesContent: React.FC = () => {
   const { user, accessToken, loading: authLoading } = useAuth();
   const [conversations, setConversations] = useState<Conversation[]>([]);
   const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
   const [messages, setMessages] = useState<Message[]>([]);
   const [loading, setLoading] = useState(true);

   // Initialize with mock data since backend isn't ready
   useEffect(() => {
      if (!authLoading) {
         const initializeMockData = () => {
            // Mock conversations data - Extended for scrollbar testing
            const mockConversations: Conversation[] = [
               {
                  id: "conv-1",
                  type: "direct",
                  participants: [
                     { id: "user-1", name: "John Doe", email: "john@example.com", status: "online" },
                     { id: user?.id || "current-user", name: user?.name || "You", email: user?.email || "you@example.com", status: "online" }
                  ],
                  lastMessage: {
                     id: "msg-1",
                     conversationId: "conv-1",
                     senderId: "user-1",
                     content: "Hey! How are you doing?",
                     type: "text",
                     timestamp: new Date().toISOString(),
                     status: "read"
                  },
                  lastMessageAt: new Date().toISOString(),
                  unreadCount: 0,
                  isArchived: false,
                  isMuted: false,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
               },
               {
                  id: "conv-2",
                  type: "direct",
                  participants: [
                     { id: "user-2", name: "Jane Smith", email: "jane@example.com", status: "offline" },
                     { id: user?.id || "current-user", name: user?.name || "You", email: user?.email || "you@example.com", status: "online" }
                  ],
                  lastMessage: {
                     id: "msg-2",
                     conversationId: "conv-2",
                     senderId: "user-2",
                     content: "Thanks for the update!",
                     type: "text",
                     timestamp: new Date(Date.now() - 3600000).toISOString(),
                     status: "read"
                  },
                  lastMessageAt: new Date(Date.now() - 3600000).toISOString(),
                  unreadCount: 2,
                  isArchived: false,
                  isMuted: false,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
               },
               {
                  id: "conv-3",
                  type: "group",
                  name: "Team Chat",
                  participants: [
                     { id: "user-3", name: "Alice Johnson", email: "alice@example.com", status: "online" },
                     { id: "user-4", name: "Bob Wilson", email: "bob@example.com", status: "away" },
                     { id: user?.id || "current-user", name: user?.name || "You", email: user?.email || "you@example.com", status: "online" }
                  ],
                  lastMessage: {
                     id: "msg-3",
                     conversationId: "conv-3",
                     senderId: "user-3",
                     content: "Meeting at 3 PM today",
                     type: "text",
                     timestamp: new Date(Date.now() - 7200000).toISOString(),
                     status: "read"
                  },
                  lastMessageAt: new Date(Date.now() - 7200000).toISOString(),
                  unreadCount: 1,
                  isArchived: false,
                  isMuted: false,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
               },
               {
                  id: "conv-4",
                  type: "direct",
                  participants: [
                     { id: "user-5", name: "Mike Chen", email: "mike@example.com", status: "online" },
                     { id: user?.id || "current-user", name: user?.name || "You", email: user?.email || "you@example.com", status: "online" }
                  ],
                  lastMessage: {
                     id: "msg-4",
                     conversationId: "conv-4",
                     senderId: "user-5",
                     content: "Can we reschedule our call?",
                     type: "text",
                     timestamp: new Date(Date.now() - 10800000).toISOString(),
                     status: "delivered"
                  },
                  lastMessageAt: new Date(Date.now() - 10800000).toISOString(),
                  unreadCount: 0,
                  isArchived: false,
                  isMuted: false,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
               },
               {
                  id: "conv-5",
                  type: "direct",
                  participants: [
                     { id: "user-6", name: "Sarah Williams", email: "sarah@example.com", status: "away" },
                     { id: user?.id || "current-user", name: user?.name || "You", email: user?.email || "you@example.com", status: "online" }
                  ],
                  lastMessage: {
                     id: "msg-5",
                     conversationId: "conv-5",
                     senderId: user?.id || "current-user",
                     content: "Sure, let's meet tomorrow!",
                     type: "text",
                     timestamp: new Date(Date.now() - 14400000).toISOString(),
                     status: "read"
                  },
                  lastMessageAt: new Date(Date.now() - 14400000).toISOString(),
                  unreadCount: 0,
                  isArchived: false,
                  isMuted: false,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
               },
               {
                  id: "conv-6",
                  type: "group",
                  name: "Project Alpha",
                  participants: [
                     { id: "user-7", name: "David Brown", email: "david@example.com", status: "online" },
                     { id: "user-8", name: "Lisa Garcia", email: "lisa@example.com", status: "online" },
                     { id: "user-9", name: "Tom Wilson", email: "tom@example.com", status: "offline" },
                     { id: user?.id || "current-user", name: user?.name || "You", email: user?.email || "you@example.com", status: "online" }
                  ],
                  lastMessage: {
                     id: "msg-6",
                     conversationId: "conv-6",
                     senderId: "user-7",
                     content: "The new design looks amazing! 🎨",
                     type: "text",
                     timestamp: new Date(Date.now() - 18000000).toISOString(),
                     status: "read"
                  },
                  lastMessageAt: new Date(Date.now() - 18000000).toISOString(),
                  unreadCount: 3,
                  isArchived: false,
                  isMuted: false,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
               },
               {
                  id: "conv-7",
                  type: "direct",
                  participants: [
                     { id: "user-10", name: "Emma Davis", email: "emma@example.com", status: "offline" },
                     { id: user?.id || "current-user", name: user?.name || "You", email: user?.email || "you@example.com", status: "online" }
                  ],
                  lastMessage: {
                     id: "msg-7",
                     conversationId: "conv-7",
                     senderId: "user-10",
                     content: "Thanks for the help yesterday!",
                     type: "text",
                     timestamp: new Date(Date.now() - 21600000).toISOString(),
                     status: "read"
                  },
                  lastMessageAt: new Date(Date.now() - 21600000).toISOString(),
                  unreadCount: 0,
                  isArchived: false,
                  isMuted: false,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
               },
               {
                  id: "conv-8",
                  type: "direct",
                  participants: [
                     { id: "user-11", name: "Alex Rodriguez", email: "alex@example.com", status: "online" },
                     { id: user?.id || "current-user", name: user?.name || "You", email: user?.email || "you@example.com", status: "online" }
                  ],
                  lastMessage: {
                     id: "msg-8",
                     conversationId: "conv-8",
                     senderId: user?.id || "current-user",
                     content: "Perfect, see you there!",
                     type: "text",
                     timestamp: new Date(Date.now() - 25200000).toISOString(),
                     status: "read"
                  },
                  lastMessageAt: new Date(Date.now() - 25200000).toISOString(),
                  unreadCount: 0,
                  isArchived: false,
                  isMuted: false,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
               },
               {
                  id: "conv-9",
                  type: "group",
                  name: "Marketing Team",
                  participants: [
                     { id: "user-12", name: "Jessica Lee", email: "jessica@example.com", status: "online" },
                     { id: "user-13", name: "Kevin Park", email: "kevin@example.com", status: "away" },
                     { id: "user-14", name: "Rachel Green", email: "rachel@example.com", status: "offline" },
                     { id: user?.id || "current-user", name: user?.name || "You", email: user?.email || "you@example.com", status: "online" }
                  ],
                  lastMessage: {
                     id: "msg-9",
                     conversationId: "conv-9",
                     senderId: "user-12",
                     content: "Campaign launch is tomorrow! 🚀",
                     type: "text",
                     timestamp: new Date(Date.now() - 28800000).toISOString(),
                     status: "read"
                  },
                  lastMessageAt: new Date(Date.now() - 28800000).toISOString(),
                  unreadCount: 1,
                  isArchived: false,
                  isMuted: false,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
               },
               {
                  id: "conv-10",
                  type: "direct",
                  participants: [
                     { id: "user-15", name: "Daniel Kim", email: "daniel@example.com", status: "online" },
                     { id: user?.id || "current-user", name: user?.name || "You", email: user?.email || "you@example.com", status: "online" }
                  ],
                  lastMessage: {
                     id: "msg-10",
                     conversationId: "conv-10",
                     senderId: "user-15",
                     content: "Let's grab lunch this week",
                     type: "text",
                     timestamp: new Date(Date.now() - 32400000).toISOString(),
                     status: "delivered"
                  },
                  lastMessageAt: new Date(Date.now() - 32400000).toISOString(),
                  unreadCount: 0,
                  isArchived: false,
                  isMuted: false,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
               },
               {
                  id: "conv-11",
                  type: "direct",
                  participants: [
                     { id: "user-16", name: "Sophie Turner", email: "sophie@example.com", status: "offline" },
                     { id: user?.id || "current-user", name: user?.name || "You", email: user?.email || "you@example.com", status: "online" }
                  ],
                  lastMessage: {
                     id: "msg-11",
                     conversationId: "conv-11",
                     senderId: user?.id || "current-user",
                     content: "The presentation went well!",
                     type: "text",
                     timestamp: new Date(Date.now() - 36000000).toISOString(),
                     status: "read"
                  },
                  lastMessageAt: new Date(Date.now() - 36000000).toISOString(),
                  unreadCount: 0,
                  isArchived: false,
                  isMuted: false,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
               },
               {
                  id: "conv-12",
                  type: "group",
                  name: "Design Reviews",
                  participants: [
                     { id: "user-17", name: "Mark Johnson", email: "mark@example.com", status: "online" },
                     { id: "user-18", name: "Anna Martinez", email: "anna@example.com", status: "online" },
                     { id: "user-19", name: "Chris Taylor", email: "chris@example.com", status: "away" },
                     { id: "user-20", name: "Nina Patel", email: "nina@example.com", status: "offline" },
                     { id: user?.id || "current-user", name: user?.name || "You", email: user?.email || "you@example.com", status: "online" }
                  ],
                  lastMessage: {
                     id: "msg-12",
                     conversationId: "conv-12",
                     senderId: "user-17",
                     content: "Feedback on the mockups: looks great!",
                     type: "text",
                     timestamp: new Date(Date.now() - 39600000).toISOString(),
                     status: "read"
                  },
                  lastMessageAt: new Date(Date.now() - 39600000).toISOString(),
                  unreadCount: 2,
                  isArchived: false,
                  isMuted: false,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
               },
               {
                  id: "conv-13",
                  type: "direct",
                  participants: [
                     { id: "user-21", name: "Ryan Murphy", email: "ryan@example.com", status: "online" },
                     { id: user?.id || "current-user", name: user?.name || "You", email: user?.email || "you@example.com", status: "online" }
                  ],
                  lastMessage: {
                     id: "msg-13",
                     conversationId: "conv-13",
                     senderId: "user-21",
                     content: "Coffee meeting at 10 AM?",
                     type: "text",
                     timestamp: new Date(Date.now() - 43200000).toISOString(),
                     status: "sent"
                  },
                  lastMessageAt: new Date(Date.now() - 43200000).toISOString(),
                  unreadCount: 0,
                  isArchived: false,
                  isMuted: false,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
               },
               {
                  id: "conv-14",
                  type: "direct",
                  participants: [
                     { id: "user-22", name: "Olivia White", email: "olivia@example.com", status: "away" },
                     { id: user?.id || "current-user", name: user?.name || "You", email: user?.email || "you@example.com", status: "online" }
                  ],
                  lastMessage: {
                     id: "msg-14",
                     conversationId: "conv-14",
                     senderId: user?.id || "current-user",
                     content: "Thanks for the collaboration!",
                     type: "text",
                     timestamp: new Date(Date.now() - 46800000).toISOString(),
                     status: "read"
                  },
                  lastMessageAt: new Date(Date.now() - 46800000).toISOString(),
                  unreadCount: 0,
                  isArchived: false,
                  isMuted: false,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
               },
               {
                  id: "conv-15",
                  type: "group",
                  name: "Weekly Standup",
                  participants: [
                     { id: "user-23", name: "James Wilson", email: "james@example.com", status: "online" },
                     { id: "user-24", name: "Maya Singh", email: "maya@example.com", status: "online" },
                     { id: "user-25", name: "Luke Anderson", email: "luke@example.com", status: "offline" },
                     { id: user?.id || "current-user", name: user?.name || "You", email: user?.email || "you@example.com", status: "online" }
                  ],
                  lastMessage: {
                     id: "msg-15",
                     conversationId: "conv-15",
                     senderId: "user-23",
                     content: "Standup meeting in 30 minutes",
                     type: "text",
                     timestamp: new Date(Date.now() - 50400000).toISOString(),
                     status: "read"
                  },
                  lastMessageAt: new Date(Date.now() - 50400000).toISOString(),
                  unreadCount: 1,
                  isArchived: false,
                  isMuted: false,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
               }
            ];

            // Mock messages for the first conversation
            const mockMessages: Message[] = [
               {
                  id: "msg-1",
                  conversationId: "conv-1",
                  senderId: "user-1",
                  content: "Hey! How are you doing?",
                  type: "text",
                  timestamp: new Date(Date.now() - 1800000).toISOString(),
                  status: "read"
               },
               {
                  id: "msg-2",
                  conversationId: "conv-1",
                  senderId: user?.id || "current-user",
                  content: "I'm doing great! Thanks for asking. How about you?",
                  type: "text",
                  timestamp: new Date(Date.now() - 1500000).toISOString(),
                  status: "read"
               },
               {
                  id: "msg-3",
                  conversationId: "conv-1",
                  senderId: "user-1",
                  content: "Pretty good! Just working on some new projects. Want to grab coffee sometime?",
                  type: "text",
                  timestamp: new Date(Date.now() - 900000).toISOString(),
                  status: "read"
               },
               {
                  id: "msg-4",
                  conversationId: "conv-1",
                  senderId: user?.id || "current-user",
                  content: "That sounds great! I'd love to catch up. When works for you?",
                  type: "text",
                  timestamp: new Date(Date.now() - 600000).toISOString(),
                  status: "read"
               },
               {
                  id: "msg-5",
                  conversationId: "conv-1",
                  senderId: "user-1",
                  content: "How about this Friday afternoon? Around 2 PM?",
                  type: "text",
                  timestamp: new Date(Date.now() - 300000).toISOString(),
                  status: "read"
               }
            ];

            setConversations(mockConversations);
            setMessages(mockMessages);
            setCurrentConversation(mockConversations[0]);
            setLoading(false);
         };

         initializeMockData();
      }
   }, [authLoading, user]);

   const handleSendMessage = async (content: string) => {
      if (currentConversation) {
         const newMessage: Message = {
            id: `msg-${Date.now()}`,
            conversationId: currentConversation.id,
            senderId: user?.id || "current-user",
            content,
            type: "text",
            timestamp: new Date().toISOString(),
            status: "sent"
         };

         setMessages(prev => [...prev, newMessage]);

         // Update conversation's last message
         setConversations(prev => prev.map(conv =>
            conv.id === currentConversation.id
               ? { ...conv, lastMessage: newMessage, lastMessageAt: newMessage.timestamp }
               : conv
         ));
      }
   };

   const handleSendMessageWithAttachments = async (files: File[], textContent?: string) => {
      if (!currentConversation) return;

      // Determine message type based on content
      const hasImages = files.some(file => file.type.startsWith('image/'));
      const hasFiles = files.some(file => !file.type.startsWith('image/'));
      const messageType = hasImages && hasFiles ? 'text' :
         hasImages ? 'image' :
            hasFiles ? 'file' : 'text';

      // Create a single message with all files and text
      const newMessage: Message = {
         id: `msg-${Date.now()}`,
         conversationId: currentConversation.id,
         senderId: user?.id || "current-user",
         content: textContent || (files.length === 1 ? files[0].name : `${files.length} files`),
         type: messageType,
         timestamp: new Date().toISOString(),
         status: "sent",
         attachments: files.map((file, index) => ({
            id: `att-${Date.now()}-${index}`,
            type: file.type.startsWith('image/') ? 'image' : 'file',
            filename: file.name,
            url: URL.createObjectURL(file),
            mimeType: file.type,
            size: file.size
         }))
      };

      setMessages(prev => [...prev, newMessage]);

      // Update conversation's last message
      setConversations(prev => prev.map(conv =>
         conv.id === currentConversation.id
            ? { ...conv, lastMessage: newMessage, lastMessageAt: newMessage.timestamp }
            : conv
      ));
   };

   const handleCreateNewConversation = () => {
      console.log('Create new conversation');
      // TODO: Implement create new conversation modal
   };

   const selectConversation = (conversationId: string) => {
      const conversation = conversations.find(c => c.id === conversationId);
      if (conversation) {
         setCurrentConversation(conversation);
         // In a real app, you'd load messages for this conversation
         // For now, we'll use the same mock messages
      }
   };

   const archiveConversation = (conversationId: string) => {
      setConversations(prev => prev.map(conv =>
         conv.id === conversationId ? { ...conv, isArchived: true } : conv
      ));
   };

   if (authLoading) {
      return (
         <div className="flex justify-center items-center h-full">
            <div className="text-yellow-500">
               Loading...
            </div>
         </div>
      );
   }

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

   if (loading) {
      return (
         <div className="flex justify-center items-center h-full">
            <div className="text-yellow-500">
               Loading conversations...
            </div>
         </div>
      );
   }

   return (
      <div className="flex h-[90vh] bg-gray-100 dark:bg-gray-900">
         {/* Chat List Sidebar */}
         <div className="w-1/3 bg-white border-r border-gray-200 dark:border-gray-700 dark:bg-gray-800">
            <ChatList
               conversations={conversations}
               selectedConversationId={currentConversation?.id}
               onSelect={selectConversation}
               onCreateNew={handleCreateNewConversation}
               loading={false}
            />
         </div>

         {/* Chat Interface */}
         <div className="flex flex-col flex-1">
            {currentConversation ? (
               <>
                  <ChatHeader
                     conversation={currentConversation}
                     onArchive={archiveConversation}
                     onVideoCall={() => console.log("Video call clicked")}
                     onVoiceCall={() => console.log("Voice call clicked")}
                     onInfoClick={() => console.log("Info clicked")}
                  />
                  <ChatMessages
                     messages={mapStoreMessagesToComponents(messages, user?.id)}
                     loading={false}
                     typingUsers={[]}
                  />
                  <ChatInput
                     onSendMessage={handleSendMessage}
                     onAttachment={handleSendMessageWithAttachments}
                     onTypingStart={() => { }}
                     onTypingStop={() => { }}
                     typingIndicator={{
                        users: [],
                        isTyping: false
                     }}
                  />
               </>
            ) : (
               <div className="flex justify-center items-center h-full text-gray-500 dark:text-gray-400">
                  Select a conversation to start chatting
               </div>
            )}
         </div>
      </div>
   );
};
