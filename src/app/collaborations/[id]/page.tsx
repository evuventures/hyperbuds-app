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
import CollaborationSummaryCards from "@/components/collaboration/detail/CollaborationSummaryCards";
import CollaborationEditForm from "@/components/collaboration/detail/CollaborationEditForm";
import CollaborationInviteForm from "@/components/collaboration/detail/CollaborationInviteForm";
import CollaborationStatusCard from "@/components/collaboration/detail/CollaborationStatusCard";
import CollaborationRespondCard from "@/components/collaboration/detail/CollaborationRespondCard";
import CollaborationDeliverablesCard from "@/components/collaboration/detail/CollaborationDeliverablesCard";
import CollaborationReviewCard from "@/components/collaboration/detail/CollaborationReviewCard";
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
  const creatorId = collaboration?.creator
    ? typeof collaboration.creator === "string"
      ? collaboration.creator
      : (collaboration.creator as { _id?: string; id?: string })._id ||
        (collaboration.creator as { id?: string }).id
    : undefined;
  const isOwner = Boolean(currentUserId && creatorId && currentUserId === creatorId);

  const ensureOwner = () => {
    if (isOwner) return true;
    setActionError("Only the collaboration creator can perform this action.");
    toast.error("Only the collaboration creator can perform this action.");
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
    if (!collaborationId || !ensureOwner()) return;
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
    if (!collaborationId || !ensureOwner()) return;
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
      <div className="min-h-screen bg-white dark:bg-slate-900">
        <div className="max-w-6xl mx-auto px-6 py-12 space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <BackLink onClick={() => router.back()} />
            <CollaborationNav />
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            {isLoading ? (
              <div className="flex flex-col justify-center items-center py-12 sm:py-16">
                <div className="mb-4 w-12 h-12 text-purple-600 animate-spin sm:w-16 sm:h-16">
                  <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                </div>
                <p className="text-base font-medium text-gray-600 sm:text-lg dark:text-gray-400">
                  Loading collaboration...
                </p>
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
                <CollaborationDetailHeader
                  title={collaboration.title}
                  description={collaboration.description}
                  isOwner={isOwner}
                  isEditing={isEditing}
                  isSubmitting={isSubmitting}
                  onToggleEdit={() => isOwner && setIsEditing((prev) => !prev)}
                  onDelete={handleDelete}
                />
                <CollaborationSummaryCards collaboration={collaboration} />
                {isEditing && isOwner && (
                  <CollaborationEditForm
                    editForm={editForm}
                    typeOptions={typeOptions}
                    platformOptions={platformOptions}
                    isSubmitting={isSubmitting}
                    onChange={(patch) => setEditForm((prev) => ({ ...prev, ...patch }))}
                    onSubmit={handleUpdateCollaboration}
                  />
                )}
              </div>
            ) : null}
          </div>

          {collaboration && (
            <div className="grid gap-6 lg:grid-cols-3">
              {isOwner && (
                <CollaborationInviteForm
                  inviteForm={inviteForm}
                  isSubmitting={isSubmitting}
                  onChange={(patch) => setInviteForm((prev) => ({ ...prev, ...patch }))}
                  onSubmit={handleInvite}
                />
              )}

              {isOwner && (
                <CollaborationStatusCard
                  status={statusForm}
                  statusOptions={statusOptions}
                  isSubmitting={isSubmitting}
                  onChange={setStatusForm}
                  onUpdate={handleStatusUpdate}
                />
              )}

              {/* <CollaborationRespondCard
                isSubmitting={isSubmitting}
                onAccept={() => handleRespondInvite("accept")}
                onDecline={() => handleRespondInvite("decline")}
              /> */}

              <CollaborationDeliverablesCard
                deliverables={deliverables}
                deliverableForm={deliverableForm}
                deliverableUpdates={deliverableUpdates}
                isSubmitting={isSubmitting}
                canEdit={isOwner}
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

              {collaboration.status === "completed" && (
                <CollaborationReviewCard
                  reviewForm={reviewForm}
                  isSubmitting={isSubmitting}
                  onChange={(patch) => setReviewForm((prev) => ({ ...prev, ...patch }))}
                  onSubmit={handleReview}
                />
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
    </DashboardLayout>
  );
}
