'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { marketplaceApi } from "@/lib/api/marketplace.api";
import { useAuth } from "@/hooks/auth/useAuth"; 
import { CreateServiceRequest, MarketplacePackage, MarketplaceFaq } from "@/types/marketplace.types";
import { ArrowLeft, Trash2, Loader2, X, Send, Clock,Tag,MapPin, AlertTriangle} from "lucide-react";
import DashboardLayout from "@/components/layout/Dashboard/Dashboard";
import Image from "next/image";
export default function EditServicePage() {
 const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { loading: isAuthLoading } = useAuth();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const emptyForm: CreateServiceRequest = {
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
  };

  const [form, setForm] = useState<CreateServiceRequest>(emptyForm);

  //  states for additions
  const [tempPkg, setTempPkg] = useState<MarketplacePackage>({ name: "", description: "", price: 0 });
  const [tempFaq, setTempFaq] = useState<MarketplaceFaq>({ question: "", answer: "" });
  const [tempReq, setTempReq] = useState("");
  const [tempTag, setTempTag] = useState("");
  const [tempImg, setTempImg] = useState("");

 
  const { data, isLoading: isServiceLoading } = useQuery({
    queryKey: ["service", id],
    queryFn: () => marketplaceApi.getService(id as string),
    enabled: !!id
  });

  useEffect(() => {
    if (data?.service) {
      
      setForm({
        ...emptyForm,
        ...data.service,
        tags: data.service.tags ?? [],
        images: data.service.images ?? [],
        packages: data.service.packages ?? [],
        faq: data.service.faq ?? [],
        requirements: data.service.requirements ?? [],
        subcategory: data.service.subcategory ?? "",
        deliveryTime: data.service.deliveryTime ?? "",
        location: data.service.location ?? "",
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  // Mutations
  const updateMutation = useMutation({
    mutationFn: (payload: CreateServiceRequest) => {
      const sanitizedData = {
        title: payload.title,
        description: payload.description,
        price: payload.price,
        currency: payload.currency,
        category: payload.category,
        subcategory: payload.subcategory,
        tags: payload.tags ?? [],
        images: payload.images ?? [],
        deliveryTime: payload.deliveryTime,
        location: payload.location,
        isAvailable: payload.isAvailable,
        featured: payload.featured,
        packages: payload.packages ?? [],
        requirements: payload.requirements ?? [],
        faq: payload.faq ?? [],
      };
      return marketplaceApi.updateService(id as string, sanitizedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      queryClient.invalidateQueries({ queryKey: ["service", id] });
      router.push(`/marketplace/services/${id}`);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: () => marketplaceApi.deleteService(id as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      router.push("/marketplace/services");
    }
  });

  // Removal helpers
  const removeItem = <T,>(arr: T[], idx: number): T[] => arr.filter((_, i) => i !== idx);

  if (isAuthLoading || isServiceLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-black">
        <Loader2 className="animate-spin text-purple-500" size={32} />
      </div>
    );
  }


  return (
    <DashboardLayout>
      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-lg border border-gray-200 dark:border-zinc-800 shadow-2xl p-6 md:p-10 overflow-hidden">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center text-red-500">
                <AlertTriangle size={40} />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold dark:text-white ">Delete Service?</h2>
                <p className="text-gray-500 dark:text-gray-200 text-sm">
                  This action is permanent and will remove your service from the global marketplace.
                </p>
              </div>
              <div className="flex flex-col w-full gap-3">
                <button 
                  onClick={() => deleteMutation.mutate()}
                  disabled={deleteMutation.isPending}
                  className="w-full py-4 bg-red-700 hover:bg-red-800 text-white rounded-2xl font-bold uppercase text-xs tracking-widest transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
                >
                  {deleteMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                  Confirm <span className="hidden md:flex">Permanent Delete</span>
                </button>
                <button 
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="w-full py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-300 rounded-2xl font-bold uppercase text-xs tracking-widest hover:opacity-80 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gray-50 dark:bg-black p-6 md:p-12 pb-32">
        <div className="max-w-4xl mx-auto space-y-8">
          
          <div className="flex justify-between items-center">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 font-bold hover:text-purple-500 transition">
              <ArrowLeft size={20} /> Back
            </button>
            <button 
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 p-3 rounded-2xl transition-all"
            >
              <Trash2 size={22} />
            </button>
          
          </div>

          <form 
            onSubmit={(e) => { e.preventDefault(); updateMutation.mutate(form); }}
            className="space-y-12 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-800 rounded-[2.5rem] p-4 pt-12 md:p-12 shadow-2xl"
          >
            <header>
              <h1 className="text-3xl font-semibold uppercase dark:text-white">Edit Service Details</h1>
              <p className="text-gray-500 mt-2 font-medium dark:text-gray-200">Update your professional parameters and pricing.</p>
            </header>

            {/* 01. ESSENTIAL INFO */}
            <section className="space-y-6">
              <h2 className="text-base font-bold text-purple-500 uppercase border-b pb-2 border-purple-100">
                01. Essential Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-semi-bold text-gray-500 dark:text-gray-200 ">Service Title *</label>
                  <input required value={form.title} className="w-full bg-gray-100 dark:bg-white rounded-2xl p-4 mt-1" onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-semi-bold text-gray-500 dark:text-gray-200 ">Category *</label>
                  <input required value={form.category} className="w-full bg-gray-100 dark:bg-white rounded-2xl p-4 mt-1" onChange={(e) => setForm({ ...form, category: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-sm font-semi-bold text-gray-500 dark:text-gray-200 ">Description *</label>
                <textarea required value={form.description} className="w-full bg-gray-100 dark:bg-white rounded-2xl p-4 h-32 resize-none mt-1" onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
               <div>
                <label className="text-sm font-semi-bold text-gray-500 dark:text-gray-200 ">Subcategory</label>
                <input value={form.subcategory} onChange={e => setForm({ ...form, subcategory: e.target.value })} className="w-full bg-gray-100 dark:bg-white rounded-2xl p-4 mt-1" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="">
                <label className="text-sm font-semi-bold text-gray-500 dark:text-gray-200 ">Price</label>
                <input type="number" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} placeholder="Price" className="w-full bg-gray-100 dark:bg-white rounded-2xl p-4 mt-1" />
                </div>
                <div className="">
                <label className="text-sm font-semi-bold text-gray-500 dark:text-gray-200 ">Currency</label>
                <input value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })} placeholder="Currency" className="w-full bg-gray-100 dark:bg-white rounded-2xl p-4 mt-1" />
              </div>
              </div>
            </section>

            {/* 02. LOGISTICS */}
            <section className="space-y-6">
              <h2 className="text-base font-bold text-purple-500 uppercase border-b pb-2 border-purple-100">02. Logistics & Status</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                <label className="text-sm font-semi-bold text-gray-500 dark:text-gray-200 ">Delivery Time</label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input value={form.deliveryTime} onChange={e => setForm({ ...form, deliveryTime: e.target.value })} placeholder="Delivery Time" className="w-full bg-gray-100 dark:bg-white rounded-2xl p-4 pl-12 mt-1" />
                </div>
                </div>
                <div>
                <label className="text-sm font-semi-bold text-gray-500 dark:text-gray-200">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Location" className="w-full bg-gray-100 dark:bg-white rounded-2xl p-4 pl-12 mt-1" />
                </div>

              </div>
              </div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer dark:text-white">
                  <input type="checkbox" checked={form.isAvailable} onChange={e => setForm({ ...form, isAvailable: e.target.checked })} /> Available
                </label>
                <label className="flex items-center gap-2 cursor-pointer dark:text-white">
                  <input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} /> Featured
                </label>
              </div>
            </section>

             {/* 03. TAGS & IMAGES */}
            <section className="space-y-6">
              <h2 className="text-base font-bold text-purple-500 uppercase border-b pb-2 border-purple-100">03. Tags & Images</h2>
              {/* Tags */}
               <label className="text-sm font-semi-bold text-gray-500 dark:text-gray-200 ">Tags</label>
              <div className="flex flex-col md:flex-row gap-2 mb-2 mt-2">
                <input placeholder="Add tag..." value={tempTag} onChange={e => setTempTag(e.target.value)} className="grow bg-gray-100 dark:bg-white p-4 rounded-2xl" />
                <button type="button" onClick={() => { if (tempTag) setForm({ ...form, tags: [...(form.tags ?? []), tempTag] }); setTempTag(""); }} className="bg-gray-700 text-white px-4 rounded-2xl font-bold dark:bg-gray-600 py-3">Add</button>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {(form.tags ?? []).map((tag, i) => (
                  <span key={i} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full flex items-center gap-2 text-sm">
                    <Tag size={14} /> {tag}
                    <X size={14} className="cursor-pointer" onClick={() => setForm({ ...form, tags: removeItem(form.tags ?? [], i) })} />
                  </span>
                ))}
              </div>

              {/* Images */}

              <label className="text-sm font-semi-bold text-gray-500 dark:text-gray-200">Images</label>
              <div className="flex flex-col md:flex-row gap-2 mb-2 mt-2">
                <input placeholder="Paste image URL..." value={tempImg} onChange={e => setTempImg(e.target.value)} className="grow bg-gray-100 dark:bg-white p-4 rounded-2xl" />
                <button type="button" onClick={() => { if (tempImg) setForm({ ...form, images: [...(form.images ?? []), tempImg] }); setTempImg(""); }} className="bg-gray-700 text-white px-4 rounded-2xl font-bold dark:bg-gray-600 py-3">Add</button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {(form.images ?? []).map((src, i) => (
                  <div key={i} className="relative group">
                    <Image src={src} alt={`Preview ${i+1}`} width={300} height={128} className="w-full h-32 object-cover rounded-xl" />
                    <button type="button" onClick={() => setForm({ ...form, images: removeItem(form.images ?? [], i) })} className="absolute top-2 right-2 bg-pink-600 text-white p-1 rounded-full"><X size={14} /></button>
                  </div>
                ))}
              </div>
            </section>

             {/* 04. PACKAGES, REQUIREMENTS & FAQ */}
            <section className="space-y-10">
              <h2 className="text-base font-bold text-purple-500 uppercase border-b pb-2 border-purple-100">04. Packages, Requirements & FAQ</h2>
              
              {/* Packages */}
               <label className="text-sm font-semi-bold text-gray-500 dark:text-gray-200  ">Packages</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-100 dark:bg-gray-800 p-4 rounded-3xl mb-4 mt-2">
                <input placeholder="Name" value={tempPkg.name} onChange={e => setTempPkg({ ...tempPkg, name: e.target.value })} className="p-3 rounded-xl bg-white border-none" />
                <input placeholder="Description" value={tempPkg.description} onChange={e => setTempPkg({ ...tempPkg, description: e.target.value })} className="p-3 rounded-xl bg-white border-none" />
                <input placeholder="Price" type="number" value={tempPkg.price || ""} onChange={e => setTempPkg({ ...tempPkg, price: Number(e.target.value) })} className="p-3 rounded-xl bg-white border-none" />
                <button type="button" onClick={() => { if (tempPkg.name) setForm({ ...form, packages: [...(form.packages ?? []), tempPkg] }); setTempPkg({ name: "", description: "", price: 0 }); }} className="bg-gray-700 text-white font-bold rounded-xl px-4 py-3 md:col-span-3">Add Package</button>
              </div>
              {(form.packages ?? []).map((pkg, i) => (
                <div key={i} className="bg-gray-50 dark:bg-gray-200 p-4 rounded-xl flex justify-between items-center mb-6">
                  <div><span className="font-bold text-purple-600 uppercase text-xs">{pkg.name}</span><span className="ml-4 font-bold">${pkg.price}</span></div>
                  <button type="button" onClick={() => setForm({ ...form, packages: removeItem(form.packages ?? [], i) })} className="text-gray-400 hover:text-red-500"><X size={16} /></button>
                </div>
              ))}

              {/* Requirements */}
              <div className="space-y-2 mb-4">
                 <label className="text-sm font-semi-bold text-gray-500 dark:text-gray-200 ">Requirements</label>
                <div className="flex flex-col md:flex-row gap-2 mt-2">
                  <input placeholder="Buyer Requirement..." value={tempReq} onChange={e => setTempReq(e.target.value)} className="grow bg-gray-100 dark:bg-white p-4 rounded-2xl" />
                  <button type="button" onClick={() => { if (tempReq) setForm({ ...form, requirements: [...(form.requirements ?? []), tempReq] }); setTempReq(""); }} className="bg-gray-700 text-white px-4 rounded-2xl font-bold dark:bg-gray-600 py-3">Add</button>
                </div>
                {(form.requirements ?? []).map((req, i) => (
                  <div key={i} className="flex justify-between items-center bg-gray-50 dark:bg-gray-200 p-4 rounded-xl mb-1">
                    <span>{req}</span>
                    <button type="button" onClick={() => setForm({ ...form, requirements: removeItem(form.requirements ?? [], i) })} className="text-gray-400"><X size={16} /></button>
                  </div>
                ))}
              </div>

              {/* FAQ */}
              <div className="space-y-2">
                 <label className="text-sm font-semi-bold text-gray-500 dark:text-gray-200">FAQ</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2 mt-2">
                  <input placeholder="Question" value={tempFaq.question} onChange={e => setTempFaq({ ...tempFaq, question: e.target.value })} className="p-3 rounded-xl bg-gray-100 dark:bg-white" />
                  <input placeholder="Answer" value={tempFaq.answer} onChange={e => setTempFaq({ ...tempFaq, answer: e.target.value })} className="p-3 rounded-xl bg-gray-100 dark:bg-white" />
                  <button type="button" onClick={() => { if (tempFaq.question && tempFaq.answer) setForm({ ...form, faq: [...(form.faq ?? []), tempFaq] }); setTempFaq({ question: "", answer: "" }); }} className="bg-gray-700 text-white font-bold rounded-xl px-4 py-3 md:col-span-2 dark:bg-gray-600">Add FAQ</button>
                </div>
                {(form.faq ?? []).map((item, i) => (
                  <div key={i} className="bg-gray-50 dark:bg-gray-200 p-4 rounded-xl flex justify-between items-start mb-1">
                    <div>
                      <strong className="block text-purple-500 text-xs uppercase">{item.question}</strong>
                      <span className="text-gray-400 text-sm">{item.answer}</span>
                    </div>
                    <button type="button" onClick={() => setForm({ ...form, faq: removeItem(form.faq ?? [], i) })} className="text-gray-400"><X size={16} /></button>
                  </div>
                ))}
              </div>
            </section>


            <button
              disabled={updateMutation.isPending}
              className="w-full  py-4 bg-linear-to-r from-purple-500 to-blue-500 hover:bg-purple-600 text-white   rounded-xl transition-all shadow-xl shadow-purple-500/20 flex items-center justify-center gap-1 md:gap-3 active:scale-95 disabled:opacity-50"
            >
              {updateMutation.isPending ? "UPDATING REGISTRY..." : <>UPDATE<span className="hidden md:flex">SERVICE REGISTRY </span><Send size={22} /></>}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}