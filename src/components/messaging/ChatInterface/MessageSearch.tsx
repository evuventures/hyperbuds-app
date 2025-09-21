"use client";

import React, { useState, useEffect } from 'react';
import { Search, X, MessageSquare, User} from 'lucide-react';
import { MessageSearchResult } from '@/types/messaging.types';
import { formatMessageTimestamp } from '@/lib/utils/messageMappers';

interface MessageSearchProps {
   onSearch: (query: string) => Promise<MessageSearchResult[]>;
   onClose: () => void;
   onMessageClick: (conversationId: string, messageId: string) => void;
}

export const MessageSearch: React.FC<MessageSearchProps> = ({
   onSearch,
   onClose,
   onMessageClick,
}) => {
   const [query, setQuery] = useState('');
   const [results, setResults] = useState<MessageSearchResult[]>([]);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);

   // Debounce search
   useEffect(() => {
      const timeoutId = setTimeout(() => {
         if (query.trim().length >= 2) {
            performSearch(query.trim());
         } else {
            setResults([]);
         }
      }, 300);

      return () => clearTimeout(timeoutId);
   }, [query]);

   const performSearch = async (searchQuery: string) => {
      setLoading(true);
      setError(null);

      try {
         const searchResults = await onSearch(searchQuery);
         setResults(searchResults);
      } catch (err) {
         setError('Failed to search messages');
         console.error('Search error:', err);
      } finally {
         setLoading(false);
      }
   };

   const handleMessageClick = (conversationId: string, messageId: string) => {
      onMessageClick(conversationId, messageId);
      onClose();
   };
   
   const getConversationName = (conversation: any) => {
      if (conversation.participants && conversation.participants.length > 0) {
         return conversation.participants[0].email || 'Unknown User';
      }
      return 'Unknown Conversation';
   };

   return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
         <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
               <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                     Search Messages
                  </h2>
                  <button
                     onClick={onClose}
                     className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                     <X className="w-5 h-5" />
                  </button>
               </div>
            </div>

            {/* Search Input */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
               <div className="relative">
                  <Search className="absolute left-3 top-1/2 w-4 h-4 text-gray-400 transform -translate-y-1/2" />
                  <input
                     type="text"
                     placeholder="Search messages... (minimum 2 characters)"
                     value={query}
                     onChange={(e) => setQuery(e.target.value)}
                     className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                     autoFocus
                  />
               </div>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto p-4">
               {loading && (
                  <div className="flex items-center justify-center py-8">
                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
               )}

               {error && (
                  <div className="text-center py-8 text-red-500">
                     {error}
                  </div>
               )}

               {!loading && !error && query.length >= 2 && results.length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                     <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                     <p>No messages found for &34;{query}&34;</p>
                  </div>
               )}

               {!loading && !error && query.length < 2 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                     <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                     <p>Type at least 2 characters to search</p>
                  </div>
               )}

               {results.length > 0 && (
                  <div className="space-y-3">
                     {results.map((result) => (
                        <div
                           key={result._id}
                           onClick={() => handleMessageClick(result.conversationId._id, result._id)}
                           className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                        >
                           <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0">
                                 <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                    <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                 </div>
                              </div>

                              <div className="flex-1 min-w-0">
                                 <div className="flex items-center justify-between mb-1">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                       {getConversationName(result.conversationId)}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                       {formatMessageTimestamp(result.createdAt)}
                                    </p>
                                 </div>

                                 <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                                    {result.content}
                                 </p>

                                 <div className="flex items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
                                    <User className="w-3 h-3 mr-1" />
                                    <span>{result.sender.email}</span>
                                 </div>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
               <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  {results.length > 0 && `${results.length} result${results.length === 1 ? '' : 's'} found`}
               </p>
            </div>
         </div>
      </div>
   );
};
