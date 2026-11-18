"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, Edit3, Loader2, MapPin, ShieldCheck, Star, Trash2 } from "lucide-react";
import { MarketplaceService } from "@/types/marketplace.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { marketplaceApi } from "@/lib/api/marketplace.api";
import { useState } from "react";

interface ServiceCardProps {
  service: MarketplaceService;
  ownerView?: boolean;
}

export const ServiceCard = ({ service, ownerView = false }: ServiceCardProps) => {
  const queryClient = useQueryClient();
  const [confirming, setConfirming] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => marketplaceApi.deleteService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-services"] });
      queryClient.invalidateQueries({ queryKey: ["marketplace-all"] });
    },
  });

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 4000);
      return;
    }
    deleteMutation.mutate(service._id);
  };

  const hasMeasuredRating = (service.rating?.count ?? 0) > 0;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-800">
      {/* Airbnb-Inspired Media Header */}
      <Link href={`/marketplace/services/${service._id}`} className="block">
        <div className="relative h-44 w-full overflow-hidden border-b border-slate-100 bg-slate-100 dark:border-slate-800 dark:bg-slate-800/70">
          {service.images && service.images.length > 0 ? (
            <Image
              src={service.images[0]}
              alt={service.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-slate-900 text-slate-300">
              <span className="rounded-md border border-slate-700 bg-slate-800 px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider text-indigo-300">
                {service.category || "Service"}
              </span>
              <span className="mt-2 text-xs text-slate-400">Studio deliverable listing</span>
            </div>
          )}

          {service.featured && (
            <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-slate-800 shadow-xs dark:border-slate-700 dark:bg-slate-900/95 dark:text-slate-100">
              <ShieldCheck size={12} className="text-indigo-600 dark:text-indigo-400" />
              <span>Featured</span>
            </div>
          )}
        </div>
      </Link>

      {/* Card Body */}
      <div className="flex grow flex-col justify-between p-5">
        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="rounded bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
              {service.category}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-400">
              <Star size={12} className={hasMeasuredRating ? "fill-amber-400 text-amber-400" : "text-slate-400"} />
              {hasMeasuredRating
                ? `${Number(service.rating?.average || 0).toFixed(1)} (${service.rating?.count})`
                : "New"}
            </span>
          </div>

          <Link href={`/marketplace/services/${service._id}`} className="block group/title">
            <h3 className="line-clamp-1 text-base font-bold text-slate-900 transition-colors group-hover/title:text-indigo-600 dark:text-white dark:group-hover/title:text-indigo-400">
              {service.title}
            </h3>
            <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              {service.description}
            </p>
          </Link>

          {/* Delivery & Location Meta */}
          <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
            {service.deliveryTime && (
              <span className="inline-flex items-center gap-1">
                <Clock size={12} /> {service.deliveryTime}
              </span>
            )}
            {service.location && (
              <span className="inline-flex items-center gap-1">
                <MapPin size={12} /> {service.location}
              </span>
            )}
          </div>
        </div>

        {/* Price & Action Footer */}
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3.5 dark:border-slate-800">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Starting at</p>
            <div className="mt-0.5 flex items-baseline gap-1">
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                {Number(service.price || 0).toLocaleString()}
              </span>
              <span className="text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400">
                {service.currency || "USD"}
              </span>
            </div>
          </div>

          <Link
            href={`/marketplace/services/${service._id}`}
            aria-label={`View ${service.title}`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition group-hover:border-indigo-600 group-hover:bg-indigo-600 group-hover:text-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            View <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Owner Actions Overlay */}
      {ownerView && (
        <div className="absolute right-3 top-3 flex gap-1.5">
          <Link
            href={`/marketplace/services/${service._id}/edit`}
            className="rounded-lg border border-slate-200 bg-white/95 p-2 text-slate-700 shadow-xs transition hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900/95 dark:text-slate-200"
            title="Edit Service"
          >
            <Edit3 size={14} />
          </Link>

          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className={`rounded-lg border p-2 shadow-xs transition ${
              confirming
                ? "border-red-500 bg-red-600 text-white"
                : "border-slate-200 bg-white/95 text-slate-700 hover:text-red-600 dark:border-slate-700 dark:bg-slate-900/95 dark:text-slate-200"
            }`}
            title={confirming ? "Confirm Delete" : "Delete Service"}
          >
            {deleteMutation.isPending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Trash2 size={14} />
            )}
          </button>
        </div>
      )}
    </article>
  );
};
