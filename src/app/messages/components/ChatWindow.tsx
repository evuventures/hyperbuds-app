"use client"
import React, { useCallback, useEffect, useRef, useMemo, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setMessages, setActiveConversation, markMessagesAsRead } from '@/store/slices/chatSlice';
import { messagingAPI } from '@/lib/api/messaging.api';
import apiClient from '@/lib/api/client';
import { MessageBubble } from './MessageBubble';
import { MessageListSkeleton } from '@/components/ui/AppSkeletons';
import { MessageInput } from './MessageInput';
import { ChatHeader } from './ChatHeader';
import { ChatDuoChallengeCard, type PartnerDuoStatus } from './ChatDuoChallengeCard';
import { format, isToday, isYesterday } from 'date-fns';
import {
  BriefcaseBusiness,
  ExternalLink,
  Layers,
  Plus,
  ShieldCheck,
  UserCheck,
  X,
} from 'lucide-react';

interface ChatWindowProps {
  conversationId?: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ conversationId }) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [duoStatus, setDuoStatus] = useState<PartnerDuoStatus | null>(null);
  const [duoLoading, setDuoLoading] = useState(false);
  const [startingDuo, setStartingDuo] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
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

    let cancelled = false;
    setLoading(true);
    setError('');
    setMobileDrawerOpen(false);

    const fetchMessages = async () => {
      try {
        const data = await messagingAPI.getMessages(activeId);
        if (!cancelled) dispatch(setMessages(data.messages));
      } catch {
        if (!cancelled) setError('Messages could not be loaded. Try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void fetchMessages();
    return () => {
      cancelled = true;
    };
  }, [activeId, dispatch, retry]);

  const sortedMessages = useMemo(
    () =>
      messages
        .filter((m) => m.conversationId === activeId)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [messages, activeId],
  );

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
        .filter((m) => !m.isRead && getSenderId(m.sender) !== currentUserId)
        .map((m) => m._id);
      if (unreadIds.length > 0) {
        void messagingAPI
          .markAsRead(activeId, unreadIds)
          .then(() =>
            dispatch(
              markMessagesAsRead({
                conversationId: activeId,
                messageIds: unreadIds,
                userId: currentUserId,
              }),
            ),
          )
          .catch(() => {});
      }
    }
  }, [activeId, sortedMessages, currentUser, dispatch]);

  const activeChat = conversations.find((c) => c._id === activeId);
  const currentUserId = currentUser?.id || currentUser?._id;
  const recipientRaw =
    (activeChat?.participants ?? []).find(
      (p) => typeof p === 'object' && p !== null && p._id !== currentUserId && p.id !== currentUserId,
    ) || activeChat?.participants?.[0];
  const recipient = typeof recipientRaw === 'object' && recipientRaw !== null ? recipientRaw : undefined;
  const recipientRecord = recipient as
    | (typeof recipient & { displayName?: string; fullName?: string; isOnline?: boolean; avatar?: string })
    | undefined;
  const recipientId = recipient?._id || recipient?.id || '';
  const recipientName =
    recipientRecord?.displayName || recipientRecord?.fullName || recipient?.username || 'Collaborator';
  const recipientHandle = recipient?.username ? `@${recipient.username}` : '';
  const isOnline = Boolean(recipientRecord?.isOnline);

  const loadPartnerDuoStatus = useCallback(async (partnerId: string) => {
    if (!partnerId) {
      setDuoStatus(null);
      return;
    }
    setDuoLoading(true);
    try {
      const res = await apiClient.get<PartnerDuoStatus>(
        `/challenges/duo/partner-status/${encodeURIComponent(partnerId)}`,
      );
      setDuoStatus(res.data || null);
    } catch {
      setDuoStatus(null);
    } finally {
      setDuoLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPartnerDuoStatus(recipientId);
  }, [recipientId, loadPartnerDuoStatus]);

  const handleStartDuoChallenge = async () => {
    if (!recipientId || startingDuo) return;
    setStartingDuo(true);
    try {
      await apiClient.post('/challenges/duo/generate', {
        partnerUserId: recipientId,
        matchId: duoStatus?.matchId || undefined,
      });
      toast.success(`Grow Together Challenge started with ${recipientName}!`);
      await loadPartnerDuoStatus(recipientId);
    } catch (err) {
      const msg =
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
        'Could not start Duo Challenge right now.';
      toast.error(msg);
    } finally {
      setStartingDuo(false);
    }
  };

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
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
            No conversation selected
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed px-6">
            Choose a conversation from the sidebar to start chatting with your fellow Hyperbuds
          </p>
        </div>
      </div>
    );
  }

  const renderQuickActions = (onLinkClick?: () => void) => (
    <div className="space-y-2">
      <p className="px-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        Quick Actions
      </p>
      {recipient?.username && (
        <Link
          href={`/profile/@${encodeURIComponent(recipient.username)}`}
          onClick={onLinkClick}
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
        onClick={onLinkClick}
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
        onClick={onLinkClick}
        className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-indigo-300 hover:text-indigo-600 transition"
      >
        <span className="inline-flex items-center gap-2">
          <Layers className="h-3.5 w-3.5 text-indigo-500" />
          Collaboration Workspaces
        </span>
        <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
      </Link>
    </div>
  );

  const showMobileAlertDot = Boolean(duoStatus?.needsChallengePrompt);

  return (
    <div className="flex min-h-0 flex-1 h-full bg-white dark:bg-slate-900 relative border-l border-slate-200 dark:border-slate-800/50">
      {/* Center Pane: Message Stream & Composer */}
      <div className="relative flex min-h-0 flex-1 flex-col h-full">
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
          {error && (
            <div role="alert" className="text-sm text-red-700 dark:text-red-300">
              <p>{error}</p>
              <button className="mt-2 underline" onClick={() => setRetry((v) => v + 1)}>
                Retry messages
              </button>
            </div>
          )}
          {!loading && !error && !sortedMessages.length && (
            <p className="text-sm text-muted-foreground">No messages yet. Start the conversation below.</p>
          )}
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

        {/* Mobile Floating `+` Trigger Button (shows pulsing indicator when matched without a challenge) */}
        <button
          type="button"
          onClick={() => setMobileDrawerOpen(true)}
          aria-label={
            showMobileAlertDot
              ? `Open match challenge & quick actions for ${recipientName} (new challenge prompt)`
              : `Open quick actions & match details for ${recipientName}`
          }
          className="lg:hidden absolute right-4 bottom-24 z-30 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-purple-600 text-white shadow-lg shadow-purple-600/35 ring-2 ring-white transition hover:bg-purple-500 active:scale-95 dark:ring-slate-900"
        >
          <Plus className="h-5 w-5" />
          {showMobileAlertDot && (
            <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pink-400 opacity-80" />
              <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-white bg-pink-500 dark:border-slate-900" />
            </span>
          )}
        </button>

        {/* Input — pinned to bottom, never squished */}
        <div className="shrink-0 border-t border-slate-100 dark:border-transparent">
          <MessageInput key={`${activeId}:${currentUserId}`} conversationId={activeId} />
        </div>
      </div>

      {/* Desktop Right Sidebar: Member Info, Matched Duo Challenge Indicator & Quick Actions */}
      <aside
        aria-label="Participant details"
        className="hidden lg:flex lg:w-72 xl:w-80 shrink-0 flex-col border-l border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 overflow-y-auto"
      >
        {/* Top Banner + Overlapping Avatar */}
        <div className="h-16 bg-slate-900 dark:bg-slate-950 relative">
          <div
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)',
              backgroundSize: '12px 12px',
            }}
          />
        </div>
        <div className="px-5 pb-5">
          <div className="-mt-8 mb-3 flex items-end justify-between">
            <div className="relative h-16 w-16">
              <div className="h-16 w-16 rounded-2xl border-4 border-white dark:border-slate-900 bg-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-sm overflow-hidden">
                {recipientRecord?.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={recipientRecord.avatar}
                    alt={recipientName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  recipientName.charAt(0).toUpperCase()
                )}
              </div>
              <span
                className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-slate-900 ${
                  isOnline ? 'bg-emerald-500' : 'bg-slate-400'
                }`}
              />
            </div>
            <span className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              {duoStatus?.isMatched ? 'Matched' : isOnline ? 'Online' : 'Direct Thread'}
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
                <span className="font-mono font-semibold text-slate-900 dark:text-white">
                  {sortedMessages.length}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span>Channel security</span>
                <span className="inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="h-3.5 w-3.5" /> Verified
                </span>
              </div>
            </div>
          </div>

          {/* Match Duo Challenge Indicator */}
          {(duoLoading || duoStatus?.isMatched || duoStatus?.activeChallenge) && (
            <div className="mt-4">
              <ChatDuoChallengeCard
                partnerName={recipientName}
                status={duoStatus}
                loading={duoLoading}
                starting={startingDuo}
                onStartChallenge={() => void handleStartDuoChallenge()}
              />
            </div>
          )}

          {/* Shared Workspaces & Quick Navigation */}
          <div className="mt-4">{renderQuickActions()}</div>
        </div>
      </aside>

      {/* Mobile Bottom-Sheet Popup triggered by the `+` button */}
      {mobileDrawerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Match challenge and quick actions with ${recipientName}`}
          className="lg:hidden fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-xs"
          onClick={() => setMobileDrawerOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-t-3xl border-t border-slate-200 bg-slate-50 p-5 pb-8 shadow-2xl dark:border-slate-800 dark:bg-slate-950 animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Drag Handle */}
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-300 dark:bg-slate-700" />

            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-11 w-11 shrink-0 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-base font-bold overflow-hidden">
                  {recipientRecord?.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={recipientRecord.avatar}
                      alt={recipientName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    recipientName.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                    {recipientName}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {duoStatus?.isMatched ? 'Mutual Match · Collaborate together' : recipientHandle || 'Direct Chat'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                aria-label="Close popup"
                onClick={() => setMobileDrawerOpen(false)}
                className="rounded-full p-2 text-slate-500 hover:bg-slate-200/70 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <ChatDuoChallengeCard
                partnerName={recipientName}
                status={duoStatus}
                loading={duoLoading}
                starting={startingDuo}
                onStartChallenge={() => void handleStartDuoChallenge()}
                onNavigate={() => setMobileDrawerOpen(false)}
              />
              {renderQuickActions(() => setMobileDrawerOpen(false))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
