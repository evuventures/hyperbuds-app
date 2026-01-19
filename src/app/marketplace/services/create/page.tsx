"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateService } from "@/hooks/features/useMarketplace";
import { uploadAvatar } from "@/lib/utils/uploadthing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import DashboardLayout from "@/components/layout/Dashboard/Dashboard";
import { ArrowLeft, Upload, X, Plus, Trash2 } from "lucide-react";
import type { CreateServiceRequest, MarketplacePackage, MarketplaceFaq } from "@/types/marketplace.types";

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

export default function CreateServicePage() {
  const router = useRouter();
  const createService = useCreateService();

  const [formData, setFormData] = useState<CreateServiceRequest>({
    title: "",
    description: "",
    price: 0,
    currency: "USD",
    category: "",
    subcategory: "",
    tags: [],
    images: [],
    deliveryTime: "",
    location: "",
    isAvailable: true,
    featured: false,
    packages: [],
    requirements: [],
    faq: [],
  });

  const [tagInput, setTagInput] = useState("");
  const [requirementInput, setRequirementInput] = useState("");
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const handleInputChange = (
    field: keyof CreateServiceRequest,
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
      setImageFiles((prev) => [...prev, ...Array.from(files)]);
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
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
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

    // Validation
    if (!formData.title || !formData.description || !formData.category || formData.price <= 0) {
      alert("Please fill in all required fields (title, description, category, and price)");
      return;
    }

    try {
      const result = await createService.mutateAsync(formData);
      router.push(`/marketplace/services/${result.service._id}`);
    } catch (error) {
      // Error is handled by the mutation
      console.error("Service creation failed:", error);
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-full bg-gradient-to-br from-gray-50 via-white to-purple-50/10 dark:from-gray-900 dark:via-gray-900 dark:to-purple-900/10">
        <div className="p-4 pb-16 lg:p-6 lg:pb-34">
          <div className="mx-auto max-w-4xl space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => router.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">
                  Create Service
                </h1>
                <p className="text-xs text-gray-500 sm:text-sm dark:text-gray-400">
                  Publish a new marketplace listing
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
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
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      placeholder="e.g., Professional Video Editing"
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
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="Describe your service in detail..."
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
                        placeholder="Optional"
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
                        value={formData.price}
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
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm">
                <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                  <CardTitle className="text-gray-900 dark:text-white">Images</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">Upload images to showcase your service</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="flex items-center gap-4">
                    <Label htmlFor="images" className="cursor-pointer">
                      <Button 
                        type="button" 
                        variant="outline" 
                        disabled={uploadingImages}
                        className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
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

              {/* Additional Details */}
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm">
                <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                  <CardTitle className="text-gray-900 dark:text-white">Additional Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="deliveryTime" className="text-gray-700 dark:text-gray-300">Delivery Time</Label>
                      <Input
                        id="deliveryTime"
                        value={formData.deliveryTime || ""}
                        onChange={(e) => handleInputChange("deliveryTime", e.target.value)}
                        placeholder="e.g., 3-5 business days"
                        className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-primary dark:focus:border-purple-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-gray-700 dark:text-gray-300">Location</Label>
                      <Input
                        id="location"
                        value={formData.location || ""}
                        onChange={(e) => handleInputChange("location", e.target.value)}
                        placeholder="City, Country"
                        className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-primary dark:focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tags" className="text-gray-700 dark:text-gray-300">Tags</Label>
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
                        className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-primary dark:focus:border-purple-500"
                      />
                      <Button 
                        type="button" 
                        onClick={addTag}
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                      >
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
                    <Label htmlFor="requirements" className="text-gray-700 dark:text-gray-300">Requirements</Label>
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
                        className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-primary dark:focus:border-purple-500"
                      />
                      <Button 
                        type="button" 
                        onClick={addRequirement}
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                      >
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

              {/* Packages */}
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
                                placeholder="Package name"
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
                              placeholder="e.g., 5-7 business days"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No packages added. Click "Add Package" to create pricing tiers.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* FAQ */}
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
                              placeholder="Enter question"
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
                              placeholder="Enter answer"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No FAQ items added. Click "Add FAQ" to add questions.
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
                  disabled={createService.isPending}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg"
                >
                  {createService.isPending ? "Creating..." : "Create Service"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
