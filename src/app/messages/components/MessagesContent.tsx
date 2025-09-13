"use client";

import React, { useState, useEffect } from "react";
import {
   Search,
   Filter,
   MoreVertical,
   Send,
   Plus,
   Paperclip,
   Smile,
   Image as ImageIcon,
   Phone,
   Video,
   Info
} from "lucide-react";

interface Message {
   id: string;
   sender: string;
   content: string;
   timestamp: string;
   isOwn: boolean;
   avatar?: string;
   status?: 'typing' | 'delivered' | 'read';
}

interface Chat {
   id: string;
   name: string;
   lastMessage: string;
   timestamp: string;
   unread: boolean;
   avatar: string;
   status: 'online' | 'offline' | 'typing';
   visitInfo?: string;
}

export const MessagesContent: React.FC = () => {
   const [activeChat, setActiveChat] = useState("brooklyn-simmons");
   const [searchQuery, setSearchQuery] = useState("");
   const [activeTab, setActiveTab] = useState("Active");
   const [showChatView, setShowChatView] = useState(false);

   // Mock chat data
   const chats: Chat[] = [
      {
         id: "courtney-henry",
         name: "Courtney Henry",
         lastMessage: "What time do you close?",
         timestamp: "Just now",
         unread: true,
         avatar: "/images/user1.png",
         status: "online"
      },
      {
         id: "kristin-watson",
         name: "Kristin Watson",
         lastMessage: "thank you for the reminder!",
         timestamp: "1 min ago",
         unread: true,
         avatar: "/images/user2.png",
         status: "online"
      },
      {
         id: "ronald-richards",
         name: "Ronald Richards",
         lastMessage: "I'll be there at 8:30am",
         timestamp: "3 min ago",
         unread: false,
         avatar: "/images/user3.png",
         status: "offline"
      },
      {
         id: "brooklyn-simmons",
         name: "Brooklyn Simmons",
         lastMessage: "typing...",
         timestamp: "5 min ago",
         unread: false,
         avatar: "/images/user4.png",
         status: "typing",
         visitInfo: "Visit 2 • Last visit Sep 16, 2024"
      },
      {
         id: "robert-fox",
         name: "Robert Fox",
         lastMessage: "Can we reschedule?",
         timestamp: "Yesterday",
         unread: false,
         avatar: "/images/user5.png",
         status: "offline"
      }
   ];

   // Mock messages for active chat
   const messages: Message[] = [
      {
         id: "1",
         sender: "Brooklyn Simmons",
         content: "Hi Dr. Alex, thank you for the reminder! I'll be there at 8:30am Let me know if I need to bring anything specific.",
         timestamp: "05:00 PM",
         isOwn: false,
         avatar: "/images/user4.png"
      },
      {
         id: "2",
         sender: "You",
         content: "Hi Brooklyn Simmons, I wanted to let you know that we've received your lab results. Everything looks good, but I'd like to discuss a few preventive measures during our next appointment.",
         timestamp: "05:02 PM",
         isOwn: true
      },
      {
         id: "3",
         sender: "Brooklyn Simmons",
         content: "Thank you, Dr. Alex I appreciate the update. Can I schedule a time to discuss it?",
         timestamp: "05:30 PM",
         isOwn: false,
         avatar: "/images/user4.png"
      }
   ];

   const activeChatData = chats.find(chat => chat.id === activeChat);

   const handleResize = () => {
      if (window.innerWidth >= 1024) {
         setShowChatView(false);
      }
   };

   useEffect(() => {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
   }, []);

   const handleChatSelect = (chatId: string) => {
      setActiveChat(chatId);
      if (window.innerWidth < 1024) {
         setShowChatView(true);
      }
   };

   const handleBackToMessages = () => {
      setShowChatView(false);
   };

   return (
      <div className="w-full h-[90vh]">
         {/* Messages Content */}
         <div className="flex h-full">
            {/* Messages Sidebar */}
            <div className={`flex flex-col bg-white border-r border-gray-200 dark:bg-[#111828] dark:border-gray-700 transition-all duration-300 ${
               // Mobile: Hide messages sidebar when chat is open, show when no chat selected
               window.innerWidth < 1024
                  ? (showChatView ? 'hidden' : 'w-full')
                  : 'w-80'
               }`}>
               {/* Messages Header */}
               <div className="p-4 border-b border-gray-200 sm:p-6 dark:border-gray-700">
                  <h1 className="mb-4 text-xl font-bold text-gray-900 sm:mb-6 sm:text-2xl dark:text-white">
                     Messages
                  </h1>

                  {/* Search Bar */}
                  <div className="relative">
                     <Search className="absolute left-3 top-1/2 w-4 h-4 text-gray-400 transform -translate-y-1/2 dark:text-gray-500" />
                     <input
                        type="text"
                        placeholder="Search patients"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="py-2 pr-4 pl-10 w-full text-sm placeholder-gray-500 text-gray-900 bg-gray-50 rounded-xl border border-gray-200 transition-all duration-200 sm:py-3 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:bg-white dark:focus:bg-gray-600 dark:text-gray-100 dark:placeholder-gray-400 sm:text-base"
                     />
                     <button className="absolute right-3 top-1/2 text-gray-400 transform -translate-y-1/2 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                        <Filter className="w-4 h-4" />
                     </button>
                  </div>

                  {/* Tabs */}
                  <div className="flex p-1 mt-4 space-x-1 bg-gray-100 rounded-lg sm:mt-6 dark:bg-gray-700">
                     <button
                        onClick={() => setActiveTab("Active")}
                        className={`flex-1 py-2 px-3 sm:px-4 text-xs sm:text-sm font-medium rounded-md transition-colors ${activeTab === "Active"
                           ? "bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-400 shadow-sm"
                           : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                           }`}
                     >
                        Active
                     </button>
                     <button
                        onClick={() => setActiveTab("Inactive")}
                        className={`flex-1 py-2 px-3 sm:px-4 text-xs sm:text-sm font-medium rounded-md transition-colors ${activeTab === "Inactive"
                           ? "bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-400 shadow-sm"
                           : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                           }`}
                     >
                        Inactive
                     </button>
                  </div>
               </div>

               {/* Chat List */}
               <div className="overflow-y-auto flex-1">
                  {chats.map((chat) => (
                     <div
                        key={chat.id}
                        onClick={() => handleChatSelect(chat.id)}
                        className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${activeChat === chat.id ? "bg-purple-50 dark:bg-purple-900/20 border-r-2 border-purple-500" : ""
                           }`}
                     >
                        <div className="relative flex-shrink-0">
                           <div className="flex justify-center items-center w-10 h-10 bg-gray-300 rounded-full sm:w-12 sm:h-12 dark:bg-gray-600">
                              <span className="text-xs font-medium text-gray-600 sm:text-sm dark:text-gray-300">
                                 {chat.name.split(' ').map(n => n[0]).join('')}
                              </span>
                           </div>
                           {chat.status === 'online' && (
                              <div className="absolute -right-1 -bottom-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white sm:w-4 sm:h-4 dark:border-gray-800"></div>
                           )}
                           {chat.status === 'typing' && (
                              <div className="absolute -right-1 -bottom-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white animate-pulse sm:w-4 sm:h-4 dark:border-gray-800"></div>
                           )}
                        </div>

                        <div className="flex-1 min-w-0">
                           <div className="flex justify-between items-center">
                              <h3 className="text-xs font-semibold text-gray-900 truncate sm:text-sm dark:text-white">
                                 {chat.name}
                              </h3>
                              <div className="flex gap-1 items-center sm:gap-2">
                                 {chat.unread && (
                                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full"></div>
                                 )}
                                 <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {chat.timestamp}
                                 </span>
                              </div>
                           </div>
                           <p className="mt-1 text-xs text-gray-600 truncate sm:text-sm dark:text-gray-400">
                              {chat.lastMessage}
                           </p>
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            {/* Chat Area */}
            <div className={`flex flex-col flex-1 bg-white min-w-0 transition-all duration-300 max-h-[90vh] dark:bg-[#111828]  ${
               // Mobile: Hide chat area when not in chat view
               window.innerWidth < 1024
                  ? (showChatView ? 'block' : 'hidden')
                  : 'block'
               }`}>
               {/* Chat Header */}
               <div className="flex justify-between items-center p-4 border-b border-gray-200 sm:p-6 dark:border-gray-700">
                  <div className="flex flex-1 gap-3 items-center min-w-0 sm:gap-4">
                     {/* Back button for mobile */}
                     {window.innerWidth < 1024 && (
                        <button
                           onClick={handleBackToMessages}
                           className="flex-shrink-0 p-2 text-gray-500 rounded-lg transition-colors dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                           </svg>
                        </button>
                     )}
                     <div className="flex flex-shrink-0 justify-center items-center w-10 h-10 bg-gray-300 rounded-full sm:w-12 sm:h-12 dark:bg-gray-600">
                        <span className="text-xs font-medium text-gray-600 sm:text-sm dark:text-gray-300">
                           {activeChatData?.name.split(' ').map(n => n[0]).join('')}
                        </span>
                     </div>
                     <div className="flex-1 min-w-0">
                        <h2 className="text-base font-semibold text-gray-900 truncate sm:text-lg dark:text-white">
                           {activeChatData?.name}
                        </h2>
                        {activeChatData?.visitInfo && (
                           <p className="text-xs text-gray-500 truncate sm:text-sm dark:text-gray-400">
                              {activeChatData.visitInfo}
                           </p>
                        )}
                     </div>
                  </div>

                  <div className="flex flex-shrink-0 gap-1 items-center sm:gap-2">
                     <button className="p-1.5 sm:p-2 text-gray-500 rounded-lg transition-colors dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                     </button>
                     <button className="p-1.5 sm:p-2 text-gray-500 rounded-lg transition-colors dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <Video className="w-4 h-4 sm:w-5 sm:h-5" />
                     </button>
                     <button className="p-1.5 sm:p-2 text-gray-500 rounded-lg transition-colors dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <Info className="w-4 h-4 sm:w-5 sm:h-5" />
                     </button>
                     <button className="p-1.5 sm:p-2 text-gray-500 rounded-lg transition-colors dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5" />
                     </button>
                  </div>
               </div>

               {/* Messages Area */}
               <div className="overflow-y-auto flex-1 p-3 space-y-4 sm:p-6 sm:space-y-6 scrollbar-hide">
                  {/* Date Separator */}
                  <div className="flex items-center">
                     <div className="flex-1 border-t border-gray-200 dark:border-gray-700"></div>
                     <span className="px-3 text-xs text-gray-500 bg-white sm:px-4 sm:text-sm dark:text-gray-400 dark:bg-gray-800">
                        Today, Nov 16
                     </span>
                     <div className="flex-1 border-t border-gray-200 dark:border-gray-700"></div>
                  </div>

                  {/* Messages */}
                  {messages.map((message) => (
                     <div key={message.id} className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex gap-2 sm:gap-3  sm:max-w-md ${message.isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                           {!message.isOwn && (
                              <div className="flex flex-shrink-0 justify-center items-center w-6 h-6 bg-gray-300 rounded-full sm:w-8 sm:h-8 dark:bg-gray-600">
                                 <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                                    {message.sender.split(' ').map(n => n[0]).join('')}
                                 </span>
                              </div>
                           )}

                           <div className={`flex flex-col ${message.isOwn ? 'items-end' : 'items-start'}`}>
                              {!message.isOwn && (
                                 <div className="flex gap-1 items-center mb-1 sm:gap-2">
                                    <span className="text-xs font-medium text-gray-900 sm:text-sm dark:text-white">
                                       {message.sender}
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                       {message.timestamp}
                                    </span>
                                 </div>
                              )}

                              <div
                                 className={`px-3 sm:px-4 py-2 sm:py-3 rounded-2xl ${message.isOwn
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                                    }`}
                              >
                                 <p className="text-xs leading-relaxed break-words sm:text-sm">{message.content}</p>
                              </div>

                              {message.isOwn && (
                                 <div className="flex gap-1 items-center mt-1 sm:gap-2">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                       {message.timestamp}
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                       You
                                    </span>
                                 </div>
                              )}
                           </div>
                        </div>
                     </div>
                  ))}

                  {/* New Message Separator */}
                  <div className="flex items-center">
                     <div className="flex-1 border-t border-red-300 dark:border-red-600"></div>
                     <span className="px-3 text-xs font-medium text-red-600 bg-white sm:px-4 sm:text-sm dark:text-red-400 dark:bg-gray-800">
                        New Message
                     </span>
                     <div className="flex-1 border-t border-red-300 dark:border-red-600"></div>
                  </div>

                  {/* Latest Message */}
                  <div className="flex justify-start">
                     <div className="flex gap-2 sm:gap-3 sm:max-w-md">
                        <div className="flex flex-shrink-0 justify-center items-center w-6 h-6 bg-gray-300 rounded-full sm:w-8 sm:h-8 dark:bg-gray-600">
                           <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                              BS
                           </span>
                        </div>

                        <div className="flex flex-col items-start">
                           <div className="flex gap-1 items-center mb-1 sm:gap-2">
                              <span className="text-xs font-medium text-gray-900 sm:text-sm dark:text-white">
                                 Brooklyn Simmons
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                 05:30 PM
                              </span>
                           </div>

                           <div className="px-3 py-2 text-gray-900 bg-gray-100 rounded-2xl sm:px-4 sm:py-3 dark:bg-gray-700 dark:text-white">
                              <p className="text-xs leading-relaxed break-words sm:text-sm">
                                 Thank you, Dr. Alex I appreciate the update. Can I schedule a time to discuss it?
                              </p>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Message Input */}
               <div className="p-3 border-t border-gray-200 sm:p-6 dark:border-gray-700">
                  <div className="flex gap-2 items-center sm:gap-3">
                     <button className="p-1.5 sm:p-2 text-gray-500 rounded-lg transition-colors dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex-shrink-0">
                        <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                     </button>
                     <button className="p-1.5 sm:p-2 text-gray-500 rounded-lg transition-colors dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex-shrink-0">
                        <Paperclip className="w-4 h-4 sm:w-5 sm:h-5" />
                     </button>
                     <button className="p-1.5 sm:p-2 text-gray-500 rounded-lg transition-colors dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex-shrink-0">
                        <Smile className="w-4 h-4 sm:w-5 sm:h-5" />
                     </button>
                     <button className="p-1.5 sm:p-2 text-gray-500 rounded-lg transition-colors dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex-shrink-0">
                        <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                     </button>

                     <div className="relative flex-1 min-w-0">
                        <input
                           type="text"
                           placeholder="Type a message..."
                           className="px-3 py-2 w-full text-sm placeholder-gray-500 text-gray-900 bg-gray-50 rounded-full border border-gray-200 transition-all duration-200 sm:px-4 sm:py-3 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:bg-white dark:focus:bg-gray-600 dark:text-gray-100 dark:placeholder-gray-400 sm:text-base"
                        />
                     </div>

                     <button className="flex flex-shrink-0 gap-1 items-center px-3 py-2 text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-opacity sm:gap-2 sm:px-6 sm:py-3 hover:opacity-90">
                        <Send className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden text-sm sm:inline">Send</span>
                     </button>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};
