"use client"
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { messagingSocketService } from '@/lib/socket/messagingSocket'; 
import { addMessage } from '@/store/slices/chatSlice';
import { Message } from '@/types/messaging.types';

export const useChatSocket = () => {
  const dispatch = useDispatch();
  const { token } = useSelector((state: RootState) => state.auth);
  const { activeConversationId } = useSelector((state: RootState) => state.chat);

  useEffect(() => {
    if (!token) return;

    // Connect to the service (this returns the socket, but we use the service methods)
    messagingSocketService.connect(token);

    const handleNewMessage = (newMessage: Message) => {
      console.log("🚀 Real-time message received:", newMessage);
      dispatch(addMessage(newMessage));
    };

    // Use the service's typed listeners
    messagingSocketService.on('message:new', handleNewMessage);

    return () => {
      messagingSocketService.off('message:new', handleNewMessage);
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