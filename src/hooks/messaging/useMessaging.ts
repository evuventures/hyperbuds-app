"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import {
   Conversation,
   Message,
   TypingUser,
   SendMessageRequest,
   CreateConversationRequest,
   MessageFilters,
   ConversationFilters
} from '@/types/messaging.types';
import { messagingAPI } from '@/lib/api/messaging.api';
import { useSocket } from '../socket/useSocket';

interface UseMessagingReturn {
   // Data
   conversations: Conversation[];
   currentConversation: Conversation | null;
   messages: Message[];
   typingUsers: Record<string, TypingUser[]>;

   // Loading states
   loadingConversations: boolean;
   loadingMessages: boolean;

   // Connection state
   isConnected: boolean;
   error: string | null;

   // Actions
   selectConversation: (conversationId: string) => void;
   sendMessage: (conversationId: string, content: string, type?: Message['type']) => Promise<void>;
   sendMessageWithAttachments: (conversationId: string, content: string, attachments: File[]) => Promise<void>;
   createConversation: (data: CreateConversationRequest) => Promise<Conversation>;
   archiveConversation: (conversationId: string) => Promise<void>;
   markAsRead: (conversationId: string) => Promise<void>;

   // Typing indicators
   handleTypingStart: (conversationId: string) => void;
   handleTypingStop: (conversationId: string) => void;

   // Search and filters
   searchMessages: (query: string, filters?: MessageFilters) => Promise<void>;
   refreshConversations: () => Promise<void>;
   refreshMessages: () => Promise<void>;
}

