"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { Check, X, Clock, Inbox } from 'lucide-react';
import DashboardLayout from "@/components/layout/Dashboard/Dashboard";
import { getPendingInvites, respondToInvite } from '@/lib/api/collaboration.api';
import { PendingInvite } from '@/types/collaboration.types';

const InvitesPage = ({ token }: { token: string }) => {
    const [invites, setInvites] = useState<PendingInvite[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');

    const loadInvites = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getPendingInvites(token);
            setInvites(data || []); 
        } catch (err) { 
            console.error("Failed to load invites:", err); 
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        loadInvites();
    }, [loadInvites, token]);

    const handleAction = async (id: string, action: 'accept' | 'decline') => {
        try {
            const success = await respondToInvite(id, { action }, token);
            if (success) loadInvites(); 
        } catch (err) {
            console.error(`Failed to ${action} invite:`, err);
        }
    };

    return (
        <DashboardLayout>
            {/* Background adapts to light/dark mode */}
            <div className="flex-1 bg-gray-50/50 dark:bg-black p-8 min-h-screen transition-colors duration-200">
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Pending Invites</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-xs">Manage collaboration invitations</p>
                    </div>
                   
                </header>

                {/* Tabs */}
                <div className="flex gap-2 mb-8 bg-gray-100 dark:bg-gray-900/50 p-1 rounded-2xl w-fit">
                    <button 
                        onClick={() => setActiveTab('received')}
                        className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${
                            activeTab === 'received' 
                            ? 'bg-white dark:bg-gray-800 text-purple-600 dark:text-white shadow-sm' 
                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                    >
                        Received ({invites.length})
                    </button>
                    <button 
                        onClick={() => setActiveTab('sent')}
                        className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${
                            activeTab === 'sent' 
                            ? 'bg-white dark:bg-gray-800 text-purple-600 dark:text-white shadow-sm' 
                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                    >
                        Sent (0)
                    </button>
                </div>

                <div className="space-y-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-4"></div>
                            <p className="text-xs font-medium uppercase tracking-widest">Loading Invites...</p>
                        </div>
                    ) : invites.length > 0 ? (
                        invites.map((invite) => (
                            <div 
                                key={invite.id} 
                                className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-center group hover:border-purple-200 dark:hover:border-white/10 transition-all shadow-sm dark:shadow-none"
                            >
                                <div className="flex items-center gap-4 w-full sm:w-auto mb-4 sm:mb-0">
                                    <div className="w-12 h-12 rounded-full bg-linear-to-tr from-purple-500 to-blue-400 dark:to-[#00f2ea] flex items-center justify-center font-bold text-white dark:text-black shrink-0">
                                        {invite.senderName.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">{invite.title}</h3>
                                        <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">{invite.senderName}</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                                    <div className="text-left sm:text-right">
                                        <p className="text-sm font-black text-purple-600 dark:text-white">{invite.amount || 'Equity'}</p>
                                        <span className="text-[9px] text-gray-400 dark:text-gray-500 flex items-center gap-1 sm:justify-end">
                                            <Clock size={10} /> Expires {invite.expiresIn || 'soon'}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => handleAction(invite.id, 'decline')} 
                                            className="p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors border border-transparent hover:border-red-100 dark:hover:border-red-500/20"
                                            title="Decline"
                                        >
                                            <X size={18} />
                                        </button>
                                        <button 
                                            onClick={() => handleAction(invite.id, 'accept')} 
                                            className="p-2.5 bg-purple-600 dark:bg-[#00f2ea] text-white dark:text-black rounded-xl hover:scale-105 transition-transform shadow-lg shadow-purple-200 dark:shadow-none"
                                            title="Accept"
                                        >
                                            <Check size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="bg-white dark:bg-[#111] border border-dashed border-gray-200 dark:border-white/10 rounded-3xl py-20 flex flex-col items-center justify-center text-center px-4">
                            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-full mb-4">
                                <Inbox className="text-gray-300 dark:text-gray-700" size={32} />
                            </div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">No pending invites</h2>
                            <p className="text-xs text-gray-500 max-w-50">When creators want to collaborate with you, they&apos;ll appear here.</p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default InvitesPage;