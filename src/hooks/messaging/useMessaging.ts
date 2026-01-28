"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Conversation,
    Message,
    TypingUser,
    SendMessageRequest,
    CreateConversationRequest,
    MessageSearchResult
} from '@/types/messaging.types';
import { messagingAPI } from '@/lib/api/messaging.api';
import { getUserIdFromToken, isTokenValid } from '@/lib/utils/jwt';

interface UseMessagingReturn {
    // Data
    conversations: Conversation[];
    currentConversation: Conversation | null;
    messages: Message[];
    typingUsers: Record<string, TypingUser[]>;

    // Loading states
    loadingConversations: boolean;
    loadingMessages: boolean;
    loadingMoreMessages: boolean;
    hasMoreMessages: boolean;

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
    deleteMessage: (messageId: string) => Promise<void>;

    // Typing indicators
    handleTypingStart: (conversationId: string) => void;
    handleTypingStop: (conversationId: string) => void;

    // Search
    searchMessages: (query: string) => Promise<MessageSearchResult[]>;
    loadMoreMessages: () => Promise<void>;
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
    const [loadingMoreMessages, setLoadingMoreMessages] = useState(false);
    const [hasMoreMessages, setHasMoreMessages] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Refs
    const typingTimeouts = useRef<Record<string, NodeJS.Timeout>>({});
    const currentUserId = useRef<string>('');

    // Poll messages when conversation is active (5s interval)
    const { data: polledMessages } = useQuery({
        queryKey: ['messages', currentConversation?._id],
        queryFn: async () => {
            if (!currentConversation || !accessToken) return null;
            const result = await messagingAPI.getMessages(accessToken, currentConversation._id, 1, 50);
            return result.messages;
        },
        enabled: !!currentConversation && !!accessToken && isTokenValid(accessToken),
        refetchInterval: currentConversation ? 5000 : false, // Poll every 5s when conversation active
    });

    // Update messages when polled data changes
    useEffect(() => {
        if (polledMessages) {
            setMessages(polledMessages.reverse());
        }
    }, [polledMessages]);

    // Poll conversations (30s interval when not actively viewing messages)
    const { data: polledConversations } = useQuery({
        queryKey: ['conversations'],
        queryFn: async () => {
            if (!accessToken) return null;
            const result = await messagingAPI.getConversations(accessToken);
            return result.conversations;
        },
        enabled: !!accessToken && isTokenValid(accessToken),
        refetchInterval: 30000, // Poll every 30s
    });

    // Update conversations when polled data changes
    useEffect(() => {
        if (polledConversations) {
            setConversations(polledConversations);
        }
    }, [polledConversations]);


    // Load conversations (Memoized with useCallback)
    const loadConversations = useCallback(async () => {
        if (!accessToken || !isTokenValid(accessToken)) {
            setError('Invalid or expired token');
            return;
        }

        try {
            const result = await messagingAPI.getConversations(accessToken);
            setConversations(result.conversations);
            setError(null);
        } catch (err) {
            console.error('Failed to load conversations:', err);
            setError(err instanceof Error ? err.message : 'Failed to load conversations');
        }
    }, [accessToken]);


    // Load messages for a conversation (Memoized with useCallback)
    const loadMessages = useCallback(async (conversationId: string) => {
        if (!accessToken || !isTokenValid(accessToken)) {
            setError('Invalid or expired token');
            return;
        }

        try {
            setLoadingMessages(true);
            const result = await messagingAPI.getMessages(accessToken, conversationId);
            setMessages(result.messages.reverse()); // Reverse to show oldest first
            setCurrentPage(1);
            setHasMoreMessages(result.messages.length === 50); // Check if there are more messages
            setError(null);
        } catch (err) {
            console.error('Failed to load messages:', err);
            setError(err instanceof Error ? err.message : 'Failed to load messages');
        } finally {
            setLoadingMessages(false);
        }
    }, [accessToken]);


