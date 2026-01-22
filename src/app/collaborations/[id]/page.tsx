"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/Dashboard/Dashboard";
import { collaborationApi } from "@/lib/api/collaboration.api";
import type { Collaboration } from "@/types/collaboration.types";
import { Button } from "@/components/ui/button";

interface CollaborationPageProps {
  params: Promise<{ id: string }>;
}

const statusOptions: Collaboration["status"][] = [
  "draft",
  "pending",
  "accepted",
  "in_progress",
  "completed",
  "cancelled",
];

const typeOptions: Collaboration["type"][] = [
  "video",
  "livestream",
  "podcast",
  "photo_shoot",
  "event",
  "challenge",
  "series",
  "other",
];

const platformOptions = ["tiktok", "instagram", "youtube", "twitch", "twitter"];

const toDateInput = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

export default function CollaborationPage({ params }: CollaborationPageProps) {
  const router = useRouter();
  const [collaboration, setCollaboration] = useState<Collaboration | null>(null);
  const [collaborationId, setCollaborationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    username: "",
    role: "co-creator",
    message: "",
  });
  const [statusForm, setStatusForm] = useState<Collaboration["status"]>("draft");
  const [deliverableForm, setDeliverableForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    assignedTo: "",
    files: "",
  });
  const [deliverableUpdates, setDeliverableUpdates] = useState<
    Record<string, { status?: string; files?: string }>
  >({});
  const [editForm, setEditForm] = useState<{
    title: string;
    description: string;
    type: Collaboration["type"];
    scheduledDate: string;
    duration: string;
    location: string;
    platforms: string[];
    requirements: string;
    compensationType: "none" | "revenue_share" | "fixed_fee" | "barter";
    compensationAmount: string;
    compensationCurrency: string;
    compensationDescription: string;
    theme: string;
    hashtags: string;
    targetAudience: string;
    goals: string;
    tags: string;
    isPublic: boolean;
  }>({
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
  const [reviewForm, setReviewForm] = useState({
    rating: "5",
    comment: "",
  });

  const loadCollaboration = async (id: string) => {
    try {
      setIsLoading(true);
      const data = await collaborationApi.getCollaborationById(id);
      setCollaboration(data);
      setStatusForm(data.status);
      setEditForm({
        title: data.title || "",
        description: data.description || "",
        type: data.type || "video",
        scheduledDate: toDateInput(data.details?.scheduledDate),
        duration: data.details?.duration ? String(data.details.duration) : "",
        location: data.details?.location || "",
        platforms: data.details?.platform || [],
        requirements: data.details?.requirements?.join(", ") || "",
        compensationType: data.details?.compensation?.type || "none",
        compensationAmount: data.details?.compensation?.amount
          ? String(data.details.compensation.amount)
          : "",
        compensationCurrency: data.details?.compensation?.currency || "USD",
        compensationDescription: data.details?.compensation?.description || "",
        theme: data.content?.theme || "",
        hashtags: data.content?.hashtags?.join(", ") || "",
        targetAudience: data.content?.targetAudience || "",
        goals: data.content?.goals?.join(", ") || "",
        tags: data.tags?.join(", ") || "",
        isPublic: Boolean(data.isPublic),
      });
      setDeliverableUpdates(
        (data.deliverables || []).reduce((acc, deliverable) => {
          if (!deliverable._id) return acc;
          acc[deliverable._id] = {
            status: deliverable.status,
            files: deliverable.files?.join(", ") || "",
          };
          return acc;
        }, {} as Record<string, { status?: string; files?: string }>)
      );
      setError(null);
    } catch (err) {
      console.error("Failed to load collaboration:", err);
      setError(err instanceof Error ? err.message : "Failed to load collaboration");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const { id } = await params;
      setCollaborationId(id);
      await loadCollaboration(id);
    };

    init();
  }, [params]);

  const handleStatusUpdate = async () => {
    if (!collaborationId) return;
    setActionError(null);
    try {
      setIsSubmitting(true);
      const updated = await collaborationApi.updateStatus(collaborationId, statusForm);
      setCollaboration(updated);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInvite = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!collaborationId) return;
    setActionError(null);
    try {
      setIsSubmitting(true);
      await collaborationApi.inviteCollaborators(collaborationId, {
        collaborators: [
          {
            username: inviteForm.username,
            role: inviteForm.role as "co-creator" | "featured" | "guest",
            message: inviteForm.message.trim() || undefined,
          },
        ],
      });
      setInviteForm({ username: "", role: "co-creator", message: "" });
      await loadCollaboration(collaborationId);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to send invite");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeliverable = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!collaborationId) return;
    setActionError(null);
    try {
      setIsSubmitting(true);
      await collaborationApi.addDeliverable(collaborationId, {
        title: deliverableForm.title.trim(),
        description: deliverableForm.description.trim() || undefined,
        dueDate: deliverableForm.dueDate ? new Date(deliverableForm.dueDate).toISOString() : undefined,
        assignedTo: deliverableForm.assignedTo.trim() || undefined,
      });
      if (deliverableForm.files.trim()) {
        const files = deliverableForm.files.split(",").map((item) => item.trim()).filter(Boolean);
        if (files.length) {
          const latest = await collaborationApi.getCollaborationById(collaborationId);
          const lastDeliverable = latest.deliverables?.[latest.deliverables.length - 1];
          if (lastDeliverable?._id) {
            await collaborationApi.updateDeliverable(collaborationId, lastDeliverable._id, { files });
          }
          setCollaboration(latest);
        }
      } else {
        await loadCollaboration(collaborationId);
      }
      setDeliverableForm({ title: "", description: "", dueDate: "", assignedTo: "", files: "" });
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to add deliverable");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeliverableUpdate = async (deliverableId: string) => {
    if (!collaborationId) return;
    setActionError(null);
    try {
      setIsSubmitting(true);
      const update = deliverableUpdates[deliverableId] || {};
      const files = update.files
        ? update.files.split(",").map((item) => item.trim()).filter(Boolean)
        : undefined;
      await collaborationApi.updateDeliverable(collaborationId, deliverableId, {
        status: update.status as "pending" | "in_progress" | "completed" | undefined,
        files,
      });
      await loadCollaboration(collaborationId);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to update deliverable");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRespondInvite = async (action: "accept" | "decline") => {
    if (!collaborationId) return;
    setActionError(null);
    try {
      setIsSubmitting(true);
      const updated = await collaborationApi.respondToInvite(collaborationId, { action });
      setCollaboration(updated);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to respond to invite");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateCollaboration = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!collaborationId) return;
    setActionError(null);
    try {
      setIsSubmitting(true);
      const payload = {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        type: editForm.type as Collaboration["type"],
        details: {
          scheduledDate: editForm.scheduledDate
            ? new Date(editForm.scheduledDate).toISOString()
            : undefined,
          duration: editForm.duration ? Number(editForm.duration) : undefined,
          location: editForm.location || undefined,
          platform: editForm.platforms.length ? editForm.platforms : undefined,
          requirements: editForm.requirements
            ? editForm.requirements.split(",").map((item) => item.trim()).filter(Boolean)
            : undefined,
          compensation: {
            type: editForm.compensationType,
            amount: editForm.compensationAmount ? Number(editForm.compensationAmount) : undefined,
            currency: editForm.compensationCurrency || "USD",
            description: editForm.compensationDescription || undefined,
          },
        },
        content: {
          theme: editForm.theme || undefined,
          hashtags: editForm.hashtags
            ? editForm.hashtags.split(",").map((item) => item.trim()).filter(Boolean)
            : undefined,
          targetAudience: editForm.targetAudience || undefined,
          goals: editForm.goals
            ? editForm.goals.split(",").map((item) => item.trim()).filter(Boolean)
            : undefined,
        },
        tags: editForm.tags
          ? editForm.tags.split(",").map((item) => item.trim()).filter(Boolean)
          : undefined,
        isPublic: editForm.isPublic,
      };

      const updated = await collaborationApi.updateCollaboration(collaborationId, payload);
      setCollaboration(updated);
      setIsEditing(false);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to update collaboration");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!collaborationId) return;
    const confirmDelete = window.confirm("Delete this collaboration? This cannot be undone.");
    if (!confirmDelete) return;
    setActionError(null);
    try {
      setIsSubmitting(true);
      await collaborationApi.deleteCollaboration(collaborationId);
      router.push("/collaborations");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to delete collaboration");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReview = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!collaborationId) return;
    setActionError(null);
    try {
      setIsSubmitting(true);
      const updated = await collaborationApi.reviewCollaboration(collaborationId, {
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment.trim() || undefined,
      });
      setCollaboration(updated);
      setReviewForm({ rating: "5", comment: "" });
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deliverables = useMemo(() => collaboration?.deliverables || [], [collaboration]);

  return (
    <DashboardLayout>
      <div className="min-h-full bg-gray-50 dark:bg-slate-900">
        <div className="p-4 pb-16 lg:p-6 lg:pb-34">
          <div className="mx-auto max-w-6xl space-y-6">
            <div className="p-5 rounded-xl border-2 shadow-xl backdrop-blur-sm sm:p-6 sm:rounded-2xl lg:p-8 border-purple-200/50 bg-white/90 dark:bg-slate-800/90 dark:border-purple-500/30">
              {isLoading ? (
                <div className="flex flex-col justify-center items-center py-12 sm:py-16">
                  <div className="mb-4 w-12 h-12 text-purple-600 animate-spin sm:w-16 sm:h-16">
                    <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                  </div>
                  <p className="text-base font-medium text-gray-600 sm:text-lg dark:text-gray-400">Loading collaboration...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col justify-center items-center py-12 sm:py-16">
                  <div className="p-5 mb-4 bg-red-50 rounded-xl sm:p-6 dark:bg-red-900/20">
                    <p className="text-base font-semibold text-red-600 sm:text-lg dark:text-red-400">
                      Failed to load collaboration
                    </p>
                    <p className="mt-1 text-xs text-red-500 sm:text-sm dark:text-red-400">
                      {error}
                    </p>
                  </div>
                </div>
              ) : collaboration ? (
                <div className="space-y-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">
                        {collaboration.title}
                      </h1>
                      <p className="text-sm text-gray-500 sm:text-base dark:text-gray-400">
                        {collaboration.description}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing((prev) => !prev)}
                        className="text-xs text-purple-600 border-purple-500 sm:text-sm hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/20"
                      >
                        {isEditing ? "Close" : "Edit"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDelete}
                        className="text-xs text-red-600 border-red-300 sm:text-sm hover:bg-red-50"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-gray-200/60 bg-white/80 p-4 text-sm text-gray-600 dark:border-white/10 dark:bg-slate-900/40 dark:text-gray-300">
                      <p className="font-semibold text-gray-900 dark:text-white">Status</p>
                      <p className="capitalize">{collaboration.status.replace(/_/g, " ")}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200/60 bg-white/80 p-4 text-sm text-gray-600 dark:border-white/10 dark:bg-slate-900/40 dark:text-gray-300">
                      <p className="font-semibold text-gray-900 dark:text-white">Type</p>
                      <p className="capitalize">{collaboration.type.replace(/_/g, " ")}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200/60 bg-white/80 p-4 text-sm text-gray-600 dark:border-white/10 dark:bg-slate-900/40 dark:text-gray-300">
                      <p className="font-semibold text-gray-900 dark:text-white">Scheduled Date</p>
                      <p>{collaboration.details?.scheduledDate ? new Date(collaboration.details.scheduledDate).toLocaleDateString() : "TBD"}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200/60 bg-white/80 p-4 text-sm text-gray-600 dark:border-white/10 dark:bg-slate-900/40 dark:text-gray-300">
                      <p className="font-semibold text-gray-900 dark:text-white">Collaborators</p>
                      <p>{collaboration.collaborators?.length || 0}</p>
                    </div>
                  </div>

                  {isEditing && (
                    <form onSubmit={handleUpdateCollaboration} className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Title</label>
                          <input
                            value={editForm.title}
                            onChange={(event) => setEditForm((prev) => ({ ...prev, title: event.target.value }))}
                            required
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-white/10 dark:bg-slate-900/60 dark:text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Type</label>
                          <select
                            value={editForm.type}
                            onChange={(event) =>
                              setEditForm((prev) => ({
                                ...prev,
                                type: event.target.value as Collaboration["type"],
                              }))
                            }
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-white/10 dark:bg-slate-900/60 dark:text-white"
                          >
                            {typeOptions.map((option) => (
                              <option key={option} value={option}>
                                {option.replace(/_/g, " ")}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Description</label>
                        <textarea
                          value={editForm.description}
                          onChange={(event) => setEditForm((prev) => ({ ...prev, description: event.target.value }))}
                          required
                          rows={4}
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-white/10 dark:bg-slate-900/60 dark:text-white"
                        />
                      </div>
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Scheduled Date</label>
                          <input
                            type="date"
                            value={editForm.scheduledDate}
                            onChange={(event) => setEditForm((prev) => ({ ...prev, scheduledDate: event.target.value }))}
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-white/10 dark:bg-slate-900/60 dark:text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Duration (minutes)</label>
                          <input
                            type="number"
                            min="1"
                            value={editForm.duration}
                            onChange={(event) => setEditForm((prev) => ({ ...prev, duration: event.target.value }))}
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-white/10 dark:bg-slate-900/60 dark:text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Location</label>
                          <input
                            value={editForm.location}
                            onChange={(event) => setEditForm((prev) => ({ ...prev, location: event.target.value }))}
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-white/10 dark:bg-slate-900/60 dark:text-white"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Platforms</label>
                        <div className="flex flex-wrap gap-2">
                          {platformOptions.map((platform) => (
                            <button
                              type="button"
                              key={platform}
                              onClick={() =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  platforms: prev.platforms.includes(platform)
                                    ? prev.platforms.filter((item) => item !== platform)
                                    : [...prev.platforms, platform],
                                }))
                              }
                              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                                editForm.platforms.includes(platform)
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
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Requirements</label>
                          <input
                            value={editForm.requirements}
                            onChange={(event) => setEditForm((prev) => ({ ...prev, requirements: event.target.value }))}
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-white/10 dark:bg-slate-900/60 dark:text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Tags</label>
                          <input
                            value={editForm.tags}
                            onChange={(event) => setEditForm((prev) => ({ ...prev, tags: event.target.value }))}
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-white/10 dark:bg-slate-900/60 dark:text-white"
                          />
                        </div>
                      </div>
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Compensation Type</label>
                          <select
                            value={editForm.compensationType}
                            onChange={(event) => setEditForm((prev) => ({ ...prev, compensationType: event.target.value as "none" | "revenue_share" | "fixed_fee" | "barter" }))}
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-white/10 dark:bg-slate-900/60 dark:text-white"
                          >
                            {['none', 'revenue_share', 'fixed_fee', 'barter'].map((option) => (
                              <option key={option} value={option}>
                                {option.replace(/_/g, ' ')}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Amount</label>
                          <input
                            type="number"
                            min="0"
                            value={editForm.compensationAmount}
                            onChange={(event) => setEditForm((prev) => ({ ...prev, compensationAmount: event.target.value }))}
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-white/10 dark:bg-slate-900/60 dark:text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Currency</label>
                          <input
                            value={editForm.compensationCurrency}
                            onChange={(event) => setEditForm((prev) => ({ ...prev, compensationCurrency: event.target.value }))}
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-white/10 dark:bg-slate-900/60 dark:text-white"
                          />
                        </div>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Theme</label>
                          <input
                            value={editForm.theme}
                            onChange={(event) => setEditForm((prev) => ({ ...prev, theme: event.target.value }))}
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-white/10 dark:bg-slate-900/60 dark:text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Target Audience</label>
                          <input
                            value={editForm.targetAudience}
                            onChange={(event) => setEditForm((prev) => ({ ...prev, targetAudience: event.target.value }))}
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-white/10 dark:bg-slate-900/60 dark:text-white"
                          />
                        </div>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Hashtags</label>
                          <input
                            value={editForm.hashtags}
                            onChange={(event) => setEditForm((prev) => ({ ...prev, hashtags: event.target.value }))}
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-white/10 dark:bg-slate-900/60 dark:text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Goals</label>
                          <input
                            value={editForm.goals}
                            onChange={(event) => setEditForm((prev) => ({ ...prev, goals: event.target.value }))}
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-white/10 dark:bg-slate-900/60 dark:text-white"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editForm.isPublic}
                          onChange={(event) => setEditForm((prev) => ({ ...prev, isPublic: event.target.checked }))}
                          className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-300">Show in marketplace</span>
                      </div>
                      <Button type="submit" disabled={isSubmitting} className="text-xs sm:text-sm bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                        Save Changes
                      </Button>
                    </form>
                  )}
                </div>
              ) : null}
            </div>

            {collaboration && (
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="rounded-2xl border border-gray-200/60 bg-white/90 p-5 shadow-lg backdrop-blur-sm dark:border-white/10 dark:bg-slate-800/90 lg:col-span-2">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Invite Collaborator</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Invite a creator by user ID and assign a role.
                  </p>
                  <form onSubmit={handleInvite} className="mt-4 space-y-3">
                    <input
                      value={inviteForm.username}
                      onChange={(event) => setInviteForm((prev) => ({ ...prev, username: event.target.value }))}
                      required
                      placeholder="User ID"
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-white/10 dark:bg-slate-900/60 dark:text-white"
                    />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <select
                        value={inviteForm.role}
                        onChange={(event) => setInviteForm((prev) => ({ ...prev, role: event.target.value }))}
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-white/10 dark:bg-slate-900/60 dark:text-white"
                      >
                        <option value="co-creator">Co-creator</option>
                        <option value="featured">Featured</option>
                        <option value="guest">Guest</option>
                      </select>
                      <input
                        value={inviteForm.message}
                        onChange={(event) => setInviteForm((prev) => ({ ...prev, message: event.target.value }))}
                        placeholder="Optional message"
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-white/10 dark:bg-slate-900/60 dark:text-white"
                      />
                    </div>
                    <Button type="submit" disabled={isSubmitting} className="text-xs sm:text-sm bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                      Send Invite
                    </Button>
                  </form>
                </div>

                <div className="rounded-2xl border border-gray-200/60 bg-white/90 p-5 shadow-lg backdrop-blur-sm dark:border-white/10 dark:bg-slate-800/90">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Update Status</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Keep your collaboration state up to date.
                  </p>
                  <div className="mt-4 space-y-3">
                    <select
                      value={statusForm}
                      onChange={(event) => setStatusForm(event.target.value as Collaboration["status"])}
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-white/10 dark:bg-slate-900/60 dark:text-white"
                    >
                      {statusOptions.map((option) => (
                        <option key={option} value={option}>
                          {option.replace(/_/g, " ")}
                        </option>
                      ))}
                    </select>
                    <Button type="button" disabled={isSubmitting} onClick={handleStatusUpdate} className="text-xs sm:text-sm bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                      Update Status
                    </Button>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200/60 bg-white/90 p-5 shadow-lg backdrop-blur-sm dark:border-white/10 dark:bg-slate-800/90">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Respond to Invite</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Accept or decline the collaboration invite.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleRespondInvite("accept")}
                      className="text-xs sm:text-sm bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                    >
                      Accept
                    </Button>
                    <Button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleRespondInvite("decline")}
                      variant="outline"
                      className="text-xs text-red-600 border-red-300 sm:text-sm hover:bg-red-50"
                    >
                      Decline
                    </Button>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200/60 bg-white/90 p-5 shadow-lg backdrop-blur-sm dark:border-white/10 dark:bg-slate-800/90 lg:col-span-3">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Add Deliverable</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Track deliverables for this collaboration.
                  </p>
                  <form onSubmit={handleDeliverable} className="mt-4 space-y-3">
                    <div className="grid gap-3 md:grid-cols-2">
                      <input
                        value={deliverableForm.title}
                        onChange={(event) => setDeliverableForm((prev) => ({ ...prev, title: event.target.value }))}
                        required
                        placeholder="Deliverable title"
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-white/10 dark:bg-slate-900/60 dark:text-white"
                      />
                      <input
                        value={deliverableForm.assignedTo}
                        onChange={(event) => setDeliverableForm((prev) => ({ ...prev, assignedTo: event.target.value }))}
                        placeholder="Assigned user ID (optional)"
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-white/10 dark:bg-slate-900/60 dark:text-white"
                      />
                    </div>
                    <textarea
                      value={deliverableForm.description}
                      onChange={(event) => setDeliverableForm((prev) => ({ ...prev, description: event.target.value }))}
                      placeholder="Deliverable description"
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-white/10 dark:bg-slate-900/60 dark:text-white"
                      rows={3}
                    />
                    <div className="grid gap-3 md:grid-cols-2">
                      <input
                        type="date"
                        value={deliverableForm.dueDate}
                        onChange={(event) => setDeliverableForm((prev) => ({ ...prev, dueDate: event.target.value }))}
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-white/10 dark:bg-slate-900/60 dark:text-white"
                      />
                      <input
                        value={deliverableForm.files}
                        onChange={(event) => setDeliverableForm((prev) => ({ ...prev, files: event.target.value }))}
                        placeholder="File URLs (comma separated)"
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-white/10 dark:bg-slate-900/60 dark:text-white"
                      />
                    </div>
                    <Button type="submit" disabled={isSubmitting} className="text-xs sm:text-sm bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                      Add Deliverable
                    </Button>
                  </form>

                  {deliverables.length > 0 && (
                    <div className="mt-6 space-y-4">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Existing Deliverables</h3>
                      {deliverables.map((deliverable) => (
                        <div key={deliverable._id} className="rounded-xl border border-gray-200/60 bg-white/80 p-4 text-sm text-gray-600 shadow-sm dark:border-white/10 dark:bg-slate-900/40 dark:text-gray-300">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">{deliverable.title}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{deliverable.description || "No description"}</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <select
                                value={deliverableUpdates[deliverable._id || ""]?.status || deliverable.status}
                                onChange={(event) =>
                                  setDeliverableUpdates((prev) => ({
                                    ...prev,
                                    [deliverable._id || ""]: {
                                      ...prev[deliverable._id || ""],
                                      status: event.target.value,
                                    },
                                  }))
                                }
                                className="rounded-lg border border-gray-200 bg-white px-3 py-1 text-xs text-gray-700 shadow-sm dark:border-white/10 dark:bg-slate-900/60 dark:text-white"
                              >
                                <option value="pending">Pending</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                              </select>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => deliverable._id && handleDeliverableUpdate(deliverable._id)}
                                className="text-xs"
                              >
                                Update
                              </Button>
                            </div>
                          </div>
                          <input
                            value={deliverableUpdates[deliverable._id || ""]?.files || ""}
                            onChange={(event) =>
                              setDeliverableUpdates((prev) => ({
                                ...prev,
                                [deliverable._id || ""]: {
                                  ...prev[deliverable._id || ""],
                                  files: event.target.value,
                                },
                              }))
                            }
                            placeholder="File URLs (comma separated)"
                            className="mt-3 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-white/10 dark:bg-slate-900/60 dark:text-white"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {collaboration.status === "completed" && (
                  <div className="rounded-2xl border border-gray-200/60 bg-white/90 p-5 shadow-lg backdrop-blur-sm dark:border-white/10 dark:bg-slate-800/90 lg:col-span-3">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Leave a Review</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Share feedback about this collaboration.
                    </p>
                    <form onSubmit={handleReview} className="mt-4 space-y-3">
                      <div className="grid gap-3 md:grid-cols-2">
                        <select
                          value={reviewForm.rating}
                          onChange={(event) => setReviewForm((prev) => ({ ...prev, rating: event.target.value }))}
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-white/10 dark:bg-slate-900/60 dark:text-white"
                        >
                          {[5, 4, 3, 2, 1].map((value) => (
                            <option key={value} value={String(value)}>
                              {value} Stars
                            </option>
                          ))}
                        </select>
                        <input
                          value={reviewForm.comment}
                          onChange={(event) => setReviewForm((prev) => ({ ...prev, comment: event.target.value }))}
                          placeholder="Optional comment"
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-white/10 dark:bg-slate-900/60 dark:text-white"
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="text-xs sm:text-sm bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      >
                        Submit Review
                      </Button>
                    </form>
                  </div>
                )}

                {actionError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300 lg:col-span-3">
                    {actionError}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
