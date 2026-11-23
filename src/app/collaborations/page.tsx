"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  FileText,
  Globe,
  Lock,
  Plus,
  RefreshCw,
  UserPlus,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import DashboardLayout from "@/components/layout/Dashboard/Dashboard";
import { CardGridSkeleton } from "@/components/ui/AppSkeletons";
import CollaborationList from "@/components/collaboration/CollaborationList";
import {
  CreatorHandlePicker,
  type CreatorHandleSuggestion,
} from "@/components/collaboration/CreatorHandlePicker";
import { collaborationApi } from "@/lib/api/collaboration.api";
import type { Collaboration } from "@/types/collaboration.types";
import BackLink from "@/components/collaboration/BackLink";
import CollaborationNav from "@/components/collaboration/CollaborationNav";
import InvitesTable from "@/components/collaboration/invites/InvitesTable";
import InviteDecisionModal from "@/components/collaboration/invites/InviteDecisionModal";

type CollaborationFilter = "all" | "invites" | "active" | "completed";
type CollaboratorRole = "co-creator" | "featured" | "guest";

interface PendingInvitee extends CreatorHandleSuggestion {
  role: CollaboratorRole;
  message: string;
}

const COLLAB_TYPES: Array<{ value: Collaboration["type"]; label: string; hint: string }> = [
  { value: "video", label: "Video", hint: "YouTube, Reels, or TikTok" },
  { value: "livestream", label: "Livestream", hint: "Co-hosted live session" },
  { value: "podcast", label: "Podcast", hint: "Guest or co-hosted episode" },
  { value: "photo_shoot", label: "Photo Shoot", hint: "Editorial or brand shoot" },
  { value: "event", label: "Event", hint: "Workshop, meetup, or launch" },
  { value: "challenge", label: "Challenge", hint: "Creator duo or trend" },
  { value: "series", label: "Series", hint: "Multi-part episodic collab" },
  { value: "other", label: "Other", hint: "Custom creative project" },
];

const PLATFORMS: Array<{ id: string; label: string }> = [
  { id: "tiktok", label: "TikTok" },
  { id: "instagram", label: "Instagram" },
  { id: "youtube", label: "YouTube" },
  { id: "twitch", label: "Twitch" },
  { id: "twitter", label: "X / Twitter" },
];

const WIZARD_STEPS = [
  { id: 0, title: "Project", subtitle: "Title, format & brief" },
  { id: 1, title: "Invite", subtitle: "Add @creators" },
  { id: 2, title: "Schedule", subtitle: "Dates & platforms" },
  { id: 3, title: "Terms", subtitle: "Comp & review" },
] as const;

const INITIAL_FORM = {
  title: "",
  description: "",
  type: "video" as Collaboration["type"],
  scheduledDate: "",
  duration: "",
  location: "",
  platforms: [] as string[],
  requirements: "",
  compensationType: "none",
  compensationAmount: "",
  compensationCurrency: "USD",
  compensationDescription: "",
  theme: "",
  hashtags: "",
  targetAudience: "",
  goals: "",
  tags: "",
  isPublic: false,
};

const INPUT_CLASS =
  "w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-slate-400 dark:focus:ring-white/10";