    // Select conversation (Memoized with useCallback)
    const selectConversation = useCallback(async (conversationId: string) => {
        if (!conversationId) {
            console.error('No conversation ID provided');
            return;
        }

        try {
            // Load conversation details from API
            const conversation = await messagingAPI.getConversation(accessToken, conversationId);
            setCurrentConversation(conversation);

            // Load messages
            await loadMessages(conversationId);

            // Mark as read
            await messagingAPI.markMessagesAsRead(accessToken, conversationId);

            // Update conversation in list
            setConversations(prev => prev.map(conv =>
                conv._id === conversationId ? { ...conv, unreadCount: 0 } : conv
            ));
        } catch (err) {
            console.error('Failed to select conversation:', err);
            setError(err instanceof Error ? err.message : 'Failed to select conversation');
        }
    }, [accessToken, loadMessages]);


    // Send message (Memoized with useCallback)
    const sendMessage = useCallback(async (
        conversationId: string,
        content: string,
        type: Message['type'] = 'text'
    ) => {
        if (!accessToken || !isTokenValid(accessToken) || !content.trim()) {
            setError('Invalid token or empty message');
            return;
        }

        try {
            const messageData: SendMessageRequest = {
                content: content.trim(),
                type,
            };

            const newMessage = await messagingAPI.sendMessage(accessToken, conversationId, messageData);

            // Add message to local state immediately for optimistic UI
            setMessages(prev => [...prev, newMessage]);

            // Update conversation's last message
            setConversations(prev => prev.map(conv =>
                conv._id === conversationId
                    ? {
                        ...conv,
                        lastMessage: {
                            _id: newMessage._id,
                            content: newMessage.content,
                            createdAt: newMessage.createdAt
                        },
                        lastActivity: newMessage.createdAt
                    }
                    : conv
            ));

            // Typing stop handled by timeout

        } catch (err) {
            console.error('Failed to send message:', err);
            setError(err instanceof Error ? err.message : 'Failed to send message');
        }
    }, [accessToken]);


    // Send message with attachments (Memoized with useCallback)
    const sendMessageWithAttachments = useCallback(async (
        conversationId: string,
        content: string,
        attachments: File[]
    ) => {
        if (!accessToken) return;

        try {
            // Convert files to attachment format
            const messageAttachments = attachments.map(file => ({
                url: URL.createObjectURL(file), // This should be uploaded to server first
                filename: file.name,
                mimeType: file.type,
                size: file.size
            }));

            const messageData: SendMessageRequest = {
                content,
                type: 'file',
                attachments: messageAttachments,
            };

            const newMessage = await messagingAPI.sendMessage(accessToken, conversationId, messageData);

            setMessages(prev => [...prev, newMessage]);
            setConversations(prev => prev.map(conv =>
                conv._id === conversationId
                    ? {
                        ...conv,
                        lastMessage: {
                            _id: newMessage._id,
                            content: newMessage.content,
                            createdAt: newMessage.createdAt
                        },
                        lastActivity: newMessage.createdAt
                    }
                    : conv
            ));
        } catch (err) {
            console.error('Failed to send message with attachments:', err);
            setError(err instanceof Error ? err.message : 'Failed to send message with attachments');
        }
    }, [accessToken]);


    // Create conversation (Memoized with useCallback)
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


    // Archive conversation (Memoized with useCallback)
    const archiveConversation = useCallback(async (conversationId: string) => {
        if (!accessToken) return;

        try {
            await messagingAPI.archiveConversation(accessToken, conversationId);
            setConversations(prev => prev.filter(conv => conv._id !== conversationId));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to archive conversation');
        }
    }, [accessToken]);


    // Mark conversation as read (Memoized with useCallback)
    const markAsRead = useCallback(async (conversationId: string) => {
        if (!accessToken) return;

        try {
            await messagingAPI.markMessagesAsRead(accessToken, conversationId);
            setConversations(prev => prev.map(conv =>
                conv._id === conversationId ? { ...conv, unreadCount: 0 } : conv
            ));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to mark as read');
        }
    }, [accessToken]);


