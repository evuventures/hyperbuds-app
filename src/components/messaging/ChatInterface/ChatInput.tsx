"use client";

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import {
   Send,
   Paperclip,
   Smile,
   X,
   Mic,
   MicOff
} from 'lucide-react';

interface ChatInputProps {
   onSendMessage: (content: string) => void;
   onAttachment?: (files: File[], textContent?: string) => void;
   onTypingStart?: () => void;
   onTypingStop?: () => void;
   onVoiceMessage?: (audioBlob: Blob) => void;
   typingIndicator?: {
      users: string[];
      isTyping: boolean;
   };
   disabled?: boolean;
   placeholder?: string;
   maxLength?: number;
   allowedFileTypes?: string[];
   maxFileSize?: number; // in MB
}

export const ChatInput: React.FC<ChatInputProps> = ({
   onSendMessage,
   onAttachment,
   onTypingStart,
   onTypingStop,
   onVoiceMessage,
   typingIndicator,
   disabled = false,
   placeholder = "Type a message...",
   maxLength = 2000,
   allowedFileTypes = ['image/*', 'video/*', 'audio/*', '.pdf', '.doc', '.docx', '.txt'],
   maxFileSize = 10, // 10MB
}) => {
   const [message, setMessage] = useState('');
   const [isRecording, setIsRecording] = useState(false);
   const [showEmojiPicker, setShowEmojiPicker] = useState(false);
   const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
   const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
   const [isUploading, setIsUploading] = useState(false);

   const textareaRef = useRef<HTMLTextAreaElement>(null);
   const fileInputRef = useRef<HTMLInputElement>(null);
   const emojiPickerRef = useRef<HTMLDivElement>(null);
   const mediaRecorderRef = useRef<MediaRecorder | null>(null);
   const audioChunksRef = useRef<Blob[]>([]);
   const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

   // Handle click outside to close emoji picker
   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
         if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
            setShowEmojiPicker(false);
         }
      };

      if (showEmojiPicker) {
         document.addEventListener('mousedown', handleClickOutside);
      }

      return () => {
         document.removeEventListener('mousedown', handleClickOutside);
      };
   }, [showEmojiPicker]);

   // Handle message input
   const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      if (value.length <= maxLength) {
         setMessage(value);

         // Handle typing indicators
         if (value.trim() && onTypingStart) {
            onTypingStart();

            // Clear existing timeout
            if (typingTimeoutRef.current) {
               clearTimeout(typingTimeoutRef.current);
            }

            // Set new timeout to stop typing
            typingTimeoutRef.current = setTimeout(() => {
               if (onTypingStop) {
                  onTypingStop();
               }
            }, 3000);
         } else if (!value.trim() && onTypingStop) {
            onTypingStop();
         }
      }
   };

   // Handle send message
   const handleSendMessage = () => {
      if ((!message.trim() && selectedFiles.length === 0) || disabled) return;

      // If there are files, upload them with the text message
      if (selectedFiles.length > 0) {
         handleFileUpload();
      } else {
         // Send text-only message
         if (message.trim()) {
            onSendMessage(message.trim());
            setMessage('');
         }
      }

      // Stop typing indicator
      if (onTypingStop) {
         onTypingStop();
      }

      // Clear typing timeout
      if (typingTimeoutRef.current) {
         clearTimeout(typingTimeoutRef.current);
      }

      // Reset textarea height
      if (textareaRef.current) {
         textareaRef.current.style.height = 'auto';
      }
   };

   // Handle key press
   const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
         e.preventDefault();
         handleSendMessage();
      }
   };

   // Handle file selection
   const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;

      // Validate files
      const validFiles: File[] = [];
      const errors: string[] = [];

      files.forEach(file => {
         // Check file size
         if (file.size > maxFileSize * 1024 * 1024) {
            errors.push(`${file.name} is too large. Maximum size is ${maxFileSize}MB.`);
            return;
         }

         // Check file type
         const isValidType = allowedFileTypes.some(type => {
            if (type.includes('*')) {
               return file.type.startsWith(type.replace('*', ''));
            }
            return file.name.toLowerCase().endsWith(type.toLowerCase());
         });

         if (!isValidType) {
            errors.push(`${file.name} is not an allowed file type.`);
            return;
         }

         validFiles.push(file);
      });

      // Show errors if any
      if (errors.length > 0) {
         alert(errors.join('\n'));
      }

      // Handle valid files
      if (validFiles.length > 0) {
         // Add valid files to selected files
         setSelectedFiles(prev => [...prev, ...validFiles]);
      }

      // Reset file input
      if (fileInputRef.current) {
         fileInputRef.current.value = '';
      }
   };

   // Handle voice recording
   const startRecording = async () => {
      try {
         const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
         const mediaRecorder = new MediaRecorder(stream);
         mediaRecorderRef.current = mediaRecorder;
         audioChunksRef.current = [];

         mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
               audioChunksRef.current.push(event.data);
            }
         };

         mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            if (onVoiceMessage) {
               onVoiceMessage(audioBlob);
            }

            // Stop all tracks
            stream.getTracks().forEach(track => track.stop());
         };

         mediaRecorder.start();
         setIsRecording(true);
      } catch (error) {
         console.error('Error starting recording:', error);
         alert('Could not start recording. Please check microphone permissions.');
      }
   };

   const stopRecording = () => {
      if (mediaRecorderRef.current && isRecording) {
         mediaRecorderRef.current.stop();
         setIsRecording(false);
      }
   };

   // Handle file removal
   const removeFile = (index: number) => {
      setSelectedFiles(prev => prev.filter((_, i) => i !== index));
   };

   // Handle file upload
   const handleFileUpload = async () => {
      if (selectedFiles.length === 0) return;

      setIsUploading(true);
      try {
         // Simulate upload progress
         selectedFiles.forEach((file, index) => {
            const fileId = `${file.name}-${Date.now()}-${index}`;
            setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));

            // Simulate progress
            const interval = setInterval(() => {
               setUploadProgress(prev => {
                  const current = prev[fileId] || 0;
                  if (current >= 100) {
                     clearInterval(interval);
                     return prev;
                  }
                  return { ...prev, [fileId]: current + 10 };
               });
            }, 100);
         });

         // Simulate upload completion
         setTimeout(() => {
            setIsUploading(false);
            setUploadProgress({});
            if (onAttachment) {
               onAttachment(selectedFiles, message.trim());
            }
            // Clear message after sending with files
            setMessage('');
            // Clear selected files after successful upload
            setSelectedFiles([]);
         }, 2000);
      } catch (error) {
         console.error('Upload failed:', error);
         setIsUploading(false);
      }
   };

   // Handle emoji selection
   const handleEmojiSelect = (emoji: string) => {
      setMessage(prev => prev + emoji);
      setShowEmojiPicker(false);

      // Focus back to textarea
      if (textareaRef.current) {
         textareaRef.current.focus();
      }
   };

   // Auto-resize textarea
   const adjustTextareaHeight = () => {
      if (textareaRef.current) {
         textareaRef.current.style.height = 'auto';
         textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
      }
   };

   // Cleanup on unmount
   React.useEffect(() => {
      return () => {
         if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
         }
         if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
         }
      };
   }, [isRecording]);

   return (
      <div className="flex-shrink-0 p-3 w-full bg-white border-t border-gray-300 md:p-4 dark:bg-gray-900 dark:border-gray-700">
         {/* Typing indicator */}
         {typingIndicator?.isTyping && typingIndicator.users.length > 0 && (
            <div className="px-3 py-1 mb-2 bg-blue-50 rounded-lg dark:bg-blue-900/20">
               <p className="text-xs text-blue-600 dark:text-blue-400">
                  {typingIndicator.users.join(', ')} {typingIndicator.users.length === 1 ? 'is' : 'are'} typing...
               </p>
            </div>
         )}

         {/* File previews */}
         {selectedFiles.length > 0 && (
            <div className="p-2 mb-3 bg-gray-50 rounded-lg border border-gray-300 md:p-3 md:mb-4 dark:bg-gray-800 dark:border-gray-700">
               <div className="flex flex-wrap gap-2 mb-2">
                  {selectedFiles.map((file, index) => {
                     const fileId = `${file.name}-${index}`;
                     const progress = uploadProgress[fileId] || 0;
                     const isImage = file.type.startsWith('image/');

                     return (
                        <div key={index} className="relative group">
                           <div className="flex gap-2 items-center p-2 bg-white rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600">
                              {isImage ? (
                                 <div className="flex overflow-hidden justify-center items-center w-10 h-10 bg-gray-200 rounded-lg md:w-12 md:h-12 dark:bg-gray-600">
                                    <Image
                                       src={URL.createObjectURL(file)}
                                       alt={file.name}
                                       width={48}
                                       height={48}
                                       className="object-cover w-full h-full"
                                    />
                                 </div>
                              ) : (
                                 <div className="flex justify-center items-center w-10 h-10 bg-gray-200 rounded-lg md:w-12 md:h-12 dark:bg-gray-600">
                                    <Paperclip className="w-5 h-5 text-gray-500 md:w-6 md:h-6" />
                                 </div>
                              )}
                              <div className="flex-1 min-w-0">
                                 <p className="text-xs font-medium text-gray-900 truncate md:text-sm dark:text-white">
                                    {file.name}
                                 </p>
                                 <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {(file.size / 1024 / 1024).toFixed(1)} MB
                                 </p>
                                 {isUploading && (
                                    <div className="mt-1 w-full h-1 bg-gray-200 rounded-full dark:bg-gray-600">
                                       <div
                                          className="h-1 bg-blue-500 rounded-full transition-all duration-300"
                                          style={{ width: `${progress}%` }}
                                       />
                                    </div>
                                 )}
                              </div>
                              <button
                                 onClick={() => removeFile(index)}
                                 className="p-1 text-gray-400 cursor-pointer hover:text-red-500"
                                 disabled={isUploading}
                              >
                                 <X className="w-3 h-3 md:w-4 md:h-4" />
                              </button>
                           </div>
                        </div>
                     );
                  })}
               </div>
               {isUploading && (
                  <div className="text-center">
                     <div className="inline-flex gap-2 items-center text-xs text-blue-600 md:text-sm dark:text-blue-400">
                        <div className="w-3 h-3 rounded-full border-2 border-blue-600 animate-spin md:w-4 md:h-4 border-t-transparent" />
                        Uploading files...
                     </div>
                  </div>
               )}
            </div>
         )}

         {/* Input area */}
         <div className="flex gap-1.5 md:gap-2 items-end">
            {/* Attachment button */}
            <button
               onClick={() => fileInputRef.current?.click()}
               disabled={disabled}
               className="p-1.5 md:p-2 text-gray-500 rounded-lg transition-colors cursor-pointer hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
               title="Attach file"
            >
               <Paperclip className="w-4 h-4 md:w-5 md:h-5" />
            </button>

            {/* Hidden file input */}
            <input
               ref={fileInputRef}
               type="file"
               multiple
               accept={allowedFileTypes.join(',')}
               onChange={handleFileSelect}
               className="hidden"
            />

            {/* Message input */}
            <div className="relative flex-1">
               <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => {
                     handleMessageChange(e);
                     adjustTextareaHeight();
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder={placeholder}
                  disabled={disabled}
                  className={`px-3 py-2 w-full max-h-28 ${disabled ? 'text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs' : 'text-xs lg:text-sm'} placeholder-gray-500 text-gray-900 bg-gray-50 rounded-2xl border border-gray-300 transition-all duration-200 resize-none md:px-4 md:py-3 md:max-h-32 scrollbar-hide hover:scrollbar-thin hover:scrollbar-thumb-gray-300 hover:dark:scrollbar-thumb-gray-600 dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:bg-white dark:focus:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400`}
                  rows={1}
               />

               {/* Character count */}
               {message.length > maxLength * 0.8 && (
                  <div className="absolute bottom-1 right-10 text-xs text-gray-400 md:right-12">
                     {message.length}/{maxLength}
                  </div>
               )}
            </div>

            {/* Emoji button - Hidden on mobile */}
            <button
               onClick={() => setShowEmojiPicker(!showEmojiPicker)}
               disabled={disabled}
               className="hidden p-2 text-gray-500 rounded-lg transition-colors cursor-pointer md:flex hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
               title="Add emoji"
            >
               <Smile className="w-5 h-5" />
            </button>

            {/* Voice message button */}
            <button
               onMouseDown={startRecording}
               onMouseUp={stopRecording}
               onMouseLeave={stopRecording}
               onTouchStart={startRecording}
               onTouchEnd={stopRecording}
               disabled={disabled}
               className={`p-1.5 md:p-2 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${isRecording
                  ? 'text-red-500 bg-red-50 dark:bg-red-900/20'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
               title={isRecording ? "Recording... Release to send" : "Hold to record"}
            >
               {isRecording ? <MicOff className="w-4 h-4 md:w-5 md:h-5" /> : <Mic className="w-4 h-4 md:w-5 md:h-5" />}
            </button>

            {/* Send button */}
            <button
               onClick={handleSendMessage}
               disabled={disabled || (!message.trim() && selectedFiles.length === 0) || isUploading}
               className="flex gap-1 items-center px-3 py-2 text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl transition-all duration-200 cursor-pointer md:gap-2 md:px-4 md:py-3 disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
               <Send className="w-4 h-4" />
               <span className="hidden text-xs font-medium md:text-sm sm:inline">Send</span>
            </button>
         </div>

         {/* Emoji picker */}
         {showEmojiPicker && (
            <div
               ref={emojiPickerRef}
               className="absolute right-0 bottom-20 z-50 p-3 w-72 bg-white rounded-lg border border-gray-300 shadow-lg md:p-4 md:w-80 dark:bg-gray-800 dark:border-gray-700"
            >
               <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                     Choose an emoji
                  </h3>
                  <button
                     onClick={() => setShowEmojiPicker(false)}
                     className="p-1 text-gray-400 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300"
                  >
                     <X className="w-4 h-4" />
                  </button>
               </div>

               <div
                  className="grid overflow-y-auto overflow-x-hidden grid-cols-6 md:grid-cols-8 gap-1.5 md:gap-2 max-h-40 md:max-h-48 scrollbar-hide hover:scrollbar-thin hover:scrollbar-thumb-gray-300 hover:dark:scrollbar-thumb-gray-600"
                  style={{ height: '160px' }}
               >
                  {[
                     // Face emojis
                     '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏',
                     // Hand gestures
                     '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '👋', '🤚', '🖐️', '🖖', '👏', '🙌', '👐',
                     // Objects & symbols
                     '❤️', '💙', '💚', '💛', '🧡', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '⭐',
                     // Animals
                     '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔',
                     // Food
                     '🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬',
                     // Activities
                     '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁',
                     // Weather & nature
                     '☀️', '🌤️', '⛅', '🌥️', '☁️', '🌦️', '🌧️', '⛈️', '🌩️', '🌨️', '❄️', '☃️', '⛄', '🌬️', '💨', '💧', '💦', '☔', '☂️', '🌊',
                     // Travel & places
                     '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🏍️', '🛵', '🚲', '🛴', '🛹', '🛼',
                     // More faces & expressions
                     '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥',
                     // Objects & misc
                     '🎉', '🎊', '🎈', '🎁', '🎀', '🎂', '🍰', '🧁', '🍭', '🍬', '🍫', '🍩', '🍪', '🍨', '🍧', '🍦', '🥧', '🍮', '🎯', '🎪'
                  ].map((emoji) => (
                     <button
                        key={emoji}
                        onClick={() => handleEmojiSelect(emoji)}
                        className="flex justify-center items-center w-7 h-7 text-base rounded-lg transition-colors cursor-pointer md:w-8 md:h-8 md:text-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                        style={{ minHeight: '28px' }}
                     >
                        {emoji}
                     </button>
                  ))}
               </div>
            </div>
         )}
      </div>
   );
};
