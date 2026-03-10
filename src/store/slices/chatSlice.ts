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
      state.conversations = action.payload;
    },

    setActiveConversation: (state, action: PayloadAction<string | null>) => {
      state.activeConversationId = action.payload;
      // Clear messages when switching chats to avoid "ghosting"
      state.messages = [];
    },

    setMessages: (state, action: PayloadAction<Message[]>) => {
      // ✅ Merge instead of replace — preserves real-time socket messages
      // that arrived before or during the API fetch.
      const incoming = action.payload;
      const existingIds = new Set(state.messages.map(m => m._id));
      const newOnly = incoming.filter(m => !existingIds.has(m._id));
      state.messages = [...state.messages, ...newOnly];
    },

    addMessage: (state, action: PayloadAction<Message>) => {
      const message = action.payload;

      // Prevent duplicates
      const isDuplicate = state.messages.some(m => m._id === message._id);

      // ✅ No activeConversationId check — always store if not duplicate.
      // ChatWindow only renders messages for the active conversation anyway,
      // so filtering at the store level was causing real-time messages to be lost
      // whenever the component remounted and cleared the message list.
      if (!isDuplicate) {
        state.messages.push(message);
      }

      // Update sidebar preview
      const convIndex = state.conversations.findIndex(c => c._id === message.conversationId);
      if (convIndex !== -1) {
        state.conversations[convIndex].lastMessage = message;
      }
    },

    setTypingStatus: (state, action: PayloadAction<{
      conversationId: string;
      userId: string;
      isTyping: boolean;
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

      // Update messages in the current feed
      state.messages = state.messages.map(msg =>
        messageIds.includes(msg._id)
          ? { ...msg, isRead: true, readAt: new Date().toISOString() }
          : msg
      );

      // Guard: conversation and unreadCounts may not exist yet
      const convIndex = state.conversations.findIndex(c => c._id === conversationId);
      if (convIndex !== -1) {
        const conv = state.conversations[convIndex];

        if (!conv.unreadCounts) {
          conv.unreadCounts = [];
        }

        const unreadEntry = conv.unreadCounts.find(u => u.userId === userId);
        if (unreadEntry) {
          unreadEntry.count = 0;
        }
      }
    },

    deleteMessageLocal: (state, action: PayloadAction<{ messageId: string }>) => {
      const { messageId } = action.payload;

      // Mark message as deleted in the feed
      state.messages = state.messages.map(msg =>
        msg._id === messageId
          ? { ...msg, content: "This message was deleted", isDeleted: true }
          : msg
      );

      // Update sidebar preview if the deleted message was the last one
      const conversation = state.conversations.find(c => c.lastMessage?._id === messageId);
      if (conversation) {
        const remainingMessages = state.messages.filter(m => m._id !== messageId && !m.isDeleted);

        conversation.lastMessage = remainingMessages.length > 0
          ? remainingMessages[remainingMessages.length - 1]
          : undefined;
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
        // Guard: unreadCounts may not exist on older conversation objects
        if (!conversation.unreadCounts) {
          conversation.unreadCounts = [];
        }

        const userCount = conversation.unreadCounts.find(u => u.userId === userId);
        if (userCount) {
          userCount.count += 1;
        } else {
          conversation.unreadCounts.push({ userId, count: 1 });
        }
      }
    },
  },
});

export const {
  setConversations,
  setActiveConversation,
  setMessages,
  addMessage,
  setTypingStatus,
  markMessagesAsRead,
  deleteMessageLocal,
  toggleArchiveLocal,
  incrementUnreadCount,
} = chatSlice.actions;

export default chatSlice.reducer;