export function useMessaging(accessToken: string): UseMessagingReturn {
   // State
   const [conversations, setConversations] = useState<Conversation[]>([]);
   const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
   const [messages, setMessages] = useState<Message[]>([]);
   const [typingUsers, setTypingUsers] = useState<Record<string, TypingUser[]>>({});
   const [loadingConversations, setLoadingConversations] = useState(false);
   const [loadingMessages, setLoadingMessages] = useState(false);
   const [error, setError] = useState<string | null>(null);

   // Refs
   const typingTimeouts = useRef<Record<string, NodeJS.Timeout>>({});
   const currentUserId = useRef<string>('');

   // Socket connection
   const { socket, isConnected } = useSocket(accessToken);

   // Initialize messaging
   useEffect(() => {
      if (!accessToken) return;

      const initializeMessaging = async () => {
         try {
            setLoadingConversations(true);
            await loadConversations();
         } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to initialize messaging');
         } finally {
            setLoadingConversations(false);
         }
      };

      initializeMessaging();
   }, [accessToken]);

   // Socket event handlers
   useEffect(() => {
      if (!socket) return;

      const handleMessageReceived = (message: Message) => {
         setMessages(prev => {
            // Avoid duplicates
            if (prev.some(m => m.id === message.id)) return prev;
            return [...prev, message];
         });

         // Update conversation's last message
         setConversations(prev => prev.map(conv =>
            conv.id === message.conversationId
               ? { ...conv, lastMessage: message, lastMessageAt: message.timestamp, unreadCount: conv.id === currentConversation?.id ? conv.unreadCount : conv.unreadCount + 1 }
               : conv
         ));
      };

      const handleMessageStatusUpdate = (data: { messageId: string; status: Message['status'] }) => {
         setMessages(prev => prev.map(msg =>
            msg.id === data.messageId ? { ...msg, status: data.status } : msg
         ));
      };

      const handleTypingStart = (data: { conversationId: string; userId: string; userName: string }) => {
         if (data.userId === currentUserId.current) return; // Don't show own typing

         setTypingUsers(prev => {
            const conversationTyping = prev[data.conversationId] || [];
            const userAlreadyTyping = conversationTyping.some(user => user.userId === data.userId);

            if (userAlreadyTyping) return prev;

            return {
               ...prev,
               [data.conversationId]: [
                  ...conversationTyping,
                  { userId: data.userId, name: data.userName, timestamp: new Date().toISOString() }
               ]
            };
         });
      };

      const handleTypingStop = (data: { conversationId: string; userId: string }) => {
         setTypingUsers(prev => ({
            ...prev,
            [data.conversationId]: (prev[data.conversationId] || []).filter(user => user.userId !== data.userId)
         }));
      };

      const handleConversationUpdate = (conversation: Conversation) => {
         setConversations(prev => prev.map(conv =>
            conv.id === conversation.id ? conversation : conv
         ));

         if (currentConversation?.id === conversation.id) {
            setCurrentConversation(conversation);
         }
      };

      const handleUserStatusUpdate = (data: { userId: string; status: 'online' | 'offline' | 'away' }) => {
         setConversations(prev => prev.map(conv => ({
            ...conv,
            participants: conv.participants.map(participant =>
               participant.id === data.userId ? { ...participant, status: data.status } : participant
            )
         })));
      };

      // Register socket event listeners
      socket.on('message:received', handleMessageReceived);
      socket.on('message:status', handleMessageStatusUpdate);
      socket.on('typing:start', handleTypingStart);
      socket.on('typing:stop', handleTypingStop);
      socket.on('conversation:updated', handleConversationUpdate);
      socket.on('user:status', handleUserStatusUpdate);

      return () => {
         socket.off('message:received', handleMessageReceived);
         socket.off('message:status', handleMessageStatusUpdate);
         socket.off('typing:start', handleTypingStart);
         socket.off('typing:stop', handleTypingStop);
         socket.off('conversation:updated', handleConversationUpdate);
         socket.off('user:status', handleUserStatusUpdate);
      };
   }, [socket, currentConversation?.id]);

   // Load conversations
   const loadConversations = useCallback(async (filters?: ConversationFilters) => {
      if (!accessToken) return;

      try {
         const result = await messagingAPI.getConversations(accessToken, filters);
         setConversations(result.conversations);
         setError(null);
      } catch (err) {
         setError(err instanceof Error ? err.message : 'Failed to load conversations');
      }
   }, [accessToken]);

   // Load messages for a conversation
   const loadMessages = useCallback(async (conversationId: string, filters?: MessageFilters) => {
      if (!accessToken) return;

      try {
         setLoadingMessages(true);
         const result = await messagingAPI.getMessages(accessToken, conversationId, filters);
         setMessages(result.messages.reverse()); // Reverse to show oldest first
         setError(null);
      } catch (err) {
         setError(err instanceof Error ? err.message : 'Failed to load messages');
      } finally {
         setLoadingMessages(false);
      }
   }, [accessToken]);

   // Select conversation
   const selectConversation = useCallback(async (conversationId: string) => {
      try {
         // Load conversation details
         const conversation = await messagingAPI.getConversation(accessToken, conversationId);
         setCurrentConversation(conversation);

         // Load messages
         await loadMessages(conversationId);

         // Mark as read
         await messagingAPI.markConversationAsRead(accessToken, conversationId);

         // Update conversation in list
         setConversations(prev => prev.map(conv =>
            conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
         ));
      } catch (err) {
         setError(err instanceof Error ? err.message : 'Failed to select conversation');
      }
   }, [accessToken, loadMessages]);

   // Send message
   const sendMessage = useCallback(async (
      conversationId: string,
      content: string,
      type: Message['type'] = 'text'
   ) => {
      if (!accessToken || !content.trim()) return;

      try {
         const messageData: SendMessageRequest = {
            conversationId,
            content: content.trim(),
            type,
         };

         const newMessage = await messagingAPI.sendMessage(accessToken, messageData);

         // Add message to local state immediately for optimistic UI
         setMessages(prev => [...prev, newMessage]);

         // Update conversation's last message
         setConversations(prev => prev.map(conv =>
            conv.id === conversationId
               ? { ...conv, lastMessage: newMessage, lastMessageAt: newMessage.timestamp }
               : conv
         ));
      } catch (err) {
         setError(err instanceof Error ? err.message : 'Failed to send message');
      }
   }, [accessToken]);

   // Send message with attachments
   const sendMessageWithAttachments = useCallback(async (
      conversationId: string,
      content: string,
      attachments: File[]
   ) => {
      if (!accessToken) return;

      try {
         const messageData: SendMessageRequest = {
            conversationId,
            content,
            type: 'file',
            attachments,
         };

         const newMessage = await messagingAPI.sendMessage(accessToken, messageData);

         setMessages(prev => [...prev, newMessage]);
         setConversations(prev => prev.map(conv =>
            conv.id === conversationId
               ? { ...conv, lastMessage: newMessage, lastMessageAt: newMessage.timestamp }
               : conv
         ));
      } catch (err) {
         setError(err instanceof Error ? err.message : 'Failed to send message with attachments');
      }
   }, [accessToken]);

   // Create conversation
   const createConversation = useCallback(async (data: CreateConversationRequest): Promise<Conversation> => {
      if (!accessToken) throw new Error('No access token');

      try {
         const newConversation = await messagingAPI.createConversation(accessToken, data);
         setConversations(prev => [newConversation, ...prev]);
         return newConversation;
      } catch (err) {
         setError(err instanceof Error ? err.message : 'Failed to create conversation');
         throw err;
      }
   }, [accessToken]);

   // Archive conversation
   const archiveConversation = useCallback(async (conversationId: string) => {
      if (!accessToken) return;

      try {
         await messagingAPI.archiveConversation(accessToken, conversationId);
         setConversations(prev => prev.map(conv =>
            conv.id === conversationId ? { ...conv, isArchived: true } : conv
         ));
      } catch (err) {
         setError(err instanceof Error ? err.message : 'Failed to archive conversation');
      }
   }, [accessToken]);

   // Mark conversation as read
   const markAsRead = useCallback(async (conversationId: string) => {
      if (!accessToken) return;

      try {
         await messagingAPI.markConversationAsRead(accessToken, conversationId);
         setConversations(prev => prev.map(conv =>
            conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
         ));
      } catch (err) {
         setError(err instanceof Error ? err.message : 'Failed to mark as read');
      }
   }, [accessToken]);

   // Handle typing start
   const handleTypingStart = useCallback((conversationId: string) => {
      if (!socket || !currentUserId.current) return;

      socket.emit('typing:start', { conversationId, userId: currentUserId.current });

      // Clear existing timeout
      if (typingTimeouts.current[conversationId]) {
         clearTimeout(typingTimeouts.current[conversationId]);
      }

      // Set new timeout to stop typing
      typingTimeouts.current[conversationId] = setTimeout(() => {
         handleTypingStop(conversationId);
      }, 3000);
   }, [socket]);

   // Handle typing stop
   const handleTypingStop = useCallback((conversationId: string) => {
      if (!socket || !currentUserId.current) return;

      socket.emit('typing:stop', { conversationId, userId: currentUserId.current });

      // Clear timeout
      if (typingTimeouts.current[conversationId]) {
         clearTimeout(typingTimeouts.current[conversationId]);
         delete typingTimeouts.current[conversationId];
      }
   }, [socket]);

   // Search messages
   const searchMessages = useCallback(async (query: string, filters?: MessageFilters) => {
      if (!accessToken || !query.trim()) return;

      try {
         const result = await messagingAPI.searchMessages(accessToken, query, filters);
         // Handle search results as needed
         console.log('Search results:', result);
      } catch (err) {
         setError(err instanceof Error ? err.message : 'Failed to search messages');
      }
   }, [accessToken]);

   // Refresh conversations
   const refreshConversations = useCallback(async () => {
      await loadConversations();
   }, [loadConversations]);

   // Refresh messages
   const refreshMessages = useCallback(async () => {
      if (currentConversation) {
         await loadMessages(currentConversation.id);
      }
   }, [currentConversation, loadMessages]);

   // Get current user ID (this should come from auth context)
   useEffect(() => {
      // This should be replaced with actual user ID from auth context
      const token = localStorage.getItem('accessToken');
      if (token) {
         // Decode token to get user ID (simplified - should use proper JWT decode)
         try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            currentUserId.current = payload.userId || payload.sub || '';
         } catch {
            currentUserId.current = '';
         }
      }
   }, [accessToken]);

   // Cleanup timeouts on unmount
   useEffect(() => {
      return () => {
         Object.values(typingTimeouts.current).forEach(timeout => clearTimeout(timeout));
      };
   }, []);

   return {
      // Data
      conversations,
      currentConversation,
      messages,
      typingUsers,

      // Loading states
      loadingConversations,
      loadingMessages,

      // Connection state
      isConnected,
      error,

      // Actions
      selectConversation,
      sendMessage,
      sendMessageWithAttachments,
      createConversation,
      archiveConversation,
      markAsRead,

      // Typing indicators
      handleTypingStart,
      handleTypingStop,

      // Search and filters
      searchMessages,
      refreshConversations,
      refreshMessages,
   };
}
