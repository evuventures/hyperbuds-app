"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle, XCircle, Loader, AlertCircle } from "lucide-react";
import type { Booking, BookingStatus } from "@/types/marketplace.types";

interface BookingActionsProps {
  booking: Booking;
  role: "buyer" | "seller";
  onStatusUpdate?: (bookingId: string, status: BookingStatus) => void;
}

export function BookingActions({ booking, role, onStatusUpdate }: BookingActionsProps) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedStatus, setSelectedStatus] = React.useState<BookingStatus | "">("");

  const handleStatusChange = (newStatus: BookingStatus) => {
    setSelectedStatus(newStatus);
    setDialogOpen(true);
  };

  const handleConfirm = () => {
    if (selectedStatus && onStatusUpdate) {
      onStatusUpdate(booking._id, selectedStatus);
      setDialogOpen(false);
      setSelectedStatus("");
    }
  };

  // Buyer actions
  if (role === "buyer") {
    if (booking.status === "pending") {
      return (
        <>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleStatusChange("cancelled")}
            className="w-full shadow-md"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Cancel Booking
          </Button>
          <StatusUpdateDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            booking={booking}
            newStatus={selectedStatus as BookingStatus}
            onConfirm={handleConfirm}
          />
        </>
      );
    }
    return null;
  }

  // Seller actions
  if (role === "seller") {
    if (booking.status === "pending") {
      return (
        <>
          <div className="flex gap-2 w-full">
            <Button
              variant="default"
              size="sm"
              onClick={() => handleStatusChange("accepted")}
              className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Accept
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleStatusChange("cancelled")}
              className="flex-1 shadow-md"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </Button>
          </div>
          <StatusUpdateDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            booking={booking}
            newStatus={selectedStatus as BookingStatus}
            onConfirm={handleConfirm}
          />
        </>
      );
    }

    if (booking.status === "accepted") {
      return (
        <>
          <Button
            variant="default"
            size="sm"
            onClick={() => handleStatusChange("in_progress")}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md"
          >
            <Loader className="w-4 h-4 mr-2" />
            Start Work
          </Button>
          <StatusUpdateDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            booking={booking}
            newStatus={selectedStatus as BookingStatus}
            onConfirm={handleConfirm}
          />
        </>
      );
    }

    if (booking.status === "in_progress") {
      return (
        <>
          <Button
            variant="default"
            size="sm"
            onClick={() => handleStatusChange("delivered")}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Mark as Delivered
          </Button>
          <StatusUpdateDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            booking={booking}
            newStatus={selectedStatus as BookingStatus}
            onConfirm={handleConfirm}
          />
        </>
      );
    }

    if (booking.status === "delivered") {
      return (
        <>
          <Button
            variant="default"
            size="sm"
            onClick={() => handleStatusChange("completed")}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Complete
          </Button>
          <StatusUpdateDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            booking={booking}
            newStatus={selectedStatus as BookingStatus}
            onConfirm={handleConfirm}
          />
        </>
      );
    }
  }

  return null;
}

interface StatusUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking;
  newStatus: BookingStatus;
  onConfirm: () => void;
}

function StatusUpdateDialog({
  open,
  onOpenChange,
  booking,
  newStatus,
  onConfirm,
}: StatusUpdateDialogProps) {
  const isDestructive = newStatus === "cancelled" || newStatus === "refunded";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isDestructive ? "Confirm Action" : "Update Booking Status"}
          </DialogTitle>
          <DialogDescription>
            {isDestructive
              ? `Are you sure you want to ${newStatus === "cancelled" ? "cancel" : "refund"} this booking? This action may not be reversible.`
              : `Update booking status from "${booking.status}" to "${newStatus}"?`}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant={isDestructive ? "destructive" : "default"}
            onClick={onConfirm}
          >
            {isDestructive ? (
              <>
                <AlertCircle className="w-4 h-4 mr-2" />
                Confirm
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Update
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default BookingActions;
