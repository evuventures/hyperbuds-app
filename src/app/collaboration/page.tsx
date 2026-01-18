"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, Plus, Search, Filter, X } from 'lucide-react';
import CollaborationCard from '@/components/collaboration/allcollaboration/CollabCard';
import { Collaboration } from '@/types/collaboration.types';
import DashboardLayout from "@/components/layout/Dashboard/Dashboard";
import { listCollaborations, deleteCollaboration } from '@/lib/api/collaboration.api';
import NewCollaborationModal from '@/components/collaboration/allcollaboration/NewCollab';
import toast from 'react-hot-toast';

// Defined interface to remove 'any' errors
interface FilterParams {
    status?: string;
    type?: string;
}

const AllCollaborationsPage = () => {
    const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);

    // Filter & Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCollab, setSelectedCollab] = useState<Collaboration | null>(null);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Wrapped in useCallback to satisfy useEffect dependency requirements
    const fetchCollabs = useCallback(async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        try {
            setIsLoading(true);
            const params: FilterParams = {};
            
            if (statusFilter !== 'all') params.status = statusFilter;
            if (typeFilter !== 'all') params.type = typeFilter;
            
            const data = await listCollaborations(token, params);
            
            // Client-side search filtering
            const filteredData = data.filter((c: Collaboration) => 
                c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.description.toLowerCase().includes(searchQuery.toLowerCase())
            );

            setCollaborations(filteredData);
        } catch {
            // Removed unused 'err' variable
            toast.error("Failed to load collaborations");
        } finally {
            setIsLoading(false);
        }
    }, [statusFilter, typeFilter, searchQuery]);

    useEffect(() => {
        if (isMounted) {
            const delayDebounceFn = setTimeout(() => {
                fetchCollabs();
            }, 300); 
            return () => clearTimeout(delayDebounceFn);
        }
    }, [isMounted, fetchCollabs]);

    // Handlers
    const handleDelete = async (id: string) => {
        const token = localStorage.getItem('accessToken');
        if (!token || !window.confirm("Delete this project?")) return;
        try {
            await deleteCollaboration(id, token);
            toast.success("Deleted");
            setCollaborations(prev => prev.filter(c => c.id !== id));
        } catch { 
            // Removed unused 'err' variable
            toast.error("Failed to delete"); 
        }
    };

    const handleUpdate = (collab: Collaboration) => {
        setSelectedCollab(collab);
        setIsModalOpen(true);
    };

    if (!isMounted) return null;

    return (
        <DashboardLayout>
            <div className="p-8 max-w-7xl mx-auto space-y-8">
                {/* Header Row */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold dark:text-white">Collaborations</h1>
                        <p className="text-sm text-gray-500">Search and filter through your active projects</p>
                    </div>
                    <button
                        onClick={() => { setSelectedCollab(null); setIsModalOpen(true); }}
                        className="flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-xl font-bold transition-all active:scale-95"
                    >
                        <Plus size={18} /> New Collab
                    </button>
                </div>

                {/* Filter Bar Row */}
                <div className="flex flex-col lg:flex-row gap-4 items-center bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by title or description..."
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-2 w-full lg:w-48">
                        <Filter size={14} className="text-gray-400 hidden lg:block" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>

                    <div className="w-full lg:w-48">
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="all">All Types</option>
                            <option value="video">Video</option>
                            <option value="podcast">Podcast</option>
                            <option value="challenge">Challenge</option>
                            <option value="series">Series</option>
                            <option value="event">Event</option>
                            <option value="photo-shoot">Photo Shoot</option>
                        </select>
                    </div>
                </div>

                {/* Content Grid */}
                {isLoading && collaborations.length === 0 ? (
                    <div className="flex justify-center py-20"><Loader2 className="animate-spin text-purple-600" size={40} /></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {collaborations.map((collab) => (
                            <CollaborationCard
                                key={collab.id}
                                collab={collab}
                                onDelete={handleDelete}
                                onUpdate={handleUpdate}
                            />
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && collaborations.length === 0 && (
                    <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/20 rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-800">
                        <p className="text-gray-500">No results found matching your criteria.</p>
                        <button 
                            onClick={() => { setSearchQuery(''); setStatusFilter('all'); setTypeFilter('all'); }}
                            className="mt-4 text-purple-600 font-bold hover:underline"
                        >
                            Reset all filters
                        </button>
                    </div>
                )}

                <NewCollaborationModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={fetchCollabs}
                    token={typeof window !== 'undefined' ? localStorage.getItem('accessToken') || '' : ''}
                    initialData={selectedCollab}
                />
            </div>
        </DashboardLayout>
    );
};

export default AllCollaborationsPage;