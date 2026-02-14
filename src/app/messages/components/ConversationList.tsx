"use client"
import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { setActiveConversation } from '@/store/slices/chatSlice';
import { ConversationItem } from './ConversationItem';
import { Search, Plus } from 'lucide-react';

type FilterType = 'All' | 'Unread' | 'Archived';

export const ConversationList = () => {
  const dispatch = useDispatch();
  
  // Only read from Redux - No local fetch here!
  const { conversations, activeConversationId } = useSelector((state: RootState) => state.chat);
  const { user: currentUser } = useSelector((state: RootState) => state.auth);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');

  // Safety logic: Remove any duplicates by ID and filter by search/tab
  const filteredConversations = useMemo(() => {
    // Deduplicate by _id to prevent the visual double-populating
    const uniqueList = Array.from(
      new Map(conversations.map(c => [c._id, c])).values()
    );

    return uniqueList.filter((chat) => {
      // Correctly find the other participant (not Esther)
      const otherUser = chat.participants.find(p => p._id !== currentUser?.id) || chat.participants[0];
      const name = otherUser?.name?.toLowerCase() || "";
      const email = otherUser?.email?.toLowerCase() || "";
      const query = searchQuery.toLowerCase();

      const matchesSearch = name.includes(query) || email.includes(query);
      
      if (activeFilter === 'Unread') return matchesSearch && chat.unreadCount > 0;
      return matchesSearch;
    });
  }, [conversations, searchQuery, activeFilter, currentUser?.id]);

  return (
    <div className="flex flex-col h-full bg-[#0F172A] border-r border-slate-800/50">
      <div className="p-6 pb-2">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white tracking-tight">Messages</h2>
          <button className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-all">
            <Plus size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input 
            type="text" 
            placeholder="Search conversations..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1E293B] border-none rounded-xl py-2.5 pl-11 pr-12 text-sm text-slate-200 placeholder:text-slate-500 focus:ring-1 focus:ring-purple-500/50 transition-all outline-none"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex p-1 bg-[#1E293B] rounded-xl mb-6">
          {(['All', 'Unread', 'Archived'] as FilterType[]).map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeFilter === tab 
                  ? 'bg-slate-700 text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable List Container */}
      <div className="flex-1 overflow-y-auto px-2 pb-4 scrollbar-hide">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-10 text-center opacity-30">
             <Search size={32} className="text-slate-400 mb-4" />
             <p className="text-sm font-bold text-white">No matches found</p>
          </div>
        ) : (
          filteredConversations.map((chat) => (
            <ConversationItem 
              key={chat._id} 
              conversation={chat} 
              isActive={activeConversationId === chat._id}
              onClick={() => dispatch(setActiveConversation(chat._id))}
            />
          ))
        )}
      </div>
    </div>
  );
};