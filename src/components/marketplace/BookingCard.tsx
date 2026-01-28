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
  isArchived?: boolean;
}

export function BookingCard({ booking, role, onStatusUpdate, isArchived = false }: BookingCardProps) {
  const serviceTitle =
    typeof booking.serviceId === "object" && booking.serviceId
      ? booking.serviceId.title
      : "Service";
  const serviceId =
    typeof booking.serviceId === "object" && booking.serviceId
      ? booking.serviceId._id
      : booking.serviceId;

  const buyerName: string =
    typeof booking.buyerId === "object" && booking.buyerId
      ? String(booking.buyerId.name || booking.buyerId.username || "Unknown")
      : "Unknown";
  const sellerName: string =
    typeof booking.sellerId === "object" && booking.sellerId
      ? String(booking.sellerId.name || booking.sellerId.username || "Unknown")
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
    <Card className={`hover:shadow-lg transition-all duration-200 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-500 shadow-md overflow-hidden ${isArchived ? "opacity-75 border-dashed" : ""
      }`}>
      <CardHeader className={`border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800 p-3 ${isArchived ? "bg-gray-100 dark:bg-gray-700/50" : ""
        }`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0 pr-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-bold text-gray-900 dark:text-white break-words line-clamp-2">
                <Link
                  href={`/marketplace/services/${serviceId}`}
                  className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"
                >
                  {serviceTitle}
                </Link>
              </CardTitle>
              {isArchived && (
                <span className="px-2 py-0.5 text-xs font-semibold bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400 rounded-md border border-gray-300 dark:border-gray-500">
                  Archived
                </span>
              )}
            </div>
            <CardDescription className="mt-0.5 text-xs font-medium text-gray-600 dark:text-gray-400">
              Booking #{booking._id.slice(-8)}
            </CardDescription>
          </div>
          <div className="flex-shrink-0 flex items-start">
            <BookingStatusBadge status={booking.status} />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-2.5 pt-3 px-3 pb-3">
        {/* Key Info Grid - Compact Layout */}
        <div className="grid grid-cols-2 gap-2">
          {/* Provider/Buyer */}
          <div className="flex items-center gap-1.5 p-2 rounded-md bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
            <User className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-gray-500 dark:text-gray-400">{role === "buyer" ? "Provider" : "Buyer"}</p>
              <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{role === "buyer" ? sellerName : buyerName}</p>
            </div>
          </div>

          {/* Amount */}
          <div className="flex items-center gap-1.5 p-2 rounded-md bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800">
            <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-gray-500 dark:text-gray-400">Amount</p>
              <p className="text-sm font-bold text-green-700 dark:text-green-400 truncate">
                {booking.currency || "USD"} {booking.amount.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Scheduled Date */}
          {booking.scheduledFor && (
            <div className="flex items-center gap-1.5 p-2 rounded-md bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
              <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-gray-500 dark:text-gray-400">Scheduled</p>
                <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{formatDate(booking.scheduledFor)}</p>
              </div>
            </div>
          )}

          {/* Due Date */}
          {booking.dueDate && (
            <div className="flex items-center gap-1.5 p-2 rounded-md bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
              <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-gray-500 dark:text-gray-400">Due</p>
                <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{formatDate(booking.dueDate)}</p>
              </div>
            </div>
          )}

          {/* Package */}
          {booking.packageName && (
            <div className="flex items-center gap-1.5 p-2 rounded-md bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 col-span-2">
              <Package className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-gray-500 dark:text-gray-400">Package</p>
                <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{booking.packageName}</p>
              </div>
            </div>
          )}
        </div>

        {/* Requirements & Message - Compact */}
        {(booking.requirements || booking.message) && (
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700 space-y-2">
            {booking.requirements && (
              <div>
                <p className="text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">Requirements:</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-snug p-2 rounded bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 line-clamp-2">{booking.requirements}</p>
              </div>
            )}
            {booking.message && (
              <div>
                <p className="text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">Message:</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-snug p-2 rounded bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 line-clamp-2">{booking.message}</p>
              </div>
            )}
          </div>
        )}

        {/* Deliverables - Compact */}
        {booking.deliverables && booking.deliverables.length > 0 && (
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs font-semibold mb-1.5 text-gray-700 dark:text-gray-300">Deliverables:</p>
            <div className="flex flex-wrap gap-1.5">
              {booking.deliverables.map((deliverable, index) => (
                <div key={index} className="flex items-center gap-1 px-2 py-1 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400 flex-shrink-0" />
                  {deliverable.url ? (
                    <a
                      href={deliverable.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-green-700 dark:text-green-400 hover:underline truncate max-w-[120px]"
                    >
                      {deliverable.title || "View"}
                    </a>
                  ) : (
                    <span className="text-xs font-medium text-gray-900 dark:text-white truncate max-w-[120px]">{deliverable.title || "Deliverable"}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timestamps - Compact */}
        <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
          {booking.createdAt && (
            <span>
              <span className="font-semibold">Created:</span> {formatDate(booking.createdAt)}
            </span>
          )}
          {booking.updatedAt && booking.updatedAt !== booking.createdAt && (
            <span>
              <span className="font-semibold">Updated:</span> {formatDate(booking.updatedAt)}
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="border-t border-gray-200 dark:border-gray-700 pt-3 px-3 pb-3 bg-gray-50 dark:bg-gray-700/30">
        <BookingActions
          booking={booking}
          role={role}
          onStatusUpdate={onStatusUpdate}
          isArchived={isArchived}
        />
      </CardFooter>
    </Card>
  );
}

export default BookingCard;
