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
    icon: <Clock className="w-3 h-3" />,
  },
  accepted: {
    label: "Accepted",
    variant: "default",
    icon: <CheckCircle className="w-3 h-3" />,
  },
  in_progress: {
    label: "In Progress",
    variant: "default",
    icon: <Loader className="w-3 h-3" />,
  },
  delivered: {
    label: "Delivered",
    variant: "default",
    icon: <Package className="w-3 h-3" />,
  },
  completed: {
    label: "Completed",
    variant: "default",
    icon: <CheckCircle className="w-3 h-3" />,
  },
  cancelled: {
    label: "Cancelled",
    variant: "destructive",
    icon: <XCircle className="w-3 h-3" />,
  },
  refunded: {
    label: "Refunded",
    variant: "outline",
    icon: <DollarSign className="w-3 h-3" />,
  },
};

export function BookingStatusBadge({ status }: BookingStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <Badge variant={config.variant} className="flex items-center gap-1">
      {config.icon}
      {config.label}
    </Badge>
  );
}

export default BookingStatusBadge;
