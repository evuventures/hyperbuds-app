'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { marketplaceApi } from "@/lib/api/marketplace.api";
import { useAuth } from "@/hooks/auth/useAuth"; 
import { ArrowLeft, Save, Trash2, Loader2 } from "lucide-react";

export default function EditServicePage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: 0
  });

  // 1. Fetch current data
  const { data, isLoading } = useQuery({
    queryKey: ["service", id],
    queryFn: () => marketplaceApi.getService(id as string),
  });

  // 2. Load data into form and check ownership
  useEffect(() => {
    if (data?.service) {
      setFormData({
        title: data.service.title,
        description: data.service.description,
        price: data.service.price
      });
    }
  }, [data]);

  const isOwner = user?.id === data?.service?.seller?._id || user?.id === data?.service?.seller;

  // 3. Update Mutation
  const updateMutation = useMutation({
    mutationFn: (payload: any) => marketplaceApi.updateService(id as string, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      router.push(`/marketplace/services/${id}`);
    }
  });

  // 4. Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: () => marketplaceApi.deleteService(id as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      router.push("/marketplace");
    }
  });

  if (isLoading) return <div className="p-20 text-center font-black animate-pulse">LOADING...</div>;
  
  if (!isOwner) return <div className="p-20 text-center font-black text-red-500">ACCESS DENIED</div>;

  return (
    <div className="max-w-2xl mx-auto py-12 px-6">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-[10px] font-black uppercase text-zinc-400 mb-8">
        <ArrowLeft size={14} /> Back to Details
      </button>

      <h1 className="text-3xl font-black uppercase italic tracking-tighter mb-10">Edit Service</h1>

      <div className="space-y-8">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Service Title</label>
          <input 
            value={formData.title}
            onChange={e => setFormData({...formData, title: e.target.value})}
            className="w-full p-4 bg-zinc-50 dark:bg-zinc-800 border-2 border-zinc-900 rounded-2xl font-bold outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Price (USD)</label>
          <input 
            type="number"
            value={formData.price}
            onChange={e => setFormData({...formData, price: Number(e.target.value)})}
            className="w-full p-4 bg-zinc-50 dark:bg-zinc-800 border-2 border-zinc-900 rounded-2xl font-bold outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Description</label>
          <textarea 
            rows={6}
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            className="w-full p-4 bg-zinc-50 dark:bg-zinc-800 border-2 border-zinc-900 rounded-2xl font-bold outline-none"
          />
        </div>

        <div className="flex gap-4 pt-6">
          <button 
            onClick={() => updateMutation.mutate(formData)}
            disabled={updateMutation.isPending}
            className="grow py-5 bg-zinc-900 text-white font-black uppercase text-xs rounded-2xl flex items-center justify-center gap-2 hover:bg-pink-600 transition disabled:opacity-50"
          >
            {updateMutation.isPending ? <Loader2 className="animate-spin" /> : <Save size={18} />}
            Save Changes
          </button>
          
          <button 
            onClick={() => confirm("Delete this listing?") && deleteMutation.mutate()}
            className="px-8 py-5 border-2 border-red-500 text-red-500 font-black uppercase text-xs rounded-2xl hover:bg-red-50 transition"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
