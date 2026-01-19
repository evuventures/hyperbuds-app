"use client"
import React, { useState, useEffect } from 'react';
import { History, Clock, CheckCircle2, ArrowUpRight, Calendar, Ban, Search } from 'lucide-react';
import DashboardLayout from "@/components/layout/Dashboard/Dashboard";
import { getCollaborationHistory } from '@/lib/api/collaboration.api';
import { CollaborationHistoryItem } from '@/types/collaboration.types';

const HistoryPage = ({ token }: { token: string }) => {
    const [history, setHistory] = useState<CollaborationHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadHistory = async () => {
            try {
                const data = await getCollaborationHistory(token);
                setHistory(data);
            } catch (err) {
                console.error("History fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        loadHistory();
    }, [token]);

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'Completed': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'Updated': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'Invite Received': return 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20';
            case 'Cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20';
            default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Completed': return <CheckCircle2 size={14} />;
            case 'Updated': return <ArrowUpRight size={14} />;
            case 'Invite Received': return <Calendar size={14} />;
            case 'Cancelled': return <Ban size={14} />;
            default: return <Clock size={14} />;
        }
    };

    return (
        <DashboardLayout>
            <div className="flex-1 bg-gray-50/50 dark:bg-black p-8 min-h-screen transition-colors duration-200">
                <header className="flex justify-between items-end mb-10">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <History className="text-purple-600 dark:text-[#00f2ea]" size={18} />
                            <span className="text-[10px] font-black uppercase tracking-widest text-purple-600 dark:text-[#00f2ea]">Archive</span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Collaboration History</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Track all your past activities and milestones</p>
                    </div>
                    
                    <div className="hidden md:flex items-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/5 rounded-xl px-4 py-2 gap-3 shadow-sm">
                        <Search size={16} className="text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Filter by date..." 
                            className="bg-transparent text-xs outline-none dark:text-white w-32"
                        />
                    </div>
                </header>

                <div className="space-y-4 max-w-5xl">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                        </div>
                    ) : history.length > 0 ? (
                        history.map((item) => (
                            <div 
                                key={item.id} 
                                className="relative group bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 p-6 rounded-3xl flex items-center justify-between hover:border-purple-200 dark:hover:border-white/10 transition-all shadow-sm"
                            >
                                <div className="flex items-center gap-6">
                                    {/* Timeline Line Connector */}
                                    <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-4 h-0.5 bg-gray-200 dark:bg-gray-800 hidden lg:block" />
                                    
                                    <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-bold text-gray-500 dark:text-gray-400 text-xs shrink-0 border border-gray-200 dark:border-white/5">
                                        {item.initials}
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-0.5">{item.title}</h3>
                                        <p className="text-[11px] text-gray-400 font-medium mb-2">{item.clientName}</p>
                                        <p className="text-[11px] text-gray-500 dark:text-gray-400 italic">&quot;{item.description}&ldquo;</p>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border mb-3 ${getStatusStyles(item.status)}`}>
                                        {getStatusIcon(item.status)}
                                        {item.status}
                                    </div>
                                    <div className="text-[10px] text-gray-400 font-medium flex items-center justify-end gap-1.5">
                                        <Clock size={12} />
                                        {item.timestamp}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-white dark:bg-gray-900/30 rounded-3xl border border-dashed border-gray-200 dark:border-white/5">
                            <History className="mx-auto text-gray-300 dark:text-gray-700 mb-4" size={48} />
                            <h3 className="text-gray-900 dark:text-white font-bold">No history found</h3>
                            <p className="text-xs text-gray-500">Your completed projects will appear here.</p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default HistoryPage;