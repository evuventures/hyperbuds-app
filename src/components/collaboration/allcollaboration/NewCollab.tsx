"use client"
import React, { useState, useEffect } from 'react';
import { X, Loader2, Tag as TagIcon } from 'lucide-react';
import { createCollaboration, updateCollaboration, CreateCollaborationRequest } from '@/lib/api/collaboration.api';
import { Collaboration } from '@/types/collaboration.types';
import toast from 'react-hot-toast';

interface Props {
    isOpen: boolean; 
    onClose: () => void; 
    onSuccess: () => void; 
    token: string; 
    initialData?: Collaboration | null; 
}

const NewCollaborationModal = ({ isOpen, onClose, onSuccess, token, initialData }: Props) => {
    const [isLoading, setIsLoading] = useState(false);
    const [tagInput, setTagInput] = useState('');

    const [formData, setFormData] = useState<CreateCollaborationRequest>({
        title: '', description: '', type: 'video',
        details: {}, content: {}, tags: [], isPublic: true,
    });

    useEffect(() => {
        if (initialData && isOpen) {
            setFormData({
                title: initialData.title || '', description: initialData.description || '',
                type: initialData.type || 'video', details: initialData.details || {},
                content: initialData.content || {}, tags: initialData.tags || [],
                isPublic: initialData.isPublic ?? true,
            });
        } else if (!initialData && isOpen) {
            setFormData({ title: '', description: '', type: 'video', details: {}, content: {}, tags: [], isPublic: true });
        }
    }, [initialData, isOpen]);

    const addTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const tag = tagInput.trim();
            if (tag.length > 30) { toast.error("Tag is too long"); return; }
            if (tag && !formData.tags.includes(tag)) {
                setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
                setTagInput('');
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.description.length < 10) {
            toast.error("Description must be at least 10 characters");
            return;
        }
        setIsLoading(true);

        const finalTags = [...formData.tags];
        if (tagInput.trim() && !finalTags.includes(tagInput.trim())) {
            finalTags.push(tagInput.trim());
        }

        const payload = { ...formData, tags: finalTags };

        try {
            if (initialData?.id) {
                // FIX: Use underscore to ignore the unused 'type' variable
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { type: _, ...updateData } = payload;
                await updateCollaboration(initialData.id, updateData, token);
            } else {
                await createCollaboration(payload, token);
            }
            onSuccess();
            onClose();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Failed to save";
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-900 w-full max-w-xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <h2 className="text-xl font-bold dark:text-white">{initialData ? 'Update Collaboration' : 'New Collaboration'}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button>
                </div>

                <form id="collab-form" onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</label>
                            <select 
                                disabled={!!initialData}
                                className="w-full px-4 py-3 rounded-2xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700 outline-none"
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                            >
                                {['video', 'challenge', 'series', 'event', 'photo-shoot', 'podcast', 'other'].map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Visibility</label>
                            <select 
                                className="w-full px-4 py-3 rounded-2xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700 outline-none"
                                value={formData.isPublic ? 'public' : 'private'}
                                onChange={e => setFormData({ ...formData, isPublic: e.target.value === 'public' })}
                            >
                                <option value="public">Public</option>
                                <option value="private">Private</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Project Title</label>
                        <input 
                            required className="w-full px-4 py-3 rounded-2xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700 outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Description</label>
                        <textarea 
                            required rows={4} className="w-full px-4 py-3 rounded-2xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700 outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tags (Press Enter)</label>
                        <div className="flex flex-wrap gap-2 p-3 border border-gray-100 dark:border-gray-700 rounded-2xl dark:bg-gray-800 min-h-12.5">
                            {formData.tags.map((tag, index) => (
                                <span key={index} className="flex items-center gap-1.5 bg-purple-600 text-white px-3 py-1 rounded-xl text-[10px] font-bold">
                                    <TagIcon size={10} /> {tag}
                                    <button type="button" onClick={() => setFormData(prev => ({...prev, tags: prev.tags.filter((_, i) => i !== index)}))}><X size={12} /></button>
                                </span>
                            ))}
                            <input 
                                maxLength={30} className="flex-1 bg-transparent outline-none text-sm px-2 py-1 dark:text-white"
                                placeholder="Add tags..." value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)} onKeyDown={addTag}
                            />
                        </div>
                    </div>
                </form>

                <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3 bg-gray-50/50 dark:bg-gray-800/50">
                    <button type="button" onClick={onClose} className="px-6 py-2.5 text-sm font-bold text-gray-400 hover:text-gray-600">Cancel</button>
                    <button 
                        type="submit" form="collab-form" disabled={isLoading}
                        className="bg-purple-600 text-white px-10 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-purple-500/20 disabled:bg-purple-400 transition-all active:scale-95"
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={18} /> : (initialData ? 'Update Project' : 'Launch Project')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NewCollaborationModal;