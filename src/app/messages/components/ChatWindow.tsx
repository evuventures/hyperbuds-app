"use client"
import React, { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setMessages, setActiveConversation, markMessagesAsRead } from '@/store/slices/chatSlice';
import { messagingAPI } from '@/lib/api/messaging.api';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { ChatHeader } from './ChatHeader';
import { format, isToday, isYesterday } from 'date-fns';

interface ChatWindowProps {
  conversationId?: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ conversationId }) => {
  const dispatch = useAppDispatch();
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, conversations } = useAppSelector((state) => state.chat);
  const { user: currentUser } = useAppSelector((state) => state.auth);

  const activeId = conversationId;

  const formatDividerDate = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMMM d, yyyy');
  };
// In ChatWindow.tsx, update the first useEffect:
useEffect(() => {
  if (!activeId) return;
  dispatch(setActiveConversation(activeId));

  // ✅ Clear unread count when opening the conversation
  const currentUserId = currentUser?.id || currentUser?._id;
  if (currentUserId) {
    dispatch(markMessagesAsRead({ 
      conversationId: activeId, 
      messageIds: [], 
      userId: currentUserId 
    }));
  }

  const fetchMessages = async () => {
    try {
      const data = await messagingAPI.getMessages(activeId);
      dispatch(setMessages(data.messages));
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  };
  fetchMessages();
}, [activeId, dispatch, currentUser]);

  // ✅ Filter to only show messages for the active conversation
  const activeMessages = messages.filter(m => m.conversationId === activeId);

  // ✅ Sort by createdAt to ensure correct order after merging
  const sortedMessages = [...activeMessages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [sortedMessages]);

  useEffect(() => {
    const currentUserId = currentUser?.id || currentUser?._id;

    if (activeId && sortedMessages.length > 0 && currentUserId) {
      const unreadIds = sortedMessages
        .filter(m => !m.isRead && m.sender._id !== currentUserId)
        .map(m => m._id);

      if (unreadIds.length > 0) {
        messagingAPI.markAsRead(activeId, unreadIds);
      }
    }
  }, [activeId, sortedMessages, currentUser]);

  if (!activeId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#0F172A] text-slate-400">
        <div className="flex flex-col items-center max-w-sm text-center">
          <div className="relative mb-6">
            <div className="bg-white rounded-2xl p-5 shadow-2xl transform transition-transform hover:scale-105">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-slate-800 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-slate-800 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 bg-slate-800 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 rounded-sm" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-white mb-2 tracking-tight">No conversation selected</h3>
          <p className="text-sm text-slate-500 leading-relaxed px-6">
            Choose a conversation from the sidebar to start chatting with your fellow Hyperbuds
          </p>
        </div>
      </div>
    );
  }

  const activeChat = conversations.find(c => c._id === activeId);
  const currentUserId = currentUser?.id || currentUser?._id;

  const recipient = activeChat?.participants.find(
    (p) => p._id !== currentUserId
  ) || activeChat?.participants[0];

  return (
    <div className="flex flex-col h-full bg-[#0F172A] relative border-l border-slate-800/50">
      <ChatHeader recipient={recipient} />

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth 
                   scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent"
      >
        {sortedMessages.map((msg, index) => {
          const currentDate = new Date(msg.createdAt);
          const prevDate = index > 0 ? new Date(sortedMessages[index - 1].createdAt) : null;

          const isNewDay = !prevDate ||
            currentDate.toDateString() !== prevDate.toDateString();

          return (
            <React.Fragment key={msg._id}>
              {isNewDay && (
                <div className="flex justify-center my-8">
                  <span className="px-4 py-1.5 rounded-full bg-slate-800/40 border border-slate-700/50 text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                    {formatDividerDate(currentDate)}
                  </span>
                </div>
              )}

              <MessageBubble
                message={msg}
                isMe={msg.sender._id === currentUserId}
              />
            </React.Fragment>
          );
        })}
        <div className="h-2" />
      </div>

      <div className="p-4 bg-[#0F172A]">
        <MessageInput conversationId={activeId} />
      </div>
    </div>
  );
};