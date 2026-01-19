"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Star, Eye, ShoppingCart } from "lucide-react";
import type { MarketplaceService } from "@/types/marketplace.types";

interface ServiceCardProps {
  service: MarketplaceService;
  showActions?: boolean;
  onEdit?: (serviceId: string) => void;
  onDelete?: (serviceId: string) => void;
}

export function ServiceCard({ service, showActions = false, onEdit, onDelete }: ServiceCardProps) {
  const sellerId = typeof service.seller === "string" ? service.seller : service.seller?._id;
  const sellerName =
    typeof service.seller === "object" && service.seller
      ? service.seller.name || service.seller.username || "Unknown"
      : "Unknown";

  const imageUrl = service.images && service.images.length > 0 ? service.images[0] : null;
  const rating = service.rating?.average || 0;
  const ratingCount = service.rating?.count || 0;
  const views = service.stats?.views || 0;
  const orders = service.stats?.orders || 0;

  return (
    <Card className="group hover:shadow-xl transition-all duration-200 overflow-hidden bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-500 shadow-sm hover:shadow-md">
      <Link href={`/marketplace/services/${service._id}`}>
        <div className="relative aspect-video w-full overflow-hidden bg-gray-100 dark:bg-gray-900">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={service.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-800">
              <ShoppingCart className="w-12 h-12 text-gray-400 dark:text-gray-500" />
            </div>
          )}
          {service.featured && (
            <Badge className="absolute top-2 right-2 bg-yellow-500 hover:bg-yellow-600">
              Featured
            </Badge>
          )}
          {!service.isAvailable && (
            <Badge
              variant="destructive"
              className="absolute top-2 left-2"
            >
              Unavailable
            </Badge>
          )}
        </div>
      </Link>

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/marketplace/services/${service._id}`}>
            <h3 className="font-semibold text-lg line-clamp-2 hover:text-purple-600 dark:hover:text-purple-400 transition-colors text-gray-900 dark:text-white">
              {service.title}
            </h3>
          </Link>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mt-1">
          {service.description}
        </p>
      </CardHeader>

      <CardContent className="pt-0 space-y-2">
        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          {service.location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="line-clamp-1">{service.location}</span>
            </div>
          )}
          {service.deliveryTime && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span>{service.deliveryTime}</span>
            </div>
          )}
        </div>

        {service.category && (
          <div className="flex flex-wrap gap-1">
            <Badge variant="outline" className="text-xs border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50">
              {service.category}
            </Badge>
            {service.subcategory && (
              <Badge variant="outline" className="text-xs border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50">
                {service.subcategory}
              </Badge>
            )}
          </div>
        )}

        {rating > 0 && (
          <div className="flex items-center gap-1 text-sm">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium text-gray-900 dark:text-white">{rating.toFixed(1)}</span>
            {ratingCount > 0 && (
              <span className="text-gray-600 dark:text-gray-400">({ratingCount})</span>
            )}
          </div>
        )}

        <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
          {views > 0 && (
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3 text-gray-500 dark:text-gray-400" />
              <span>{views}</span>
            </div>
          )}
          {orders > 0 && (
            <div className="flex items-center gap-1">
              <ShoppingCart className="w-3 h-3 text-gray-500 dark:text-gray-400" />
              <span>{orders} orders</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {service.currency || "USD"} {service.price.toFixed(2)}
          </span>
          {service.packages && service.packages.length > 0 && (
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {service.packages.length} package{service.packages.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        {showActions && onEdit && onDelete ? (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                onEdit(service._id);
              }}
            >
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                onDelete(service._id);
              }}
            >
              Delete
            </Button>
          </div>
        ) : (
          <Link href={`/marketplace/services/${service._id}`}>
            <Button 
              size="sm"
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md"
            >
              View Details
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}

export default ServiceCard;
