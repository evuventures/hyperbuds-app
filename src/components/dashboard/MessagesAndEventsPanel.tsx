'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import apiClient from '@/lib/api/client';
import { Calendar, Edit3, Search } from 'lucide-react';

interface ConversationParticipant {
  _id?: string;
  id?: string;
  fullName?: string;
  displayName?: string;
  username?: string;
  avatar?: string;
}

interface ConversationItem {
  _id: string;
  participants?: ConversationParticipant[];
  lastMessage?: {
    content?: string;
    createdAt?: string;
  };
  unreadCount?: number;
  category?: 'primary' | 'general' | 'request';
  status?: string;
}

interface EventItem {
  id: string;
  title: string;
  subtitle: string;
  href: string;
}

function getInitials(name?: string) {
  if (!name) return 'HB';
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function MessagesAndEventsPanel({ currentUserId }: { currentUserId?: string }) {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [tab, setTab] = useState<'primary' | 'general' | 'requests'>('primary');
  const [search, setSearch] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadRightRail() {
      setLoadingMessages(true);
      try {
        const [convRes, streamsRes, trendingRes] = await Promise.all([
          apiClient.get('/messages/conversations?limit=20').catch(() => null),
          apiClient.get('/streaming/streams?limit=3').catch(() => null),
          apiClient.get('/dashboard/trending-collaborations?limit=2').catch(() => null),
        ]);

        if (!active) return;

        const convList =
          convRes?.data?.conversations ||
          convRes?.data?.data?.conversations ||
          (Array.isArray(convRes?.data) ? convRes.data : []);
        setConversations(Array.isArray(convList) ? convList : []);

        const streamItems: EventItem[] = (streamsRes?.data?.streams || [])
          .slice(0, 2)
          .map(
            (s: { _id?: string; id?: string; title?: string; status?: string; scheduledFor?: string }) => {
              const sid = s._id || s.id;
              return {
                id: `stream-${sid || Math.random()}`,
                title: s.title || 'Live Creator Stream',
                subtitle: s.status ? `Stream · ${s.status}` : 'Live Studio Room',
                href: sid ? `/streaming/room/${sid}` : '/streaming',
              };
            },
          );

        const collabItems: EventItem[] = (trendingRes?.data?.trending || []).slice(0, 2).map(
          (c: { _id?: string; id?: string; title?: string; category?: string }) => ({
            id: `collab-${c._id || c.id || Math.random()}`,
            title: c.title || 'Creator Collaboration',
            subtitle: c.category || 'Active Collab',
            href: c._id ? `/collaborations/${c._id}` : '/collaborations',
          }),
        );

        setEvents([...streamItems, ...collabItems].slice(0, 4));
      } finally {
        if (active) setLoadingMessages(false);
      }
    }

    loadRightRail();
    return () => {
      active = false;
    };
  }, []);

  const requestCount = useMemo(
    () =>
      conversations.filter(
        (c) => c.category === 'request' || c.status === 'pending',
      ).length,
    [conversations],
  );

  const filteredConversations = useMemo(() => {
    const q = search.trim().toLowerCase();
    return conversations.filter((conv) => {
      const isRequest = conv.category === 'request' || conv.status === 'pending';
      const isGeneral = conv.category === 'general';
      if (tab === 'requests' && !isRequest) return false;
      if (tab === 'general' && !isGeneral) return false;
      if (tab === 'primary' && (isRequest || isGeneral)) return false;

      if (!q) return true;
      const peer = (conv.participants || []).find(
        (p) => (p._id || p.id) !== currentUserId,
      ) || conv.participants?.[0];
      const name = (
        peer?.displayName ||
        peer?.fullName ||
        peer?.username ||
        ''
      ).toLowerCase();
      return name.includes(q);
    });
  }, [conversations, tab, search, currentUserId]);

  return (
    <aside className="space-y-4">
      {/* Messages Card (modeled on right reference image) */}
      <section
        aria-label="Messages panel"
        className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-950 dark:text-white">Messages</h2>
          <Link
            href="/messages"
            aria-label="Compose message"
            className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <Edit3 className="h-4 w-4" />
          </Link>
        </div>

        {/* Search Input */}
        <div className="relative mt-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            aria-label="Search messages"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
        </div>

        {/* Primary / General / Requests Tabs */}
        <div className="mt-3 flex items-center justify-between border-b border-slate-100 pb-2 text-xs dark:border-slate-800">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setTab('primary')}
              className={`font-semibold transition ${
                tab === 'primary'
                  ? 'text-slate-950 underline decoration-indigo-600 decoration-2 underline-offset-8 dark:text-white'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              Primary
            </button>
            <button
              type="button"
              onClick={() => setTab('general')}
              className={`font-semibold transition ${
                tab === 'general'
                  ? 'text-slate-950 underline decoration-indigo-600 decoration-2 underline-offset-8 dark:text-white'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              General
            </button>
          </div>
          <button
            type="button"
            onClick={() => setTab('requests')}
            className={`font-semibold tabular-nums transition ${
              tab === 'requests'
                ? 'text-indigo-700 underline decoration-indigo-600 decoration-2 underline-offset-8 dark:text-indigo-300'
                : 'text-indigo-600 hover:text-indigo-700 dark:text-indigo-400'
            }`}
          >
            Requests({requestCount})
          </button>
        </div>

        {/* Conversation List */}
        <div className="mt-3 space-y-2">
          {loadingMessages ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-10 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800"
                />
              ))}
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 px-3 py-4 text-center dark:border-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                No {tab} conversations yet.
              </p>
              <Link
                href="/messages"
                className="mt-1.5 inline-block text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
              >
                Open Inbox
              </Link>
            </div>
          ) : (
            filteredConversations.slice(0, 6).map((conv) => {
              const peer =
                (conv.participants || []).find(
                  (p) => (p._id || p.id) !== currentUserId,
                ) || conv.participants?.[0];
              const peerName =
                peer?.displayName || peer?.fullName || peer?.username || 'Creator';

              return (
                <Link
                  key={conv._id}
                  href={`/messages?conversationId=${conv._id}`}
                  className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition hover:bg-slate-50 dark:hover:bg-slate-800/70"
                >
                  <div className="relative shrink-0">
                    {peer?.avatar ? (
                      <img
                        src={peer.avatar}
                        alt={peerName}
                        className="h-8 w-8 rounded-full border border-slate-200 object-cover dark:border-slate-700"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-[11px] font-bold text-white dark:bg-indigo-600">
                        {getInitials(peerName)}
                      </div>
                    )}
                    <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-900" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-slate-900 dark:text-white">
                      {peerName}
                    </p>
                    {conv.lastMessage?.content && (
                      <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                        {conv.lastMessage.content}
                      </p>
                    )}
                  </div>
                  {(conv.unreadCount ?? 0) > 0 && (
                    <span className="rounded-full bg-indigo-600 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-white">
                      {conv.unreadCount}
                    </span>
                  )}
                </Link>
              );
            })
          )}
        </div>

        <div className="mt-3 border-t border-slate-100 pt-2.5 dark:border-slate-800">
          <Link
            href="/messages"
            className="text-xs font-semibold text-slate-500 transition hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
          >
            View All
          </Link>
        </div>
      </section>

      {/* Events Card (modeled on right reference image) */}
      <section
        aria-label="Events panel"
        className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-950 dark:text-white">Events</h2>
          <Link
            href="/streaming"
            className="text-[11px] font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
          >
            Studio
          </Link>
        </div>

        {events.length === 0 ? (
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            No upcoming streams or collab events scheduled.
          </p>
        ) : (
          <ul className="mt-3 space-y-2.5">
            {events.map((ev) => (
              <li key={ev.id}>
                <Link
                  href={ev.href}
                  className="flex items-start gap-2.5 rounded-xl p-1.5 transition hover:bg-slate-50 dark:hover:bg-slate-800/70"
                >
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-indigo-400">
                    <Calendar className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-slate-900 dark:text-white">
                      {ev.title}
                    </p>
                    <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                      {ev.subtitle}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </aside>
  );
}
