import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Conversation, Message } from '@/types/messaging.types';

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: Message[];
  isLoading: boolean;
}

const initialState: ChatState = {
  conversations: [],
  activeConversationId: null,
  messages: [],
  isLoading: false,
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
      // Clear messages when switching chats to avoid "ghosting" from the previous chat
      state.messages = []; 
    },
    setMessages: (state, action: PayloadAction<Message[]>) => {
      state.messages = action.payload;
    },
    // This is the most important part: handling the real-time message
    addMessage: (state, action: PayloadAction<Message>) => {
      // 1. If the message belongs to the open chat, add it to the feed
      if (state.activeConversationId === action.payload.conversationId) {
        state.messages.push(action.payload);
      }
      
      // 2. Update the conversation preview in the sidebar
      const convIndex = state.conversations.findIndex(c => c._id === action.payload.conversationId);
      if (convIndex !== -1) {
        state.conversations[convIndex].lastMessage = {
          _id: action.payload._id,
          content: action.payload.content,
          createdAt: action.payload.createdAt
        };
        // If it's not the active chat, increment unread count
        if (state.activeConversationId !== action.payload.conversationId) {
          state.conversations[convIndex].unreadCount += 1;
        }
      }
    },
  },
});

export const { setConversations, setActiveConversation, setMessages, addMessage } = chatSlice.actions;
export default chatSlice.reducer;