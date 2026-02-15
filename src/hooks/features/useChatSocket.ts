"use client"
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { messagingSocketService } from '@/lib/socket/messagingSocket';
import {
    addMessage,
    setTypingStatus,
    markMessagesAsRead,
    deleteMessageLocal,
    incrementUnreadCount
} from '@/store/slices/chatSlice';
import { Message } from '@/types/messaging.types';

export const useChatSocket = () => {
    const dispatch = useDispatch();
    const { token, user: currentUser } = useSelector((state: RootState) => state.auth);
    const { activeConversationId } = useSelector((state: RootState) => state.chat);

    useEffect(() => {
        if (!token) return;

        messagingSocketService.connect(token);

        const handleNewMessage = (newMessage: Message) => {
            console.log("🚀 Real-time message received:", newMessage);

            // 1. Add the message to the feed
            dispatch(addMessage(newMessage));

            // 2. Increment unread count IF:
            const isFromMe = newMessage.sender._id === currentUser?.id;
            const isInActiveChat = newMessage.conversationId === activeConversationId;

            if (!isFromMe && !isInActiveChat && currentUser?.id) {
                dispatch(incrementUnreadCount({
                    conversationId: newMessage.conversationId,
                    userId: currentUser.id // TypeScript now knows this is a string
                }));
            }
        };

        const handleTypingStart = ({ conversationId, userId }: { conversationId: string; userId: string }) => {
            dispatch(setTypingStatus({ conversationId, userId, isTyping: true }));
        };

        const handleTypingStop = ({ conversationId, userId }: { conversationId: string; userId: string }) => {
            dispatch(setTypingStatus({ conversationId, userId, isTyping: false }));
        };

        const handleMessagesRead = ({ conversationId, messageIds, userId }: { conversationId: string, messageIds: string[], userId: string }) => {
            dispatch(markMessagesAsRead({ conversationId, messageIds, userId }));
        };

        const handleMessageDeleted = ({ messageId }: { messageId: string }) => {
            dispatch(deleteMessageLocal({ messageId }));
        };

        // Register listeners
        messagingSocketService.on('message:new', handleNewMessage);
        messagingSocketService.on('typing:start', handleTypingStart);
        messagingSocketService.on('typing:stop', handleTypingStop);
        messagingSocketService.on('message:read', handleMessagesRead);
        messagingSocketService.on('message:deleted', handleMessageDeleted);

        return () => {
            messagingSocketService.off('message:new', handleNewMessage);
            messagingSocketService.off('typing:start', handleTypingStart);
            messagingSocketService.off('typing:stop', handleTypingStop);
            messagingSocketService.off('message:read', handleMessagesRead);
            messagingSocketService.off('message:deleted', handleMessageDeleted);
        };
    }, [dispatch, token, activeConversationId, currentUser?.id]); // Added activeConversationId to dependencies

    // Handle Room Joining
    useEffect(() => {
        if (activeConversationId) {
            messagingSocketService.joinConversation(activeConversationId);
            return () => {
                messagingSocketService.leaveConversation(activeConversationId);
            };
        }
    }, [activeConversationId]);

    return null;
};