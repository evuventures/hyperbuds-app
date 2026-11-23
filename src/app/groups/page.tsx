'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/Dashboard/Dashboard';
import apiClient from '@/lib/api/client';
import { useAuth } from '@/hooks/auth/useAuth';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Flame,
  Hash,
  Link2,
  Loader2,
  MessageSquare,
  Plus,
  Search,
  Send,
  Trophy,
  Users,
  X,
} from 'lucide-react';

interface CollabGroupSummary {
  id: string;
  name: string;
  slug: string;
  description: string;
  niche: string;
  visibility: 'public' | 'invite_only';
  membersCount: number;
  activeChallengesCount: number;
  isMember: boolean;
  viewerRole: string | null;
}

interface GroupMember {
  userId: string;
  role: string;
  displayName: string;
  username: string;
  avatar: string;
  rizzScore: number;
}

interface GroupMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderUsername: string;
  senderAvatar: string;
  content: string;
  externalPromoUrl?: string | null;
  createdAt: string;
}

interface GroupChallenge {
  id: string;
  title: string;
  description: string;
  hashtag: string;
  targetCount: number;
  entriesCount: number;
  viewerEntered: boolean;
  expiresAt?: string;
}

interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  username: string;
  avatar: string;
  completedCount: number;
}

const NICHES = ['All', 'General', 'Tech', 'Gaming', 'Music', 'Lifestyle', 'Finance', 'Fitness', 'Beauty', 'Comedy', 'Startups', 'AI'];

function initialsOf(name?: string) {
  if (!name) return 'HB';
  return name
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function formatMessageTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDateDivider(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: d.getFullYear() !== today.getFullYear() ? 'numeric' : undefined });
}

