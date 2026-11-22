'use client';

import React, { useCallback, useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/Dashboard/Dashboard';
import apiClient from '@/lib/api/client';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Flame,
  Hash,
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

export default function CollabGroupsPage() {
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

  // Group Chat / Hype Pod composer
  const [msgText, setMsgText] = useState('');
  const [msgPromoUrl, setMsgPromoUrl] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

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

  const loadGroupDetail = useCallback(async (groupId: string) => {
    setDetailLoading(true);
    try {
      const res = await apiClient.get(`/groups/${encodeURIComponent(groupId)}`);
      setGroupDetail(res.data);
    } catch (err) {
      toast.error((err as { message?: string })?.message || 'Could not load group');
      setSelectedGroupId(null);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadGroups();
  }, [loadGroups]);

  useEffect(() => {
    if (selectedGroupId) {
      void loadGroupDetail(selectedGroupId);
    } else {
      setGroupDetail(null);
    }
  }, [selectedGroupId, loadGroupDetail]);

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
      if (selectedGroupId === group.id) {
        await loadGroupDetail(group.id);
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
      await loadGroupDetail(selectedGroupId);
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
      await loadGroupDetail(selectedGroupId);
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
      await loadGroupDetail(selectedGroupId);
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

  return (
    <DashboardLayout>
      <div className="min-h-full bg-[#f8f9fc] px-4 py-6 pb-24 dark:bg-slate-950 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-6">
          {!selectedGroupId ? (
            <>
              {/* Hero */}
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
                          onClick={() => setSelectedGroupId(g.id)}
                          className="flex-1 rounded-xl bg-purple-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-purple-500"
                        >
                          Open Group
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
            </>
          ) : (
            /* Group Detail Workspace */
            <div className="space-y-5">
              <button
                type="button"
                onClick={() => setSelectedGroupId(null)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700 hover:underline dark:text-purple-400"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to all groups
              </button>

              {detailLoading || !groupDetail ? (
                <div className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" />
              ) : (
                <>
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-[10px] font-bold text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                          {groupDetail.group.niche}
                        </span>
                        <h2 className="mt-2 text-xl font-extrabold text-slate-900 dark:text-white">
                          {groupDetail.group.name}
                        </h2>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {groupDetail.group.description}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => void handleJoinOrLeave(groupDetail.group)}
                        className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                          groupDetail.group.isMember
                            ? 'border border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
                            : 'bg-purple-600 text-white hover:bg-purple-500'
                        }`}
                      >
                        {groupDetail.group.isMember ? 'Leave Group' : 'Join Group'}
                      </button>
                    </div>

                    <div className="mt-5 flex gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                      {(
                        [
                          { id: 'chat', label: 'Hype Pod & Chat', icon: MessageSquare },
                          { id: 'challenges', label: `Group Challenges (${groupDetail.challenges.length})`, icon: Flame },
                          { id: 'members', label: `Members & Leaderboard (${groupDetail.members.length})`, icon: Trophy },
                        ] as const
                      ).map((t) => {
                        const Icon = t.icon;
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setDetailTab(t.id)}
                            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                              detailTab === t.id
                                ? 'bg-purple-600 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            <Icon className="h-3.5 w-3.5" />
                            {t.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {detailTab === 'chat' && (
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                      <div className="max-h-96 space-y-3 overflow-y-auto pr-1">
                        {groupDetail.messages.length === 0 ? (
                          <p className="py-8 text-center text-xs text-slate-500">
                            No messages yet. Say hello or drop a YouTube/TikTok/IG link for Golden Hour support!
                          </p>
                        ) : (
                          groupDetail.messages.map((m) => (
                            <div
                              key={m.id}
                              className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-800/40"
                            >
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-slate-900 dark:text-white">{m.senderName}</span>
                                <span className="text-[10px] text-slate-400">
                                  {new Date(m.createdAt).toLocaleString()}
                                </span>
                              </div>
                              <p className="mt-1 text-xs text-slate-700 dark:text-slate-300">{m.content}</p>
                              {m.externalPromoUrl && (
                                <a
                                  href={m.externalPromoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-purple-100 px-2.5 py-1 text-[11px] font-bold text-purple-700 hover:bg-purple-200 dark:bg-purple-950/60 dark:text-purple-300"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  Support External Post
                                </a>
                              )}
                            </div>
                          ))
                        )}
                      </div>

                      {groupDetail.group.isMember && (
                        <form onSubmit={handleSendGroupMessage} className="mt-4 space-y-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                          <input
                            type="text"
                            value={msgText}
                            onChange={(e) => setMsgText(e.target.value)}
                            placeholder="Share a collab idea or ask for feedback..."
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 outline-none focus:border-purple-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          />
                          <div className="flex gap-2">
                            <input
                              type="url"
                              value={msgPromoUrl}
                              onChange={(e) => setMsgPromoUrl(e.target.value)}
                              placeholder="Optional https:// YouTube / TikTok / IG / X link to boost"
                              className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 outline-none focus:border-purple-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                            />
                            <button
                              type="submit"
                              disabled={sendingMsg}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-500 disabled:opacity-50"
                            >
                              {sendingMsg ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                              Post
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}

                  {detailTab === 'challenges' && (
                    <div className="space-y-4">
                      {groupDetail.group.isMember && (
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => setChallengeModalOpen(true)}
                            className="inline-flex items-center gap-1.5 rounded-full bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-500"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Launch Group Challenge
                          </button>
                        </div>
                      )}

                      {groupDetail.challenges.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
                          <Flame className="mx-auto h-8 w-8 text-purple-500" />
                          <p className="mt-2 text-sm font-bold text-slate-900 dark:text-white">
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
                              className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
                            >
                              <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                  <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-[11px] font-bold text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                                    <Hash className="h-3 w-3" />
                                    {ch.hashtag}
                                  </span>
                                  <h3 className="mt-1.5 text-base font-bold text-slate-900 dark:text-white">
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
                                  className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition ${
                                    ch.viewerEntered
                                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                                      : 'bg-purple-600 text-white hover:bg-purple-500 disabled:opacity-50'
                                  }`}
                                >
                                  {enteringChallengeId === ch.id ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                  )}
                                  {ch.viewerEntered ? 'Verified Entry ✓' : `Verify #${ch.hashtag} Post`}
                                </button>
                              </div>
                              <div className="mt-3">
                                <div className="mb-1 flex justify-between text-[11px] font-semibold text-slate-500">
                                  <span>Group Goal Progress</span>
                                  <span>
                                    {ch.entriesCount}/{ch.targetCount} entries ({pct}%)
                                  </span>
                                </div>
                                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                  <div style={{ width: `${pct}%` }} className="h-full rounded-full bg-purple-600" />
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}

                  {detailTab === 'members' && (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                        <h3 className="mb-3 text-sm font-bold text-slate-900 dark:text-white">
                          Challenge Leaderboard
                        </h3>
                        {groupDetail.leaderboard.length === 0 ? (
                          <p className="text-xs text-slate-500">Complete group challenges to appear on the leaderboard.</p>
                        ) : (
                          <div className="space-y-2">
                            {groupDetail.leaderboard.map((l) => (
                              <div key={l.userId} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800/60">
                                <div className="flex items-center gap-2.5">
                                  <span className="text-xs font-extrabold text-purple-600">#{l.rank}</span>
                                  <span className="text-xs font-semibold text-slate-900 dark:text-white">{l.displayName}</span>
                                </div>
                                <span className="text-xs font-bold text-emerald-600">{l.completedCount} completed</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                        <h3 className="mb-3 text-sm font-bold text-slate-900 dark:text-white">
                          Members ({groupDetail.members.length})
                        </h3>
                        <div className="space-y-2">
                          {groupDetail.members.map((m) => (
                            <div key={m.userId} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800/60">
                              <span className="text-xs font-semibold text-slate-900 dark:text-white">{m.displayName}</span>
                              <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold uppercase text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                                {m.role}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

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
