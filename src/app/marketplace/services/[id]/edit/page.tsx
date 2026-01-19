"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useService, useUpdateService, useDeleteService } from "@/hooks/features/useMarketplace";
import { uploadAvatar } from "@/lib/utils/uploadthing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardLayout from "@/components/layout/Dashboard/Dashboard";
import { ArrowLeft, Upload, X, Plus, Trash2, AlertCircle } from "lucide-react";
import type { UpdateServiceRequest, MarketplacePackage, MarketplaceFaq } from "@/types/marketplace.types";

const CATEGORIES = [
  "Content Creation",
  "Social Media Management",
  "Video Production",
  "Photography",
  "Graphic Design",
  "Writing & Editing",
  "Marketing",
  "Consulting",
  "Coaching",
  "Other",
];

export default function EditServicePage() {
  const params = useParams();
  const router = useRouter();
  const serviceId = params.id as string;

  const { data, isLoading, error } = useService(serviceId);
  const updateService = useUpdateService();
  const deleteService = useDeleteService();

  const [formData, setFormData] = useState<UpdateServiceRequest>({});
  const [tagInput, setTagInput] = useState("");
  const [requirementInput, setRequirementInput] = useState("");
  const [uploadingImages, setUploadingImages] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Populate form when service data loads
  useEffect(() => {
    if (data?.service) {
      const service = data.service;
      setFormData({
        title: service.title,
        description: service.description,
        price: service.price,
        currency: service.currency || "USD",
        category: service.category,
        subcategory: service.subcategory,
        tags: service.tags || [],
        images: service.images || [],
        deliveryTime: service.deliveryTime,
        location: service.location,
        isAvailable: service.isAvailable !== false,
        featured: service.featured === true,
        packages: service.packages || [],
        requirements: service.requirements || [],
        faq: service.faq || [],
      });
    }
  }, [data?.service]);

  const handleInputChange = (
    field: keyof UpdateServiceRequest,
    value: unknown
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    try {
      const uploadPromises = Array.from(files).map((file) => uploadAvatar(file));
      const urls = await Promise.all(uploadPromises);
      setFormData((prev) => ({
        ...prev,
        images: [...(prev.images || []), ...urls],
      }));
    } catch (error) {
      console.error("Image upload failed:", error);
      alert(error instanceof Error ? error.message : "Failed to upload images");
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index) || [],
    }));
  };

  const addTag = () => {
    if (tagInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const removeTag = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags?.filter((_, i) => i !== index) || [],
    }));
  };

  const addRequirement = () => {
    if (requirementInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        requirements: [...(prev.requirements || []), requirementInput.trim()],
      }));
      setRequirementInput("");
    }
  };

  const removeRequirement = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      requirements: prev.requirements?.filter((_, i) => i !== index) || [],
    }));
  };

  const addPackage = () => {
    setFormData((prev) => ({
      ...prev,
      packages: [
        ...(prev.packages || []),
        { name: "", price: 0, description: "", deliveryTime: "" },
      ],
    }));
  };

  const updatePackage = (index: number, field: keyof MarketplacePackage, value: unknown) => {
    setFormData((prev) => {
      const packages = [...(prev.packages || [])];
      packages[index] = { ...packages[index], [field]: value };
      return { ...prev, packages };
    });
  };

  const removePackage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      packages: prev.packages?.filter((_, i) => i !== index) || [],
    }));
  };

  const addFaq = () => {
    setFormData((prev) => ({
      ...prev,
      faq: [...(prev.faq || []), { question: "", answer: "" }],
    }));
  };

  const updateFaq = (index: number, field: keyof MarketplaceFaq, value: string) => {
    setFormData((prev) => {
      const faq = [...(prev.faq || [])];
      faq[index] = { ...faq[index], [field]: value };
      return { ...prev, faq };
    });
  };

  const removeFaq = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      faq: prev.faq?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.category || (formData.price !== undefined && formData.price <= 0)) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      await updateService.mutateAsync({ serviceId, data: formData });
      router.push(`/marketplace/services/${serviceId}`);
    } catch (error) {
      console.error("Service update failed:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteService.mutateAsync(serviceId);
      router.push("/marketplace/services");
    } catch (error) {
      console.error("Service deletion failed:", error);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-full bg-gray-50 dark:bg-slate-900 p-4 pb-16 lg:p-6">
          <div className="mx-auto max-w-4xl space-y-6">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !data?.service) {
    return (
      <DashboardLayout>
        <div className="min-h-full bg-gray-50 dark:bg-slate-900 p-4 pb-16 lg:p-6">
          <div className="mx-auto max-w-4xl">
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Service Not Found</h2>
              <p className="text-muted-foreground mb-4">
                {error instanceof Error ? error.message : "The service you're looking for doesn't exist."}
              </p>
              <Button onClick={() => router.push("/marketplace/services")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Services
              </Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Use the same form structure as Create page
  return (
    <DashboardLayout>
      <div className="min-h-full bg-gradient-to-br from-gray-50 via-white to-purple-50/10 dark:from-gray-900 dark:via-gray-900 dark:to-purple-900/10">
        <div className="p-4 pb-16 lg:p-6 lg:pb-34">
          <div className="mx-auto max-w-4xl space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => router.back()}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">
                    Edit Service
                  </h1>
                  <p className="text-xs text-gray-500 sm:text-sm dark:text-gray-400">
                    Update your service listing details
                  </p>
                </div>
              </div>
              <Button
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
                className="shadow-md"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information - Same as Create page */}
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm">
                <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                  <CardTitle className="text-gray-900 dark:text-white">Basic Information</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Provide essential details about your service
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-gray-700 dark:text-gray-300">
                      Title <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="title"
                      value={formData.title || ""}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      required
                      className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-primary dark:focus:border-purple-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-gray-700 dark:text-gray-300">
                      Description <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description || ""}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      rows={6}
                      required
                      className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-primary dark:focus:border-purple-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-gray-700 dark:text-gray-300">
                        Category <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => handleInputChange("category", value)}
                      >
                        <SelectTrigger className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                          {CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat} className="text-gray-900 dark:text-gray-100">
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subcategory" className="text-gray-700 dark:text-gray-300">Subcategory</Label>
                      <Input
                        id="subcategory"
                        value={formData.subcategory || ""}
                        onChange={(e) => handleInputChange("subcategory", e.target.value)}
                        className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-primary dark:focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price" className="text-gray-700 dark:text-gray-300">
                        Price <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.price || 0}
                        onChange={(e) =>
                          handleInputChange("price", parseFloat(e.target.value) || 0)
                        }
                        required
                        className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-primary dark:focus:border-purple-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="currency" className="text-gray-700 dark:text-gray-300">Currency</Label>
                      <Select
                        value={formData.currency || "USD"}
                        onValueChange={(value) => handleInputChange("currency", value)}
                      >
                        <SelectTrigger className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                          <SelectItem value="USD" className="text-gray-900 dark:text-gray-100">USD</SelectItem>
                          <SelectItem value="EUR" className="text-gray-900 dark:text-gray-100">EUR</SelectItem>
                          <SelectItem value="GBP" className="text-gray-900 dark:text-gray-100">GBP</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Images */}
              <Card>
                <CardHeader>
                  <CardTitle>Images</CardTitle>
                  <CardDescription>Upload images to showcase your service</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Label htmlFor="images" className="cursor-pointer">
                      <Button type="button" variant="outline" disabled={uploadingImages}>
                        <Upload className="w-4 h-4 mr-2" />
                        {uploadingImages ? "Uploading..." : "Upload Images"}
                      </Button>
                    </Label>
                    <Input
                      id="images"
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => handleImageUpload(e.target.files)}
                      disabled={uploadingImages}
                    />
                  </div>

                  {formData.images && formData.images.length > 0 && (
                    <div className="grid grid-cols-3 gap-4">
                      {formData.images.map((url, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={url}
                            alt={`Service image ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100"
                            onClick={() => removeImage(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Additional Details - Same structure as Create */}
              <Card>
                <CardHeader>
                  <CardTitle>Additional Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="deliveryTime">Delivery Time</Label>
                      <Input
                        id="deliveryTime"
                        value={formData.deliveryTime || ""}
                        onChange={(e) => handleInputChange("deliveryTime", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={formData.location || ""}
                        onChange={(e) => handleInputChange("location", e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Tags, Requirements, Switches - Same as Create */}
                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags</Label>
                    <div className="flex gap-2">
                      <Input
                        id="tags"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addTag();
                          }
                        }}
                        placeholder="Add a tag and press Enter"
                      />
                      <Button type="button" onClick={addTag}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    {formData.tags && formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.tags.map((tag, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-1 bg-secondary px-2 py-1 rounded"
                          >
                            <span className="text-sm">{tag}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4"
                              onClick={() => removeTag(index)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="requirements">Requirements</Label>
                    <div className="flex gap-2">
                      <Input
                        id="requirements"
                        value={requirementInput}
                        onChange={(e) => setRequirementInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addRequirement();
                          }
                        }}
                        placeholder="Add a requirement and press Enter"
                      />
                      <Button type="button" onClick={addRequirement}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    {formData.requirements && formData.requirements.length > 0 && (
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        {formData.requirements.map((req, index) => (
                          <li key={index} className="flex items-center justify-between">
                            <span className="text-sm">{req}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => removeRequirement(index)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="isAvailable">Available for Booking</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow users to book this service
                      </p>
                    </div>
                    <Switch
                      id="isAvailable"
                      checked={formData.isAvailable !== false}
                      onCheckedChange={(checked) =>
                        handleInputChange("isAvailable", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="featured">Featured</Label>
                      <p className="text-sm text-muted-foreground">
                        Highlight this service in the marketplace
                      </p>
                    </div>
                    <Switch
                      id="featured"
                      checked={formData.featured === true}
                      onCheckedChange={(checked) =>
                        handleInputChange("featured", checked)
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Packages - Same as Create */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Packages</CardTitle>
                      <CardDescription>Optional pricing tiers</CardDescription>
                    </div>
                    <Button type="button" variant="outline" onClick={addPackage}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Package
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {formData.packages && formData.packages.length > 0 ? (
                    formData.packages.map((pkg, index) => (
                      <Card key={index}>
                        <CardContent className="p-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">Package {index + 1}</h4>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removePackage(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Name</Label>
                              <Input
                                value={pkg.name}
                                onChange={(e) =>
                                  updatePackage(index, "name", e.target.value)
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Price</Label>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={pkg.price}
                                onChange={(e) =>
                                  updatePackage(
                                    index,
                                    "price",
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                              value={pkg.description || ""}
                              onChange={(e) =>
                                updatePackage(index, "description", e.target.value)
                              }
                              rows={2}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Delivery Time</Label>
                            <Input
                              value={pkg.deliveryTime || ""}
                              onChange={(e) =>
                                updatePackage(index, "deliveryTime", e.target.value)
                              }
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No packages added.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* FAQ - Same as Create */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>FAQ</CardTitle>
                      <CardDescription>Frequently asked questions</CardDescription>
                    </div>
                    <Button type="button" variant="outline" onClick={addFaq}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add FAQ
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {formData.faq && formData.faq.length > 0 ? (
                    formData.faq.map((faq, index) => (
                      <Card key={index}>
                        <CardContent className="p-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">Question {index + 1}</h4>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeFaq(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="space-y-2">
                            <Label>Question</Label>
                            <Input
                              value={faq.question}
                              onChange={(e) =>
                                updateFaq(index, "question", e.target.value)
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Answer</Label>
                            <Textarea
                              value={faq.answer}
                              onChange={(e) =>
                                updateFaq(index, "answer", e.target.value)
                              }
                              rows={3}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No FAQ items added.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Submit */}
              <div className="flex gap-4 justify-end">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.back()}
                  className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateService.isPending}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg"
                >
                  {updateService.isPending ? "Updating..." : "Update Service"}
                </Button>
              </div>
            </form>

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
                    onClick={() => setDeleteDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
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
