"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useServices, useDeleteService } from "@/hooks/features/useMarketplace";
import { useAuth } from "@/hooks/auth/useAuth";
import { ServiceCard } from "@/components/marketplace/ServiceCard/ServiceCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import DashboardLayout from "@/components/layout/Dashboard/Dashboard";
import { Plus, AlertCircle, Rocket } from "lucide-react";
import type { ServiceListFilters } from "@/types/marketplace.types";

export default function ProviderServicesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);

  const deleteService = useDeleteService();

  const [filters, setFilters] = useState<ServiceListFilters>({
    page: 1,
    limit: 20,
  });

  // Set sellerId filter when user is loaded
  useEffect(() => {
    if (user?.id && !authLoading) {
      setFilters((prev) => ({ ...prev, sellerId: user.id }));
    }
  }, [user?.id, authLoading]);

  const { data, isLoading, error } = useServices(filters);

  const handleEdit = (serviceId: string) => {
    router.push(`/marketplace/services/${serviceId}/edit`);
  };

  const handleDeleteClick = (serviceId: string) => {
    setServiceToDelete(serviceId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (serviceToDelete) {
      try {
        await deleteService.mutateAsync(serviceToDelete);
        setDeleteDialogOpen(false);
        setServiceToDelete(null);
      } catch (error) {
        // Error is handled by the mutation
        console.error("Delete failed:", error);
      }
    }
  };

  const services = data?.services || [];

  return (
    <DashboardLayout>
      <div className="min-h-full bg-gradient-to-br from-gray-50 via-white to-purple-50/10 dark:from-gray-900 dark:via-gray-900 dark:to-purple-900/10">
        <div className="p-4 pb-16 lg:p-6 lg:pb-34">
          <div className="mx-auto max-w-7xl space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex gap-3 items-center">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-md">
                  <Rocket className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">
                    Your Services
                  </h1>
                  <p className="text-xs text-gray-500 sm:text-sm dark:text-gray-400">
                    Manage services you offer in the marketplace
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => router.push("/marketplace/services/create")}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Service
              </Button>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
                <p className="text-destructive">
                  {error instanceof Error ? error.message : "Failed to load services"}
                </p>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="mt-4"
                >
                  Retry
                </Button>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && services.length === 0 && (
              <div className="text-center py-12">
                <Rocket className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">No Services Yet</h2>
                <p className="text-muted-foreground mb-4">
                  Start offering your services in the marketplace
                </p>
                <Button 
                  onClick={() => router.push("/marketplace/services/create")}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Service
                </Button>
              </div>
            )}

            {/* Services Grid */}
            {!isLoading && !error && services.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {services.map((service) => (
                    <ServiceCard
                      key={service._id}
                      service={service}
                      showActions={true}
                      onEdit={handleEdit}
                      onDelete={handleDeleteClick}
                    />
                  ))}
                </div>

                {/* Stats Summary */}
                <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                  <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Summary</h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Total Services</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{services.length}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Available</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {services.filter((s) => s.isAvailable !== false).length}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Total Orders</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {services.reduce(
                          (sum, s) => sum + (s.stats?.orders || 0),
                          0
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Service</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete this service? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDeleteDialogOpen(false);
                      setServiceToDelete(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteConfirm}
                    disabled={deleteService.isPending}
                  >
                    {deleteService.isPending ? "Deleting..." : "Delete"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
