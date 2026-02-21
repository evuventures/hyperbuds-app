"use client"
import React, { useState, useMemo } from 'react';
import { useAppSelector } from '@/store/hooks';
import { ConversationItem } from './ConversationItem';
import { Search } from 'lucide-react';

type FilterType = 'All' | 'Unread' | 'Archived';

export const ConversationList = () => {
  const { conversations, activeConversationId } = useAppSelector((state) => state.chat);
  const { user: currentUser } = useAppSelector((state) => state.auth);
  
  // Standardized ID logic to match your auth refactor
  const currentUserId = currentUser?.id || currentUser?._id;

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');

  // 1. Spontaneous Tab Counts
  const counts = useMemo(() => {
    const safeConversations = Array.isArray(conversations) ? conversations : [];
    return {
      All: safeConversations.filter(c => !c.isArchived).length,
      Unread: safeConversations.filter(c => {
        const userUnread = (c.unreadCounts ?? []).find(u => u.userId === currentUserId);
        return (userUnread?.count || 0) > 0 && !c.isArchived;
      }).length,
      Archived: safeConversations.filter(c => c.isArchived).length,
    };
  }, [conversations, currentUserId]);

  // 2. Filtered & Spontaneously Sorted List
  const filteredConversations = useMemo(() => {
    const safeConversations = Array.isArray(conversations) ? conversations : [];
    
    // ✅ Sort by the most recent timestamp available (message or activity)
    const sortedList = [...safeConversations].sort((a, b) => {
      const dateA = new Date(a.lastMessage?.createdAt || a.lastActivity || a.updatedAt).getTime();
      const dateB = new Date(b.lastMessage?.createdAt || b.lastActivity || b.updatedAt).getTime();
      return dateB - dateA;
    });

    return sortedList.filter((chat) => {
      // ✅ Improved otherUser detection logic
      const otherUser = chat.participants?.find(p => p._id !== currentUserId && p.id !== currentUserId) || chat.participants?.[0];
      const query = searchQuery.toLowerCase();
      
      const matchesSearch = 
        (otherUser?.username?.toLowerCase() || "").includes(query) || 
        (otherUser?.fullName?.toLowerCase() || "").includes(query) ||
        (otherUser?.email?.toLowerCase() || "").includes(query);
      
      const userUnreadData = (chat.unreadCounts ?? []).find(u => u.userId === currentUserId);
      const hasUnread = (userUnreadData?.count || 0) > 0;

      if (activeFilter === 'Archived') return matchesSearch && chat.isArchived;
      if (activeFilter === 'Unread') return matchesSearch && hasUnread && !chat.isArchived;
      return matchesSearch && !chat.isArchived;
    });
    // ✅ Dependencies ensure this re-runs when ANY part of conversations changes
  }, [conversations, searchQuery, activeFilter, currentUserId]);

  return (
    <div className="flex flex-col h-full bg-[#0F172A] border-r border-slate-800/50">
      <div className="p-6 pb-2">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white tracking-tight">Messages</h2>
        </div>

        <div className="relative mb-5">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input 
            type="text" 
            placeholder="Search creators..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1E293B] border-none rounded-xl py-2.5 pl-11 pr-12 text-sm text-slate-200 placeholder:text-slate-500 focus:ring-1 focus:ring-purple-500/50 transition-all outline-none"
          />
        </div>

        {/* Tab Filters */}
        <div className="flex p-1 bg-[#1E293B] rounded-xl mb-6">
          {(['All', 'Unread', 'Archived'] as FilterType[]).map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeFilter === tab ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <span>{tab}</span>
              {counts[tab] > 0 && (
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${
                  activeFilter === tab ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {counts[tab]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4 scrollbar-hide">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-10 text-center opacity-30">
            <Search size={32} className="text-slate-400 mb-4" />
            <p className="text-sm font-bold text-white">
              {activeFilter === 'Archived' ? 'No archived chats' : 'No messages found'}
            </p>
          </div>
        ) : (
          filteredConversations.map((chat) => (
            <ConversationItem 
              key={chat._id} 
              conversation={chat} 
              isActive={activeConversationId === chat._id}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ConversationList;