const CollaborationsPage: React.FC = () => {
  const router = useRouter();
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [invites, setInvites] = useState<Collaboration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<CollaborationFilter>("all");

  // Wizard state (kept strictly separate from submission state)
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [formState, setFormState] = useState(INITIAL_FORM);

  // Step 2: @profile invitees
  const [inviteSearch, setInviteSearch] = useState("");
  const [inviteRole, setInviteRole] = useState<CollaboratorRole>("co-creator");
  const [inviteNote, setInviteNote] = useState("");
  const [selectedInvitees, setSelectedInvitees] = useState<PendingInvitee[]>([]);

  // Incoming invite response modal
  const [selectedInvite, setSelectedInvite] = useState<Collaboration | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isRespondingToInvite, setIsRespondingToInvite] = useState(false);

  const loadCollaborations = async () => {
    try {
      setIsLoading(true);
      const [all, pendingInvites] = await Promise.all([
        collaborationApi.getCollaborations({ limit: 50 }),
        collaborationApi.getPendingInvites(),
      ]);
      setCollaborations(all);
      setInvites(pendingInvites);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load collaborations");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadCollaborations();
    if (typeof window !== "undefined" && window.location.hash === "#new-collaboration") {
      setShowWizard(true);
    }
  }, []);

  const resetWizard = () => {
    setFormState(INITIAL_FORM);
    setSelectedInvitees([]);
    setInviteSearch("");
    setInviteNote("");
    setInviteRole("co-creator");
    setWizardStep(0);
    setCreateError(null);
  };

  const handleTogglePlatform = (platform: string) => {
    setFormState((prev) => {
      const exists = prev.platforms.includes(platform);
      return {
        ...prev,
        platforms: exists
          ? prev.platforms.filter((p) => p !== platform)
          : [...prev.platforms, platform],
      };
    });
  };

  const handleAddInvitee = (creator: CreatorHandleSuggestion) => {
    setSelectedInvitees((prev) => {
      if (prev.some((c) => c.username.toLowerCase() === creator.username.toLowerCase())) {
        return prev;
      }
      return [
        ...prev,
        {
          ...creator,
          role: inviteRole,
          message: inviteNote.trim(),
        },
      ];
    });
    setInviteSearch("");
    setInviteNote("");
  };

  const handleRemoveInvitee = (username: string) => {
    setSelectedInvitees((prev) => prev.filter((c) => c.username !== username));
  };

  const handleUpdateInviteeRole = (username: string, role: CollaboratorRole) => {
    setSelectedInvitees((prev) =>
      prev.map((c) => (c.username === username ? { ...c, role } : c)),
    );
  };

  const stepZeroValid = Boolean(formState.title.trim() && formState.description.trim());

  const goToStep = (target: number) => {
    setCreateError(null);
    if (target > 0 && !stepZeroValid) {
      setCreateError("Add a project title and short description before moving on.");
      return;
    }
    setWizardStep(Math.max(0, Math.min(WIZARD_STEPS.length - 1, target)));
  };

  const handleCreateCollaboration = async (event: React.FormEvent) => {
    event.preventDefault();
    setCreateError(null);

    if (!stepZeroValid) {
      setWizardStep(0);
      setCreateError("Project title and description are required.");
      return;
    }

    try {
      setIsSubmitting(true);

      const details = {
        scheduledDate: formState.scheduledDate
          ? new Date(formState.scheduledDate).toISOString()
          : undefined,
        duration: formState.duration ? Number(formState.duration) : undefined,
        location: formState.location.trim() || undefined,
        platform: formState.platforms.length ? formState.platforms : undefined,
        requirements: formState.requirements
          ? formState.requirements
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          : undefined,
        compensation: {
          type: formState.compensationType,
          amount:
            formState.compensationType !== "none" && formState.compensationAmount
              ? Number(formState.compensationAmount)
              : undefined,
          currency: formState.compensationCurrency.trim() || "USD",
          description: formState.compensationDescription.trim() || undefined,
        },
      };

      const content = {
        theme: formState.theme.trim() || undefined,
        hashtags: formState.hashtags
          ? formState.hashtags
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          : undefined,
        targetAudience: formState.targetAudience.trim() || undefined,
        goals: formState.goals
          ? formState.goals
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          : undefined,
      };

      const payload = {
        title: formState.title.trim(),
        description: formState.description.trim(),
        type: formState.type,
        details,
        content,
        collaborators: selectedInvitees.map((c) => ({
          userId: c.id,
          username: c.username,
          role: c.role,
          message: c.message || undefined,
        })),
        tags: formState.tags
          ? formState.tags
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          : undefined,
        isPublic: formState.isPublic,
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const created = await collaborationApi.createCollaboration(payload as any);
      setCollaborations((prev) => [created, ...prev]);
      setFilter("all");
      resetWizard();
      setShowWizard(false);
      toast.success(
        selectedInvitees.length > 0
          ? `Collaboration created and ${selectedInvitees.length} invite${selectedInvitees.length === 1 ? "" : "s"} sent.`
          : "Collaboration created.",
      );
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Failed to create collaboration");
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeCollaborations = useMemo(
    () => collaborations.filter((collab) => ["accepted", "in_progress"].includes(collab.status)),
    [collaborations],
  );

  const completedCollaborations = useMemo(
    () => collaborations.filter((collab) => collab.status === "completed"),
    [collaborations],
  );

  const filteredCollaborations = useMemo(() => {
    switch (filter) {
      case "invites":
        return invites;
      case "active":
        return activeCollaborations;
      case "completed":
        return completedCollaborations;
      default:
        return collaborations;
    }
  }, [filter, collaborations, invites, activeCollaborations, completedCollaborations]);

  const handleInviteSelect = (invite: Collaboration) => {
    setSelectedInvite(invite);
    setIsInviteModalOpen(true);
  };

  const handleInviteResponse = async (action: "accept" | "decline") => {
    if (!selectedInvite) return;
    try {
      setIsRespondingToInvite(true);
      await collaborationApi.respondToInvite(selectedInvite._id, { action });
      setInvites((prev) => prev.filter((invite) => invite._id !== selectedInvite._id));
      await loadCollaborations();
      setIsInviteModalOpen(false);
      setSelectedInvite(null);
      toast.success(action === "accept" ? "Invite accepted." : "Invite declined.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to respond to invite");
    } finally {
      setIsRespondingToInvite(false);
    }
  };

  const handleInviteModalClose = () => {
    setIsInviteModalOpen(false);
    setSelectedInvite(null);
  };

  const filterTabs: Array<{ id: CollaborationFilter; label: string; count: number }> = [
    { id: "all", label: "All", count: collaborations.length },
    { id: "active", label: "Active", count: activeCollaborations.length },
    { id: "invites", label: "Invites", count: invites.length },
    { id: "completed", label: "Completed", count: completedCollaborations.length },
  ];

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:py-10 space-y-6">
          {/* Top navigation row */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <BackLink onClick={() => router.back()} />
            <div className="flex items-center gap-2">
              <CollaborationNav />
              <button
                type="button"
                onClick={() => void loadCollaborations()}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Clean editorial header */}
          <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between dark:border-slate-800">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                Collaborations
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {isLoading
                  ? "Loading your workspace…"
                  : collaborations.length === 0
                    ? "Plan projects, invite creators by @handle, and track deliverables in one place."
                    : `${collaborations.length} project${collaborations.length === 1 ? "" : "s"} · ${invites.length} pending invite${invites.length === 1 ? "" : "s"}`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowWizard((prev) => !prev);
                setCreateError(null);
              }}
              className="inline-flex items-center justify-center gap-2 self-start rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 sm:self-auto dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
            >
              {showWizard ? (
                <>
                  <X className="h-4 w-4" />
                  Close Form
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  New Collaboration
                </>
              )}
            </button>
          </div>

          {/* Multi-Step Collaboration Wizard */}
          {showWizard && (
            <section
              id="new-collaboration"
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
              {/* Clickable Stepper Header */}
              <div className="border-b border-slate-200 bg-slate-50/70 px-4 py-4 sm:px-6 dark:border-slate-800 dark:bg-slate-900/60">
                <nav aria-label="Collaboration creation steps" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {WIZARD_STEPS.map((step) => {
                    const isCurrent = wizardStep === step.id;
                    const isCompleted = wizardStep > step.id && (step.id !== 0 || stepZeroValid);
                    return (
                      <button
                        key={step.id}
                        type="button"
                        onClick={() => goToStep(step.id)}
                        className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition ${
                          isCurrent
                            ? "border-slate-900 bg-white shadow-2xs dark:border-white dark:bg-slate-800"
                            : isCompleted
                              ? "border-slate-200 bg-white/80 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900/70"
                              : "border-transparent bg-transparent hover:bg-white/60 dark:hover:bg-slate-800/40"
                        }`}
                      >
                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                            isCurrent
                              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                              : isCompleted
                                ? "bg-emerald-600 text-white"
                                : "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                          }`}
                        >
                          {isCompleted ? <Check className="h-3.5 w-3.5" /> : step.id + 1}
                        </span>
                        <span className="min-w-0">
                          <span
                            className={`block truncate text-xs font-semibold ${
                              isCurrent
                                ? "text-slate-900 dark:text-white"
                                : "text-slate-600 dark:text-slate-300"
                            }`}
                          >
                            {step.title}
                          </span>
                          <span className="block truncate text-[11px] text-slate-400">
                            {step.subtitle}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              <form onSubmit={handleCreateCollaboration} className="p-5 sm:p-6">
                {/* STEP 1: Project Basics */}
                {wizardStep === 0 && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                        What are you making together?
                      </h2>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        Give collaborators a clear picture of the project.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        Project title <span className="text-rose-500">*</span>
                      </label>
                      <input
                        value={formState.title}
                        onChange={(e) => setFormState((prev) => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g. Behind-the-Scenes Studio Day Reel"
                        className={INPUT_CLASS}
                        maxLength={160}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        Format
                      </label>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {COLLAB_TYPES.map((item) => {
                          const active = formState.type === item.value;
                          return (
                            <button
                              key={item.value}
                              type="button"
                              onClick={() => setFormState((prev) => ({ ...prev, type: item.value }))}
                              className={`rounded-xl border px-3 py-2.5 text-left transition ${
                                active
                                  ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900"
                                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                              }`}
                            >
                              <span className="block text-xs font-semibold">{item.label}</span>
                              <span
                                className={`mt-0.5 block text-[11px] ${
                                  active
                                    ? "text-white/75 dark:text-slate-600"
                                    : "text-slate-400"
                                }`}
                              >
                                {item.hint}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        Brief &amp; goals <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        value={formState.description}
                        onChange={(e) =>
                          setFormState((prev) => ({ ...prev, description: e.target.value }))
                        }
                        rows={4}
                        placeholder="Outline the concept, what each creator will contribute, and what success looks like."
                        className={INPUT_CLASS}
                      />
                    </div>

                    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-200 px-4 py-3 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        {formState.isPublic ? (
                          <Globe className="h-4 w-4 text-slate-700 dark:text-slate-300" />
                        ) : (
                          <Lock className="h-4 w-4 text-slate-500" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            List publicly in Collaboration Marketplace
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {formState.isPublic
                              ? "Other creators can discover and request to join."
                              : "Private — only people you invite can see this project."}
                          </p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={formState.isPublic}
                        onChange={(e) =>
                          setFormState((prev) => ({ ...prev, isPublic: e.target.checked }))
                        }
                        className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                      />
                    </label>
                  </div>
                )}

                {/* STEP 2: Invite @Creators */}
                {wizardStep === 1 && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                        Invite creators by @profile
                      </h2>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        Optional — search by @username to send invites right away, or skip and invite later.
                      </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-12">
                      <div className="sm:col-span-6">
                        <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
                          Creator handle
                        </label>
                        <CreatorHandlePicker
                          value={inviteSearch}
                          onChange={setInviteSearch}
                          onSelect={handleAddInvitee}
                          excludeHandles={selectedInvitees.map((c) => c.username)}
                          placeholder="Search @username or name…"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
                          Default role
                        </label>
                        <select
                          value={inviteRole}
                          onChange={(e) => setInviteRole(e.target.value as CollaboratorRole)}
                          className={INPUT_CLASS}
                        >
                          <option value="co-creator">Co-creator</option>
                          <option value="featured">Featured</option>
                          <option value="guest">Guest</option>
                        </select>
                      </div>
                      <div className="sm:col-span-3">
                        <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
                          Note (optional)
                        </label>
                        <input
                          value={inviteNote}
                          onChange={(e) => setInviteNote(e.target.value)}
                          placeholder="Quick pitch…"
                          className={INPUT_CLASS}
                        />
                      </div>
                    </div>

                    {selectedInvitees.length === 0 ? (
                      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center dark:border-slate-800">
                        <UserPlus className="h-5 w-5 text-slate-400" />
                        <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                          No creators added yet
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                          Pick a creator from the @profile search above to include them on launch.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          Invited ({selectedInvitees.length})
                        </p>
                        <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
                          {selectedInvitees.map((creator) => (
                            <li
                              key={creator.username}
                              className="flex flex-wrap items-center justify-between gap-3 px-3.5 py-2.5"
                            >
                              <div className="flex min-w-0 items-center gap-2.5">
                                {creator.avatar ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={creator.avatar}
                                    alt={creator.displayName}
                                    className="h-8 w-8 shrink-0 rounded-full object-cover"
                                  />
                                ) : (
                                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                                    {creator.displayName.slice(0, 2).toUpperCase()}
                                  </span>
                                )}
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                                    {creator.displayName}
                                  </p>
                                  <p className="truncate text-xs text-slate-500">
                                    @{creator.username}
                                    {creator.message ? ` · "${creator.message}"` : ""}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <select
                                  value={creator.role}
                                  onChange={(e) =>
                                    handleUpdateInviteeRole(
                                      creator.username,
                                      e.target.value as CollaboratorRole,
                                    )
                                  }
                                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                                >
                                  <option value="co-creator">Co-creator</option>
                                  <option value="featured">Featured</option>
                                  <option value="guest">Guest</option>
                                </select>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveInvitee(creator.username)}
                                  aria-label={`Remove @${creator.username}`}
                                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 3: Schedule & Channels */}
                {wizardStep === 2 && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                        Schedule &amp; distribution channels
                      </h2>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        Set logistics and where the finished piece will publish. All fields are optional.
                      </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="space-y-1.5">
                        <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          Target date
                        </label>
                        <input
                          type="date"
                          value={formState.scheduledDate}
                          onChange={(e) =>
                            setFormState((prev) => ({ ...prev, scheduledDate: e.target.value }))
                          }
                          className={INPUT_CLASS}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                          Duration (minutes)
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={formState.duration}
                          onChange={(e) =>
                            setFormState((prev) => ({ ...prev, duration: e.target.value }))
                          }
                          placeholder="e.g. 90"
                          className={INPUT_CLASS}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                          Location
                        </label>
                        <input
                          value={formState.location}
                          onChange={(e) =>
                            setFormState((prev) => ({ ...prev, location: e.target.value }))
                          }
                          placeholder="Remote or city"
                          className={INPUT_CLASS}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        Target platforms
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {PLATFORMS.map((p) => {
                          const selected = formState.platforms.includes(p.id);
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => handleTogglePlatform(p.id)}
                              className={`rounded-lg border px-3.5 py-1.5 text-xs font-medium transition ${
                                selected
                                  ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900"
                                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                              }`}
                            >
                              {p.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                          Equipment / requirements (comma separated)
                        </label>
                        <input
                          value={formState.requirements}
                          onChange={(e) =>
                            setFormState((prev) => ({ ...prev, requirements: e.target.value }))
                          }
                          placeholder="4K camera, lav mic, ring light"
                          className={INPUT_CLASS}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                          Tags (comma separated)
                        </label>
                        <input
                          value={formState.tags}
                          onChange={(e) =>
                            setFormState((prev) => ({ ...prev, tags: e.target.value }))
                          }
                          placeholder="fitness, lifestyle, podcast"
                          className={INPUT_CLASS}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4: Compensation, Creative Brief & Review */}
                {wizardStep === 3 && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                        Terms &amp; final review
                      </h2>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        Specify compensation (if any), creative direction, and confirm your details.
                      </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-4">
                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                          Compensation structure
                        </label>
                        <select
                          value={formState.compensationType}
                          onChange={(e) =>
                            setFormState((prev) => ({ ...prev, compensationType: e.target.value }))
                          }
                          className={INPUT_CLASS}
                        >
                          <option value="none">Unpaid / Cross-promotion</option>
                          <option value="revenue_share">Revenue share</option>
                          <option value="fixed_fee">Fixed fee</option>
                          <option value="barter">Barter / Product trade</option>
                        </select>
                      </div>

                      {formState.compensationType !== "none" && (
                        <>
                          <div className="space-y-1.5">
                            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                              Amount
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={formState.compensationAmount}
                              onChange={(e) =>
                                setFormState((prev) => ({
                                  ...prev,
                                  compensationAmount: e.target.value,
                                }))
                              }
                              placeholder="0"
                              className={INPUT_CLASS}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                              Currency
                            </label>
                            <input
                              value={formState.compensationCurrency}
                              onChange={(e) =>
                                setFormState((prev) => ({
                                  ...prev,
                                  compensationCurrency: e.target.value,
                                }))
                              }
                              className={INPUT_CLASS}
                            />
                          </div>
                        </>
                      )}
                    </div>

                    {formState.compensationType !== "none" && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                          Compensation notes
                        </label>
                        <input
                          value={formState.compensationDescription}
                          onChange={(e) =>
                            setFormState((prev) => ({
                              ...prev,
                              compensationDescription: e.target.value,
                            }))
                          }
                          placeholder="e.g. 50/50 split on YouTube AdSense & sponsorships"
                          className={INPUT_CLASS}
                        />
                      </div>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                          Theme / angle
                        </label>
                        <input
                          value={formState.theme}
                          onChange={(e) =>
                            setFormState((prev) => ({ ...prev, theme: e.target.value }))
                          }
                          placeholder="e.g. Day in the life"
                          className={INPUT_CLASS}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                          Target audience
                        </label>
                        <input
                          value={formState.targetAudience}
                          onChange={(e) =>
                            setFormState((prev) => ({ ...prev, targetAudience: e.target.value }))
                          }
                          placeholder="e.g. Gen-Z indie founders"
                          className={INPUT_CLASS}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                          Hashtags (comma separated)
                        </label>
                        <input
                          value={formState.hashtags}
                          onChange={(e) =>
                            setFormState((prev) => ({ ...prev, hashtags: e.target.value }))
                          }
                          placeholder="#collab, #hyperbuds"
                          className={INPUT_CLASS}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                          Goals (comma separated)
                        </label>
                        <input
                          value={formState.goals}
                          onChange={(e) =>
                            setFormState((prev) => ({ ...prev, goals: e.target.value }))
                          }
                          placeholder="reach, subscriber growth"
                          className={INPUT_CLASS}
                        />
                      </div>
                    </div>

                    {/* Crisp Summary Card */}
                    <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        <FileText className="h-3.5 w-3.5" />
                        Summary
                      </div>
                      <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                        <div>
                          <dt className="text-xs text-slate-500">Title</dt>
                          <dd className="font-medium text-slate-900 dark:text-white">
                            {formState.title.trim() || "—"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs text-slate-500">Format &amp; visibility</dt>
                          <dd className="font-medium capitalize text-slate-900 dark:text-white">
                            {formState.type.replace(/_/g, " ")} ·{" "}
                            {formState.isPublic ? "Public" : "Private"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs text-slate-500">Invited creators</dt>
                          <dd className="font-medium text-slate-900 dark:text-white">
                            {selectedInvitees.length > 0
                              ? selectedInvitees.map((c) => `@${c.username}`).join(", ")
                              : "None yet"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs text-slate-500">Schedule &amp; platforms</dt>
                          <dd className="font-medium text-slate-900 dark:text-white">
                            {formState.scheduledDate || "Flexible date"}
                            {formState.platforms.length > 0
                              ? ` · ${formState.platforms.join(", ")}`
                              : ""}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                )}

                {createError && (
                  <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
                    {createError}
                  </div>
                )}

                {/* Wizard Footer Navigation */}
                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      if (wizardStep === 0) {
                        setShowWizard(false);
                      } else {
                        goToStep(wizardStep - 1);
                      }
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    {wizardStep > 0 && <ArrowLeft className="h-4 w-4" />}
                    {wizardStep === 0 ? "Cancel" : "Back"}
                  </button>

                  <div className="flex items-center gap-2">
                    <span className="hidden text-xs text-slate-400 sm:inline">
                      Step {wizardStep + 1} of {WIZARD_STEPS.length}
                    </span>

                    {wizardStep < WIZARD_STEPS.length - 1 ? (
                      <button
                        type="button"
                        onClick={() => goToStep(wizardStep + 1)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                      >
                        Continue
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                      >
                        <Check className="h-4 w-4" />
                        {isSubmitting ? "Creating…" : "Create Collaboration"}
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </section>
          )}

          {/* Clean segmented filter tabs */}
          <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 pb-3 dark:border-slate-800">
            {filterTabs.map((tab) => {
              const active = filter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilter(tab.id)}
                  className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums ${
                      active
                        ? "bg-white/20 text-white dark:bg-slate-900/15 dark:text-slate-900"
                        : tab.id === "invites" && tab.count > 0
                          ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                          : "bg-slate-200/70 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Collaborations List / Invites */}
          <div>
            {isLoading ? (
              <CardGridSkeleton count={4} columns={2} />
            ) : error ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center dark:border-slate-800 dark:bg-slate-900">
                <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">
                  Failed to load collaborations
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{error}</p>
                <button
                  type="button"
                  onClick={() => void loadCollaborations()}
                  className="mt-4 rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Try Again
                </button>
              </div>
            ) : filter === "invites" ? (
              <InvitesTable invites={invites} onSelect={handleInviteSelect} />
            ) : (
              <CollaborationList
                items={filteredCollaborations}
                emptyTitle={
                  filter === "completed"
                    ? "No completed collaborations"
                    : filter === "active"
                      ? "No active collaborations"
                      : "No collaborations yet"
                }
                emptyDescription={
                  filter === "completed"
                    ? "Finished projects will appear here."
                    : filter === "active"
                      ? "Accept an invite or start a new collaboration to get going."
                      : "Create a collaboration above and invite creators by @handle."
                }
              />
            )}
          </div>
        </div>
      </div>

      <InviteDecisionModal
        invite={selectedInvite}
        isOpen={isInviteModalOpen}
        isSubmitting={isRespondingToInvite}
        onAccept={() => handleInviteResponse("accept")}
        onDecline={() => handleInviteResponse("decline")}
        onClose={handleInviteModalClose}
      />
    </DashboardLayout>
  );
};

export default CollaborationsPage;
