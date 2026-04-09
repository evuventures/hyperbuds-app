"use client"
import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { messagingSocketService } from '@/lib/socket/messagingSocket';
import {
    addMessage,
    setLatestIncomingMessage,
    setTypingStatus,
    markMessagesAsRead,
    deleteMessageLocal,
    incrementUnreadCount
} from '@/store/slices/chatSlice';
import { SocketEvents, Message } from '@/types/messaging.types';

interface NewMessagePayload {
    conversationId: string;
    message: Message;
}

export const useChatSocket = () => {
    const dispatch = useAppDispatch();
    const { token, user: currentUser } = useAppSelector((state) => state.auth);
    const { activeConversationId } = useAppSelector((state) => state.chat);

    const activeConversationRef = useRef(activeConversationId);
    const currentUserRef = useRef(currentUser);

    useEffect(() => {
        activeConversationRef.current = activeConversationId;
    }, [activeConversationId]);

    useEffect(() => {
        currentUserRef.current = currentUser;
    }, [currentUser]);

    // ─── SINGLE EFFECT: connect, join rooms, register handlers ────────────────
    // Combining into one effect guarantees the socket exists before we attach
    // handlers — the previous split caused a race where getSocket() returned
    // null because the handler effect ran before connect() finished.
    useEffect(() => {
        const currentUserId = currentUser?.id || currentUser?._id;
        if (!token || !currentUserId) return;

        // 1. Connect (safe — returns existing socket if already connected)
        const socket = messagingSocketService.connect(token);

        // 2. Join rooms once connected
        const onConnect = () => {
            messagingSocketService.joinUserRoom(currentUserId);
            if (activeConversationRef.current) {
                messagingSocketService.joinConversation(activeConversationRef.current);
            }
        };

        if (socket.connected) {
            onConnect();
        } else {
            socket.once('connect', onConnect);
        }

        // 3. Register event handlers on the same socket instance
        const handleNewMessage = (data: NewMessagePayload) => {
          
            const { conversationId, message } = data;
            const currentUserId = currentUserRef.current?.id || currentUserRef.current?._id;
            const activeId = activeConversationRef.current;
               console.log('📬 handleNewMessage fired:', message.content);
  console.log('📬 currentUserId:', currentUserId);
  console.log('📬 isFromMe:', message.sender._id === currentUserId);
  console.log('📬 isInActiveChat:', conversationId === activeId);
  console.log('📬 will increment:', !( message.sender._id === currentUserId) && !(conversationId === activeId) && !!currentUserId);

            dispatch(addMessage(message));

            const isFromMe = message.sender._id === currentUserId;
            if (!isFromMe) {
                dispatch(setLatestIncomingMessage({
                    conversationId,
                    messageId: message._id,
                    createdAt: message.createdAt,
                }));
            }

            const isInActiveChat = conversationId === activeId;

            if (!isFromMe && !isInActiveChat && currentUserId) {
                dispatch(incrementUnreadCount({ conversationId, userId: currentUserId }));
            }
        };

        const handleTyping = (data: SocketEvents['typing']) => {
            dispatch(setTypingStatus(data));

            const currentUserId = currentUserRef.current?.id || currentUserRef.current?._id;
            if (data.userId !== currentUserId) {
                dispatch(setLatestIncomingMessage({
                    conversationId: data.conversationId,
                    messageId: `typing-${data.userId}-${Date.now()}`,
                    createdAt: new Date().toISOString(),
                }));
            }
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

        socket.on('new-message', handleNewMessage);
        socket.on('typing', handleTyping);
        socket.on('message-read', handleMessagesRead);
        socket.on('message-deleted', handleMessageDeleted);

        return () => {
            socket.off('connect', onConnect);
            socket.off('new-message', handleNewMessage);
            socket.off('typing', handleTyping);
            socket.off('message-read', handleMessagesRead);
            socket.off('message-deleted', handleMessageDeleted);

            if (activeConversationRef.current) {
                messagingSocketService.leaveConversation(activeConversationRef.current);
            }
        };

    // Only re-runs when token or user changes — NOT on activeConversationId
    // because we read that from the ref inside the handler
    }, [token, currentUser, dispatch]);

    // ─── ROOM SWITCHING ───────────────────────────────────────────────────────
    // Separate effect just for joining/leaving rooms when conversation changes.
    // Does NOT re-register handlers.
    useEffect(() => {
        const currentUserId = currentUser?.id || currentUser?._id;
        if (!token || !currentUserId || !activeConversationId) return;

        const socket = messagingSocketService.getSocket();
        if (!socket) return;

        if (socket.connected) {
            messagingSocketService.joinConversation(activeConversationId);
        }

        return () => {
            messagingSocketService.leaveConversation(activeConversationId);
        };
    }, [activeConversationId, currentUser, token]);

    return null;
};