"use client"
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { messagingSocketService } from '@/lib/socket/messagingSocket';
import { addMessage, setTypingStatus, markMessagesAsRead, deleteMessageLocal } from '@/store/slices/chatSlice'; // Import the new action
import { Message } from '@/types/messaging.types';

export const useChatSocket = () => {
    const dispatch = useDispatch();
    const { token } = useSelector((state: RootState) => state.auth);
    const { activeConversationId } = useSelector((state: RootState) => state.chat);

    useEffect(() => {
        if (!token) return;

        messagingSocketService.connect(token);

        // 1. New Message Handler
        const handleNewMessage = (newMessage: Message) => {
            console.log("🚀 Real-time message received:", newMessage);
            dispatch(addMessage(newMessage));
        };

        // 2. Typing Start Handler
        const handleTypingStart = ({ conversationId, userId }: { conversationId: string; userId: string }) => {
            dispatch(setTypingStatus({ conversationId, userId, isTyping: true }));
        };

        // 3. Typing Stop Handler
        const handleTypingStop = ({ conversationId, userId }: { conversationId: string; userId: string }) => {
            dispatch(setTypingStatus({ conversationId, userId, isTyping: false }));
        };

        const handleMessagesRead = ({ conversationId, messageIds, userId }: { conversationId: string, messageIds: string[], userId: string }) => {
            dispatch(markMessagesAsRead({ conversationId, messageIds, userId }));
        };

        const handleMessageDeleted = ({ messageId }: { messageId: string }) => {
            dispatch(deleteMessageLocal({ messageId }));
        };
       
        


        // Register listeners using the service's typed methods
        messagingSocketService.on('message:new', handleNewMessage);
        messagingSocketService.on('typing:start', handleTypingStart);
        messagingSocketService.on('typing:stop', handleTypingStop);
        messagingSocketService.on('message:read', handleMessagesRead);
        messagingSocketService.on('message:deleted', handleMessageDeleted);


        return () => {
            // Clean up listeners on unmount
            messagingSocketService.off('message:new', handleNewMessage);
            messagingSocketService.off('typing:start', handleTypingStart);
            messagingSocketService.off('typing:stop', handleTypingStop);
            messagingSocketService.off('message:read', handleMessagesRead);


        };
    }, [dispatch, token]);

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