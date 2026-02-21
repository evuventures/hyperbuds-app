import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Conversation, Message } from '@/types/messaging.types';

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: Message[];
  isLoading: boolean;
  typingUsers: Record<string, string[]>;

}

const initialState: ChatState = {
  conversations: [],
  activeConversationId: null,
  messages: [],
  isLoading: false,
  typingUsers: {},
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setConversations: (state, action: PayloadAction<Conversation[]>) => {
      // Replaces the list entirely 
      state.conversations = action.payload;
    },
    setActiveConversation: (state, action: PayloadAction<string | null>) => {
      state.activeConversationId = action.payload;
      // Clear messages when switching chats to avoid "ghosting"
      state.messages = [];
    },
    setMessages: (state, action: PayloadAction<Message[]>) => {
      state.messages = action.payload;
    },
    // Inside chatSlice.ts -> addMessage reducer
    addMessage: (state, action: PayloadAction<Message>) => {
      const message = action.payload;

      if (state.activeConversationId === message.conversationId) {
        state.messages.push(message);
      }

      const convIndex = state.conversations.findIndex(c => c._id === message.conversationId);
      if (convIndex !== -1) {
        state.conversations[convIndex].lastMessage = message;
        state.conversations[convIndex].lastActivity = message.createdAt;

        //  FIX: Increment unread count for the person WHO IS NOT the sender
        // On the receiver's end, we need to find their specific unread entry in the array
        if (state.activeConversationId !== message.conversationId) {
          // We search for the entry that doesn't belong to the sender
          // This ensures the receiver sees the notification
          const unreadEntry = state.conversations[convIndex].unreadCounts.find(
            u => u.userId !== message.sender._id
          );

          if (unreadEntry) {
            unreadEntry.count += 1;
          } 
        }
      }
    },
    setTypingStatus: (state, action: PayloadAction<{
      conversationId: string;
      userId: string;
      isTyping: boolean
    }>) => {
      const { conversationId, userId, isTyping } = action.payload;

      if (!state.typingUsers[conversationId]) {
        state.typingUsers[conversationId] = [];
      }

      if (isTyping) {
        if (!state.typingUsers[conversationId].includes(userId)) {
          state.typingUsers[conversationId].push(userId);
        }
      } else {
        state.typingUsers[conversationId] = state.typingUsers[conversationId]
          .filter(id => id !== userId);
      }
    },
    markMessagesAsRead: (state, action: PayloadAction<{ conversationId: string; messageIds: string[]; userId: string }>) => {
      const { conversationId, messageIds, userId } = action.payload;

      // Update the messages in the current feed
      state.messages = state.messages.map(msg =>
        messageIds.includes(msg._id) ? { ...msg, isRead: true, readAt: new Date().toISOString() } : msg
      );

      // Reset the unread count 
      const convIndex = state.conversations.findIndex(c => c._id === conversationId);
      if (convIndex !== -1) {
        const unreadEntry = state.conversations[convIndex].unreadCounts.find(u => u.userId === userId);
        if (unreadEntry) {
          unreadEntry.count = 0;
        }
      }
    },

    // src/store/slices/chatSlice.ts

    // src/store/slices/chatSlice.ts

    // src/store/slices/chatSlice.ts

    deleteMessageLocal: (state, action: PayloadAction<{ messageId: string }>) => {
      const { messageId } = action.payload;

      // 1. Mark the message as deleted in the main feed
      state.messages = state.messages.map(msg =>
        msg._id === messageId
          ? { ...msg, content: "This message was deleted", isDeleted: true }
          : msg
      );

      // 2. Find the conversation that owns this message
      const conversation = state.conversations.find(c => c.lastMessage?._id === messageId);

      if (conversation) {
        // Look through the messages we have in state to find the NEW last message
        // We filter out the one we just deleted and any others marked as deleted
        const remainingMessages = state.messages.filter(m => m._id !== messageId && !m.isDeleted);

        if (remainingMessages.length > 0) {
          // ✅ SET THE SIDEBAR TO THE PREVIOUS MESSAGE
          conversation.lastMessage = remainingMessages[remainingMessages.length - 1];
        } else {
          // If no messages are left, clear the preview
          conversation.lastMessage = undefined;
        }
      }
    },
    toggleArchiveLocal: (state, action: PayloadAction<{ conversationId: string; isArchived: boolean }>) => {
      const { conversationId, isArchived } = action.payload;

      const index = state.conversations.findIndex(c => c._id === conversationId);
      if (index !== -1) {
        state.conversations[index].isArchived = isArchived;
      }
    },
    incrementUnreadCount: (state, action: PayloadAction<{ conversationId: string; userId: string }>) => {
      const { conversationId, userId } = action.payload;
      const conversation = state.conversations.find(c => c._id === conversationId);
      if (conversation) {
        if (!conversation.unreadCounts) conversation.unreadCounts = [];
        const userCount = conversation.unreadCounts.find(u => u.userId === userId);
        if (userCount) {
          userCount.count += 1;
        } else {
          conversation.unreadCounts.push({ userId, count: 1 });
        }
      }
    },
  }

});

export const { setConversations,
  setActiveConversation,
  setMessages,
  addMessage,
  setTypingStatus,
  markMessagesAsRead,
  deleteMessageLocal,
  toggleArchiveLocal,
  incrementUnreadCount } = chatSlice.actions;

export default chatSlice.reducer;