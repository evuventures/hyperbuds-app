'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  hubApi,
  type HubTalent,
  type Pitch,
  type PitchDraft,
  type PitchRole,
} from '@/lib/api/hub.api';

type WorkspaceTab = 'details' | 'roles' | 'talent';
type CompType = 'salary' | 'equity' | 'hybrid';

function toErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return 'Unable to update startup pitch. Try again.';
}

function buildInitialDraft(pitch: Pitch): PitchDraft {
  return {
    startupName: pitch.startupName || pitch.title || '',
    tagline: pitch.tagline || pitch.summary || '',
    fullDescription: pitch.fullDescription || pitch.description || '',
    category: pitch.category || '',
    fundingStage: pitch.fundingStage || 'just_an_idea',
  };
}

/**
 * Founder modal workspace for editing startup pitch details, open target roles,
 * and sending explicit compensation invitations to matched talent.
 */
export function PitchWorkspace({ pitch, onChanged }: { pitch: Pitch; onChanged: () => void }) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('details');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const [draft, setDraft] = useState<PitchDraft>(() => buildInitialDraft(pitch));
  const [roles, setRoles] = useState<PitchRole[]>(() => pitch.recommendedRoles || []);
  const [newRoleTitle, setNewRoleTitle] = useState('');
  const [newRoleSkills, setNewRoleSkills] = useState('');

  const [talents, setTalents] = useState<HubTalent[]>([]);
  const [loadingTalents, setLoadingTalents] = useState(false);
  const [selectedTalent, setSelectedTalent] = useState<HubTalent | null>(null);
  const [inviteRoleTitle, setInviteRoleTitle] = useState('');
  const [compType, setCompType] = useState<CompType>('salary');
  const [currency, setCurrency] = useState('USD');
  const [salaryAmount, setSalaryAmount] = useState('0');
  const [equityPct, setEquityPct] = useState('0');
  const [vestingNotes, setVestingNotes] = useState('');
  const [sentTalentIds, setSentTalentIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setDraft(buildInitialDraft(pitch));
    setRoles(pitch.recommendedRoles || []);
  }, [pitch]);

  useEffect(() => {
    if (!open || activeTab !== 'talent') return;
    const controller = new AbortController();
    setLoadingTalents(true);
    setError('');
    hubApi
      .talents(pitch._id, controller.signal)
      .then((rows) => {
        if (!controller.signal.aborted) setTalents(rows);
      })
      .catch((err) => {
        if (!controller.signal.aborted) setError(toErrorMessage(err));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingTalents(false);
      });
    return () => controller.abort();
  }, [open, activeTab, pitch._id]);

  async function handleSaveDetails(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await hubApi.updatePitch(pitch._id, draft);
      setOpen(false);
      onChanged();
    } catch (err) {
      setError(toErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  function handleAddRole() {
    const title = newRoleTitle.trim();
    if (!title) return;
    const skills = newRoleSkills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    setRoles((prev) => [...prev, { title, skills, isSelected: true }]);
    setNewRoleTitle('');
    setNewRoleSkills('');
  }

  async function handleSaveRoles() {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await hubApi.saveRoles(pitch._id, roles);
      setOpen(false);
      onChanged();
    } catch (err) {
      setError(toErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  function openInviteComposer(talent: HubTalent) {
    const firstActiveRole = (pitch.recommendedRoles || []).find((r) => r.isSelected !== false);
    setSelectedTalent(talent);
    setInviteRoleTitle(firstActiveRole?.title || roles[0]?.title || 'Collaborator');
    setCompType('salary');
    setCurrency('USD');
    setSalaryAmount('0');
    setEquityPct('0');
    setVestingNotes('');
    setError('');
  }

  async function handleSendInvitation(event: FormEvent) {
    event.preventDefault();
    if (!selectedTalent || busy) return;
    setBusy(true);
    setError('');
    try {
      const matchedRole = (pitch.recommendedRoles || []).find((r) => r.title === inviteRoleTitle);
      await hubApi.invite({
        pitchId: pitch._id,
        talentId: selectedTalent.id,
        roleTitle: inviteRoleTitle.trim(),
        ...(matchedRole?._id ? { roleId: matchedRole._id } : {}),
        offerTerms: {
          compensationType: compType,
          salary: Number(salaryAmount) || 0,
          equity: Number(equityPct) || 0,
          currency: currency.trim().toUpperCase() || 'USD',
          vesting: vestingNotes.trim(),
        },
      });
      setSentTalentIds((prev) => ({ ...prev, [selectedTalent.id]: true }));
      onChanged();
    } catch (err) {
      setError(toErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!busy) {
          setOpen(next);
          if (!next) {
            setError('');
            setSelectedTalent(null);
          }
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="outline"
          onClick={() => {
            setActiveTab('details');
            setError('');
          }}
        >
          Manage pitch &amp; team
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage startup pitch &amp; team</DialogTitle>
          <DialogDescription>
            Update pitch summary, configure open target roles, or prepare an explicit offer proposal for matched talent.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3 dark:border-slate-800">
          <Button
            type="button"
            variant={activeTab === 'details' ? 'default' : 'outline'}
            onClick={() => setActiveTab('details')}
          >
            Pitch details
          </Button>
          <Button
            type="button"
            variant={activeTab === 'roles' ? 'default' : 'outline'}
            onClick={() => setActiveTab('roles')}
          >
            Open roles
          </Button>
          <Button
            type="button"
            variant={activeTab === 'talent' ? 'default' : 'outline'}
            onClick={() => setActiveTab('talent')}
          >
            Find talent
          </Button>
        </div>

        {activeTab === 'details' && (
          <form onSubmit={handleSaveDetails} className="space-y-4">
            <label className="grid gap-1.5 text-sm font-medium text-foreground">
              Startup name
              <Input
                required
                maxLength={120}
                value={draft.startupName}
                onChange={(e) => setDraft({ ...draft, startupName: e.target.value })}
              />
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-foreground">
              One-line pitch
              <Input
                required
                maxLength={250}
                value={draft.tagline}
                onChange={(e) => setDraft({ ...draft, tagline: e.target.value })}
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1.5 text-sm font-medium text-foreground">
                Category
                <Input
                  required
                  maxLength={100}
                  value={draft.category}
                  onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                />
              </label>
              <label className="grid gap-1.5 text-sm font-medium text-foreground">
                Funding stage
                <select
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
                  value={draft.fundingStage}
                  onChange={(e) => setDraft({ ...draft, fundingStage: e.target.value })}
                >
                  {['just_an_idea', 'pre_seed', 'mvp_built', 'seed', 'series_a'].map((stage) => (
                    <option key={stage} value={stage}>
                      {stage.replaceAll('_', ' ')}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="grid gap-1.5 text-sm font-medium text-foreground">
              Description
              <Textarea
                required
                maxLength={10000}
                rows={4}
                value={draft.fullDescription}
                onChange={(e) => setDraft({ ...draft, fullDescription: e.target.value })}
              />
            </label>
            {error && (
              <p role="alert" className="text-sm text-red-700 dark:text-red-300">
                {error}
              </p>
            )}
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" disabled={busy} onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={busy}>
                {busy ? 'Saving…' : 'Save pitch details'}
              </Button>
            </DialogFooter>
          </form>
        )}

        {activeTab === 'roles' && (
          <div className="space-y-4">
            <ul className="space-y-2">
              {roles.length === 0 ? (
                <li className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-muted-foreground dark:border-slate-700">
                  No open roles configured yet.
                </li>
              ) : (
                roles.map((role, index) => (
                  <li
                    key={role._id || `${role.title}-${index}`}
                    className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-800"
                  >
                    <div>
                      <p className="font-semibold text-foreground">{role.title}</p>
                      {role.skills && role.skills.length > 0 && (
                        <p className="text-xs text-muted-foreground">{role.skills.join(', ')}</p>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setRoles((prev) => prev.filter((_, i) => i !== index))}
                    >
                      Remove
                    </Button>
                  </li>
                ))
              )}
            </ul>

            <div className="grid gap-3 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
              <label className="grid gap-1.5 text-sm font-medium text-foreground">
                New role title
                <Input
                  value={newRoleTitle}
                  onChange={(e) => setNewRoleTitle(e.target.value)}
                  placeholder="e.g. Video Editor"
                />
              </label>
              <label className="grid gap-1.5 text-sm font-medium text-foreground">
                Skills, separated by commas
                <Input
                  value={newRoleSkills}
                  onChange={(e) => setNewRoleSkills(e.target.value)}
                  placeholder="Editing, Design"
                />
              </label>
              <div>
                <Button type="button" variant="outline" onClick={handleAddRole}>
                  Add role
                </Button>
              </div>
            </div>

            {error && (
              <p role="alert" className="text-sm text-red-700 dark:text-red-300">
                {error}
              </p>
            )}
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" disabled={busy} onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="button" disabled={busy} onClick={handleSaveRoles}>
                {busy ? 'Saving…' : 'Save roles'}
              </Button>
            </DialogFooter>
          </div>
        )}

        {activeTab === 'talent' && (
          <div className="space-y-4">
            {loadingTalents ? (
              <p role="status" className="text-sm text-muted-foreground">
                Loading matched talent…
              </p>
            ) : talents.length === 0 ? (
              <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-muted-foreground dark:border-slate-700">
                No matching talent candidates found for this pitch yet.
              </p>
            ) : (
              <ul className="space-y-3">
                {talents.map((talent) => (
                  <li
                    key={talent.id}
                    className="rounded-lg border border-slate-200 p-4 dark:border-slate-800"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h4 className="text-base font-semibold text-foreground">{talent.name}</h4>
                        {talent.bio && <p className="mt-1 text-xs text-muted-foreground">{talent.bio}</p>}
                        {talent.skills && talent.skills.length > 0 && (
                          <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">
                            Skills: {talent.skills.join(', ')}
                          </p>
                        )}
                      </div>
                      <Button type="button" variant="outline" onClick={() => openInviteComposer(talent)}>
                        Prepare invitation
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {selectedTalent && (
              <form
                onSubmit={handleSendInvitation}
                className="space-y-3 rounded-lg border border-indigo-200 bg-indigo-50/40 p-4 dark:border-indigo-900/60 dark:bg-indigo-950/20"
              >
                <p className="text-sm font-semibold text-foreground">
                  Proposal for {selectedTalent.name}
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-1 text-xs font-medium text-foreground">
                    Target role
                    <Input
                      required
                      value={inviteRoleTitle}
                      onChange={(e) => setInviteRoleTitle(e.target.value)}
                    />
                  </label>
                  <label className="grid gap-1 text-xs font-medium text-foreground">
                    Compensation structure
                    <select
                      className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
                      value={compType}
                      onChange={(e) => setCompType(e.target.value as CompType)}
                    >
                      <option value="salary">Salary</option>
                      <option value="equity">Equity</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </label>
                  <label className="grid gap-1 text-xs font-medium text-foreground">
                    Currency code
                    <Input
                      required
                      maxLength={8}
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                    />
                  </label>
                  <label className="grid gap-1 text-xs font-medium text-foreground">
                    Proposed salary amount
                    <Input
                      type="number"
                      min="0"
                      step="any"
                      value={salaryAmount}
                      onChange={(e) => setSalaryAmount(e.target.value)}
                    />
                  </label>
                  <label className="grid gap-1 text-xs font-medium text-foreground">
                    Proposed equity %
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="any"
                      value={equityPct}
                      onChange={(e) => setEquityPct(e.target.value)}
                    />
                  </label>
                  <label className="grid gap-1 text-xs font-medium text-foreground">
                    Vesting / compensation notes
                    <Input
                      maxLength={500}
                      value={vestingNotes}
                      onChange={(e) => setVestingNotes(e.target.value)}
                    />
                  </label>
                </div>
                <p className="text-xs text-muted-foreground">
                  Invitations are structured proposals and do not execute payroll or legal agreements.
                </p>
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={busy || Boolean(sentTalentIds[selectedTalent.id])}
                  >
                    {sentTalentIds[selectedTalent.id]
                      ? 'Invitation sent'
                      : busy
                        ? 'Sending…'
                        : 'Send invitation'}
                  </Button>
                </div>
              </form>
            )}

            {error && (
              <p role="alert" className="text-sm text-red-700 dark:text-red-300">
                {error}
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
