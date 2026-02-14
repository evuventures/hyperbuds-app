"use client"
import React from 'react';
import { MoreVertical, Phone, Video } from 'lucide-react';
import { User } from '@/types/messaging.types'; // Import the User type

interface ChatHeaderProps {
  // Update the prop from conversation to recipient
  recipient?: User; 
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ recipient }) => {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-[#0F172A] z-10">
      <div className="flex items-center gap-3">
        {/* Profile Picture with Status Indicator */}
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-linear-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
            {/* Logic: Uses username first, then name, then email prefix */}
            {recipient?.username?.[0].toUpperCase() || 
             recipient?.name?.[0].toUpperCase() || 
             recipient?.email?.[0].toUpperCase() || 'H'}
          </div>
          {recipient?.status === 'online' && (
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-slate-900 rounded-full" />
          )}
        </div>

        {/* User Info */}
        <div>
          <h3 className="text-sm font-bold text-white leading-none">
            {/* Displays the handle or name of the other Hyperbud */}
            {recipient?.username || recipient?.name || recipient?.email?.split('@')[0] || "Hyperbud Creator"}
          </h3>
          <p className="text-[10px] text-slate-500 mt-1">
            {recipient?.status === 'online' ? 'Active now' : 'Away'}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4 text-slate-500">
        <button className="hover:text-purple-500 transition-colors">
          <Phone size={18} />
        </button>
        <button className="hover:text-purple-500 transition-colors">
          <Video size={18} />
        </button>
        <button className="hover:text-purple-500 transition-colors">
          <MoreVertical size={18} />
        </button>
      </div>
    </div>
  );
};