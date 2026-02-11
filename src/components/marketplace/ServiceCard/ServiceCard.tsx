"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Edit3, Trash2, Loader2, ShieldCheck } from "lucide-react";
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
    e.preventDefault(); // Prevent navigating to details when clicking delete
    if (!confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 4000);
      return;
    }
    deleteMutation.mutate(service._id);
  };

  return (
    <div className="relative group bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-3xl flex flex-col overflow-hidden hover:border-purple-500/50 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-purple-500/5">
      
      {/* SERVICE IMAGE */}
      <Link href={`/marketplace/services/${service._id}`} className="block">
        <div className="relative w-full h-48 overflow-hidden bg-gray-100 dark:bg-gray-800">
          {service.images && service.images.length > 0 ? (
            <Image
              src={service.images[0]}
              alt={service.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-700">
              <span className="text-xs font-medium">No Preview Available</span>
            </div>
          )}
          
          {/* Featured Badge */}
          {service.featured && (
            <div className="absolute top-4 left-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-700 flex items-center gap-1.5 shadow-sm">
              <ShieldCheck size={12} className="text-purple-500" />
              <span className="text-xs  text-gray-500 dark:text-gray-100  ">Featured</span>
            </div>
          )}
        </div>
      </Link>

      {/* CARD BODY */}
      <div className="p-6 flex flex-col grow">
        <div className="mb-3">
          <span className="text-xs text-purple-600 dark:text-purple-400 uppercase">
            {service.category}
          </span>
        </div>

        <Link href={`/marketplace/services/${service._id}`} className="grow group/title">
          <h3 className="text-xl font-bold  text-gray-700 dark:text-gray-100 group-hover/title:text-purple-600 dark:group-hover/title:text-purple-400 transition-colors line-clamp-1">
            {service.title}
          </h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm ">
            {service.description}
          </p>
        </Link>

        {/* PRICE & ACTION */}
        <div className="mt-6 pt-5 border-t border-gray-300 dark:border-gray-800 flex items-center justify-between">
          <div className="flex flex-col">
            
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-gray-900 dark:text-gray-100">{service.price}</span>
              <span className="text-[9px] font-bold text-gray-400 uppercase">{service.currency || "USD"}</span>
            </div>
          </div>
          
          <Link 
            href={`/marketplace/services/${service._id}`}
            className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center group-hover:bg-linear-to-r group-hover:from-purple-500 group-hover:to-blue-500 group-hover:text-white transition-all duration-300 shadow-sm"
          >
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>

      {/* OWNER ACTIONS Overlay */}
      {ownerView && (
        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-y-1 group-hover:translate-y-0">
          <Link
            href={`/marketplace/services/${service._id}/edit`}
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md text-gray-600 dark:text-gray-300 p-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:text-purple-600 dark:hover:text-purple-400 shadow-lg transition-all"
            title="Edit Service"
          >
            <Edit3 size={14} />
          </Link>

          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className={`p-2 rounded-lg backdrop-blur-md border shadow-lg transition-all ${
              confirming
                ? "bg-red-500 text-white border-red-400"
                : "bg-white/90 dark:bg-gray-800/90 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:text-red-500"
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
    </div>
  );
};