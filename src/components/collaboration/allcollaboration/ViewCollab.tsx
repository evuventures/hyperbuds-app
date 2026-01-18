"use client"
import React from 'react';
import { X, Tag as TagIcon, Globe, Lock } from 'lucide-react';

interface Collaboration {
    type: string;
    isPublic: boolean;
    title: string;
    description: string;
    tags?: string[];
}

const ViewCollabModal = ({ isOpen, onClose, collab }: { isOpen: boolean, onClose: () => void, collab: Collaboration }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-110 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-900 w-full max-w-xl rounded-3xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/30 dark:bg-gray-800/50">
                    <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-purple-600 text-white text-[10px] font-black rounded-lg uppercase tracking-wider">
                            {collab.type}
                        </span>
                        <div className="flex items-center gap-1.5 text-gray-400 text-xs font-medium border-l pl-3">
                            {collab.isPublic ? <><Globe size={12}/> Public</> : <><Lock size={12}/> Private</>}
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors dark:text-white">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 overflow-y-auto space-y-6 custom-scrollbar">
                    {/* Title & Description */}
                    <section>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-4 leading-tight">{collab.title}</h2>
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-inner">
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap text-sm italic">
                                &#34;{collab.description}&#34;
                            </p>
                        </div>
                    </section>

                    {/* Tags Section - Fixed undefined checks */}
                    {(collab.tags?.length ?? 0) > 0 && (
                        <section>
                            <h4 className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">
                                <TagIcon size={12}/> Collaboration Tags
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {collab.tags?.map((tag: string, i: number) => (
                                    <span key={i} className="px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 text-[11px] font-bold text-purple-600 rounded-lg border border-purple-100 dark:border-purple-800/30">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 bg-gray-50/50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex justify-end items-center">
                    <button 
                        onClick={onClose} 
                        className="px-12 py-3 bg-purple-600 text-white font-black rounded-2xl hover:bg-purple-700 transition-all text-[10px] uppercase tracking-widest shadow-lg shadow-purple-500/20"
                    >
                        Dismiss
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewCollabModal;