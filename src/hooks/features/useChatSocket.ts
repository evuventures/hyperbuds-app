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
import { SocketEvents, Message } from '@/types/messaging.types';

interface NewMessagePayload {
    conversationId: string;
    message: Message; // Ensure Message is imported from your types
}

export const useChatSocket = () => {
    const dispatch = useAppDispatch();
    const { token, user: currentUser } = useAppSelector((state) => state.auth);
    const { activeConversationId } = useAppSelector((state) => state.chat);

    useEffect(() => {
        if (!token) return;

        messagingSocketService.connect(token);


     const handleNewMessage = (data: NewMessagePayload) => {
    const { conversationId, message } = data;
    const currentUserId = currentUser?.id || currentUser?._id;

    // ✅ DISPATCH MESSAGE FIRST
    dispatch(addMessage(message));

    // ✅ ONLY INCREMENT IF: 
    // 1. The message is NOT from me
    // 2. I am NOT currently looking at this specific chat
    const isFromMe = message.sender._id === currentUserId;
    const isInActiveChat = conversationId === activeConversationId;

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
  // Room Management
useEffect(() => {
  const currentUserId = currentUser?.id || currentUser?._id;
  if (!token || !currentUserId) return;

  const socket = messagingSocketService.connect(token);

  // ✅ Wait for connection before joining rooms
  const onConnect = () => {
    messagingSocketService.joinUserRoom(currentUserId);
    if (activeConversationId) {
      messagingSocketService.joinConversation(activeConversationId);
    }
  };

  if (socket.connected) {
    onConnect();
  } else {
    socket.once('connect', onConnect);
  }

  return () => {
    socket.off('connect', onConnect);
    if (activeConversationId) {
      messagingSocketService.leaveConversation(activeConversationId);
    }
  };
}, [activeConversationId, currentUser, token]);
    return null;
};