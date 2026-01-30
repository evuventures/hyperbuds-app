"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Users, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import CollaborationList from "@/components/collaboration/CollaborationList";
import { collaborationApi } from "@/lib/api/collaboration.api";
import type { Collaboration } from "@/types/collaboration.types";
import BackLink from "@/components/collaboration/BackLink";
import CollaborationNav from "@/components/collaboration/CollaborationNav";
import InvitesTable from "@/components/collaboration/invites/InvitesTable";
import InviteDecisionModal from "@/components/collaboration/invites/InviteDecisionModal";

type CollaborationFilter = "all" | "invites" | "active" | "completed";

const CollaborationsPage: React.FC = () => {
  const router = useRouter();
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [invites, setInvites] = useState<Collaboration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<CollaborationFilter>("all");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [selectedInvite, setSelectedInvite] = useState<Collaboration | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isRespondingToInvite, setIsRespondingToInvite] = useState(false);
  const [formState, setFormState] = useState({
    title: "",
    description: "",
    type: "video",
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
  });

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
      console.error("Failed to load collaborations:", err);
      setError(err instanceof Error ? err.message : "Failed to load collaborations");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCollaborations();
  }, []);

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

  const handleCreateCollaboration = async (event: React.FormEvent) => {
    event.preventDefault();
    setCreateError(null);

    try {
      setIsCreating(true);

      const details = {
        scheduledDate: formState.scheduledDate
          ? new Date(formState.scheduledDate).toISOString()
          : undefined,
        duration: formState.duration ? Number(formState.duration) : undefined,
        location: formState.location || undefined,
        platform: formState.platforms.length ? formState.platforms : undefined,
        requirements: formState.requirements
          ? formState.requirements.split(",").map((item) => item.trim()).filter(Boolean)
          : undefined,
        compensation: {
          type: formState.compensationType,
          amount: formState.compensationAmount
            ? Number(formState.compensationAmount)
            : undefined,
          currency: formState.compensationCurrency || "USD",
          description: formState.compensationDescription || undefined,
        },
      };

      const content = {
        theme: formState.theme || undefined,
        hashtags: formState.hashtags
          ? formState.hashtags.split(",").map((item) => item.trim()).filter(Boolean)
          : undefined,
        targetAudience: formState.targetAudience || undefined,
        goals: formState.goals
          ? formState.goals.split(",").map((item) => item.trim()).filter(Boolean)
          : undefined,
      };

      const payload = {
        title: formState.title.trim(),
        description: formState.description.trim(),
        type: formState.type as Collaboration["type"],
        details,
        content,
        tags: formState.tags
          ? formState.tags.split(",").map((item) => item.trim()).filter(Boolean)
          : undefined,
        isPublic: formState.isPublic,
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const created = await collaborationApi.createCollaboration(payload as any);
      setCollaborations((prev) => [created, ...prev]);
      setFilter("all");
      setFormState({
        title: "",
        description: "",
        type: "video",
        scheduledDate: "",
        duration: "",
        location: "",
        platforms: [],
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
      });
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Failed to create collaboration");
    } finally {
      setIsCreating(false);
    }
  };

  const activeCollaborations = useMemo(
    () => collaborations.filter((collab) => ["accepted", "in_progress"].includes(collab.status)),
    [collaborations]
  );

  const completedCollaborations = useMemo(
    () => collaborations.filter((collab) => collab.status === "completed"),
    [collaborations]
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
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Failed to respond to invite");
    } finally {
      setIsRespondingToInvite(false);
    }
  };

  const handleInviteModalClose = () => {
    setIsInviteModalOpen(false);
    setSelectedInvite(null);
  };

  return (
    <>
      <div className="min-h-screen bg-white dark:bg-slate-900">
        <div className="max-w-6xl mx-auto px-6 py-12 space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <BackLink onClick={() => router.back()} />
            <div className="flex items-center gap-3">
              <CollaborationNav />
              <Button
                variant="outline"
                size="sm"
                onClick={loadCollaborations}
                disabled={isLoading}
                className="text-xs text-gray-600 border-gray-200 sm:text-sm hover:bg-gray-100 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 sm:w-4 sm:h-4 sm:mr-2 ${isLoading ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Refresh</span>
                <span className="sm:hidden">Refresh</span>
              </Button>
            </div>
          </div>

          <div className="text-center space-y-3">
            <div className="flex justify-center items-center">
              <div className="shrink-0 p-2 mr-2 bg-linear-to-br from-purple-500 to-pink-500 rounded-xl shadow-md sm:p-2.5 sm:mr-3 sm:rounded-2xl">
                <Users className="w-6 h-6 text-white sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl dark:text-white">Collaborations</h1>
            </div>
            <p className="text-sm text-gray-600 sm:text-base lg:text-lg dark:text-gray-400">
              {isLoading
                ? "Loading your collaborations..."
                : collaborations.length === 0
                ? "No collaborations yet. Start a new project or accept invites."
                : `${collaborations.length} collaboration${collaborations.length === 1 ? "" : "s"} in your workspace`}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 justify-center mb-5 sm:mb-6">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                onClick={() => setFilter("all")}
                className={
                  filter === "all"
                    ? "text-xs bg-linear-to-r from-purple-500 to-pink-500 sm:text-sm hover:from-purple-600 hover:to-pink-600"
                    : "text-xs text-purple-600 border-purple-500 sm:text-sm hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/20"
                }
              >
                <Users className="mr-1.5 w-3.5 h-3.5 sm:mr-2 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">All Collaborations</span>
                <span className="sm:hidden">Collaborations</span>
              </Button>
              <Button
                variant={filter === "active" ? "default" : "outline"}
                onClick={() => setFilter("active")}
                className={
                  filter === "active"
                    ? "text-xs bg-linear-to-r from-purple-500 to-pink-500 sm:text-sm hover:from-purple-600 hover:to-pink-600"
                    : "text-xs text-purple-600 border-purple-500 sm:text-sm hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/20"
                }
              >
                <Zap className="mr-1.5 w-3.5 h-3.5 sm:mr-2 sm:w-4 sm:h-4" />
                Active Projects
              </Button>
              <Button
                variant={filter === "invites" ? "default" : "outline"}
                onClick={() => setFilter("invites")}
                className={
                  filter === "invites"
                    ? "text-xs bg-linear-to-r from-purple-500 to-pink-500 sm:text-sm hover:from-purple-600 hover:to-pink-600"
                    : "text-xs text-purple-600 border-purple-500 sm:text-sm hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/20"
                }
              >
                Invites
              </Button>
              <Button
                variant={filter === "completed" ? "default" : "outline"}
                onClick={() => setFilter("completed")}
                className={
                  filter === "completed"
                    ? "text-xs bg-linear-to-r from-purple-500 to-pink-500 sm:text-sm hover:from-purple-600 hover:to-pink-600"
                    : "text-xs text-purple-600 border-purple-500 sm:text-sm hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/20"
                }
              >
                Completed
              </Button>
            </div>

            <div className="mb-6 rounded-2xl border border-gray-200/60 bg-white/90 p-5 shadow-lg backdrop-blur-sm dark:border-white/10 dark:bg-slate-800/90">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Create Collaboration
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Draft a new collaboration and invite creators.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreating((prev) => !prev)}
                  className="text-xs text-purple-600 border-purple-500 sm:text-sm hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/20"
                >
                  {isCreating ? "Close" : "New Collaboration"}
                </Button>
              </div>

              {isCreating && (
                <form onSubmit={handleCreateCollaboration} className="mt-4 space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        Title
                      </label>
                      <input
                        value={formState.title}
                        onChange={(event) => setFormState((prev) => ({ ...prev, title: event.target.value }))}
                        required
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-white/10 dark:bg-slate-900/60 dark:text-white"
                        placeholder="Collaboration title"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        Type
                      </label>
                      <select
                        value={formState.type}
                        onChange={(event) => setFormState((prev) => ({ ...prev, type: event.target.value }))}
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-white/10 dark:bg-slate-900/60 dark:text-white"
                      >
                        {["video", "livestream", "podcast", "photo_shoot", "event", "challenge", "series", "other"].map(
                          (value) => (
                            <option key={value} value={value}>
                              {value.replace(/_/g, " ")}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      Description
                    </label>
                    <textarea
                      value={formState.description}
                      onChange={(event) => setFormState((prev) => ({ ...prev, description: event.target.value }))}
                      required
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-white/10 dark:bg-slate-900/60 dark:text-white"
                      rows={4}
                      placeholder="Describe the collaboration goals"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        Scheduled Date
                      </label>
                      <input
                        type="date"
                        value={formState.scheduledDate}
                        onChange={(event) => setFormState((prev) => ({ ...prev, scheduledDate: event.target.value }))}
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-white/10 dark:bg-slate-900/60 dark:text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        Duration (minutes)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formState.duration}
                        onChange={(event) => setFormState((prev) => ({ ...prev, duration: event.target.value }))}
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-white/10 dark:bg-slate-900/60 dark:text-white"
                        placeholder="120"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        Location
                      </label>
                      <input
                        value={formState.location}
                        onChange={(event) => setFormState((prev) => ({ ...prev, location: event.target.value }))}
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-white/10 dark:bg-slate-900/60 dark:text-white"
                        placeholder="Virtual or city"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      Platforms
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {["tiktok", "instagram", "youtube", "twitch", "twitter"].map((platform) => (
                        <button
                          type="button"
                          key={platform}
                          onClick={() => handleTogglePlatform(platform)}
                          className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                            formState.platforms.includes(platform)
                              ? "border-purple-500 bg-purple-500 text-white"
                              : "border-gray-200 bg-white text-gray-600 dark:border-white/10 dark:bg-slate-900/60 dark:text-gray-300"
                          }`}
                        >
                          {platform}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        Requirements (comma separated)
                      </label>
                      <input
                        value={formState.requirements}
                        onChange={(event) => setFormState((prev) => ({ ...prev, requirements: event.target.value }))}
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-white/10 dark:bg-slate-900/60 dark:text-white"
                        placeholder="Camera, lighting"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        Tags (comma separated)
                      </label>
                      <input
                        value={formState.tags}
                        onChange={(event) => setFormState((prev) => ({ ...prev, tags: event.target.value }))}
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-white/10 dark:bg-slate-900/60 dark:text-white"
                        placeholder="gaming, tech"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        Compensation Type
                      </label>
                      <select
                        value={formState.compensationType}
                        onChange={(event) => setFormState((prev) => ({ ...prev, compensationType: event.target.value }))}
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-white/10 dark:bg-slate-900/60 dark:text-white"
                      >
                        {["none", "revenue_share", "fixed_fee", "barter"].map((value) => (
                          <option key={value} value={value}>
                            {value.replace(/_/g, " ")}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        Amount
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formState.compensationAmount}
                        onChange={(event) => setFormState((prev) => ({ ...prev, compensationAmount: event.target.value }))}
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-white/10 dark:bg-slate-900/60 dark:text-white"
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        Currency
                      </label>
                      <input
                        value={formState.compensationCurrency}
                        onChange={(event) => setFormState((prev) => ({ ...prev, compensationCurrency: event.target.value }))}
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-white/10 dark:bg-slate-900/60 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      Compensation Notes
                    </label>
                    <input
                      value={formState.compensationDescription}
                      onChange={(event) => setFormState((prev) => ({ ...prev, compensationDescription: event.target.value }))}
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-white/10 dark:bg-slate-900/60 dark:text-white"
                      placeholder="Optional details about compensation"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        Theme
                      </label>
                      <input
                        value={formState.theme}
                        onChange={(event) => setFormState((prev) => ({ ...prev, theme: event.target.value }))}
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-white/10 dark:bg-slate-900/60 dark:text-white"
                        placeholder="Theme"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        Hashtags
                      </label>
                      <input
                        value={formState.hashtags}
                        onChange={(event) => setFormState((prev) => ({ ...prev, hashtags: event.target.value }))}
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-white/10 dark:bg-slate-900/60 dark:text-white"
                        placeholder="#collab, #creator"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        Goals
                      </label>
                      <input
                        value={formState.goals}
                        onChange={(event) => setFormState((prev) => ({ ...prev, goals: event.target.value }))}
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-white/10 dark:bg-slate-900/60 dark:text-white"
                        placeholder="engagement, reach"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        Target Audience
                      </label>
                      <input
                        value={formState.targetAudience}
                        onChange={(event) => setFormState((prev) => ({ ...prev, targetAudience: event.target.value }))}
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-white/10 dark:bg-slate-900/60 dark:text-white"
                        placeholder="Audience profile"
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-7">
                      <input
                        type="checkbox"
                        checked={formState.isPublic}
                        onChange={(event) => setFormState((prev) => ({ ...prev, isPublic: event.target.checked }))}
                        className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        Show in marketplace
                      </span>
                    </div>
                  </div>

                  {createError && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
                      {createError}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="text-xs sm:text-sm bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                      Create Collaboration
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreating(false)}
                      className="text-xs text-gray-600 border-gray-200 sm:text-sm hover:bg-gray-50 dark:text-gray-300 dark:border-white/10 dark:hover:bg-slate-900/40"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </div>

            <div className="p-5">
              {isLoading ? (
                <div className="flex flex-col justify-center items-center py-12 sm:py-16">
                  <div className="mb-4 w-12 h-12 text-purple-600 animate-spin sm:w-16 sm:h-16">
                    <RefreshCw className="w-full h-full" />
                  </div>
                  <p className="text-base font-medium text-gray-600 sm:text-lg dark:text-gray-400">Loading collaborations...</p>
                  <p className="mt-2 text-xs text-gray-500 sm:text-sm dark:text-gray-500">Syncing your workspace</p>
                </div>
              ) : error ? (
                <div className="flex flex-col justify-center items-center py-12 sm:py-16">
                  <div className="p-5 mb-4 bg-red-50 rounded-xl sm:p-6 dark:bg-red-900/20">
                    <p className="text-base font-semibold text-red-600 sm:text-lg dark:text-red-400">
                      Failed to load collaborations
                    </p>
                    <p className="mt-1 text-xs text-red-500 sm:text-sm dark:text-red-400">
                      {error}
                    </p>
                  </div>
                  <Button onClick={loadCollaborations} variant="outline" className="text-xs text-purple-600 border-purple-500 sm:text-sm hover:bg-purple-50">
                    Try Again
                  </Button>
                </div>
              ) : filter === "invites" ? (
                <InvitesTable invites={invites} onSelect={handleInviteSelect} />
              ) : (
                <CollaborationList
                  items={filteredCollaborations}
                  emptyTitle={
                    filter === "completed"
                      ? "No Completed Collaborations"
                      : filter === "active"
                      ? "No Active Collaborations"
                      : "No Collaborations Yet"
                  }
                  emptyDescription={
                    filter === "completed"
                      ? "Finish a project to see it here."
                      : filter === "active"
                      ? "Start or accept a collaboration to get going."
                      : "Create or accept a collaboration to see it here."
                  }
                />
              )}
            </div>
            
              {/* footer stats */}
            {/* <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-gray-200/60 bg-white/90 p-4 text-center shadow-md dark:border-white/10 dark:bg-slate-800/90">
                <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{collaborations.length}</p>
              </div>
              <div className="rounded-2xl border border-gray-200/60 bg-white/90 p-4 text-center shadow-md dark:border-white/10 dark:bg-slate-800/90">
                <p className="text-xs text-gray-500 dark:text-gray-400">Active</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeCollaborations.length}</p>
              </div>
              <div className="rounded-2xl border border-gray-200/60 bg-white/90 p-4 text-center shadow-md dark:border-white/10 dark:bg-slate-800/90">
                <p className="text-xs text-gray-500 dark:text-gray-400">Invites</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{invites.length}</p>
              </div>
            </div> */}

          </div>
        </div>
        <InviteDecisionModal
          invite={selectedInvite}
          isOpen={isInviteModalOpen}
          isSubmitting={isRespondingToInvite}
          onClose={handleInviteModalClose}
          onAccept={() => handleInviteResponse("accept")}
          onDecline={() => handleInviteResponse("decline")}
        />
    </>
  );
}

export default CollaborationsPage;
