"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import {
    Conversation,
    Message,
    TypingUser,
    SendMessageRequest,
    CreateConversationRequest,
    MessageSearchResult
} from '@/types/messaging.types';
import { messagingAPI } from '@/lib/api/messaging.api';
import { messagingSocketService } from '@/lib/socket/messagingSocket';
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

    // Setup socket event listeners (Memoized with useCallback)
    const setupSocketListeners = useCallback(() => {
        // New message received
        const handleNewMessage = (data: { conversationId: string; message: Message }) => {
            setMessages(prev => {
                // Avoid duplicates
                if (prev.some(m => m._id === data.message._id)) return prev;
                return [...prev, data.message];
            });

            // Update conversation's last message
            setConversations(prev => prev.map(conv =>
                conv._id === data.conversationId
                    ? {
                        ...conv,
                        lastMessage: {
                            _id: data.message._id,
                            content: data.message.content,
                            createdAt: data.message.createdAt
                        },
                        lastActivity: data.message.createdAt,
                        unreadCount: conv._id === currentConversation?._id ? conv.unreadCount : conv.unreadCount + 1
                    }
                    : conv
            ));
        };

        // Message read status
        const handleMessageRead = (data: { conversationId: string; readBy: string; messageIds: string[]; readAt: string }) => {
            setMessages(prev => prev.map(msg =>
                data.messageIds.includes(msg._id) ? { ...msg, isRead: true, readAt: data.readAt } : msg
            ));
        };

        // Message deleted
        const handleMessageDeleted = (data: { conversationId: string; messageId: string; deletedBy: string }) => {
            setMessages(prev => prev.filter(msg => msg._id !== data.messageId));
        };

        // Typing indicators
        const handleTyping = (data: { conversationId: string; userId: string; isTyping: boolean }) => {
            if (data.userId === currentUserId.current) return; // Don't show own typing

            if (data.isTyping) {
                setTypingUsers(prev => {
                    const conversationTyping = prev[data.conversationId] || [];
                    const userAlreadyTyping = conversationTyping.some(user => user.userId === data.userId);

                    if (userAlreadyTyping) return prev;

                    return {
                        ...prev,
                        [data.conversationId]: [
                            ...conversationTyping,
                            { userId: data.userId, name: `User ${data.userId}`, timestamp: new Date().toISOString() }
                        ]
                    };
                });
            } else {
                setTypingUsers(prev => ({
                    ...prev,
                    [data.conversationId]: (prev[data.conversationId] || []).filter(user => user.userId !== data.userId)
                }));
            }
        };

        // Conversation updates
        const handleConversationUpdated = (conversation: Conversation) => {
            setConversations(prev => prev.map(conv =>
                conv._id === conversation._id ? conversation : conv
            ));

            if (currentConversation?._id === conversation._id) {
                setCurrentConversation(conversation);
            }
        };

        // User status updates
        const handleUserStatus = (data: { userId: string; status: 'online' | 'offline' | 'away' | undefined }) => {
            if (!data.status) return;

            setConversations(prev => prev.map(conv => ({
                ...conv,
                participants: conv.participants.map(participant =>
                    participant._id === data.userId ? { ...participant, status: data.status! } : participant
                )
            })));
        };

        // Register listeners
        messagingSocketService.onNewMessage(handleNewMessage);
        messagingSocketService.onMessageRead(handleMessageRead);
        messagingSocketService.onMessageDeleted(handleMessageDeleted);
        messagingSocketService.onTyping(handleTyping);
        messagingSocketService.onConversationUpdated(handleConversationUpdated);
        messagingSocketService.onUserStatus(handleUserStatus);

        return () => {
            messagingSocketService.offNewMessage(handleNewMessage);
            messagingSocketService.offMessageRead(handleMessageRead);
            messagingSocketService.offMessageDeleted(handleMessageDeleted);
            messagingSocketService.offTyping(handleTyping);
            messagingSocketService.offConversationUpdated(handleConversationUpdated);
            messagingSocketService.offUserStatus(handleUserStatus);
        };
    }, [currentConversation?._id]);


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

            // Join conversation room for real-time updates
            if (messagingSocketService.isConnected()) {
                messagingSocketService.joinConversation(conversationId);
            }

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

            // Emit typing stop event
            if (messagingSocketService.isConnected()) {
                messagingSocketService.stopTyping(conversationId);
            }

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
        if (!currentUserId.current) return;

        messagingSocketService.stopTyping(conversationId);

        // Clear timeout
        if (typingTimeouts.current[conversationId]) {
            clearTimeout(typingTimeouts.current[conversationId]);
            delete typingTimeouts.current[conversationId];
        }
    }, []);
    
    // Handle typing start (Memoized with useCallback)
    const handleTypingStart = useCallback((conversationId: string) => {
        if (!currentUserId.current) return;

        messagingSocketService.startTyping(conversationId);

        // Clear existing timeout
        if (typingTimeouts.current[conversationId]) {
            clearTimeout(typingTimeouts.current[conversationId]);
        }

        // Set new timeout to stop typing
        typingTimeouts.current[conversationId] = setTimeout(() => {
            handleTypingStop(conversationId);
        }, 3000);
    }, [handleTypingStop]); // FIXED: Added missing dependency


   


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


    // Initialize messaging and setup sockets
    useEffect(() => {
        if (!accessToken) return;

        const initializeMessaging = async () => {
            try {
                setLoadingConversations(true);
                await loadConversations();

                // Connect to socket
                if (!isTokenValid(accessToken)) {
                    console.warn('Invalid token, skipping socket connection');
                    return;
                }
                const socket = messagingSocketService.connect(accessToken);
                setupSocketListeners();

                const handleConnect = () => setIsConnected(true);
                const handleDisconnect = () => setIsConnected(false);

                socket.on('connect', handleConnect);
                socket.on('disconnect', handleDisconnect);

                setIsConnected(socket.connected);

                const connectionTimeout = setTimeout(() => {
                    if (!socket.connected) {
                        console.warn('Socket connection timeout, continuing without real-time features');
                        setIsConnected(false);
                    }
                }, 5000);

                return () => {
                    clearTimeout(connectionTimeout);
                    socket.off('connect', handleConnect);
                    socket.off('disconnect', handleDisconnect);
                };
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to initialize messaging');
            } finally {
                setLoadingConversations(false);
            }
        };

        initializeMessaging();

        // Cleanup
        return () => {
            messagingSocketService.disconnect();
            setIsConnected(false);
        };
    }, [accessToken, loadConversations, setupSocketListeners]); // FIXED: Added missing dependencies


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