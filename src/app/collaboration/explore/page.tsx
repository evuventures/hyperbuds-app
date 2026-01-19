"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { Search, Loader2, Sparkles, Send } from 'lucide-react';
import CollaborationCard from '@/components/collaboration/allcollaboration/CollabCard';
import { searchCollaborations, requestToJoin } from '@/lib/api/collaboration.api';
import { Collaboration } from '@/types/collaboration.types';
import DashboardLayout from "@/components/layout/Dashboard/Dashboard";

interface SearchPageProps {
    myUserId: string; // Passed from your Auth context or Session
}

const SearchPage = ({ myUserId }: SearchPageProps) => {
    const [results, setResults] = useState<Collaboration[]>([]);
    const [loading, setLoading] = useState(false);
    const [isApplying, setIsApplying] = useState<string | null>(null);
    const [filters, setFilters] = useState({
        tags: '',
        type: 'Any',
        status: 'Any'
    });

    const fetchDiscoveryFeed = useCallback(async () => {
        setLoading(true);
        try {
            // Using the new Axios-based API call (Token is handled by interceptor)
            const data = await searchCollaborations({
                tags: filters.tags || undefined,
                type: filters.type === 'Any' ? undefined : filters.type,
            });

            // Filter out projects owned by the current user
            const othersProjects = data.filter((collab: Collaboration) => {
                const isNotMine = collab.ownerId !== myUserId;
                const matchesStatus = filters.status === 'Any' || 
                                     collab.status.toLowerCase() === filters.status.toLowerCase();
                return isNotMine && matchesStatus;
            });

            setResults(othersProjects);
        } catch (error) {
            console.error("Discovery fetch failed:", error);
        } finally {
            setLoading(false);
        }
    }, [filters, myUserId]);

    useEffect(() => {
        fetchDiscoveryFeed();
    }, [fetchDiscoveryFeed]);

    const handleApply = async (collabId: string) => {
        const message = window.prompt("Introduce yourself to the creator:");
        if (!message) return;

        setIsApplying(collabId);
        try {
            const success = await requestToJoin(collabId, myUserId, message);
            if (success) {
                alert("Application sent successfully!");
            }
        } catch (error) {
            console.error("Application failed:", error);
        } finally {
            setIsApplying(null);
        }
    };

    return (
        <DashboardLayout>
            <div className="flex-1 bg-gray-50/50 dark:bg-black p-8 min-h-screen transition-colors duration-200">
                <header className="mb-8">
                    <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="text-purple-600 dark:text-[#00f2ea]" size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-purple-600 dark:text-[#00f2ea]">
                            Discovery Feed
                        </span>
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Explore Collaborations</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Join projects from creators around the world</p>
                </header>

                {/* Search Bar Container */}
                <div className="bg-white dark:bg-gray-900 rounded-3xl p-2 shadow-sm border border-gray-100 dark:border-white/5 flex items-center mb-6">
                    <div className="flex-1 flex items-center gap-3 px-4">
                        <Search className="text-gray-400" size={20} />
                        <input 
                            className="w-full bg-transparent outline-none text-sm text-gray-900 dark:text-white"
                            placeholder="Search by keywords or #tags..."
                            value={filters.tags}
                            onChange={(e) => setFilters({...filters, tags: e.target.value})}
                        />
                    </div>
                    <button 
                        onClick={fetchDiscoveryFeed}
                        disabled={loading}
                        className="bg-purple-600 dark:bg-[#00f2ea] text-white dark:text-black px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" size={16}/> : 'Search'}
                    </button>
                </div>

                {/* Filter Pills */}
                <div className="flex flex-wrap gap-4 mb-10">
                    <div className="flex items-center gap-2 bg-white dark:bg-gray-900 px-4 py-2 rounded-xl border border-gray-100 dark:border-white/5">
                        <span className="text-[10px] font-black uppercase text-gray-400">Type:</span>
                        <select 
                            className="bg-transparent text-xs font-bold text-gray-900 dark:text-white outline-none cursor-pointer"
                            value={filters.type}
                            onChange={(e) => setFilters({...filters, type: e.target.value})}
                        >
                            <option value="Any">All Types</option>
                            <option value="Challenge">Challenge</option>
                            <option value="Video">Video</option>
                            <option value="Podcast">Podcast</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2 bg-white dark:bg-gray-900 px-4 py-2 rounded-xl border border-gray-100 dark:border-white/5">
                        <span className="text-[10px] font-black uppercase text-gray-400">Status:</span>
                        <select 
                            className="bg-transparent text-xs font-bold text-gray-900 dark:text-white outline-none cursor-pointer"
                            value={filters.status}
                            onChange={(e) => setFilters({...filters, status: e.target.value})}
                        >
                            <option value="Any">All Statuses</option>
                            <option value="Open">Open</option>
                            <option value="In Progress">Active</option>
                        </select>
                    </div>
                </div>

                {/* Results Grid */}
                {loading && results.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="animate-spin text-purple-600 dark:text-[#00f2ea] mb-4" size={32} />
                        <p className="text-xs font-black uppercase tracking-tighter text-gray-400">Loading Feed...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {results.map((collab) => (
                            <div key={collab.id} className="relative group">
                                <CollaborationCard 
                                    collab={collab} 
                                    onUpdate={() => {}} 
                                    onDelete={() => {}} 
                                    onManageDeliverables={() => {}}
                                />
                                
                                <button 
                                    onClick={() => handleApply(collab.id)}
                                    disabled={isApplying === collab.id}
                                    className="absolute bottom-20 left-1/2 -translate-x-1/2 w-[85%] py-3 bg-purple-600 dark:bg-[#00f2ea] text-white dark:text-black rounded-2xl text-[10px] font-black uppercase opacity-0 group-hover:opacity-100 transition-all shadow-2xl flex items-center justify-center gap-2 hover:scale-105"
                                >
                                    {isApplying === collab.id ? (
                                        <Loader2 className="animate-spin" size={14} />
                                    ) : (
                                        <><Send size={14} /> Apply to Join</>
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default SearchPage;