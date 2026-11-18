"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/Dashboard/Dashboard";
import { collaborationApi } from "@/lib/api/collaboration.api";
import type { Collaboration } from "@/types/collaboration.types";
import { useAuth } from "@/hooks/auth/useAuth";
import BackLink from "@/components/collaboration/BackLink";
import CollaborationNav from "@/components/collaboration/CollaborationNav";
import CollaborationDetailHeader from "@/components/collaboration/detail/CollaborationDetailHeader";
import CollaborationEditForm from "@/components/collaboration/detail/CollaborationEditForm";
import CollaborationInviteForm from "@/components/collaboration/detail/CollaborationInviteForm";
import CollaborationStatusCard from "@/components/collaboration/detail/CollaborationStatusCard";
import CollaborationRespondCard from "@/components/collaboration/detail/CollaborationRespondCard";
import CollaborationDeliverablesCard from "@/components/collaboration/detail/CollaborationDeliverablesCard";
import CollaborationReviewCard from "@/components/collaboration/detail/CollaborationReviewCard";
import { Calendar, Layers, MapPin, ShieldCheck, Users } from "lucide-react";
import toast from "react-hot-toast";
import type {
  DeliverableFormState,
  DeliverableUpdateState,
  EditFormState,
  InviteFormState,
  ReviewFormState,
} from "@/components/collaboration/detail/types";

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

const defaultEditForm: EditFormState = {
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
};

