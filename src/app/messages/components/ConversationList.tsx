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
  const { conversations, activeConversationId } = useSelector((state: RootState) => state.chat);
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');

  // 1. Calculate counts for the tabs
  const counts = useMemo(() => {
    const safeConversations = Array.isArray(conversations) ? conversations : [];
    
    return {
      All: safeConversations.filter(c => !c.isArchived).length,
      Unread: safeConversations.filter(c => {
        const userUnread = (c.unreadCounts ?? []).find(u => u.userId === currentUser?.id);
        return (userUnread?.count || 0) > 0 && !c.isArchived;
      }).length,
      Archived: safeConversations.filter(c => c.isArchived).length,
    };
  }, [conversations, currentUser?.id]);

  // 2. Filtered list for display
  const filteredConversations = useMemo(() => {
    const safeConversations = Array.isArray(conversations) ? conversations : [];
    const uniqueList = Array.from(new Map(safeConversations.map(c => [c._id, c])).values());

    return uniqueList.filter((chat) => {
      const otherUser = chat.participants?.find(p => p._id !== currentUser?.id) || chat.participants?.[0];
      const fullName = otherUser?.fullName?.toLowerCase() || "";
      const username = otherUser?.username?.toLowerCase() || "";
      const query = searchQuery.toLowerCase();

      const matchesSearch = fullName.includes(query) || username.includes(query);
      const userUnreadData = (chat.unreadCounts ?? []).find(u => u.userId === currentUser?.id);
      const hasUnread = (userUnreadData?.count || 0) > 0;

      if (activeFilter === 'Archived') return matchesSearch && chat.isArchived;
      if (activeFilter === 'Unread') return matchesSearch && hasUnread && !chat.isArchived;
      return matchesSearch && !chat.isArchived;
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

        {/* Filter Tabs with Dynamic Counts */}
        <div className="flex p-1 bg-[#1E293B] rounded-xl mb-6">
          {(['All', 'Unread', 'Archived'] as FilterType[]).map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeFilter === tab 
                  ? 'bg-slate-700 text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-300'
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
              onClick={() => dispatch(setActiveConversation(chat._id))}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ConversationList;