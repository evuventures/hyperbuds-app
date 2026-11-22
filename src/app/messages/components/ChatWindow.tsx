"use client"
import React, { useEffect, useRef, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setMessages, setActiveConversation, markMessagesAsRead } from '@/store/slices/chatSlice';
import { messagingAPI } from '@/lib/api/messaging.api';
import { MessageBubble } from './MessageBubble';
import { MessageListSkeleton } from '@/components/ui/AppSkeletons';
import { MessageInput } from './MessageInput';
import { ChatHeader } from './ChatHeader';
import { format, isToday, isYesterday } from 'date-fns';
import { BriefcaseBusiness, ExternalLink, Layers, ShieldCheck, UserCheck } from 'lucide-react';

interface ChatWindowProps {
  conversationId?: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ conversationId }) => {
  const dispatch = useAppDispatch();
  const [loading,setLoading]=useState(false),[error,setError]=useState(''),[retry,setRetry]=useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, conversations, activeConversationId } = useAppSelector((state) => state.chat);
  const { user: currentUser } = useAppSelector((state) => state.auth);

  const activeId = conversationId ?? activeConversationId;

  const formatDividerDate = (date: Date) => {
    if (Number.isNaN(date.getTime())) return 'Date unavailable';
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMMM d, yyyy');
  };

  useEffect(() => {
    if (!activeId) return;
    dispatch(setActiveConversation(activeId));

    let cancelled=false;setLoading(true);setError('');

    const fetchMessages = async () => {
      try {
        const data = await messagingAPI.getMessages(activeId);
        if(!cancelled)dispatch(setMessages(data.messages));
      } catch (error) {
        if(!cancelled)setError("Messages could not be loaded. Try again.");
      } finally {
        if(!cancelled)setLoading(false);
      }
    };
    void fetchMessages();
    return()=>{cancelled=true;};
  }, [activeId, dispatch, retry]);

  const sortedMessages=useMemo(()=>messages.filter(m=>m.conversationId===activeId).sort((a,b)=>new Date(a.createdAt).getTime()-new Date(b.createdAt).getTime()),[messages,activeId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [sortedMessages]);

  const getSenderId = (sender: unknown): string => {
    if (typeof sender === 'string') return sender;
    if (sender && typeof sender === 'object') {
      const s = sender as { _id?: string; id?: string };
      return s._id || s.id || '';
    }
    return '';
  };

  useEffect(() => {
    const currentUserId = currentUser?.id || currentUser?._id;
    if (activeId && sortedMessages.length > 0 && currentUserId) {
      const unreadIds = sortedMessages
        .filter(m => !m.isRead && getSenderId(m.sender) !== currentUserId)
        .map(m => m._id);
      if (unreadIds.length > 0) {
        void messagingAPI.markAsRead(activeId, unreadIds).then(()=>dispatch(markMessagesAsRead({conversationId:activeId,messageIds:unreadIds,userId:currentUserId}))).catch(()=>{});
      }
    }
  }, [activeId, sortedMessages, currentUser, dispatch]);

  if (!activeId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-400">
        <div className="flex flex-col items-center max-w-sm text-center">
          <div className="relative mb-6">
            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-50 dark:bg-slate-800 rotate-45 rounded-sm border-r border-b border-slate-200 dark:border-slate-700" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">No conversation selected</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed px-6">
            Choose a conversation from the sidebar to start chatting with your fellow Hyperbuds
          </p>
        </div>
      </div>
    );
  }

  const activeChat = conversations.find(c => c._id === activeId);
  const currentUserId = currentUser?.id || currentUser?._id;
  const recipientRaw = (activeChat?.participants ?? []).find(p => typeof p === 'object' && p !== null && p._id !== currentUserId && p.id !== currentUserId) || activeChat?.participants?.[0];
  const recipient = typeof recipientRaw === 'object' && recipientRaw !== null ? recipientRaw : undefined;
  const recipientRecord = recipient as (typeof recipient & { displayName?: string; fullName?: string; isOnline?: boolean }) | undefined;
  const recipientName = recipientRecord?.displayName || recipientRecord?.fullName || recipient?.username || 'Collaborator';
  const recipientHandle = recipient?.username ? `@${recipient.username}` : '';
  const isOnline = Boolean(recipientRecord?.isOnline);

  return (
    <div className="flex min-h-0 flex-1 h-full bg-white dark:bg-slate-900 relative border-l border-slate-200 dark:border-slate-800/50">
      {/* Center Pane: Message Stream & Composer */}
      <div className="flex min-h-0 flex-1 flex-col h-full">
        {/* Header — fixed height, never shrinks */}
        <div className="shrink-0">
          <ChatHeader recipient={recipient} />
        </div>

        {/* Messages — takes all remaining space and scrolls internally */}
        <div
          role="region"
          aria-label="Message history"
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth
                     scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-800 scrollbar-track-transparent"
        >
          {loading && <MessageListSkeleton />}
          {error&&<div role="alert" className="text-sm text-red-700 dark:text-red-300"><p>{error}</p><button className="mt-2 underline" onClick={()=>setRetry(v=>v+1)}>Retry messages</button></div>}
          {!loading&&!error&&!sortedMessages.length&&<p className="text-sm text-muted-foreground">No messages yet. Start the conversation below.</p>}
          {sortedMessages.map((msg, index) => {
            const currentDate = new Date(msg.createdAt);
            const prevDate = index > 0 ? new Date(sortedMessages[index - 1].createdAt) : null;
            const isNewDay = !prevDate || currentDate.toDateString() !== prevDate.toDateString();

            return (
              <React.Fragment key={msg._id}>
                {isNewDay && (
                  <div className="flex justify-center my-6">
                    <span className="px-3.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                      {formatDividerDate(currentDate)}
                    </span>
                  </div>
                )}
                <MessageBubble message={msg} isMe={getSenderId(msg.sender) === currentUserId} />
              </React.Fragment>
            );
          })}
          <div className="h-2" />
        </div>

        {/* Input — pinned to bottom, never squished */}
        <div className="shrink-0 border-t border-slate-100 dark:border-transparent">
          <MessageInput key={`${activeId}:${currentUserId}`} conversationId={activeId} />
        </div>
      </div>

      {/* Right Pane: Discord-Inspired Member & Shared Context Inspector */}
      <aside
        aria-label="Participant details"
        className="hidden xl:flex xl:w-72 shrink-0 flex-col border-l border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 overflow-y-auto"
      >
        {/* Top Banner + Overlapping Avatar */}
        <div className="h-16 bg-slate-900 dark:bg-slate-950 relative">
          <div
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage: "radial-gradient(#6366f1 1px, transparent 1px)",
              backgroundSize: "12px 12px",
            }}
          />
        </div>
        <div className="px-5 pb-5">
          <div className="-mt-8 mb-3 flex items-end justify-between">
            <div className="relative h-16 w-16 rounded-2xl border-4 border-white dark:border-slate-900 bg-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-sm">
              {recipientName.charAt(0).toUpperCase()}
              <span
                className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-slate-900 ${
                  isOnline ? 'bg-emerald-500' : 'bg-slate-400'
                }`}
              />
            </div>
            <span className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              {isOnline ? 'Online' : 'Direct Thread'}
            </span>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{recipientName}</h4>
            {recipientHandle && (
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{recipientHandle}</p>
            )}
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span>Messages in thread</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">{sortedMessages.length}</span>
              </div>
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span>Channel security</span>
                <span className="inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="h-3.5 w-3.5" /> Verified
                </span>
              </div>
            </div>
          </div>

          {/* Shared Workspaces & Quick Navigation */}
          <div className="mt-4 space-y-2">
            <p className="px-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Quick Actions
            </p>
            {recipient?.username && (
              <Link
                href={`/profile/@${encodeURIComponent(recipient.username)}`}
                className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-indigo-300 hover:text-indigo-600 transition"
              >
                <span className="inline-flex items-center gap-2">
                  <UserCheck className="h-3.5 w-3.5 text-indigo-500" />
                  Creator Profile
                </span>
                <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
              </Link>
            )}
            <Link
              href="/startup-talent"
              className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-indigo-300 hover:text-indigo-600 transition"
            >
              <span className="inline-flex items-center gap-2">
                <BriefcaseBusiness className="h-3.5 w-3.5 text-indigo-500" />
                Startup &amp; Talent Hub
              </span>
              <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
            </Link>
            <Link
              href="/collaborations"
              className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-indigo-300 hover:text-indigo-600 transition"
            >
              <span className="inline-flex items-center gap-2">
                <Layers className="h-3.5 w-3.5 text-indigo-500" />
                Collaboration Workspaces
              </span>
              <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );
};
