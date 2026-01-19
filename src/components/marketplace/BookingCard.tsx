"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, DollarSign, User, CheckCircle, XCircle, Loader, Package } from "lucide-react";
import type { Booking, BookingStatus } from "@/types/marketplace.types";
import { BookingStatusBadge } from "./BookingStatusBadge";
import { BookingActions } from "./BookingActions";

interface BookingCardProps {
  booking: Booking;
  role: "buyer" | "seller";
  onStatusUpdate?: (bookingId: string, status: BookingStatus) => void;
}

export function BookingCard({ booking, role, onStatusUpdate }: BookingCardProps) {
  const serviceTitle =
    typeof booking.serviceId === "object" && booking.serviceId
      ? booking.serviceId.title
      : "Service";
  const serviceId =
    typeof booking.serviceId === "object" && booking.serviceId
      ? booking.serviceId._id
      : booking.serviceId;

  const buyerName =
    typeof booking.buyerId === "object" && booking.buyerId
      ? booking.buyerId.name || booking.buyerId.username || "Unknown"
      : "Unknown";
  const sellerName =
    typeof booking.sellerId === "object" && booking.sellerId
      ? booking.sellerId.name || booking.sellerId.username || "Unknown"
      : "Unknown";

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not set";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Card className="hover:shadow-md transition-all duration-200 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600">
      <CardHeader className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg text-gray-900 dark:text-white">
              <Link
                href={`/marketplace/services/${serviceId}`}
                className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                {serviceTitle}
              </Link>
            </CardTitle>
            <CardDescription className="mt-1 text-gray-600 dark:text-gray-400">
              Booking #{booking._id.slice(-8)}
            </CardDescription>
          </div>
          <BookingStatusBadge status={booking.status} />
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-6">
        {/* User Info */}
        <div className="flex items-center gap-2 text-sm">
          <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span className="text-gray-600 dark:text-gray-400">
            {role === "buyer" ? "Provider: " : "Buyer: "}
          </span>
          <span className="font-medium text-gray-900 dark:text-white">
            {role === "buyer" ? sellerName : buyerName}
          </span>
        </div>

        {/* Package */}
        {booking.packageName && (
          <div className="flex items-center gap-2 text-sm">
            <Package className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <span className="text-gray-600 dark:text-gray-400">Package:</span>
            <span className="font-medium text-gray-900 dark:text-white">{booking.packageName}</span>
          </div>
        )}

        {/* Amount */}
        <div className="flex items-center gap-2 text-sm">
          <DollarSign className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span className="text-gray-600 dark:text-gray-400">Amount:</span>
          <span className="font-bold text-lg text-gray-900 dark:text-white">
            {booking.currency || "USD"} {booking.amount.toFixed(2)}
          </span>
        </div>

        {/* Dates */}
        <div className="space-y-2">
          {booking.scheduledFor && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">Scheduled:</span>
              <span className="text-gray-900 dark:text-white">{formatDate(booking.scheduledFor)}</span>
            </div>
          )}
          {booking.dueDate && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">Due:</span>
              <span className="text-gray-900 dark:text-white">{formatDate(booking.dueDate)}</span>
            </div>
          )}
        </div>

        {/* Requirements */}
        {booking.requirements && (
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium mb-1 text-gray-900 dark:text-white">Requirements:</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{booking.requirements}</p>
          </div>
        )}

        {/* Message */}
        {booking.message && (
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium mb-1 text-gray-900 dark:text-white">Message:</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{booking.message}</p>
          </div>
        )}

        {/* Deliverables */}
        {booking.deliverables && booking.deliverables.length > 0 && (
          <div className="pt-2 border-t">
            <p className="text-sm font-medium mb-2">Deliverables:</p>
            <div className="space-y-1">
              {booking.deliverables.map((deliverable, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  {deliverable.url ? (
                    <a
                      href={deliverable.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {deliverable.title || "View Deliverable"}
                    </a>
                  ) : (
                    <span>{deliverable.title || "Deliverable"}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timestamps */}
        <div className="pt-2 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-500">
          {booking.createdAt && (
            <p>Created: {formatDate(booking.createdAt)}</p>
          )}
          {booking.updatedAt && booking.updatedAt !== booking.createdAt && (
            <p>Updated: {formatDate(booking.updatedAt)}</p>
          )}
        </div>
      </CardContent>

      <CardFooter className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <BookingActions
          booking={booking}
          role={role}
          onStatusUpdate={onStatusUpdate}
        />
      </CardFooter>
    </Card>
  );
}

export default BookingCard;
