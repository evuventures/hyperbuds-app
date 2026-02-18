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
    addMessage: (state, action: PayloadAction<Message>) => {
      // If the message belongs to the open chat, add it to the feed
      if (state.activeConversationId === action.payload.conversationId) {
        state.messages.push(action.payload);
      }

      //  Updates the conversation preview in the sidebar
      const convIndex = state.conversations.findIndex(c => c._id === action.payload.conversationId);
      if (convIndex !== -1) {
       
        state.conversations[convIndex].lastMessage = action.payload;
        state.conversations[convIndex].lastActivity = action.payload.createdAt;

        //  Increment the count within the user-specific array
        if (state.activeConversationId !== action.payload.conversationId) {
          const unreadEntry = state.conversations[convIndex].unreadCounts.find(
            u => u.userId !== action.payload.sender._id 
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

    deleteMessageLocal: (state, action: PayloadAction<{ messageId: string }>) => {
      const { messageId } = action.payload;

      // Update the message in the feed
      state.messages = state.messages.map(msg =>
        msg._id === messageId
          ? { ...msg, content: "This message was deleted", isDeleted: true }
          : msg
      );

      // Update lastMessage in the sidebar if it was the one deleted
      const conversation = state.conversations.find(c => c.lastMessage?._id === messageId);
      if (conversation && conversation.lastMessage) {
        conversation.lastMessage.content = "This message was deleted";
        conversation.lastMessage.isDeleted = true;
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