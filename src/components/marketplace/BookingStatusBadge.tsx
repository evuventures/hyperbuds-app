"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import type { BookingStatus } from "@/types/marketplace.types";
import { CheckCircle, XCircle, Loader, Clock, Package, DollarSign } from "lucide-react";

interface BookingStatusBadgeProps {
  status: BookingStatus;
}

const statusConfig: Record<
  BookingStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }
> = {
  pending: {
    label: "Pending",
    variant: "secondary",
    icon: <Clock className="w-3 h-3 text-yellow-700 dark:text-yellow-300" />,
  },
  accepted: {
    label: "Accepted",
    variant: "default",
    icon: <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400" />,
  },
  in_progress: {
    label: "In Progress",
    variant: "default",
    icon: <Loader className="w-3 h-3 text-blue-600 dark:text-blue-400" />,
  },
  delivered: {
    label: "Delivered",
    variant: "default",
    icon: <Package className="w-3 h-3 text-purple-600 dark:text-purple-400" />,
  },
  completed: {
    label: "Completed",
    variant: "default",
    icon: <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400" />,
  },
  cancelled: {
    label: "Cancelled",
    variant: "destructive",
    icon: <XCircle className="w-3 h-3 text-red-700 dark:text-red-300" />,
  },
  refunded: {
    label: "Refunded",
    variant: "outline",
    icon: <DollarSign className="w-3 h-3 text-gray-700 dark:text-gray-300" />,
  },
};

export function BookingStatusBadge({ status }: BookingStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending;

  // Custom styling for all statuses to ensure visibility
  const getStatusStyles = () => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700";
      case "accepted":
        return "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700";
      case "in_progress":
        return "bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700";
      case "delivered":
        return "bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-700";
      case "completed":
        return "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700";
      case "cancelled":
        return "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700";
      case "refunded":
        return "bg-gray-100 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600";
      default:
        return "";
    }
  };

  return (
    <Badge
      variant={config.variant}
      className={`flex items-center gap-1.5 px-3 py-1.5 font-bold text-sm shadow-md border-2 whitespace-nowrap min-w-fit ${getStatusStyles()}`}
    >
      {config.icon}
      <span className="font-bold leading-tight">{config.label}</span>
    </Badge>
  );
}

export default BookingStatusBadge;