    // Delete message (Memoized with useCallback)
    const deleteMessage = useCallback(async (messageId: string) => {
        if (!accessToken) return;

        try {
            await messagingAPI.deleteMessage(accessToken, messageId);
            setMessages(prev => prev.filter(msg => msg._id !== messageId));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete message');
        }
    }, [accessToken]);

 // Handle typing stop (Memoized with useCallback)
    const handleTypingStop = useCallback((conversationId: string) => {
        // Clear timeout
        if (typingTimeouts.current[conversationId]) {
            clearTimeout(typingTimeouts.current[conversationId]);
            delete typingTimeouts.current[conversationId];
        }
        // Note: Typing indicators removed with socket - polling will update UI
    }, []);
    
    // Handle typing start (Memoized with useCallback)
    const handleTypingStart = useCallback((conversationId: string) => {
        // Clear existing timeout
        if (typingTimeouts.current[conversationId]) {
            clearTimeout(typingTimeouts.current[conversationId]);
        }

        // Set new timeout to stop typing
        typingTimeouts.current[conversationId] = setTimeout(() => {
            handleTypingStop(conversationId);
        }, 3000);
        // Note: Typing indicators removed with socket - polling will update UI
    }, [handleTypingStop]);


   


    // Search messages (Memoized with useCallback)
    const searchMessages = useCallback(async (query: string) => {
        if (!accessToken || !query.trim()) return [];

        try {
            const result = await messagingAPI.searchMessages(accessToken, query);
            return result.messages;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to search messages');
            return [];
        }
    }, [accessToken]);


    // Load more messages (pagination) (Memoized with useCallback)
    const loadMoreMessages = useCallback(async () => {
        if (!accessToken || !currentConversation || loadingMoreMessages) return;

        setLoadingMoreMessages(true);
        try {
            const nextPage = currentPage + 1;
            const result = await messagingAPI.getMessages(accessToken, currentConversation._id, nextPage, 50);

            if (result.messages.length > 0) {
                setMessages(prev => [...result.messages, ...prev]);
                setCurrentPage(nextPage);
                setHasMoreMessages(result.messages.length === 50);
            } else {
                setHasMoreMessages(false);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load more messages');
        } finally {
            setLoadingMoreMessages(false);
        }
    }, [accessToken, currentConversation, currentPage, loadingMoreMessages]);


    // Refresh conversations (Memoized with useCallback)
    const refreshConversations = useCallback(async () => {
        await loadConversations();
    }, [loadConversations]);


    // Refresh messages (Memoized with useCallback)
    const refreshMessages = useCallback(async () => {
        if (currentConversation) {
            await loadMessages(currentConversation._id);
        }
    }, [currentConversation, loadMessages]);


    // Initialize messaging (load conversations on mount)
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
    }, [accessToken, loadConversations]);


    // Get current user ID from JWT token
    useEffect(() => {
        if (accessToken && isTokenValid(accessToken)) {
            const userId = getUserIdFromToken(accessToken);
            currentUserId.current = userId || '';
        } else {
            currentUserId.current = '';
        }
    }, [accessToken]);


    // Cleanup timeouts on unmount
    useEffect(() => {
        const timeouts = typingTimeouts.current; // FIXED: Copied ref value to a local variable
        return () => {
            Object.values(timeouts).forEach(timeout => clearTimeout(timeout));
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
        loadingMoreMessages,
        hasMoreMessages,

        // Connection state (always false - no socket)
        isConnected: false,
        error,

        // Actions
        selectConversation,
        sendMessage,
        sendMessageWithAttachments,
        createConversation,
        archiveConversation,
        markAsRead,
        deleteMessage,

        // Typing indicators
        handleTypingStart,
        handleTypingStop,

        // Search
        searchMessages,
        loadMoreMessages,
        refreshConversations,
        refreshMessages,
    };
}