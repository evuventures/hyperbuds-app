"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useService, useCreateBooking } from "@/hooks/features/useMarketplace";
import { useAuth } from "@/hooks/auth/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DashboardLayout from "@/components/layout/Dashboard/Dashboard";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Star,
  Eye,
  ShoppingCart,
  Calendar,
  Edit,
  Package,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { CreateBookingRequest } from "@/types/marketplace.types";

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const serviceId = params.id as string;

  const { data, isLoading, error } = useService(serviceId);
  const createBooking = useCreateBooking();

  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [bookingData, setBookingData] = useState<CreateBookingRequest>({
    serviceId: serviceId,
    packageName: undefined,
    requirements: undefined,
    message: undefined,
    scheduledFor: undefined,
    dueDate: undefined,
  });

  const service = data?.service;

  const isOwner =
    user &&
    service &&
    (typeof service.seller === "string"
      ? service.seller === user.id
      : service.seller?._id === user.id);

  const handleBookingSubmit = async () => {
    try {
      await createBooking.mutateAsync(bookingData);
      setBookingDialogOpen(false);
      router.push("/marketplace/bookings");
    } catch (error) {
      // Error is handled by the mutation
      console.error("Booking creation failed:", error);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-full bg-gray-50 dark:bg-slate-900 p-4 pb-16 lg:p-6">
          <div className="mx-auto max-w-6xl space-y-6">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !service) {
    return (
      <DashboardLayout>
        <div className="min-h-full bg-gray-50 dark:bg-slate-900 p-4 pb-16 lg:p-6">
          <div className="mx-auto max-w-6xl">
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Service Not Found</h2>
              <p className="text-muted-foreground mb-4">
                {error instanceof Error ? error.message : "The service you're looking for doesn't exist."}
              </p>
              <Button onClick={() => router.push("/marketplace")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Marketplace
              </Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const sellerName =
    typeof service.seller === "object" && service.seller
      ? service.seller.name || service.seller.username || "Unknown"
      : "Unknown";
  const sellerId =
    typeof service.seller === "string" ? service.seller : service.seller?._id;

  return (
    <DashboardLayout>
      <div className="min-h-full bg-gradient-to-br from-gray-50 via-white to-purple-50/10 dark:from-gray-900 dark:via-gray-900 dark:to-purple-900/10">
        <div className="p-4 pb-16 lg:p-6 lg:pb-34">
          <div className="mx-auto max-w-6xl space-y-6">
            {/* Back Button */}
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Images */}
                {service.images && service.images.length > 0 ? (
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                    <Image
                      src={service.images[0]}
                      alt={service.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 66vw"
                    />
                  </div>
                ) : (
                  <div className="aspect-video w-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <ShoppingCart className="w-24 h-24 text-gray-400" />
                  </div>
                )}

                {/* Service Info */}
                <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm">
                  <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-3xl mb-2 text-gray-900 dark:text-white">{service.title}</CardTitle>
                        <div className="flex flex-wrap gap-2 items-center">
                          {service.category && (
                            <Badge variant="outline">{service.category}</Badge>
                          )}
                          {service.subcategory && (
                            <Badge variant="outline">{service.subcategory}</Badge>
                          )}
                          {service.featured && (
                            <Badge className="bg-yellow-500">Featured</Badge>
                          )}
                          {!service.isAvailable && (
                            <Badge variant="destructive">Unavailable</Badge>
                          )}
                        </div>
                      </div>
                      {isOwner && (
                        <Link href={`/marketplace/services/${service._id}/edit`}>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                        </Link>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6">
                    <CardDescription className="text-base text-gray-600 dark:text-gray-300">{service.description}</CardDescription>

                    {/* Details */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      {service.location && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span>{service.location}</span>
                        </div>
                      )}
                      {service.deliveryTime && (
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span>{service.deliveryTime}</span>
                        </div>
                      )}
                      {service.rating && service.rating.average && (
                        <div className="flex items-center gap-2 text-sm">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span>
                            {service.rating.average.toFixed(1)}
                            {service.rating.count && ` (${service.rating.count} reviews)`}
                          </span>
                        </div>
                      )}
                      {service.stats && (
                        <>
                          {service.stats.views && (
                            <div className="flex items-center gap-2 text-sm">
                              <Eye className="w-4 h-4 text-muted-foreground" />
                              <span>{service.stats.views} views</span>
                            </div>
                          )}
                          {service.stats.orders && (
                            <div className="flex items-center gap-2 text-sm">
                              <ShoppingCart className="w-4 h-4 text-muted-foreground" />
                              <span>{service.stats.orders} orders</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Tags */}
                    {service.tags && service.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-4 border-t">
                        {service.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Packages */}
                    {service.packages && service.packages.length > 0 && (
                      <div className="pt-4 border-t space-y-3">
                        <h3 className="font-semibold flex items-center gap-2">
                          <Package className="w-5 h-5" />
                          Packages
                        </h3>
                        <div className="space-y-2">
                          {service.packages.map((pkg, index) => (
                            <Card key={index}>
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h4 className="font-medium">{pkg.name}</h4>
                                    {pkg.description && (
                                      <p className="text-sm text-muted-foreground mt-1">
                                        {pkg.description}
                                      </p>
                                    )}
                                    {pkg.deliveryTime && (
                                      <p className="text-xs text-muted-foreground mt-1">
                                        Delivery: {pkg.deliveryTime}
                                      </p>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <p className="font-bold">
                                      {service.currency || "USD"} {pkg.price.toFixed(2)}
                                    </p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Requirements */}
                    {service.requirements && service.requirements.length > 0 && (
                      <div className="pt-4 border-t">
                        <h3 className="font-semibold mb-2">Requirements</h3>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                          {service.requirements.map((req, index) => (
                            <li key={index}>{req}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* FAQ */}
                    {service.faq && service.faq.length > 0 && (
                      <div className="pt-4 border-t space-y-3">
                        <h3 className="font-semibold">Frequently Asked Questions</h3>
                        <div className="space-y-3">
                          {service.faq.map((faq, index) => (
                            <div key={index} className="space-y-1">
                              <h4 className="font-medium text-sm">{faq.question}</h4>
                              <p className="text-sm text-muted-foreground">{faq.answer}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Booking Card */}
                <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm">
                  <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                    <CardTitle className="text-gray-900 dark:text-white">Pricing</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6">
                    <div>
                      <div className="text-3xl font-bold">
                        {service.currency || "USD"} {service.price.toFixed(2)}
                      </div>
                      {service.packages && service.packages.length > 0 && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Starting price
                        </p>
                      )}
                    </div>

                    {service.isAvailable ? (
                      !isOwner ? (
                        <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
                          <DialogTrigger asChild>
                            <Button 
                              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg" 
                              size="lg"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Book Now
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Book Service</DialogTitle>
                              <DialogDescription>
                                Fill in the details to book this service
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              {service.packages && service.packages.length > 0 && (
                                <div className="space-y-2">
                                  <Label className="text-gray-700 dark:text-gray-300">Package</Label>
                                  <Select
                                    value={bookingData.packageName || undefined}
                                    onValueChange={(value) =>
                                      setBookingData({ ...bookingData, packageName: value })
                                    }
                                  >
                                    <SelectTrigger className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                                      <SelectValue placeholder="Select a package" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                                      {service.packages.map((pkg, index) => (
                                        <SelectItem key={index} value={pkg.name} className="text-gray-900 dark:text-gray-100">
                                          {pkg.name} - {service.currency || "USD"} {pkg.price.toFixed(2)}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}
                              <div className="space-y-2">
                                <Label htmlFor="scheduledFor" className="text-gray-700 dark:text-gray-300">Scheduled Date/Time</Label>
                                <Input
                                  id="scheduledFor"
                                  type="datetime-local"
                                  value={bookingData.scheduledFor || ""}
                                  onChange={(e) =>
                                    setBookingData({
                                      ...bookingData,
                                      scheduledFor: e.target.value || undefined,
                                    })
                                  }
                                  className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-primary dark:focus:border-purple-500"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="dueDate" className="text-gray-700 dark:text-gray-300">Due Date</Label>
                                <Input
                                  id="dueDate"
                                  type="date"
                                  value={bookingData.dueDate || ""}
                                  onChange={(e) =>
                                    setBookingData({
                                      ...bookingData,
                                      dueDate: e.target.value || undefined,
                                    })
                                  }
                                  className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-primary dark:focus:border-purple-500"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="requirements" className="text-gray-700 dark:text-gray-300">Requirements</Label>
                                <Textarea
                                  id="requirements"
                                  placeholder="Any specific requirements..."
                                  value={bookingData.requirements || ""}
                                  onChange={(e) =>
                                    setBookingData({
                                      ...bookingData,
                                      requirements: e.target.value || undefined,
                                    })
                                  }
                                  rows={3}
                                  className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-primary dark:focus:border-purple-500"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="message" className="text-gray-700 dark:text-gray-300">Message</Label>
                                <Textarea
                                  id="message"
                                  placeholder="Additional notes..."
                                  value={bookingData.message || ""}
                                  onChange={(e) =>
                                    setBookingData({
                                      ...bookingData,
                                      message: e.target.value || undefined,
                                    })
                                  }
                                  rows={3}
                                  className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-primary dark:focus:border-purple-500"
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => setBookingDialogOpen(false)}
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={handleBookingSubmit}
                                disabled={createBooking.isPending}
                                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                              >
                                {createBooking.isPending ? "Booking..." : "Confirm Booking"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      ) : (
                        <Button variant="outline" className="w-full" disabled>
                          This is your service
                        </Button>
                      )
                    ) : (
                      <Button variant="outline" className="w-full" disabled>
                        Service Unavailable
                      </Button>
                    )}
                  </CardContent>
                </Card>

                {/* Provider Info */}
                <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm">
                  <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                    <CardTitle className="text-gray-900 dark:text-white">Provider</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <p className="font-medium">{sellerName}</p>
                        {sellerId && (
                          <Link
                            href={`/creator/${sellerId}`}
                            className="text-sm text-primary hover:underline"
                          >
                            View Profile
                          </Link>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
