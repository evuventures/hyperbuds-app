"use client"
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { messagingSocketService } from '@/lib/socket/messagingSocket';
import {
    addMessage,
    setTypingStatus,
    markMessagesAsRead,
    deleteMessageLocal,
    incrementUnreadCount
} from '@/store/slices/chatSlice';
import { SocketEvents } from '@/types/messaging.types';

export const useChatSocket = () => {
    const dispatch = useAppDispatch();
    const { token, user: currentUser } = useAppSelector((state) => state.auth);
    const { activeConversationId } = useAppSelector((state) => state.chat);

    useEffect(() => {
        if (!token) return;

        messagingSocketService.connect(token);


        const handleNewMessage = (data: SocketEvents['new-message']) => {
            //  Extract the actual message object
            const { conversationId, message } = data;

            console.log(" Real-time message received:", message);

            //  Add message to the current chat feed
            dispatch(addMessage(message));

            //  Logic for spontaneous sidebar updates & unread counts
            const currentUserId = currentUser?.id || currentUser?._id;
            const isFromMe = message.sender._id === currentUserId;
            const isInActiveChat = conversationId === activeConversationId;

            // increment the unread count ONLY if the message isn't from me
              
            if (!isFromMe && !isInActiveChat && currentUserId) {
                dispatch(incrementUnreadCount({
                    conversationId: conversationId,
                    userId: currentUserId
                }));
            }
        };

        const handleTyping = (data: SocketEvents['typing']) => {
            dispatch(setTypingStatus(data));
        };

        const handleMessagesRead = (data: SocketEvents['message-read']) => {
            dispatch(markMessagesAsRead({
                conversationId: data.conversationId,
                messageIds: Array.isArray(data.messageIds) ? data.messageIds : [],
                userId: data.readBy
            }));
        };

        const handleMessageDeleted = (data: SocketEvents['message-deleted']) => {
            dispatch(deleteMessageLocal({ messageId: data.messageId }));
        };

        // Register Listeners
        messagingSocketService.on('new-message', handleNewMessage);
        messagingSocketService.on('typing', handleTyping);
        messagingSocketService.on('message-read', handleMessagesRead);
        messagingSocketService.on('message-deleted', handleMessageDeleted);

        return () => {
            messagingSocketService.off('new-message', handleNewMessage);
            messagingSocketService.off('typing', handleTyping);
            messagingSocketService.off('message-read', handleMessagesRead);
            messagingSocketService.off('message-deleted', handleMessageDeleted);
        };
    }, [dispatch, token, currentUser, activeConversationId]);

    // Room Management
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