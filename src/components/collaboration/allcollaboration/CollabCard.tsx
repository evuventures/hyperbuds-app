"use client"
import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Info, Pencil, Trash2, Globe, Lock } from 'lucide-react';
import ViewCollabModal from './ViewCollab';
import { Collaboration } from '@/types/collaboration.types';

interface Props {
    // Replaced 'any' with the Collaboration type
    collab: Collaboration;
    onDelete: (id: string) => void;
    // Replaced 'any' with the Collaboration type
    onUpdate: (collab: Collaboration) => void;
}

const CollaborationCard = ({ collab, onDelete, onUpdate }: Props) => {
    const [showMenu, setShowMenu] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const closeMenu = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', closeMenu);
        return () => document.removeEventListener('mousedown', closeMenu);
    }, []);

    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col h-85 relative hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="p-5 pb-0 flex justify-between items-start">
                <div className="flex gap-3 overflow-hidden">
                    <div className="min-w-10.5 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                        {collab.title?.[0] || 'C'}
                    </div>
                    <div className="overflow-hidden">
                        <h3 className="font-bold text-gray-900 dark:text-white truncate pr-2">{collab.title}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                           <span className="text-[10px] font-black text-purple-600 uppercase bg-purple-50 dark:bg-purple-900/20 px-1.5 py-0.5 rounded">
                                {collab.type}
                           </span>
                           {collab.isPublic ? <Globe size={10} className="text-gray-400"/> : <Lock size={10} className="text-gray-400"/>}
                        </div>
                    </div>
                </div>

                <div className="relative" ref={menuRef}>
                    <button onClick={() => setShowMenu(!showMenu)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                        <MoreVertical size={18} className="text-gray-400" />
                    </button>
                    {showMenu && (
                        <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-xl z-20 py-1">
                            <button 
                                onClick={() => { onUpdate(collab); setShowMenu(false); }} 
                                className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2"
                            >
                                <Pencil size={14} className="text-blue-500" /> Update
                            </button>
                            <button 
                                onClick={() => { onDelete(collab.id); setShowMenu(false); }} 
                                className="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"
                            >
                                <Trash2 size={14} /> Delete
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Description */}
            <div className="p-5 grow overflow-hidden">
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-4 italic">
                    {collab.description}
                </p>
            </div>

            {/* Minimal Tags */}
            <div className="px-5 pb-4 flex flex-wrap gap-1.5 overflow-hidden h-7.5">
                {Array.isArray(collab.tags) && collab.tags.slice(0, 3).map((tag: string, i: number) => (
                    <span key={i} className="text-[9px] font-bold bg-gray-50 dark:bg-gray-800 text-gray-500 px-2 py-0.5 rounded border border-gray-100 dark:border-gray-700 truncate max-w-22.5">
                        #{tag}
                    </span>
                ))}
                {Array.isArray(collab.tags) && collab.tags.length > 3 && (
                    <span className="text-[9px] text-gray-400 font-bold">
                        +{collab.tags.length - 3}
                    </span>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-50 dark:border-gray-800">
                <button 
                    onClick={() => setIsViewOpen(true)}
                    className="w-full py-2.5 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-xl text-xs font-bold transition-transform active:scale-95 flex items-center justify-center gap-2"
                >
                    <Info size={14} /> View Details
                </button>
            </div>

            <ViewCollabModal 
                isOpen={isViewOpen} 
                onClose={() => setIsViewOpen(false)} 
                collab={{
                    ...collab,
                    type: collab.type || 'standard',
                    isPublic: collab.isPublic ?? true
                }} 
            />
        </div>
    );
};

export default CollaborationCard;