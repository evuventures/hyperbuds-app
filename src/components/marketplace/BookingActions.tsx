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
import { CheckCircle, XCircle, Loader, AlertCircle, Archive, ArchiveRestore } from "lucide-react";
import type { Booking, BookingStatus } from "@/types/marketplace.types";
import { useBookingArchive } from "@/hooks/features/useBookingArchive";
import { useToast } from "@/hooks/ui/useToast";

interface BookingActionsProps {
  booking: Booking;
  role: "buyer" | "seller";
  onStatusUpdate?: (bookingId: string, status: BookingStatus) => void;
  isArchived?: boolean;
}

export function BookingActions({ booking, role, onStatusUpdate, isArchived = false }: BookingActionsProps) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedStatus, setSelectedStatus] = React.useState<BookingStatus | "">("");
  const { archiveBooking, unarchiveBooking } = useBookingArchive();
  const { toast } = useToast();

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

  const handleArchive = () => {
    archiveBooking(booking._id);
    toast({
      title: "Booking archived",
      description: "This booking has been hidden from your list",
      variant: "success",
      duration: 3000,
    });
  };

  const handleUnarchive = () => {
    unarchiveBooking(booking._id);
    toast({
      title: "Booking unarchived",
      description: "This booking has been restored to your list",
      variant: "success",
      duration: 3000,
    });
    // Reload the page to ensure the booking list updates immediately
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  // If archived, show only unarchive button
  if (isArchived) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleUnarchive}
        className="w-full border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer font-semibold"
      >
        <ArchiveRestore className="w-4 h-4 mr-2" />
        Unarchive
      </Button>
    );
  }

  // Buyer actions
  if (role === "buyer") {
    if (booking.status === "pending") {
      return (
        <>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleStatusChange("cancelled")}
            className="w-full shadow-md cursor-pointer bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white font-semibold border-2 border-red-700 dark:border-red-800"
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

    // Archive button for delivered/completed bookings
    if (booking.status === "delivered" || booking.status === "completed") {
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={handleArchive}
          className="w-full border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer font-semibold"
        >
          <Archive className="w-4 h-4 mr-2" />
          Archive
        </Button>
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
              className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md cursor-pointer"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Accept
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleStatusChange("cancelled")}
              className="flex-1 shadow-md cursor-pointer bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white font-semibold border-2 border-red-700 dark:border-red-800"
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
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md cursor-pointer"
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
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md cursor-pointer"
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
          <div className="flex flex-col gap-2 w-full">
            <Button
              variant="default"
              size="sm"
              onClick={() => handleStatusChange("completed")}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md cursor-pointer"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Complete
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleArchive}
              className="w-full border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer font-semibold"
            >
              <Archive className="w-4 h-4 mr-2" />
              Archive
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

    // Archive button for completed bookings (seller)
    if (booking.status === "completed") {
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={handleArchive}
          className="w-full border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer font-semibold"
        >
          <Archive className="w-4 h-4 mr-2" />
          Archive
        </Button>
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
      <DialogContent className="max-w-md bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 shadow-2xl [&>button]:text-gray-900 [&>button]:dark:text-white [&>button]:bg-white [&>button]:dark:bg-gray-700 [&>button]:border-2 [&>button]:border-gray-300 [&>button]:dark:border-gray-600 [&>button]:hover:bg-gray-100 [&>button]:dark:hover:bg-gray-600 [&>button]:opacity-100 [&>button]:cursor-pointer [&>button]:rounded-md [&>button]:p-1.5">
        <DialogHeader className="border-b-2 border-gray-200 dark:border-gray-700 pb-4">
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            {isDestructive ? "Confirm Action" : "Update Booking Status"}
          </DialogTitle>
          <DialogDescription className="text-base font-medium text-gray-700 dark:text-gray-200 mt-3 leading-relaxed">
            {isDestructive
              ? `Are you sure you want to ${newStatus === "cancelled" ? "cancel" : "refund"} this booking? This action may not be reversible.`
              : `Update booking status from "${booking.status}" to "${newStatus}"?`}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {isDestructive
              ? "This action cannot be undone. Please confirm to proceed."
              : "Click confirm to update the booking status."}
          </p>
        </div>
        <DialogFooter className="border-t-2 border-gray-200 dark:border-gray-700 pt-4 gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer font-semibold"
          >
            Cancel
          </Button>
          <Button
            variant={isDestructive ? "destructive" : "default"}
            onClick={onConfirm}
            className={`cursor-pointer font-bold text-base px-6 py-2 ${isDestructive
              ? "bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white border-2 border-red-700 dark:border-red-800 shadow-md"
              : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-2 border-purple-700 dark:border-purple-800 shadow-md"
              }`}
          >
            {isDestructive ? (
              <>
                <AlertCircle className="w-5 h-5 mr-2" />
                Confirm
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
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