export default function CollabGroupsPage() {
  const { user } = useAuth();
  const currentUserId = String(user?.id || (user as { _id?: string } | null)?._id || '');

  const [tab, setTab] = useState<'discover' | 'mine'>('discover');
  const [nicheFilter, setNicheFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [groups, setGroups] = useState<CollabGroupSummary[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected group detail state
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailTab, setDetailTab] = useState<'chat' | 'challenges' | 'members'>('chat');
  const [groupDetail, setGroupDetail] = useState<{
    group: CollabGroupSummary;
    members: GroupMember[];
    messages: GroupMessage[];
    challenges: GroupChallenge[];
    leaderboard: LeaderboardEntry[];
  } | null>(null);

  // Create Group Modal
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newNiche, setNewNiche] = useState('General');
  const [creatingGroup, setCreatingGroup] = useState(false);

  // Group Chat composer
  const [msgText, setMsgText] = useState('');
  const [msgPromoUrl, setMsgPromoUrl] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [sendingMsg, setSendingMsg] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Create Group Challenge Modal
  const [challengeModalOpen, setChallengeModalOpen] = useState(false);
  const [chTitle, setChTitle] = useState('');
  const [chDesc, setChDesc] = useState('');
  const [chHashtag, setChHashtag] = useState('');
  const [chTarget, setChTarget] = useState(10);
  const [creatingChallenge, setCreatingChallenge] = useState(false);
  const [enteringChallengeId, setEnteringChallengeId] = useState<string | null>(null);

  const loadGroups = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ tab });
      if (search.trim()) params.set('q', search.trim());
      if (nicheFilter !== 'All') params.set('niche', nicheFilter);
      const res = await apiClient.get(`/groups?${params.toString()}`);
      setGroups(Array.isArray(res.data?.groups) ? res.data.groups : []);
    } catch {
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, [tab, search, nicheFilter]);

  const loadGroupDetail = useCallback(async (groupId: string, silent = false) => {
    if (!silent) setDetailLoading(true);
    try {
      const res = await apiClient.get(`/groups/${encodeURIComponent(groupId)}`);
      setGroupDetail(res.data);
    } catch (err) {
      if (!silent) {
        toast.error((err as { message?: string })?.message || 'Could not load group');
        setSelectedGroupId(null);
      }
    } finally {
      if (!silent) setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadGroups();
  }, [loadGroups]);

  // Support deep-link /groups?id=<id-or-slug>
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const idParam = new URLSearchParams(window.location.search).get('id')?.trim();
    if (idParam) {
      setSelectedGroupId(idParam);
    }
  }, []);

  useEffect(() => {
    if (selectedGroupId) {
      void loadGroupDetail(selectedGroupId);
      const interval = window.setInterval(() => {
        void loadGroupDetail(selectedGroupId, true);
      }, 12_000);
      return () => window.clearInterval(interval);
    } else {
      setGroupDetail(null);
    }
  }, [selectedGroupId, loadGroupDetail]);

  // Auto-scroll to newest message when messages change in chat tab
  useEffect(() => {
    if (detailTab === 'chat' && groupDetail?.messages) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [detailTab, groupDetail?.messages?.length]);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim().length < 3) {
      toast.error('Group name must be at least 3 characters');
      return;
    }
    setCreatingGroup(true);
    try {
      const res = await apiClient.post('/groups', {
        name: newName.trim(),
        description: newDesc.trim(),
        niche: newNiche,
      });
      toast.success(`Created "${newName.trim()}"!`);
      setCreateOpen(false);
      setNewName('');
      setNewDesc('');
      setNewNiche('General');
      await loadGroups();
      if (res.data?.group?.id) {
        setSelectedGroupId(res.data.group.id);
      }
    } catch (err) {
      toast.error((err as { message?: string })?.message || 'Failed to create group');
    } finally {
      setCreatingGroup(false);
    }
  };

  const handleJoinOrLeave = async (group: CollabGroupSummary) => {
    try {
      if (group.isMember) {
        await apiClient.post(`/groups/${encodeURIComponent(group.id)}/leave`);
        toast.success(`Left ${group.name}`);
      } else {
        await apiClient.post(`/groups/${encodeURIComponent(group.id)}/join`);
        toast.success(`Joined ${group.name}!`);
      }
      await loadGroups();
      if (selectedGroupId === group.id || selectedGroupId === group.slug) {
        await loadGroupDetail(group.id, true);
      }
    } catch (err) {
      toast.error((err as { message?: string })?.message || 'Action failed');
    }
  };

  const handleSendGroupMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroupId || (!msgText.trim() && !msgPromoUrl.trim())) return;
    setSendingMsg(true);
    try {
      await apiClient.post(`/groups/${encodeURIComponent(selectedGroupId)}/messages`, {
        content: msgText.trim(),
        externalPromoUrl: msgPromoUrl.trim() || undefined,
      });
      setMsgText('');
      setMsgPromoUrl('');
      setShowLinkInput(false);
      await loadGroupDetail(selectedGroupId, true);
    } catch (err) {
      toast.error(
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
          (err as { message?: string })?.message ||
          'Could not send message',
      );
    } finally {
      setSendingMsg(false);
    }
  };

  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroupId) return;
    setCreatingChallenge(true);
    try {
      await apiClient.post(`/groups/${encodeURIComponent(selectedGroupId)}/challenges`, {
        title: chTitle.trim(),
        description: chDesc.trim(),
        hashtag: chHashtag.replace(/^#/, '').trim(),
        targetCount: chTarget,
      });
      toast.success('Group challenge launched! Members have been notified.');
      setChallengeModalOpen(false);
      setChTitle('');
      setChDesc('');
      setChHashtag('');
      setChTarget(10);
      await loadGroupDetail(selectedGroupId, true);
    } catch (err) {
      toast.error(
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
          'Could not create group challenge',
      );
    } finally {
      setCreatingChallenge(false);
    }
  };

  const handleEnterChallenge = async (challengeId: string) => {
    if (!selectedGroupId) return;
    setEnteringChallengeId(challengeId);
    try {
      await apiClient.post(
        `/groups/${encodeURIComponent(selectedGroupId)}/challenges/${encodeURIComponent(challengeId)}/enter`,
        {},
      );
      toast.success('Challenge entry verified & recorded on the leaderboard!');
      await loadGroupDetail(selectedGroupId, true);
    } catch (err) {
      toast.error(
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
          'Publish a post with this challenge #hashtag first, then verify.',
        { duration: 6000 },
      );
    } finally {
      setEnteringChallengeId(null);
    }
  };

  // Messages are returned newest-first or oldest-first depending on backend; normalize oldest → newest for proper chat scroll
  const orderedMessages = React.useMemo(() => {
    if (!groupDetail?.messages) return [];
    return [...groupDetail.messages].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }, [groupDetail?.messages]);

  return (
    <DashboardLayout>
      {!selectedGroupId ? (
        <div className="min-h-full bg-[#f8f9fc] px-4 py-6 pb-24 dark:bg-slate-950 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl space-y-6">
            {/* Directory Header */}
            <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#3B0F7A] via-[#5B21B6] to-[#1E0A3C] p-6 text-white shadow-lg sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-xl">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-purple-100">
                    <Users className="h-3.5 w-3.5 text-amber-300" />
                    Creator Communities &amp; Growth Pods
                  </span>
                  <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
                    Collaboration Groups
                  </h1>
                  <p className="mt-1.5 text-sm text-purple-100/85">
                    Create or join niche creator pods, launch community #hashtag challenges, and drop your YouTube/TikTok/IG posts for Golden Hour support.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCreateOpen(true)}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-xs font-bold text-purple-900 shadow-sm transition hover:bg-purple-50"
                >
                  <Plus className="h-4 w-4" />
                  Create Group
                </button>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex rounded-full bg-black/25 p-1">
                  <button
                    type="button"
                    onClick={() => setTab('discover')}
                    className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                      tab === 'discover' ? 'bg-white text-purple-900' : 'text-purple-100 hover:text-white'
                    }`}
                  >
                    Discover Groups
                  </button>
                  <button
                    type="button"
                    onClick={() => setTab('mine')}
                    className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                      tab === 'mine' ? 'bg-white text-purple-900' : 'text-purple-100 hover:text-white'
                    }`}
                  >
                    My Groups
                  </button>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-purple-200" />
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search groups..."
                    className="w-full rounded-full border border-white/20 bg-white/10 py-1.5 pl-8 pr-3 text-xs text-white placeholder:text-purple-200 focus:border-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Niche filter chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 hb-scroll-hidden">
              {NICHES.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setNicheFilter(n)}
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition ${
                    nicheFilter === n
                      ? 'bg-purple-600 text-white'
                      : 'border border-slate-200 bg-white text-slate-600 hover:border-purple-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>

            {/* Groups grid */}
            {loading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-44 animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" />
                ))}
              </div>
            ) : groups.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
                <Users className="mx-auto h-10 w-10 text-purple-500" />
                <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
                  {tab === 'mine' ? 'You haven’t joined any groups yet' : 'No Collaboration Groups yet'}
                </h3>
                <p className="mx-auto mt-1 max-w-md text-xs text-slate-500">
                  Start the first creator growth pod in your niche and launch weekly community challenges.
                </p>
                <button
                  type="button"
                  onClick={() => setCreateOpen(true)}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-purple-600 px-5 py-2 text-xs font-semibold text-white hover:bg-purple-500"
                >
                  <Plus className="h-4 w-4" />
                  Create First Group
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {groups.map((g) => (
                  <div
                    key={g.id}
                    className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-purple-300 dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-[10px] font-bold text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                          {g.niche}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500">
                          {g.membersCount} {g.membersCount === 1 ? 'member' : 'members'} · {g.activeChallengesCount} active
                        </span>
                      </div>
                      <h3 className="mt-2 text-base font-bold text-slate-900 dark:text-white">{g.name}</h3>
                      <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                        {g.description || 'Creator collaboration pod for shared growth and weekly challenges.'}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setDetailTab('chat');
                          setSelectedGroupId(g.id);
                        }}
                        className="flex-1 rounded-xl bg-purple-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-purple-500"
                      >
                        Open Group Chat
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleJoinOrLeave(g)}
                        className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                          g.isMember
                            ? 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300'
                            : 'border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-950/40 dark:text-purple-300'
                        }`}
                      >
                        {g.isMember ? 'Joined ✓' : 'Join'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Proper Viewport-Height Group Chat Workspace */
        <div className="flex h-[calc(100dvh-116px)] w-full flex-col bg-slate-100/70 p-2 sm:p-4 lg:h-[calc(100dvh-68px)] dark:bg-slate-950">
          <div className="mx-auto flex h-full w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            {detailLoading || !groupDetail ? (
              <div className="flex flex-1 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            ) : (
              <>
                {/* Compact Chat Header Bar */}
                <header className="shrink-0 border-b border-slate-200 bg-white px-3 py-2.5 sm:px-4 dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => setSelectedGroupId(null)}
                        aria-label="Back to groups"
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </button>
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-600 text-xs font-bold text-white">
                        {initialsOf(groupDetail.group.name)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h2 className="truncate text-sm font-bold text-slate-900 sm:text-base dark:text-white">
                            {groupDetail.group.name}
                          </h2>
                          <span className="hidden rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 sm:inline dark:bg-slate-800 dark:text-slate-300">
                            {groupDetail.group.niche}
                          </span>
                        </div>
                        <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                          {groupDetail.members.length}{' '}
                          {groupDetail.members.length === 1 ? 'member' : 'members'}
                          {groupDetail.group.description ? ` · ${groupDetail.group.description}` : ''}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => void handleJoinOrLeave(groupDetail.group)}
                      className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                        groupDetail.group.isMember
                          ? 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
                          : 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900'
                      }`}
                    >
                      {groupDetail.group.isMember ? 'Leave' : 'Join'}
                    </button>
                  </div>

                  {/* Clean inline tab strip */}
                  <div className="mt-2.5 flex items-center gap-1 border-t border-slate-100 pt-2 dark:border-slate-800/80">
                    {(
                      [
                        { id: 'chat', label: 'Chat', icon: MessageSquare },
                        { id: 'challenges', label: `Challenges (${groupDetail.challenges.length})`, icon: Flame },
                        { id: 'members', label: `Members (${groupDetail.members.length})`, icon: Trophy },
                      ] as const
                    ).map((t) => {
                      const Icon = t.icon;
                      const active = detailTab === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setDetailTab(t.id)}
                          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                            active
                              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                          }`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          {t.label}
                        </button>
                      );
                    })}
                  </div>
                </header>

                {/* TAB 1: PROPER GROUP CHAT */}
                {detailTab === 'chat' && (
                  <>
                    <div
                      className="flex-1 overflow-y-auto bg-[#f0f2f5] px-3 py-4 sm:px-5 dark:bg-[#0b1017]"
                      style={{
                        backgroundImage:
                          'radial-gradient(rgba(100,116,139,0.12) 1px, transparent 1px)',
                        backgroundSize: '18px 18px',
                      }}
                    >
                      {orderedMessages.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center text-center">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-400 shadow-2xs dark:bg-slate-800">
                            <MessageSquare className="h-5 w-5" />
                          </div>
                          <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
                            No messages yet
                          </p>
                          <p className="mt-1 max-w-xs text-xs text-slate-500 dark:text-slate-400">
                            Say hello to the pod or share a link for Golden Hour support.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          {orderedMessages.map((m, idx) => {
                            const isMe = Boolean(currentUserId && m.senderId === currentUserId);
                            const prev = idx > 0 ? orderedMessages[idx - 1] : null;
                            const sameSenderAsPrev = Boolean(
                              prev &&
                                prev.senderId === m.senderId &&
                                new Date(m.createdAt).getTime() - new Date(prev.createdAt).getTime() <
                                  5 * 60 * 1000,
                            );
                            const currentDay = new Date(m.createdAt).toDateString();
                            const prevDay = prev ? new Date(prev.createdAt).toDateString() : null;
                            const showDateDivider = currentDay !== prevDay;

                            return (
                              <React.Fragment key={m.id}>
                                {showDateDivider && (
                                  <div className="my-3 flex justify-center">
                                    <span className="rounded-full bg-white/90 px-3 py-0.5 text-[11px] font-medium text-slate-500 shadow-2xs ring-1 ring-slate-200/70 dark:bg-slate-800/90 dark:text-slate-400 dark:ring-slate-700">
                                      {formatDateDivider(m.createdAt)}
                                    </span>
                                  </div>
                                )}

                                <div
                                  className={`flex items-end gap-2 ${
                                    isMe ? 'justify-end' : 'justify-start'
                                  } ${sameSenderAsPrev ? 'mt-0.5' : 'mt-3'}`}
                                >
                                  {/* Left avatar for other members */}
                                  {!isMe && (
                                    <div className="w-7 shrink-0">
                                      {!sameSenderAsPrev ? (
                                        m.senderAvatar ? (
                                          // eslint-disable-next-line @next/next/no-img-element
                                          <img
                                            src={m.senderAvatar}
                                            alt={m.senderName}
                                            className="h-7 w-7 rounded-full object-cover"
                                          />
                                        ) : (
                                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-300 text-[10px] font-bold text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                                            {initialsOf(m.senderName)}
                                          </div>
                                        )
                                      ) : null}
                                    </div>
                                  )}

                                  <div
                                    className={`flex max-w-[78%] flex-col sm:max-w-[66%] ${
                                      isMe ? 'items-end' : 'items-start'
                                    }`}
                                  >
                                    {!isMe && !sameSenderAsPrev && (
                                      <div className="mb-0.5 flex items-center gap-1.5 px-1">
                                        {m.senderUsername ? (
                                          <Link
                                            href={`/profile/${encodeURIComponent(m.senderUsername)}`}
                                            className="text-[11px] font-semibold text-slate-700 hover:underline dark:text-slate-300"
                                          >
                                            {m.senderName}
                                          </Link>
                                        ) : (
                                          <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                            {m.senderName}
                                          </span>
                                        )}
                                      </div>
                                    )}

                                    <div
                                      className={`rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed shadow-2xs ${
                                        isMe
                                          ? 'rounded-br-sm bg-slate-900 text-white dark:bg-purple-600'
                                          : 'rounded-bl-sm bg-white text-slate-900 ring-1 ring-slate-200/70 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-700/70'
                                      }`}
                                    >
                                      {m.content && (
                                        <p className="whitespace-pre-wrap break-words">{m.content}</p>
                                      )}

                                      {m.externalPromoUrl && (
                                        <a
                                          href={m.externalPromoUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className={`mt-1.5 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                                            isMe
                                              ? 'bg-white/15 text-white hover:bg-white/25'
                                              : 'bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-950/60 dark:text-purple-300'
                                          }`}
                                        >
                                          <ExternalLink className="h-3 w-3 shrink-0" />
                                          <span className="truncate">Support External Post</span>
                                        </a>
                                      )}

                                      <span
                                        className={`mt-1 block text-right text-[10px] tabular-nums ${
                                          isMe
                                            ? 'text-white/60'
                                            : 'text-slate-400 dark:text-slate-500'
                                        }`}
                                      >
                                        {formatMessageTime(m.createdAt)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </React.Fragment>
                            );
                          })}
                          <div ref={messagesEndRef} />
                        </div>
                      )}
                    </div>

                    {/* Sticky Bottom Composer */}
                    {groupDetail.group.isMember ? (
                      <form
                        onSubmit={handleSendGroupMessage}
                        className="shrink-0 border-t border-slate-200 bg-white px-3 py-2.5 sm:px-4 dark:border-slate-800 dark:bg-slate-900"
                      >
                        {showLinkInput && (
                          <div className="mb-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 dark:border-slate-700 dark:bg-slate-800">
                            <Link2 className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                            <input
                              type="url"
                              value={msgPromoUrl}
                              onChange={(e) => setMsgPromoUrl(e.target.value)}
                              placeholder="Paste YouTube / TikTok / IG / X link to boost…"
                              className="min-w-0 flex-1 bg-transparent text-xs text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setMsgPromoUrl('');
                                setShowLinkInput(false);
                              }}
                              aria-label="Remove link"
                              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setShowLinkInput((v) => !v)}
                            title="Attach external post link"
                            aria-label="Attach external post link"
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition ${
                              showLinkInput || msgPromoUrl
                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                                : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                            }`}
                          >
                            <Link2 className="h-4 w-4" />
                          </button>

                          <input
                            type="text"
                            value={msgText}
                            onChange={(e) => setMsgText(e.target.value)}
                            placeholder="Write a message…"
                            className="min-w-0 flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-slate-500"
                          />

                          <button
                            type="submit"
                            disabled={sendingMsg || (!msgText.trim() && !msgPromoUrl.trim())}
                            aria-label="Send message"
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-purple-600 dark:hover:bg-purple-500"
                          >
                            {sendingMsg ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Send className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
                        <p className="text-xs text-slate-600 dark:text-slate-300">
                          Join this group to participate in the chat.
                        </p>
                        <button
                          type="button"
                          onClick={() => void handleJoinOrLeave(groupDetail.group)}
                          className="rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
                        >
                          Join Group
                        </button>
                      </div>
                    )}
                  </>
                )}

                {/* TAB 2: GROUP CHALLENGES */}
                {detailTab === 'challenges' && (
                  <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
                    {groupDetail.group.isMember && (
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => setChallengeModalOpen(true)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Launch Group Challenge
                        </button>
                      </div>
                    )}

                    {groupDetail.challenges.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center dark:border-slate-800">
                        <Flame className="mx-auto h-8 w-8 text-slate-400" />
                        <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                          No group challenges yet
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Launch a weekly #hashtag challenge for your group members to post and grow together.
                        </p>
                      </div>
                    ) : (
                      groupDetail.challenges.map((ch) => {
                        const pct = Math.min(100, Math.round((ch.entriesCount / Math.max(1, ch.targetCount)) * 100));
                        return (
                          <div
                            key={ch.id}
                            className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/60"
                          >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-0.5 text-[11px] font-semibold text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                                  <Hash className="h-3 w-3" />
                                  {ch.hashtag}
                                </span>
                                <h3 className="mt-1.5 text-sm font-bold text-slate-900 dark:text-white">
                                  {ch.title}
                                </h3>
                                {ch.description && (
                                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{ch.description}</p>
                                )}
                              </div>
                              <button
                                type="button"
                                disabled={ch.viewerEntered || enteringChallengeId === ch.id}
                                onClick={() => void handleEnterChallenge(ch.id)}
                                className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                                  ch.viewerEntered
                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                                    : 'bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-slate-900'
                                }`}
                              >
                                {enteringChallengeId === ch.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                )}
                                {ch.viewerEntered ? 'Verified ✓' : `Verify #${ch.hashtag}`}
                              </button>
                            </div>
                            <div className="mt-3">
                              <div className="mb-1 flex justify-between text-[11px] font-medium text-slate-500">
                                <span>Group Goal Progress</span>
                                <span>
                                  {ch.entriesCount}/{ch.targetCount} ({pct}%)
                                </span>
                              </div>
                              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                <div style={{ width: `${pct}%` }} className="h-full rounded-full bg-purple-600" />
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {/* TAB 3: MEMBERS & LEADERBOARD */}
                {detailTab === 'members' && (
                  <div className="flex-1 overflow-y-auto p-4 sm:p-5">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                        <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
                          Challenge Leaderboard
                        </h3>
                        {groupDetail.leaderboard.length === 0 ? (
                          <p className="text-xs text-slate-500">
                            Complete group challenges to appear on the leaderboard.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {groupDetail.leaderboard.map((l) => (
                              <div
                                key={l.userId}
                                className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800/60"
                              >
                                <div className="flex items-center gap-2.5">
                                  <span className="text-xs font-bold text-purple-600">#{l.rank}</span>
                                  <span className="text-xs font-semibold text-slate-900 dark:text-white">
                                    {l.displayName}
                                  </span>
                                </div>
                                <span className="text-xs font-semibold text-emerald-600">
                                  {l.completedCount} completed
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                        <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
                          Members ({groupDetail.members.length})
                        </h3>
                        <div className="space-y-2">
                          {groupDetail.members.map((m) => (
                            <div
                              key={m.userId}
                              className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800/60"
                            >
                              <div className="flex items-center gap-2.5">
                                {m.avatar ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={m.avatar}
                                    alt={m.displayName}
                                    className="h-7 w-7 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                                    {initialsOf(m.displayName)}
                                  </div>
                                )}
                                <div>
                                  <p className="text-xs font-semibold text-slate-900 dark:text-white">
                                    {m.displayName}
                                  </p>
                                  {m.username && (
                                    <p className="text-[11px] text-slate-500">@{m.username}</p>
                                  )}
                                </div>
                              </div>
                              <span className="rounded-full bg-slate-200/80 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                                {m.role}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Create Group Modal */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <form
            onSubmit={handleCreateGroup}
            className="w-full max-w-md space-y-4 rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Create Collaboration Group</h2>
              <button type="button" onClick={() => setCreateOpen(false)} className="rounded-full p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-4 w-4" />
              </button>
            </div>
            <input
              type="text"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Group name (e.g. Lagos Tech Creators Pod)"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            <textarea
              rows={3}
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="What will members collaborate on together?"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            <select
              value={newNiche}
              onChange={(e) => setNewNiche(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              {NICHES.filter((n) => n !== 'All').map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={creatingGroup}
              className="w-full rounded-xl bg-purple-600 py-2.5 text-sm font-bold text-white hover:bg-purple-500 disabled:opacity-50"
            >
              {creatingGroup ? 'Creating...' : 'Create Group'}
            </button>
          </form>
        </div>
      )}

      {/* Launch Group Challenge Modal */}
      {challengeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <form
            onSubmit={handleCreateChallenge}
            className="w-full max-w-md space-y-4 rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Launch Group Challenge</h2>
              <button type="button" onClick={() => setChallengeModalOpen(false)} className="rounded-full p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-4 w-4" />
              </button>
            </div>
            <input
              type="text"
              required
              value={chTitle}
              onChange={(e) => setChTitle(e.target.value)}
              placeholder="Challenge title (e.g. 7-Day Short-Form Sprint)"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            <input
              type="text"
              required
              value={chHashtag}
              onChange={(e) => setChHashtag(e.target.value)}
              placeholder="Required hashtag (e.g. creatorsprint)"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            <textarea
              rows={2}
              value={chDesc}
              onChange={(e) => setChDesc(e.target.value)}
              placeholder="Rules & growth goal for members..."
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
              <span>Target member entries</span>
              <input
                type="number"
                min={1}
                max={500}
                value={chTarget}
                onChange={(e) => setChTarget(Number(e.target.value) || 5)}
                className="w-24 rounded-lg border border-slate-200 px-2.5 py-1 text-right dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
            <button
              type="submit"
              disabled={creatingChallenge}
              className="w-full rounded-xl bg-purple-600 py-2.5 text-sm font-bold text-white hover:bg-purple-500 disabled:opacity-50"
            >
              {creatingChallenge ? 'Launching...' : 'Launch Challenge'}
            </button>
          </form>
        </div>
      )}
    </DashboardLayout>
  );
}
