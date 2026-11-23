'use client';

import React, { useState } from 'react';
import { BarChart2, Layers, Plus, Sparkles, Type, UserCheck, UserMinus, X } from 'lucide-react';
import type { StudioOverlayState } from './StageOverlays';

interface CohostEntry {
  id: string;
  userId: string;
  username?: string | null;
  displayName?: string | null;
}

interface StudioControlsDrawerProps {
  activePanel: 'overlays' | 'poll' | 'backstage' | null;
  onClose: () => void;
  studioState: StudioOverlayState;
  cohosts: CohostEntry[];
  onUpdateStudioState: (patch: Partial<StudioOverlayState>) => Promise<void>;
  onCreatePoll: (question: string, options: string[]) => Promise<void>;
}

export function StudioControlsDrawer({
  activePanel,
  onClose,
  studioState,
  cohosts,
  onUpdateStudioState,
  onCreatePoll,
}: StudioControlsDrawerProps) {
  const [headline, setHeadline] = useState(studioState.lowerThirdText);
  const [subtext, setSubtext] = useState(studioState.lowerThirdSubtext);
  const [savingOverlay, setSavingOverlay] = useState(false);

  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [creatingPoll, setCreatingPoll] = useState(false);

  if (!activePanel) return null;

  const handleSaveLowerThird = async (visible: boolean) => {
    setSavingOverlay(true);
    try {
      await onUpdateStudioState({
        lowerThirdText: headline,
        lowerThirdSubtext: subtext,
        lowerThirdVisible: visible,
      });
    } finally {
      setSavingOverlay(false);
    }
  };

  const handlePollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOpts = pollOptions.map((o) => o.trim()).filter(Boolean);
    if (!pollQuestion.trim() || cleanOpts.length < 2) return;
    setCreatingPoll(true);
    try {
      await onCreatePoll(pollQuestion.trim(), cleanOpts);
      setPollQuestion('');
      setPollOptions(['', '']);
      onClose();
    } finally {
      setCreatingPoll(false);
    }
  };

  const toggleGuestOnStage = async (userId: string) => {
    const onStage = studioState.stageUserIds.includes(userId);
    const next = onStage
      ? studioState.stageUserIds.filter((id) => id !== userId)
      : [...studioState.stageUserIds, userId];
    await onUpdateStudioState({ stageUserIds: next });
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#151821] p-4 text-white shadow-xl">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-300">
          {activePanel === 'overlays' && (
            <>
              <Type className="h-4 w-4 text-purple-400" /> Broadcast Overlays &amp; Lower-Third
            </>
          )}
          {activePanel === 'poll' && (
            <>
              <BarChart2 className="h-4 w-4 text-purple-400" /> Launch Live Poll
            </>
          )}
          {activePanel === 'backstage' && (
            <>
              <Layers className="h-4 w-4 text-purple-400" /> Backstage Stage Queue
            </>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 text-zinc-400 hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {activePanel === 'overlays' && (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              maxLength={120}
              placeholder="Banner headline (e.g. Live Q&A — Drop questions!)"
              className="rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:border-purple-500 focus:outline-none"
            />
            <input
              value={subtext}
              onChange={(e) => setSubtext(e.target.value)}
              maxLength={160}
              placeholder="Subtext (e.g. Follow @hyperbuds for weekly drops)"
              className="rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:border-purple-500 focus:outline-none"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={savingOverlay || !headline.trim()}
              onClick={() => void handleSaveLowerThird(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-purple-500 disabled:opacity-50"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {studioState.lowerThirdVisible ? 'Update On-Screen Banner' : 'Show On Screen'}
            </button>
            {studioState.lowerThirdVisible && (
              <button
                type="button"
                disabled={savingOverlay}
                onClick={() => void handleSaveLowerThird(false)}
                className="rounded-lg border border-white/15 px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-white/10"
              >
                Hide Banner
              </button>
            )}
          </div>
        </div>
      )}

      {activePanel === 'poll' && (
        <form onSubmit={handlePollSubmit} className="space-y-3">
          <input
            value={pollQuestion}
            onChange={(e) => setPollQuestion(e.target.value)}
            maxLength={160}
            required
            placeholder="Ask your audience a question…"
            className="w-full rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:border-purple-500 focus:outline-none"
          />
          <div className="grid gap-2 sm:grid-cols-2">
            {pollOptions.map((opt, idx) => (
              <input
                key={idx}
                value={opt}
                onChange={(e) =>
                  setPollOptions((prev) => prev.map((v, i) => (i === idx ? e.target.value : v)))
                }
                maxLength={80}
                placeholder={`Option ${idx + 1}`}
                className="rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:border-purple-500 focus:outline-none"
              />
            ))}
          </div>
          <div className="flex items-center justify-between gap-2">
            {pollOptions.length < 4 ? (
              <button
                type="button"
                onClick={() => setPollOptions((prev) => [...prev, ''])}
                className="inline-flex items-center gap-1 text-xs font-medium text-purple-300 hover:text-purple-200"
              >
                <Plus className="h-3.5 w-3.5" /> Add option
              </button>
            ) : (
              <span />
            )}
            <button
              type="submit"
              disabled={creatingPoll}
              className="rounded-lg bg-purple-600 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-500 disabled:opacity-50"
            >
              {creatingPoll ? 'Launching…' : 'Launch Poll'}
            </button>
          </div>
        </form>
      )}

      {activePanel === 'backstage' && (
        <div className="space-y-2">
          <p className="text-xs text-zinc-400">
            Control which invited co-hosts appear on the main broadcast stage.
          </p>
          {cohosts.length === 0 ? (
            <p className="rounded-lg border border-dashed border-white/10 py-4 text-center text-xs text-zinc-500">
              No co-hosts invited yet. Use the Co-Hosts button to invite a creator first.
            </p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {cohosts.map((c) => {
                const onStage = studioState.stageUserIds.includes(c.userId);
                return (
                  <div
                    key={c.id}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-white">
                        {c.displayName || c.username || 'Co-Host'}
                      </p>
                      <p className="text-[11px] text-zinc-400">
                        {onStage ? 'On Stage' : 'In Backstage'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void toggleGuestOnStage(c.userId)}
                      className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition ${
                        onStage
                          ? 'bg-rose-500/20 text-rose-200 hover:bg-rose-500/30'
                          : 'bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30'
                      }`}
                    >
                      {onStage ? (
                        <>
                          <UserMinus className="h-3 w-3" /> Remove
                        </>
                      ) : (
                        <>
                          <UserCheck className="h-3 w-3" /> Add to Stage
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