export default function CollaborationPage({ params }: CollaborationPageProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [collaboration, setCollaboration] = useState<Collaboration | null>(null);
  const [collaborationId, setCollaborationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [inviteForm, setInviteForm] = useState<InviteFormState>({
    username: "",
    role: "co-creator",
    message: "",
  });
  const [statusForm, setStatusForm] = useState<Collaboration["status"]>("draft");
  const [deliverableForm, setDeliverableForm] = useState<DeliverableFormState>({
    title: "",
    description: "",
    dueDate: "",
    assignedTo: "",
    files: "",
  });
  const [deliverableUpdates, setDeliverableUpdates] = useState<DeliverableUpdateState>({});
  const [editForm, setEditForm] = useState<EditFormState>(defaultEditForm);
  const [reviewForm, setReviewForm] = useState<ReviewFormState>({
    rating: "5",
    comment: "",
  });

  const currentUserId = user?.id || (user as { _id?: string })?._id;
  const extractUserId = (ref?: unknown): string | undefined => {
    if (!ref) return undefined;
    if (typeof ref === "string") return ref;
    if (typeof ref === "object") {
      const obj = ref as { _id?: string; id?: string };
      return obj._id || obj.id;
    }
    return undefined;
  };
  const creatorId = extractUserId(collaboration?.creator);
  const isOwner = Boolean(currentUserId && creatorId && currentUserId === creatorId);
  const myCollaboratorEntry = useMemo(
    () =>
      collaboration?.collaborators?.find(
        (c) => currentUserId && extractUserId(c.user) === currentUserId
      ),
    [collaboration, currentUserId]
  );
  const isInvitedCollaborator = myCollaboratorEntry?.status === "invited";
  const isAcceptedCollaborator = myCollaboratorEntry?.status === "accepted";
  const canManageDeliverables = isOwner || isAcceptedCollaborator;

  const ensureOwner = () => {
    if (isOwner) return true;
    setActionError("Only the collaboration creator can perform this action.");
    toast.error("Only the collaboration creator can perform this action.");
    return false;
  };

  const ensureDeliverableAccess = () => {
    if (canManageDeliverables) return true;
    setActionError("Only active collaborators can manage deliverables.");
    toast.error("Only active collaborators can manage deliverables.");
    return false;
  };

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
        }, {} as DeliverableUpdateState)
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

  useEffect(() => {
    if (!isOwner && isEditing) {
      setIsEditing(false);
    }
  }, [isOwner, isEditing]);

  const handleStatusUpdate = async () => {
    if (!collaborationId || !ensureOwner()) return;
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
    if (!collaborationId || !ensureOwner()) return;
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
    if (!collaborationId || !ensureDeliverableAccess()) return;
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
    if (!collaborationId || !ensureDeliverableAccess()) return;
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
    if (!collaborationId || !ensureOwner()) return;
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
          goals: editForm.goals ? editForm.goals.split(",").map((item) => item.trim()).filter(Boolean) : undefined,
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
    if (!collaborationId || !ensureOwner()) return;
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
      <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
          {/* Linear Top Workspace Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <BackLink onClick={() => router.back()} />
              {collaboration && (
                <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>/</span>
                  <span className="font-mono uppercase text-slate-600 dark:text-slate-300">
                    WS-{String(collaboration._id || collaboration.id || "01").slice(-4)}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold capitalize text-indigo-700 border border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                    {(collaboration.status || "pending").replace(/_/g, " ")}
                  </span>
                </div>
              )}
            </div>
            <CollaborationNav />
          </div>

          {isLoading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
              <div className="mx-auto mb-4 w-10 h-10 text-indigo-600 animate-spin">
                <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Loading collaboration workspace...
              </p>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50/70 p-8 text-center dark:border-red-900/50 dark:bg-red-950/30">
              <p className="text-base font-semibold text-red-700 dark:text-red-300">
                Failed to load collaboration
              </p>
              <p className="mt-1 text-xs sm:text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          ) : collaboration ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
              {/* Left / Main Linear Project Pane (8 columns) */}
              <div className="space-y-6 lg:col-span-8 min-w-0">
                {/* Project Title & Description Card */}
                <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                  <CollaborationDetailHeader
                    title={collaboration.title}
                    description={collaboration.description}
                    isOwner={isOwner}
                    isEditing={isEditing}
                    isSubmitting={isSubmitting}
                    onToggleEdit={() => isOwner && setIsEditing((prev) => !prev)}
                    onDelete={handleDelete}
                  />

                  {isEditing && isOwner && (
                    <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
                      <CollaborationEditForm
                        editForm={editForm}
                        typeOptions={typeOptions}
                        platformOptions={platformOptions}
                        isSubmitting={isSubmitting}
                        onChange={(patch) => setEditForm((prev) => ({ ...prev, ...patch }))}
                        onSubmit={handleUpdateCollaboration}
                      />
                    </div>
                  )}
                </section>

                {/* Invited Collaborator Action Banner */}
                {isInvitedCollaborator && (
                  <CollaborationRespondCard
                    isSubmitting={isSubmitting}
                    onAccept={() => handleRespondInvite("accept")}
                    onDecline={() => handleRespondInvite("decline")}
                  />
                )}

                {/* Linear Issue-List Deliverables Card */}
                <CollaborationDeliverablesCard
                  deliverables={deliverables}
                  deliverableForm={deliverableForm}
                  deliverableUpdates={deliverableUpdates}
                  isSubmitting={isSubmitting}
                  canEdit={canManageDeliverables}
                  onChangeForm={(patch) => setDeliverableForm((prev) => ({ ...prev, ...patch }))}
                  onChangeUpdate={(id, patch) =>
                    setDeliverableUpdates((prev) => ({
                      ...prev,
                      [id]: {
                        ...prev[id],
                        ...patch,
                      },
                    }))
                  }
                  onAddDeliverable={handleDeliverable}
                  onUpdateDeliverable={handleDeliverableUpdate}
                />

                {/* Reviews Section */}
                {collaboration.status === "completed" && (
                  <CollaborationReviewCard
                    reviewForm={reviewForm}
                    isSubmitting={isSubmitting}
                    onChange={(patch) => setReviewForm((prev) => ({ ...prev, ...patch }))}
                    onSubmit={handleReview}
                  />
                )}

                {((collaboration.rating?.reviews && collaboration.rating.reviews.length > 0) ||
                  (Array.isArray((collaboration as { reviews?: unknown[] }).reviews) &&
                    ((collaboration as { reviews?: unknown[] }).reviews?.length ?? 0) > 0)) && (
                  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                      <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                        Workspace Reviews
                      </h2>
                      {collaboration.rating?.overall !== undefined && (
                        <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                          Average: {Number(collaboration.rating.overall).toFixed(1)} / 5
                        </span>
                      )}
                    </div>
                    <div className="space-y-2.5">
                      {(
                        collaboration.rating?.reviews ||
                        (
                          collaboration as {
                            reviews?: { reviewer?: unknown; rating: number; comment?: string }[];
                          }
                        ).reviews ||
                        []
                      ).map((rev, idx) => (
                        <div
                          key={idx}
                          className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 text-xs sm:text-sm dark:border-slate-800 dark:bg-slate-800/40"
                        >
                          <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-slate-100">
                            <span>
                              {typeof rev.reviewer === "object" && rev.reviewer
                                ? (rev.reviewer as { displayName?: string; username?: string }).displayName ||
                                  (rev.reviewer as { username?: string }).username ||
                                  "Collaborator"
                                : "Collaborator"}
                            </span>
                            <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                              Rating: {rev.rating}/5
                            </span>
                          </div>
                          {rev.comment && (
                            <p className="mt-1.5 text-slate-600 dark:text-slate-300">{rev.comment}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {actionError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
                    {actionError}
                  </div>
                )}
              </div>

              {/* Right Linear Inspector Sidebar (4 columns) */}
              <aside className="space-y-5 lg:col-span-4 min-w-0">
                {/* Linear Project Properties Inspector */}
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3.5 pb-2 border-b border-slate-100 dark:border-slate-800">
                    Project Properties
                  </h2>
                  <dl className="space-y-3 text-xs sm:text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <dt className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <Layers size={14} />
                        <span>Status</span>
                      </dt>
                      <dd className="font-semibold capitalize text-slate-900 dark:text-white">
                        {(collaboration.status || "pending").replace(/_/g, " ")}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <dt className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <Layers size={14} />
                        <span>Type</span>
                      </dt>
                      <dd className="font-semibold capitalize text-slate-900 dark:text-white">
                        {(collaboration.type || "other").replace(/_/g, " ")}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <dt className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <Calendar size={14} />
                        <span>Scheduled Date</span>
                      </dt>
                      <dd className="font-medium text-slate-900 dark:text-white">
                        {collaboration.details?.scheduledDate
                          ? new Date(collaboration.details.scheduledDate).toLocaleDateString()
                          : "TBD"}
                      </dd>
                    </div>
                    {collaboration.details?.location && (
                      <div className="flex items-center justify-between gap-2">
                        <dt className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                          <MapPin size={14} />
                          <span>Location</span>
                        </dt>
                        <dd className="font-medium text-slate-900 dark:text-white">
                          {collaboration.details.location}
                        </dd>
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-2">
                      <dt className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <Users size={14} />
                        <span>Collaborators</span>
                      </dt>
                      <dd className="font-semibold text-slate-900 dark:text-white">
                        {collaboration.collaborators?.length || 0}
                      </dd>
                    </div>
                  </dl>
                </section>

                {/* Pinned Startup Proposal Terms Card */}
                {collaboration.pinnedAgreement &&
                  (collaboration.pinnedAgreement.role ||
                    collaboration.pinnedAgreement.compensationType ||
                    collaboration.pinnedAgreement.salary !== undefined ||
                    collaboration.pinnedAgreement.equity !== undefined) && (
                    <section className="rounded-2xl border border-indigo-200 bg-indigo-50/70 p-5 shadow-xs dark:border-indigo-900/60 dark:bg-indigo-950/30">
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-indigo-200/70 dark:border-indigo-800/60">
                        <h3 className="flex items-center gap-1.5 text-sm font-bold text-indigo-950 dark:text-indigo-200">
                          <ShieldCheck size={16} className="text-indigo-600 dark:text-indigo-400" />
                          Pinned Startup Proposal Terms
                        </h3>
                        <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300 capitalize">
                          {collaboration.pinnedAgreement.status || "active"}
                        </span>
                      </div>

                      <dl className="mt-3 space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
                        {collaboration.pinnedAgreement.role && (
                          <div className="flex justify-between gap-2">
                            <dt className="text-slate-500 dark:text-slate-400">Role</dt>
                            <dd className="font-semibold text-right">{collaboration.pinnedAgreement.role}</dd>
                          </div>
                        )}
                        {collaboration.pinnedAgreement.compensationType && (
                          <div className="flex justify-between gap-2">
                            <dt className="text-slate-500 dark:text-slate-400">Compensation</dt>
                            <dd className="font-semibold capitalize">
                              {collaboration.pinnedAgreement.compensationType}
                            </dd>
                          </div>
                        )}
                        {collaboration.pinnedAgreement.salary !== undefined && (
                          <div className="flex justify-between gap-2">
                            <dt className="text-slate-500 dark:text-slate-400">Proposed Salary</dt>
                            <dd className="font-semibold">
                              ${collaboration.pinnedAgreement.salary.toLocaleString()}/yr
                            </dd>
                          </div>
                        )}
                        {collaboration.pinnedAgreement.equity !== undefined && (
                          <div className="flex justify-between gap-2">
                            <dt className="text-slate-500 dark:text-slate-400">Proposed Equity</dt>
                            <dd className="font-semibold">{collaboration.pinnedAgreement.equity}%</dd>
                          </div>
                        )}
                        {collaboration.pinnedAgreement.vesting && (
                          <div className="flex justify-between gap-2">
                            <dt className="text-slate-500 dark:text-slate-400">Vesting</dt>
                            <dd className="font-medium text-right">{collaboration.pinnedAgreement.vesting}</dd>
                          </div>
                        )}
                      </dl>

                      <p className="mt-3 pt-2.5 border-t border-indigo-200/60 dark:border-indigo-800/50 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                        Recorded Startup &amp; Talent Hub proposal terms. Not an executed legal contract until completed off-platform.
                      </p>
                    </section>
                  )}

                {/* Collaborator Roster Inspector Card */}
                {collaboration.collaborators && collaboration.collaborators.length > 0 && (
                  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                      Collaborator Roster
                    </h3>
                    <div className="space-y-2.5">
                      {collaboration.collaborators.map((entry, index) => {
                        const u = entry.user;
                        const label =
                          typeof u === "object" && u
                            ? u.displayName || u.username || u.email || u._id
                            : String(u || "Collaborator");
                        const initial = String(label || "C").charAt(0).toUpperCase();
                        return (
                          <div
                            key={index}
                            className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-800/40"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white">
                                {initial}
                              </span>
                              <div className="min-w-0">
                                <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                                  {label}
                                </p>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                  ({entry.role})
                                </p>
                              </div>
                            </div>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[11px] font-medium capitalize shrink-0 ${
                                entry.status === "accepted"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                                  : entry.status === "declined"
                                  ? "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800"
                                  : "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800"
                              }`}
                            >
                              {entry.status}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}

                {/* Owner Workspace Controls */}
                {isOwner && (
                  <div className="space-y-5">
                    <CollaborationStatusCard
                      status={statusForm}
                      statusOptions={statusOptions}
                      isSubmitting={isSubmitting}
                      onChange={setStatusForm}
                      onUpdate={handleStatusUpdate}
                    />
                    <CollaborationInviteForm
                      inviteForm={inviteForm}
                      isSubmitting={isSubmitting}
                      onChange={(patch) => setInviteForm((prev) => ({ ...prev, ...patch }))}
                      onSubmit={handleInvite}
                    />
                  </div>
                )}
              </aside>
            </div>
          ) : null}
        </div>
      </div>
    </DashboardLayout>
  );
}
