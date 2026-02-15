"use client"
import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image'; // Added Next.js Image component
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { MoreVertical, Archive, ArchiveRestore, Search, X } from 'lucide-react';
import { User } from '@/types/messaging.types';
import { messagingAPI } from '@/lib/api/messaging.api';
import { toggleArchiveLocal } from '@/store/slices/chatSlice';

interface ChatHeaderProps {
  recipient?: User; 
}

interface SearchResultMessage {
  _id: string;
  content: string;
  sender: {
    _id: string;
    email: string;
  };
  conversationId: string | { _id: string; participants: string[] };
  createdAt: string;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ recipient }) => {
  const dispatch = useDispatch();
  const [showMenu, setShowMenu] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResultMessage[]>([]);
  const [imgError, setImgError] = useState(false); // Added for fallback logic
  const menuRef = useRef<HTMLDivElement>(null);

  const { activeConversationId, typingUsers, conversations } = useSelector((state: RootState) => state.chat);
  
  const activeChat = conversations.find(c => c._id === activeConversationId);
  const isArchived = activeChat?.isArchived || false;

  const displayName = recipient?.fullName || recipient?.username || recipient?.email?.split('@')[0];

  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery.trim().length >= 2) {
        try {
          const data = await messagingAPI.searchMessages(searchQuery);
          const filtered = data.messages.filter((m: SearchResultMessage) => {
            const mConvId = typeof m.conversationId === 'object' ? m.conversationId._id : m.conversationId;
            return mConvId === activeConversationId;
          });
          setSearchResults(filtered);
        } catch (error) {
          console.error("Search failed:", error);
        }
      } else {
        setSearchResults([]);
      }
    };

    const debounceTimer = setTimeout(performSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, activeConversationId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const handleArchiveToggle = async () => {
    if (!activeConversationId) return;
    try {
      await messagingAPI.toggleArchive(activeConversationId);
      dispatch(toggleArchiveLocal({ conversationId: activeConversationId, isArchived: !isArchived }));
      setShowMenu(false);
    } catch (error) { 
        console.error("Archive failed:", error); 
    }
  };

  const isTyping = activeConversationId && recipient?._id 
    ? typingUsers[activeConversationId]?.includes(recipient._id) 
    : false;

  return (
    <div className="flex flex-col border-b border-slate-800 bg-[#0F172A] z-20 relative">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Updated Avatar Logic with Next.js Image */}
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-linear-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-lg overflow-hidden relative">
              {recipient?.avatar && !imgError ? (
                <Image
                  src={recipient.avatar}
                  alt={displayName || "Creator"}
                  fill
                  sizes="40px"
                  className="object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <span>{displayName?.[0]?.toUpperCase() || 'H'}</span>
              )}
            </div>
            {recipient?.status === 'online' && (
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-slate-900 rounded-full shadow-sm z-10" />
            )}
          </div>

          {!isSearching && (
            <div className="animate-in fade-in slide-in-from-left-2 duration-300">
              <h3 className="text-sm font-bold text-white leading-none">
                {displayName || "Hyperbud Creator"}
              </h3>
              <p className="text-[10px] mt-1">
                {isTyping ? (
                  <span className="text-purple-400 font-medium italic animate-pulse">typing...</span>
                ) : (
                  <span className="text-slate-500">
                    {recipient?.status === 'online' ? 'Active now' : 'Away'}
                  </span>
                )}
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 text-slate-500">
          {isSearching ? (
            <div className="flex items-center bg-slate-800 rounded-lg px-3 py-1.5 animate-in zoom-in duration-200 ring-1 ring-slate-700">
              <Search size={14} className="mr-2 text-slate-400" />
              <input 
                autoFocus
                className="bg-transparent text-xs text-white outline-none w-40 md:w-64"
                placeholder="Search in conversation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button onClick={() => { setIsSearching(false); setSearchQuery(''); }} className="hover:text-white ml-2">
                <X size={14} />
              </button>
            </div>
          ) : (
            <>
              <button 
                onClick={() => setIsSearching(true)} 
                className="hover:text-white transition-colors p-1.5 rounded-lg hover:bg-slate-800" 
                title="Search messages"
              >
                <Search size={18} />
              </button>
              
              <div className="relative" ref={menuRef}>
                <button 
                  onClick={() => setShowMenu(!showMenu)} 
                  className={`p-1.5 rounded-lg transition-colors ${showMenu ? 'text-white bg-slate-800' : 'hover:text-white hover:bg-slate-800'}`}
                >
                  <MoreVertical size={18} />
                </button>
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#1E293B] border border-slate-700 rounded-xl shadow-2xl py-1 z-50 animate-in fade-in zoom-in duration-150">
                    <button 
                      onClick={handleArchiveToggle} 
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-700/50 transition-colors rounded-lg"
                    >
                      {isArchived ? (
                        <><ArchiveRestore size={16} className="text-purple-400" /> Unarchive</>
                      ) : (
                        <><Archive size={16} /> Archive</>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {isSearching && searchQuery.length >= 2 && (
        <div className="absolute top-full left-0 w-full bg-[#1E293B] border-b border-slate-800 max-h-60 overflow-y-auto z-50 shadow-2xl border-t">
          {searchResults.length > 0 ? (
            searchResults.map(result => (
              <div key={result._id} className="p-3 hover:bg-slate-800 cursor-pointer border-b border-slate-800/50 transition-colors group">
                <p className="text-[10px] text-slate-500 mb-1 group-hover:text-slate-400">
                  {new Date(result.createdAt).toLocaleDateString()}
                </p>
                <p className="text-sm text-white line-clamp-1">{result.content}</p>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-slate-500 text-xs italic">
              No messages found matching &quot;{searchQuery}&quot;
            </div>
          )}
        </div>
      )}
    </div>
  );
};