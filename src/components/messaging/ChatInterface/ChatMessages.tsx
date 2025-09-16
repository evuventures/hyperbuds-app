"use client";

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import { ComponentMessage } from '@/lib/utils/messageMappers';
import { formatMessageTimestamp } from '@/lib/utils/messageMappers';

interface ChatMessagesProps {
   messages: ComponentMessage[];
   loading?: boolean;
   typingUsers?: string[];
   onMessageReact?: (messageId: string, emoji: string) => void;
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({
   messages,
   loading = false,
   typingUsers = [],
   onMessageReact,
}) => {
   const messagesEndRef = useRef<HTMLDivElement>(null);
   const messagesContainerRef = useRef<HTMLDivElement>(null);
   const [imagePreview, setImagePreview] = useState<{
      src: string;
      alt: string;
   } | null>(null);

   // Auto-scroll to bottom when new messages arrive
   useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
   }, [messages]);

   // Auto-scroll to bottom when typing indicator changes
   useEffect(() => {
      if (typingUsers.length > 0) {
         messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
   }, [typingUsers]);

   // Handle ESC key to close image preview
   useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
         if (event.key === 'Escape' && imagePreview) {
            setImagePreview(null);
         }
      };

      if (imagePreview) {
         document.addEventListener('keydown', handleKeyDown);
         // Prevent body scroll when modal is open
         document.body.style.overflow = 'hidden';
      }

      return () => {
         document.removeEventListener('keydown', handleKeyDown);
         document.body.style.overflow = 'unset';
      };
   }, [imagePreview]);

   // Handle image click
   const handleImageClick = (src: string, alt: string) => {
      setImagePreview({ src, alt });
   };

   // Close image preview
   const closeImagePreview = () => {
      setImagePreview(null);
   };

   const renderMessage = (message: ComponentMessage) => {
      const isOwn = message.isOwn;
      const time = formatMessageTimestamp(message.timestamp);

      return (
         <div
            key={message.id}
            className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4 group`}
         >
            <div className={`flex gap-3  ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
               {/* Avatar (only for other messages) */}
               {!isOwn && (
                  <div className="flex-shrink-0">
                     {message.sender.avatar ? (
                        <Image
                           src={message.sender.avatar}
                           alt={message.sender.name}
                           width={32}
                           height={32}
                           className="object-cover w-8 h-8 rounded-full"
                        />
                     ) : (
                        <div className="flex justify-center items-center w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full">
                           <span className="text-xs font-medium text-white">
                              {message.sender.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                           </span>
                        </div>
                     )}
                  </div>
               )}

               {/* Message content */}
               <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                  {/* Sender name and time (for other messages) */}
                  {!isOwn && (
                     <div className="flex gap-2 items-center mb-1">
                        <span className="text-xs font-medium text-gray-900 dark:text-white">
                           {message.sender.name}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                           {time}
                        </span>
                     </div>
                  )}

                  {/* Message bubble */}
                  <div
                     className={`px-4 py-2 rounded-2xl relative group/message ${isOwn
                        ? 'text-white bg-gradient-to-r from-blue-500 to-purple-600'
                        : 'text-gray-900 bg-gray-100 dark:bg-gray-800 dark:text-white'
                        }`}
                  >
                     {/* Reply reference */}
                     {message.replyTo && (
                        <div className={`mb-2 p-2 rounded-lg border-l-4 ${isOwn ? 'border-blue-300 bg-blue-400/20' : 'bg-gray-200 border-gray-400 dark:bg-gray-700'
                           }`}>
                           <p className="mb-1 text-xs font-medium">
                              Replying to {message.replyTo.sender}
                           </p>
                           <p className="text-xs truncate opacity-75">
                              {message.replyTo.content}
                           </p>
                        </div>
                     )}

                     {/* Message content */}
                     <div className="break-words">
                        {message.type === 'text' ? (
                           <div className="space-y-2">
                              {message.content && (
                                 <p className="text-sm leading-relaxed">{message.content}</p>
                              )}
                              {message.attachments && message.attachments.length > 0 && (
                                 <>
                                    {message.attachments.filter(att => att.type === 'image').map((attachment) => (
                                       <Image
                                          key={attachment.id}
                                          src={attachment.url}
                                          alt={attachment.filename}
                                          width={300}
                                          height={200}
                                          className="max-w-full h-auto rounded-lg transition-opacity cursor-pointer hover:opacity-90"
                                          onClick={() => handleImageClick(attachment.url, attachment.filename)}
                                       />
                                    ))}
                                    {message.attachments.filter(att => att.type === 'file').map((attachment) => (
                                       <div
                                          key={attachment.id}
                                          className="flex gap-3 items-center p-3 rounded-lg transition-colors cursor-pointer bg-white/10 hover:bg-white/20"
                                          onClick={() => window.open(attachment.url, '_blank')}
                                       >
                                          <div className="flex flex-shrink-0 justify-center items-center w-10 h-10 rounded-lg bg-white/20">
                                             <span className="text-xs font-medium">
                                                {attachment.filename.split('.').pop()?.toUpperCase()}
                                             </span>
                                          </div>
                                          <div className="flex-1 min-w-0">
                                             <p className="text-sm font-medium truncate">{attachment.filename}</p>
                                             <p className="text-xs opacity-75">
                                                {(attachment.size / 1024 / 1024).toFixed(1)} MB
                                             </p>
                                          </div>
                                       </div>
                                    ))}
                                 </>
                              )}
                           </div>
                        ) : message.type === 'image' ? (
                           <div className="space-y-2">
                              <p className="text-sm leading-relaxed">{message.content}</p>
                              {message.attachments?.map((attachment) => (
                                 <Image
                                    key={attachment.id}
                                    src={attachment.url}
                                    alt={attachment.filename}
                                    width={300}
                                    height={200}
                                    className="max-w-full h-auto rounded-lg transition-opacity cursor-pointer hover:opacity-90"
                                    onClick={() => handleImageClick(attachment.url, attachment.filename)}
                                 />
                              ))}
                           </div>
                        ) : message.type === 'file' ? (
                           <div className="space-y-2">
                              <p className="text-sm leading-relaxed">{message.content}</p>
                              {message.attachments?.map((attachment) => (
                                 <div
                                    key={attachment.id}
                                    className="flex gap-3 items-center p-3 rounded-lg transition-colors cursor-pointer bg-white/10 hover:bg-white/20"
                                    onClick={() => window.open(attachment.url, '_blank')}
                                 >
                                    <div className="flex flex-shrink-0 justify-center items-center w-10 h-10 rounded-lg bg-white/20">
                                       <span className="text-xs font-medium">
                                          {attachment.filename.split('.').pop()?.toUpperCase()}
                                       </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                       <p className="text-sm font-medium truncate">{attachment.filename}</p>
                                       <p className="text-xs opacity-75">
                                          {(attachment.size / 1024 / 1024).toFixed(1)} MB
                                       </p>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        ) : (
                           <p className="text-sm leading-relaxed">{message.content}</p>
                        )}
                     </div>

                     {/* Message reactions */}
                     {message.reactions && message.reactions.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                           {message.reactions.map((reaction) => (
                              <button
                                 key={`${reaction.emoji}-${reaction.userId}`}
                                 className="flex gap-1 items-center px-2 py-1 text-xs rounded-full transition-colors bg-white/20 hover:bg-white/30"
                                 onClick={() => onMessageReact?.(message.id, reaction.emoji)}
                              >
                                 <span>{reaction.emoji}</span>
                                 <span className="text-xs opacity-75">1</span>
                              </button>
                           ))}
                        </div>
                     )}

                     {/* Message status (for own messages) */}
                     {isOwn && (
                        <div className="flex justify-end items-center mt-1">
                           <span className="text-xs opacity-75">
                              {time}
                           </span>
                           <div className="flex items-center ml-2">
                              {message.status === 'sending' && (
                                 <div className="w-3 h-3 rounded-full border animate-spin border-white/50 border-t-white"></div>
                              )}
                              {message.status === 'sent' && (
                                 <div className="flex">
                                    <div className="w-2 h-2 rounded-full bg-white/50"></div>
                                 </div>
                              )}
                              {message.status === 'delivered' && (
                                 <div className="flex">
                                    <div className="w-2 h-2 rounded-full bg-white/50"></div>
                                    <div className="-ml-1 w-2 h-2 rounded-full bg-white/50"></div>
                                 </div>
                              )}
                              {message.status === 'read' && (
                                 <div className="flex">
                                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                    <div className="-ml-1 w-2 h-2 bg-blue-400 rounded-full"></div>
                                 </div>
                              )}
                              {message.status === 'failed' && (
                                 <div className="w-3 h-3 text-red-400">
                                    <svg fill="currentColor" viewBox="0 0 20 20">
                                       <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                 </div>
                              )}
                           </div>
                        </div>
                     )}
                  </div>
               </div>
            </div>
         </div>
      );
   };

   if (loading) {
      return (
         <div className="overflow-y-auto flex-1 p-6 bg-gray-50 dark:bg-gray-900">
            <div className="space-y-4">
               {[...Array(5)].map((_, i) => (
                  <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                     <div className="flex gap-3 max-w-[70%]">
                        {i % 2 === 0 && (
                           <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse dark:bg-gray-700"></div>
                        )}
                        <div className="flex-1">
                           <div className={`px-4 py-3 rounded-2xl ${i % 2 === 0
                              ? 'bg-gray-200 dark:bg-gray-800'
                              : 'bg-blue-200 dark:bg-blue-800'
                              } animate-pulse`}>
                              <div className="mb-2 h-4 bg-gray-300 rounded dark:bg-gray-600"></div>
                              <div className="w-3/4 h-3 bg-gray-300 rounded dark:bg-gray-600"></div>
                           </div>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      );
   }

   return (
      <>
         <div
            ref={messagesContainerRef}
            className="overflow-y-auto flex-1 p-6 bg-gray-50 dark:bg-gray-900 scrollbar-hide hover:scrollbar-thin hover:scrollbar-thumb-gray-300 hover:dark:scrollbar-thumb-gray-600"
         >
            {messages.length === 0 ? (
               <div className="flex flex-col justify-center items-center h-full text-gray-500 dark:text-gray-400">
                  <div className="text-center">
                     <div className="flex justify-center items-center mx-auto mb-4 w-16 h-16 bg-gray-200 rounded-full dark:bg-gray-700">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                     </div>
                     <p className="mb-2 text-lg font-medium">No messages yet</p>
                     <p className="text-sm">Start the conversation by sending a message</p>
                  </div>
               </div>
            ) : (
               <div className="space-y-4">
                  {messages.map(renderMessage)}

                  {/* Typing indicator */}
                  {typingUsers.length > 0 && (
                     <div className="flex justify-start mb-4">
                        <div className="flex gap-3">
                           <div className="flex justify-center items-center w-8 h-8 bg-gray-300 rounded-full dark:bg-gray-600">
                              <span className="text-xs text-white">T</span>
                           </div>
                           <div className="px-4 py-2 bg-gray-100 rounded-2xl dark:bg-gray-800">
                              <div className="flex items-center space-x-1">
                                 <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing
                                 </span>
                                 <div className="flex space-x-1">
                                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  )}

                  {/* Scroll anchor */}
                  <div ref={messagesEndRef} />
               </div>
            )}
         </div>

         {/* Image Preview Modal */}
         {imagePreview && (
            <div
               className="flex fixed inset-0 z-50 justify-center items-center backdrop-blur-sm bg-black/80"
               onClick={closeImagePreview}
            >
               <div className="relative max-w-4xl max-h-[90vh] p-4">
                  {/* Close button */}
                  <button
                     onClick={closeImagePreview}
                     className="absolute -top-2 -right-2 z-10 p-2 bg-white rounded-full shadow-lg transition-colors dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                     <X className="w-6 h-6 text-gray-600 cursor-pointer dark:text-gray-300" />
                  </button>

                  {/* Image */}
                  <div className="relative">
                     <Image
                        src={imagePreview.src}
                        alt={imagePreview.alt}
                        width={800}
                        height={600}
                        className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                     />

                     {/* Image info */}
                     <div className="absolute right-0 bottom-0 left-0 p-4 bg-gradient-to-t to-transparent rounded-b-lg from-black/70">
                        <p className="text-sm font-medium text-white truncate">
                           {imagePreview.alt}
                        </p>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </>
   );
};
