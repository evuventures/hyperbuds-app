'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { marketplaceApi } from "@/lib/api/marketplace.api";
import {CreateServiceRequest, MarketplacePackage, MarketplaceFaq } from "@/types/marketplace.types";
import {ArrowLeft, Send, MapPin, Clock,Tag, X} from "lucide-react";
import Image from "next/image";

export const CreateServicePage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<CreateServiceRequest>({
    title: "",
    description: "",
    price: 0,
    currency: "USD",
    category: "Design",
    subcategory: "",
    tags: [],
    images: [],
    deliveryTime: "",
    location: "Remote",
    isAvailable: true,
    featured: false,
    packages: [],
    requirements: [],
    faq: [],
  });

  const [tempTag, setTempTag] = useState("");
  const [tempImg, setTempImg] = useState("");
  const [tempReq, setTempReq] = useState("");
  const [tempPkg, setTempPkg] = useState<MarketplacePackage>({
    name: "",
    description: "",
    price: 0,
  });
  const [tempFaq, setTempFaq] = useState<MarketplaceFaq>({
    question: "",
    answer: "",
  });
  const sanitizeForm = (data: CreateServiceRequest): CreateServiceRequest => {
    const cleanPackages = data.packages?.map(pkg => ({
      ...pkg,
      description: pkg.description?.trim() || undefined,
    })) ?? [];

    return {
      ...data,
      subcategory: data.subcategory?.trim() || undefined,
      deliveryTime: data.deliveryTime?.trim() || undefined,
      location: data.location?.trim() || undefined,
      packages: cleanPackages,
    };
  };

  const mutation = useMutation({
    mutationFn: (data: CreateServiceRequest) => marketplaceApi.createService(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      router.push("/marketplace/services");
    },
  });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sanitized = sanitizeForm(form);
    mutation.mutate(sanitized);
  };
  const removeTag = (index: number) => {
    const newTags = [...(form.tags || [])];
    newTags.splice(index, 1);
    setForm({ ...form, tags: newTags });
  };
  const removeImage = (index: number) => {
    const newImages = [...(form.images || [])];
    newImages.splice(index, 1);
    setForm({ ...form, images: newImages });
  };
  const removePackage = (index: number) => {
    const newPackages = [...(form.packages || [])];
    newPackages.splice(index, 1);
    setForm({ ...form, packages: newPackages });
  };
  const removeRequirement = (index: number) => {
    const newReqs = [...(form.requirements || [])];
    newReqs.splice(index, 1);
    setForm({ ...form, requirements: newReqs });
  };
  const removeFaq = (index: number) => {
    const newFaq = [...(form.faq || [])];
    newFaq.splice(index, 1);
    setForm({ ...form, faq: newFaq });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black p-6 md:p-12 pb-32">
        <div className="max-w-4xl mx-auto space-y-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-500 dark:text-gray-400 font-bold hover:text-purple-500 transition"
          >
            <ArrowLeft size={20} /> Back
          </button>

          <form
            onSubmit={handleSubmit}
            className="space-y-12 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-lg p-4 md:p-6 pt-8 lg:p-12 shadow-2xl"
          >
            <header>
              <h1 className="text-3xl font-semibold  dark:text-white">Create New Service</h1>
              <p className="text-gray-500 mt-2 font-medium dark:text-gray-400">
                Configure your professional listing details below.
              </p>
            </header>

            {/* 01. ESSENTIAL INFO */}
            <section className="space-y-6">
              <h2 className="text-base font-bold text-purple-500  border-b pb-2 border-purple-100">
                01. Essential Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-base font-semi-bold text-gray-400 dark:text-gray-200">Service Title *</label>
                  <input
                    required
                    className="w-full bg-gray-100 dark:bg-white rounded-2xl mt-1 p-4"
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Premium  Design"
                  />
                </div>
                <div>
                  <label className="text-base font-semi-bold text-gray-400 dark:text-gray-200">Category *</label>
                  <input
                    required
                    className="w-full bg-gray-100 dark:bg-white rounded-2xl mt-1 p-4"
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    placeholder="e.g. Design"
                  />
                </div>
              </div>

              <div>
                <label className="text-base font-semi-bold text-gray-400 dark:text-gray-200">Subcategory</label>
                <input
                  className="w-full bg-gray-100 dark:bg-white rounded-2xl mt-1 p-4"
                  onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
                  placeholder="e.g. Logo Design"
                />
              </div>

              <div>
                <label className="text-base  font-semi-bold text-gray-400 dark:text-gray-200">Description *</label>
                <textarea
                  required
                  className="w-full bg-gray-100 dark:bg-white rounded-2xl p-4 h-32 resize-none mt-1"
                  placeholder="Describe your service..."
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative">
                  <div>
                    <label className="text-base font-semi-bold text-gray-400 dark:text-gray-200">Price *</label>
                    <input
                      required
                      type="number"
                      className="w-full bg-gray-100 dark:bg-white rounded-2xl p-4 mt-1 pl-12"
                      onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                      placeholder="Base Price"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-base font-semi-bold text-gray-400 dark:text-gray-200">Currency *</label>
                  <input
                    className="w-full bg-gray-100 dark:bg-white rounded-2xl p-4 mt-1"
                    value={form.currency}
                    onChange={(e) => setForm({ ...form, currency: e.target.value })}
                    placeholder="Currency (e.g. USD)"
                  />
                </div>
              </div>
            </section>

            {/* 02. LOGISTICS */}
            <section className="space-y-6 pt-6">
              <h2 className="text-base font-bold text-purple-500  border-b pb-2 border-purple-100 dark:border-gray-300">
                02. Logistics & Status
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                <label className="text-base font-semi-bold text-gray-400 dark:text-gray-200">Delivery time</label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <input
                    className="w-full bg-gray-100 dark:bg-white rounded-2xl p-4 pl-12 mt-1"
                    onChange={(e) => setForm({ ...form, deliveryTime: e.target.value })}
                    placeholder="e.g. 72 Hours"
                  />
                </div>
                </div>
                <div>
                <label className="text-base font-semi-bold text-gray-400 dark:text-gray-200">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    className="w-full bg-gray-100 dark:bg-white rounded-2xl p-4 pl-12 mt-1"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="Location"
                  />
                </div>
              </div>
              </div>

              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isAvailable}
                    onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })}
                  />
                  <span className="dark:text-gray-200">Available</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                  />
                  <span className="dark:text-gray-200">Featured</span>
                </label>
              </div>
            </section>

            {/* 03. TAGS & IMAGES */}
            <section className="space-y-6 pt-6">
              <h2 className="text-base font-bold text-purple-500 border-b pb-2 border-purple-100 dark:border-gray-300">
                03. Tags & Images
              </h2>

              {/* Tags */}
              <div className="space-y-3">
                <label className="text-base font-semi-bold text-gray-400 dark:text-gray-200">Tags</label>
                <div className="flex flex-col md:flex-row gap-2 mt-1">
                  <input
                    value={tempTag}
                    onChange={(e) => setTempTag(e.target.value)}
                    className="grow bg-zinc-100 dark:bg-white p-4 rounded-2xl  "
                    placeholder="Add tag..."
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (tempTag) setForm({ ...form, tags: [...(form.tags || []), tempTag] });
                      setTempTag("");
                    }}
                    className="bg-gray-700 text-white px-6 py-3 md:py-0 rounded-2xl font-bold dark:bg-gray-600 dark:text-white"
                  >
                    Add
                  </button>
                </div>

                {/* Tags preview with remove */}
                {form.tags && form.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {form.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                      >
                        <Tag size={14} /> {tag}
                        <X
                          size={14}
                          className="cursor-pointer hover:text-pink-900"
                          onClick={() => removeTag(i)}
                        />
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Images */}
              <div className="space-y-3">
                <label className="text-base font-semi-bold text-gray-400 dark:text-gray-200">Images</label>
                <div className="flex flex-col md:flex-row gap-2 mt-1">
                  <input
                    value={tempImg}
                    onChange={(e) => setTempImg(e.target.value)}
                    className="grow bg-gray-100 dark:bg-white p-4 rounded-2xl"
                    placeholder="Paste image URL..."
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (tempImg) setForm({ ...form, images: [...(form.images || []), tempImg] });
                      setTempImg("");
                    }}
                    className="bg-gray-700 text-white px-6 py-3 md:py-0 rounded-2xl font-bold  dark:bg-gray-600 dark:text-white"
                  >
                    Add
                  </button>
                </div>

                {/* Image preview with remove */}
                {form.images && form.images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {form.images.map((src, i) => (
                      <div key={i} className="relative group">
                        <Image
                          src={src}
                          alt={`Preview ${i + 1}`}
                          width={300}
                          height={128}
                          className="w-full h-32 object-cover rounded-xl"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute top-2 right-2 bg-pink-600 text-white p-1 rounded-full opacity-80 hover:opacity-100"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* 04. PACKAGES, REQUIREMENTS, FAQ */}
            <section className="space-y-10 pt-6">
              <h2 className="text-base font-bold text-purple-500 border-b pb-2 border-purple-100 dark:border-gray-300">
                04. Packages, Requirements & FAQ
              </h2>

              {/* Packages */}
              <div className="space-y-3">
                <label className="text-base font-semi-bold text-gray-400 dark:text-gray-200">Packages</label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 md:gap-2 lg:gap-4 bg-gray-100 dark:bg-gray-800 px-2 p-6 md:px-4 md:p-4 rounded-3xl space-y-3 mt-1">

                  <div className="flex flex-col ">
                    <label className="text-sm font-semi-bold text-gray-400">Name</label>
                    <input
                      placeholder=""
                      value={tempPkg.name}
                      onChange={(e) => setTempPkg({ ...tempPkg, name: e.target.value })}
                      className="p-3 rounded-xl bg-white border-none mt-1"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-semi-bold text-gray-400 mt-1">Description</label>
                    <input
                      placeholder=""
                      value={tempPkg.description}
                      onChange={(e) => setTempPkg({ ...tempPkg, description: e.target.value })}
                      className="p-3 rounded-xl bg-white border-none"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-semi-bold text-gray-400">Price</label>
                    <input
                      type="number"
                      placeholder=""
                      value={tempPkg.price}
                      onChange={(e) => setTempPkg({ ...tempPkg, price: Number(e.target.value) })}
                      className="p-3 rounded-xl bg-white border-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (tempPkg.name)
                        setForm({ ...form, packages: [...(form.packages || []), tempPkg] });
                      setTempPkg({ name: "", description: "", price: 0 });
                    }}
                    className="bg-gray-700 text-white font-bold rounded-xl px-4 py-4 h-fit lg:py-4 mt-2 lg:mt-0"
                  >
                    Add
                  </button>
                </div>

                {/* Package preview with remove */}
                {form.packages && form.packages.length > 0 && (
                  <ul className="space-y-2">
                    {form.packages.map((pkg, i) => (
                      <li
                        key={i}
                        className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-xl flex justify-between items-start"
                      >
                        <div>
                          <strong className="text-purple-600">{pkg.name}</strong>
                          <span className="block text-gray-400">{pkg.description}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removePackage(i)}
                          className="text-gray-400 hover:text-pink-600 transition"
                        >
                          <X size={16} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Requirements */}
              <div className="space-y-3">
                <label className="text-base font-semi-bold text-gray-400 dark:text-gray-200">Requirement</label>
                <div className="flex flex-col md:flex-row gap-2">
                  <input
                    value={tempReq}
                    onChange={(e) => setTempReq(e.target.value)}
                    className="grow bg-gray-100 dark:bg-white p-4 rounded-2xl mt-1"
                    placeholder="Buyer requirement..."
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (tempReq)
                        setForm({ ...form, requirements: [...(form.requirements || []), tempReq] });
                      setTempReq("");
                    }}
                    className="bg-gray-700 text-white px-4 rounded-2xl font-bold dark:bg-gray-600 py-3"
                  >
                    Add
                  </button>
                </div>

                {/* Requirements preview with remove */}
                {form.requirements && form.requirements.length > 0 && (
                  <ul className="list-disc pl-6 space-y-1 text-zinc-600 dark:text-zinc-300">
                    {form.requirements.map((req, i) => (
                      <li key={i} className="flex justify-between items-center">
                        <span>{req}</span>
                        <X
                          size={14}
                          className="cursor-pointer text-gray-400 hover:text-pink-600"
                          onClick={() => removeRequirement(i)}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* FAQ */}
              <div className="space-y-3">
                <label className="text-base font-semi-bold text-gray-400 dark:text-gray-200">FAQ</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-100 dark:bg-gray-800 p-4 rounded-3xl mt-1">
                  <input
                    placeholder="Question"
                    value={tempFaq.question}
                    onChange={(e) => setTempFaq({ ...tempFaq, question: e.target.value })}
                    className="p-3 rounded-xl bg-white border-none"
                  />
                  <input
                    placeholder="Answer"
                    value={tempFaq.answer}
                    onChange={(e) => setTempFaq({ ...tempFaq, answer: e.target.value })}
                    className="p-3 rounded-xl bg-white border-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (tempFaq.question && tempFaq.answer)
                        setForm({ ...form, faq: [...(form.faq || []), tempFaq] });
                      setTempFaq({ question: "", answer: "" });
                    }}
                    className="bg-gray-700 text-white font-bold rounded-xl px-4  py-4"
                  >
                    Add FAQ
                  </button>
                </div>

                {/* FAQ preview with remove */}
                {form.faq && form.faq.length > 0 && (
                  <ul className="space-y-2">
                    {form.faq.map((item, i) => (
                      <li
                        key={i}
                        className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-xl flex justify-between"
                      >
                        <div>
                          <strong className="block text-purple-500">{item.question}</strong>
                          <span className="text-gray-400">{item.answer}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFaq(i)}
                          className="text-gray-400 hover:text-pink-600 transition"
                        >
                          <X size={16} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>

            <button
              disabled={mutation.isPending}
              className="w-full  py-4 bg-linear-to-r from-purple-500 to-pink-500 hover:bg-purple-600 text-white  rounded-xl transition-all shadow-xl shadow-purple-500/20 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
            >
              {mutation.isPending ? "Processing..." : <>Publish Service <Send size={22} /></>}
            </button>
          </form>
        </div>
      </div>
  );
};

export default CreateServicePage;