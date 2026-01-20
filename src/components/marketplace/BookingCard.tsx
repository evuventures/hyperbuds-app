"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, DollarSign, User, CheckCircle, Package } from "lucide-react";
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
    <Card className="hover:shadow-lg transition-all duration-200 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-500 shadow-md overflow-hidden">
      <CardHeader className="border-b-2 border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
              <Link
                href={`/marketplace/services/${serviceId}`}
                className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"
              >
                {serviceTitle}
              </Link>
            </CardTitle>
            <CardDescription className="mt-1 text-sm font-medium text-gray-600 dark:text-gray-400">
              Booking #{booking._id.slice(-8)}
            </CardDescription>
          </div>
          <div className="flex-shrink-0">
            <BookingStatusBadge status={booking.status} />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-6">
        {/* User Info */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
          <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {role === "buyer" ? "Provider: " : "Buyer: "}
          </span>
          <span className="text-sm font-bold text-gray-900 dark:text-white">
            {role === "buyer" ? sellerName : buyerName}
          </span>
        </div>

        {/* Package */}
        {booking.packageName && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
            <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Package:</span>
            <span className="text-sm font-bold text-gray-900 dark:text-white">{booking.packageName}</span>
          </div>
        )}

        {/* Amount */}
        <div className="flex items-center gap-2 p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800">
          <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Amount:</span>
          <span className="text-xl font-bold text-green-700 dark:text-green-400">
            {booking.currency || "USD"} {booking.amount.toFixed(2)}
          </span>
        </div>

        {/* Dates */}
        <div className="space-y-2">
          {booking.scheduledFor && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
              <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Scheduled:</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(booking.scheduledFor)}</span>
            </div>
          )}
          {booking.dueDate && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
              <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Due:</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(booking.dueDate)}</span>
            </div>
          )}
        </div>

        {/* Requirements */}
        {booking.requirements && (
          <div className="pt-4 border-t-2 border-gray-200 dark:border-gray-700">
            <p className="text-sm font-bold mb-2 text-gray-900 dark:text-white uppercase tracking-wide">Requirements:</p>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">{booking.requirements}</p>
          </div>
        )}

        {/* Message */}
        {booking.message && (
          <div className="pt-4 border-t-2 border-gray-200 dark:border-gray-700">
            <p className="text-sm font-bold mb-2 text-gray-900 dark:text-white uppercase tracking-wide">Message:</p>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">{booking.message}</p>
          </div>
        )}

        {/* Deliverables */}
        {booking.deliverables && booking.deliverables.length > 0 && (
          <div className="pt-4 border-t-2 border-gray-200 dark:border-gray-700">
            <p className="text-sm font-bold mb-3 text-gray-900 dark:text-white uppercase tracking-wide">Deliverables:</p>
            <div className="space-y-2">
              {booking.deliverables.map((deliverable, index) => (
                <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  {deliverable.url ? (
                    <a
                      href={deliverable.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-green-700 dark:text-green-400 hover:underline"
                    >
                      {deliverable.title || "View Deliverable"}
                    </a>
                  ) : (
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{deliverable.title || "Deliverable"}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timestamps */}
        <div className="pt-4 border-t-2 border-gray-200 dark:border-gray-700 space-y-1">
          {booking.createdAt && (
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
              <span className="font-semibold">Created:</span> {formatDate(booking.createdAt)}
            </p>
          )}
          {booking.updatedAt && booking.updatedAt !== booking.createdAt && (
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
              <span className="font-semibold">Updated:</span> {formatDate(booking.updatedAt)}
            </p>
          )}
        </div>
      </CardContent>

      <CardFooter className="border-t-2 border-gray-200 dark:border-gray-700 pt-4 bg-gray-50 dark:bg-gray-700/30">
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
