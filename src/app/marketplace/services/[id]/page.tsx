"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useService, useCreateBooking } from "@/hooks/features/useMarketplace";
import { useAuth } from "@/hooks/auth/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Edit,
  Package,
  CheckCircle,
  AlertCircle,
  User,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Calendar,
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
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
        <div className="p-4 pb-16 min-h-full bg-gray-50 dark:bg-slate-900 lg:p-6">
          <div className="mx-auto space-y-6 max-w-6xl">
            <Skeleton className="w-48 h-10" />
            <Skeleton className="w-full h-96" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !service) {
    return (
      <DashboardLayout>
        <div className="p-4 pb-16 min-h-full bg-gray-50 dark:bg-slate-900 lg:p-6">
          <div className="mx-auto max-w-6xl">
            <div className="py-12 text-center">
              <AlertCircle className="mx-auto mb-4 w-12 h-12 text-destructive" />
              <h2 className="mb-2 text-2xl font-bold">Service Not Found</h2>
              <p className="mb-4 text-muted-foreground">
                {error instanceof Error ? error.message : "The service you're looking for doesn't exist."}
              </p>
              <Button onClick={() => router.push("/marketplace")} className="cursor-pointer">
                <ArrowLeft className="mr-2 w-4 h-4" />
                Back to Marketplace
              </Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const sellerName: string =
    (typeof service.seller === "object" && service.seller
      ? (service.seller.name || service.seller.username || "Unknown")
      : "Unknown") as string;
  const sellerId =
    typeof service.seller === "string" ? service.seller : service.seller?._id;

  return (
    <DashboardLayout>
      <div className="min-h-full bg-gradient-to-br from-gray-50 via-white to-purple-50/10 dark:from-gray-900 dark:via-gray-900 dark:to-purple-900/10">
        <div className="p-4 pb-16 lg:p-6 lg:pb-34">
          <div className="mx-auto space-y-6 max-w-6xl">
            {/* Back Button */}
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="font-medium text-gray-900 bg-white border-2 border-gray-300 shadow-sm cursor-pointer dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-purple-500 dark:hover:border-purple-400"
            >
              <ArrowLeft className="mr-2 w-4 h-4" />
              Back
            </Button>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Main Content */}
              <div className="space-y-6 lg:col-span-2">
                {/* Images Gallery */}
                {service.images && service.images.length > 0 ? (
                  <div className="relative group">
                    <div className="overflow-hidden relative w-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl border-2 border-gray-200 shadow-lg aspect-video dark:from-gray-800 dark:to-gray-900 dark:border-gray-700">
                      <Image
                        src={service.images[currentImageIndex]}
                        alt={`${service.title} - Image ${currentImageIndex + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 66vw"
                        priority
                      />
                      {/* Image Navigation */}
                      {service.images.length > 1 && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute left-4 top-1/2 text-white opacity-0 transition-opacity -translate-y-1/2 cursor-pointer bg-black/50 hover:bg-black/70 group-hover:opacity-100"
                            onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? service.images!.length - 1 : prev - 1))}
                          >
                            <ChevronLeft className="w-6 h-6" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-4 top-1/2 text-white opacity-0 transition-opacity -translate-y-1/2 cursor-pointer bg-black/50 hover:bg-black/70 group-hover:opacity-100"
                            onClick={() => setCurrentImageIndex((prev) => (prev === service.images!.length - 1 ? 0 : prev + 1))}
                          >
                            <ChevronRight className="w-6 h-6" />
                          </Button>
                          {/* Image Indicators */}
                          <div className="flex absolute bottom-4 left-1/2 gap-2 -translate-x-1/2">
                            {service.images.map((_, index) => (
                              <button
                                key={index}
                                className={`h-2 rounded-full transition-all cursor-pointer ${index === currentImageIndex
                                  ? "w-8 bg-white"
                                  : "w-2 bg-white/50 hover:bg-white/75"
                                  }`}
                                onClick={() => setCurrentImageIndex(index)}
                                aria-label={`Go to image ${index + 1}`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                    {/* Thumbnail Gallery */}
                    {service.images.length > 1 && (
                      <div className="flex overflow-x-auto gap-2 pb-2 mt-3">
                        {service.images.map((img, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${index === currentImageIndex
                              ? "border-purple-600 dark:border-purple-400 ring-2 ring-purple-200 dark:ring-purple-800"
                              : "border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-500"
                              }`}
                          >
                            <Image
                              src={img}
                              alt={`Thumbnail ${index + 1}`}
                              fill
                              className="object-cover"
                              sizes="80px"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex relative flex-col justify-center items-center w-full bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50 rounded-xl border-2 border-gray-300 border-dashed shadow-lg aspect-video dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 dark:border-gray-700">
                    <div className="p-6 mb-4 rounded-full backdrop-blur-sm bg-white/80 dark:bg-gray-800/80">
                      <ImageIcon className="w-16 h-16 text-purple-500 dark:text-purple-400" />
                    </div>
                    <p className="mb-2 text-lg font-semibold text-gray-700 dark:text-gray-300">No Images Available</p>
                    <p className="max-w-xs text-sm text-center text-gray-500 dark:text-gray-400">
                      This service doesn&apos;t have any images yet
                    </p>
                  </div>
                )}

                {/* Service Info */}
                <Card className="bg-white border-2 border-gray-200 shadow-lg dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b-2 border-gray-200 dark:border-gray-700 dark:from-gray-800 dark:to-gray-800">
                    <div className="flex gap-4 justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="mb-3 text-3xl font-bold leading-tight text-gray-900 dark:text-white">
                          {service.title}
                        </CardTitle>
                        <div className="flex flex-wrap gap-2 items-center">
                          {service.category && (
                            <Badge variant="outline" className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-50 border-2 dark:text-gray-300 dark:bg-gray-700">
                              {service.category}
                            </Badge>
                          )}
                          {service.subcategory && (
                            <Badge variant="outline" className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-50 border-2 dark:text-gray-300 dark:bg-gray-700">
                              {service.subcategory}
                            </Badge>
                          )}
                          {service.featured && (
                            <Badge className="px-3 py-1 text-sm font-semibold text-white bg-gradient-to-r from-yellow-400 to-yellow-500 shadow-md">
                              ⭐ Featured
                            </Badge>
                          )}
                          {!service.isAvailable && (
                            <Badge variant="destructive" className="px-3 py-1 text-sm font-medium">
                              Unavailable
                            </Badge>
                          )}
                        </div>
                      </div>
                      {isOwner && (
                        <Link href={`/marketplace/services/${service._id}/edit`}>
                          <Button variant="outline" size="sm" className="border-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                            <Edit className="mr-2 w-4 h-4" />
                            Edit
                          </Button>
                        </Link>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    <div className="max-w-none prose prose-gray dark:prose-invert">
                      <p className="text-lg font-normal leading-relaxed text-gray-700 dark:text-gray-200">
                        {service.description}
                      </p>
                    </div>

                    {/* Details Grid */}
                    <div className="flex flex-wrap gap-4 pt-6 border-t-2 border-gray-200 dark:border-gray-700">
                      {service.location && (
                        <div className="flex flex-col gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 min-w-[140px]">
                          <div className="flex gap-2 items-center">
                            <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            <span className="text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">Location</span>
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{service.location}</span>
                        </div>
                      )}
                      {service.deliveryTime && (
                        <div className="flex flex-col gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 min-w-[140px]">
                          <div className="flex gap-2 items-center">
                            <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            <span className="text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">Delivery</span>
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{service.deliveryTime}</span>
                        </div>
                      )}
                      {service.rating && typeof service.rating.average === 'number' && service.rating.average > 0 && (
                        <div className="flex flex-col gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 min-w-[140px]">
                          <div className="flex gap-2 items-center">
                            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                            <span className="text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">Rating</span>
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {service.rating.average.toFixed(1)}
                            {service.rating.count && service.rating.count > 0 && (
                              <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                                ({service.rating.count})
                              </span>
                            )}
                          </span>
                        </div>
                      )}
                      {service.stats && typeof service.stats.views === 'number' && service.stats.views > 0 && (
                        <div className="flex flex-col gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 min-w-[140px]">
                          <div className="flex gap-2 items-center">
                            <Eye className="w-5 h-5 text-green-600 dark:text-green-400" />
                            <span className="text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">Views</span>
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{service.stats.views}</span>
                        </div>
                      )}
                      {service.stats && typeof service.stats.orders === 'number' && (
                        <div className="flex flex-col gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 min-w-[140px]">
                          <div className="flex gap-2 items-center">
                            <ShoppingCart className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                            <span className="text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">Orders</span>
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{service.stats.orders}</span>
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    {service.tags && service.tags.length > 0 && (
                      <div className="pt-6 border-t-2 border-gray-200 dark:border-gray-700">
                        <h3 className="mb-3 text-sm font-semibold tracking-wide text-gray-700 uppercase dark:text-gray-300">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                          {service.tags.map((tag, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                // Navigate to marketplace with tag as search query
                                router.push(`/marketplace?q=${encodeURIComponent(tag)}`);
                              }}
                              className="px-3 py-1.5 text-sm font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700 hover:bg-purple-200 dark:hover:bg-purple-900/50 hover:border-purple-400 dark:hover:border-purple-500 rounded-full transition-all duration-200 cursor-pointer active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                              title={`Search for services with tag: ${tag}`}
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                        <p className="mt-2 text-xs italic text-gray-500 dark:text-gray-400">
                          Click a tag to find similar services
                        </p>
                      </div>
                    )}

                    {/* Packages */}
                    {service.packages && service.packages.length > 0 && (
                      <div className="pt-6 space-y-4 border-t-2 border-gray-200 dark:border-gray-700">
                        <h3 className="flex gap-2 items-center text-lg font-bold text-gray-900 dark:text-white">
                          <Package className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                          Available Packages
                        </h3>
                        <div className="grid gap-3">
                          {service.packages.map((pkg, index) => (
                            <Card key={index} className="border-2 border-gray-200 shadow-sm transition-colors dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-500">
                              <CardContent className="p-5">
                                <div className="flex gap-4 justify-between items-start">
                                  <div className="flex-1">
                                    <h4 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">{pkg.name}</h4>
                                    {pkg.description && (
                                      <p className="mb-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                                        {pkg.description}
                                      </p>
                                    )}
                                    {pkg.deliveryTime && (
                                      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span>Delivery: {pkg.deliveryTime}</span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
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
                      <div className="pt-6 border-t-2 border-gray-200 dark:border-gray-700">
                        <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">Requirements</h3>
                        <ul className="space-y-3">
                          {service.requirements.map((req, index) => (
                            <li key={index} className="flex gap-3 items-start p-3 bg-gray-50 rounded-lg border border-gray-200 dark:bg-gray-700/50 dark:border-gray-600">
                              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                              <span className="text-sm leading-relaxed text-gray-700 dark:text-gray-200">{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* FAQ */}
                    {service.faq && service.faq.length > 0 && (
                      <div className="pt-6 space-y-4 border-t-2 border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Frequently Asked Questions</h3>
                        <div className="space-y-4">
                          {service.faq.map((faq, index) => (
                            <Card key={index} className="border border-gray-200 shadow-sm dark:border-gray-700">
                              <CardContent className="p-4">
                                <h4 className="flex gap-2 items-start mb-2 text-base font-semibold text-gray-900 dark:text-white">
                                  <span className="font-bold text-purple-600 dark:text-purple-400">Q{index + 1}:</span>
                                  <span>{faq.question}</span>
                                </h4>
                                <p className="pl-7 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{faq.answer}</p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Booking Card - Sticky */}
                <div className="sticky top-6 space-y-6">
                  <Card className="bg-white border-2 border-gray-200 shadow-xl dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b-2 border-gray-200 dark:border-gray-700 dark:from-gray-800 dark:to-gray-800">
                      <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Pricing</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                      <div>
                        <div className="mb-1 text-4xl font-bold text-gray-900 dark:text-white">
                          {service.currency || "USD"} {service.price.toFixed(2)}
                        </div>
                        {service.packages && service.packages.length > 0 && (
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Starting price
                          </p>
                        )}
                      </div>

                      {service.isAvailable ? (
                        !isOwner ? (
                          <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
                            <DialogTrigger asChild>
                              <Button
                                className="w-full text-white bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg cursor-pointer hover:from-purple-700 hover:to-indigo-700"
                                size="lg"
                              >
                                <CheckCircle className="mr-2 w-4 h-4" />
                                Book Now
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 shadow-2xl [&>button]:text-gray-900 [&>button]:dark:text-gray-100 [&>button]:bg-white [&>button]:dark:bg-gray-700 [&>button]:border-2 [&>button]:border-gray-300 [&>button]:dark:border-gray-600 [&>button]:hover:bg-gray-100 [&>button]:dark:hover:bg-gray-600 [&>button]:opacity-100 [&>button]:cursor-pointer">
                              <DialogHeader className="pb-4 border-b-2 border-gray-200 dark:border-gray-700">
                                <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                                  Book Service
                                </DialogTitle>
                                <DialogDescription className="mt-2 text-base text-gray-600 dark:text-gray-300">
                                  Fill in the details to book this service
                                </DialogDescription>
                              </DialogHeader>
                              <div className="py-6 space-y-5">
                                {service.packages && service.packages.length > 0 && (
                                  <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-gray-900 dark:text-white">Package</Label>
                                    <Select
                                      value={bookingData.packageName || undefined}
                                      onValueChange={(value) =>
                                        setBookingData({ ...bookingData, packageName: value })
                                      }
                                    >
                                      <SelectTrigger className="text-gray-900 bg-white border-gray-200 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100">
                                        <SelectValue placeholder="Select a package" />
                                      </SelectTrigger>
                                      <SelectContent className="bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700">
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
                                  <Label htmlFor="scheduledFor" className="text-sm font-semibold text-gray-900 dark:text-white">Scheduled Date/Time</Label>
                                  <div className="relative">
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
                                      className="pr-10 text-gray-900 bg-white border-gray-200 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-primary dark:focus:border-purple-500 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-2 [&::-webkit-calendar-picker-indicator]:w-5 [&::-webkit-calendar-picker-indicator]:h-5 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const input = document.getElementById("scheduledFor") as HTMLInputElement;
                                        input?.showPicker?.();
                                        input?.focus();
                                      }}
                                      className="absolute right-3 top-1/2 z-10 text-gray-500 -translate-y-1/2 cursor-pointer dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
                                      aria-label="Open calendar"
                                    >
                                      <Calendar className="w-5 h-5" />
                                    </button>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="dueDate" className="text-sm font-semibold text-gray-900 dark:text-white">Due Date</Label>
                                  <div className="relative">
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
                                      className="pr-10 text-gray-900 bg-white border-gray-200 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-primary dark:focus:border-purple-500 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-2 [&::-webkit-calendar-picker-indicator]:w-5 [&::-webkit-calendar-picker-indicator]:h-5 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const input = document.getElementById("dueDate") as HTMLInputElement;
                                        input?.showPicker?.();
                                        input?.focus();
                                      }}
                                      className="absolute right-3 top-1/2 z-10 text-gray-500 -translate-y-1/2 cursor-pointer dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
                                      aria-label="Open calendar"
                                    >
                                      <Calendar className="w-5 h-5" />
                                    </button>
                                  </div>
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
                                    className="text-gray-900 bg-white border-gray-200 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-primary dark:focus:border-purple-500"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="message" className="text-sm font-semibold text-gray-900 dark:text-white">Message</Label>
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
                                    className="text-gray-900 bg-white border-gray-200 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-primary dark:focus:border-purple-500"
                                  />
                                </div>
                              </div>
                              <DialogFooter className="gap-3 pt-4 border-t-2 border-gray-200 dark:border-gray-700">
                                <Button
                                  variant="outline"
                                  onClick={() => setBookingDialogOpen(false)}
                                  className="flex-1 font-medium text-gray-900 bg-white border-2 border-gray-300 cursor-pointer dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600"
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={handleBookingSubmit}
                                  disabled={createBooking.isPending}
                                  className="flex-1 font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg cursor-pointer hover:from-purple-700 hover:to-indigo-700 disabled:cursor-not-allowed"
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
                  <Card className="bg-white border-2 border-gray-200 shadow-lg dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b-2 border-gray-200 dark:border-gray-700 dark:from-gray-800 dark:to-gray-800">
                      <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Provider</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="flex gap-4 items-center">
                        <div className="flex-shrink-0">
                          <div className="flex justify-center items-center w-16 h-16 text-xl font-bold text-white bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full shadow-lg">
                            {sellerName !== "Unknown" ? (
                              sellerName.charAt(0).toUpperCase()
                            ) : (
                              <User className="w-8 h-8" />
                            )}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="mb-1 text-lg font-semibold text-gray-900 truncate dark:text-white">
                            {sellerName}
                          </p>
                          {sellerId && sellerName !== "Unknown" ? (
                            <Link
                              href={`/creator/${sellerId}`}
                              className="inline-flex gap-1 items-center text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:underline"
                            >
                              View Profile
                              <ArrowLeft className="w-3 h-3 rotate-180" />
                            </Link>
                          ) : (
                            <p className="text-xs italic text-gray-500 dark:text-gray-400">
                              Provider information unavailable
                            </p>
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
      </div>
    </DashboardLayout>
  );
}
