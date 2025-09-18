import { Message, Conversation } from '@/types/messaging.types';

export interface ComponentMessage {
   id: string;
   content: string;
   timestamp: string;
   isOwn: boolean;
   sender: {
      id: string;
      name: string;
      avatar?: string;
   };
   type: Message['type'];
   status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
   replyTo?: {
      id: string;
      content: string;
      sender: string;
   };
   attachments?: Message['attachments'];
}

export interface ComponentConversation {
   id: string;
   name: string;
   lastMessage?: string;
   timestamp?: string;
   unreadCount: number;
   avatar?: string;
   participants: Array<{
      id: string;
      name: string;
      avatar?: string;
      status: 'online' | 'offline' | 'away';
   }>;
   type: Conversation['type'];
   isTyping?: boolean;
   typingUsers?: string[];
}

/**
 * Maps store messages to component messages
 */
export function mapStoreMessagesToComponents(
   messages: Message[],
   currentUserId?: string
): ComponentMessage[] {
   return messages.map(message => mapStoreMessageToComponent(message, currentUserId));
}

/**
 * Maps a single store message to component message
 */
export function mapStoreMessageToComponent(
   message: Message,
   currentUserId?: string
): ComponentMessage {
   return {
      id: message._id,
      content: message.content,
      timestamp: message.createdAt,
      isOwn: message.sender._id === currentUserId,
      sender: {
         id: message.sender._id,
         name: message.sender.email, // Use email as name for now
         avatar: undefined, // This should be resolved from participants
      },
      type: message.type,
      status: message.isRead ? 'read' : 'sent',
      replyTo: undefined, // Not supported in new API
      attachments: message.attachments
   };
}

/**
 * Maps store conversations to component conversations
 */
export function mapStoreConversationsToComponents(
   conversations: Conversation[]
): ComponentConversation[] {
   return conversations.map(conversation => mapStoreConversationToComponent(conversation));
}

/**
 * Maps a single store conversation to component conversation
 */
export function mapStoreConversationToComponent(
   conversation: Conversation
): ComponentConversation {
   // Determine conversation name based on type and participants
   let name = 'Unknown User';
   if (conversation.type === 'direct' && conversation.participants.length === 2) {
      // For direct messages, use the other participant's email
      const otherParticipant = conversation.participants.find(p => p._id !== 'current-user');
      name = otherParticipant?.email || 'Unknown User';
   }

   // Get avatar for direct messages (other participant's avatar)
   let avatar = undefined;
   if (conversation.type === 'direct' && conversation.participants.length === 2) {
      const otherParticipant = conversation.participants.find(p => p._id !== 'current-user');
      avatar = otherParticipant?.avatar;
   }

   return {
      id: conversation._id,
      name: name,
      lastMessage: conversation.lastMessage?.content,
      timestamp: conversation.lastActivity,
      unreadCount: conversation.unreadCount,
      avatar,
      participants: conversation.participants.map(p => ({
         id: p._id,
         name: p.email, // Use email as name for now
         avatar: p.avatar,
         status: p.status || 'offline',
      })),
      type: conversation.type,
      isTyping: false, // This should be determined from typing indicators
      typingUsers: [], // This should be populated from typing indicators
   };
}

/**
 * Formats timestamp for display
 */
export function formatMessageTimestamp(timestamp: string): string {
   const date = new Date(timestamp);
   const now = new Date();
   const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

   if (diffInMinutes < 1) {
      return 'Just now';
   } else if (diffInMinutes < 60) {
      return `${diffInMinutes} min ago`;
   } else if (diffInMinutes < 1440) { // 24 hours
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
   } else if (diffInMinutes < 10080) { // 7 days
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} day${days > 1 ? 's' : ''} ago`;
   } else {
      return date.toLocaleDateString();
   }
}

/**
 * Formats timestamp for conversation list
 */
export function formatConversationTimestamp(timestamp?: string): string {
   if (!timestamp) return '';

   const date = new Date(timestamp);
   const now = new Date();
   const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
   const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
   const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

   if (messageDate.getTime() === today.getTime()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
   } else if (messageDate.getTime() === yesterday.getTime()) {
      return 'Yesterday';
   } else if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
   } else {
      return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
   }
}

/**
 * Truncates text content for preview
 */
export function truncateMessageContent(content: string, maxLength: number = 50): string {
   if (content.length <= maxLength) return content;
   return content.substring(0, maxLength) + '...';
}

/**
 * Gets initials from name
 */
export function getInitials(name: string): string {
   return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
}

/**
 * Gets count of online participants in a conversation
 */
export function getOnlineParticipantsCount(conversation: Conversation): number {
   return conversation.participants.filter(p => p.status === 'online').length;
}
