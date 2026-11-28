// src/components/features/notifications/NotificationItem.tsx

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Bell,
  Heart,
  MessageSquare,
  Users,
  ShoppingBag,
  DollarSign,
  Video,
  Trophy,
  UserPlus,
  CheckCircle2,
  XCircle,
  Calendar,
  Trash2,
  X,
} from 'lucide-react';
import apiClient from '@/lib/api/client';
import type { Notification, NotificationType } from '@/types/notifications.types';
import { useMarkNotificationAsRead, useDeleteNotification } from '@/hooks/features/useNotifications';
// Simple time formatting utility
const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return date.toLocaleDateString();
};

interface NotificationItemProps {
  notification: Notification;
  onRead?: (notification: Notification) => void;
  onDelete?: (notificationId: string) => void;
  compact?: boolean;
}

const notificationIcons: Record<NotificationType, React.ReactNode> = {
  match: <Users className="w-5 h-5" />,
  message: <MessageSquare className="w-5 h-5" />,
  collaboration: <Users className="w-5 h-5" />,
  collaboration_invite: <Users className="w-5 h-5" />,
  collaboration_accepted: <CheckCircle2 className="w-5 h-5" />,
  collaboration_rejected: <XCircle className="w-5 h-5" />,
  collaboration_scheduled: <Calendar className="w-5 h-5" />,
  marketplace_order: <ShoppingBag className="w-5 h-5" />,
  marketplace_review: <ShoppingBag className="w-5 h-5" />,
  streaming_invite: <Video className="w-5 h-5" />,
  payment_received: <DollarSign className="w-5 h-5" />,
  payment_failed: <DollarSign className="w-5 h-5" />,
  system: <Bell className="w-5 h-5" />,
  new_follower: <UserPlus className="w-5 h-5" />,
  achievement: <Trophy className="w-5 h-5" />,
};

const notificationColors: Record<NotificationType, string> = {
  match: 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30',
  message: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30',
  collaboration: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
  collaboration_invite: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
  collaboration_accepted: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
  collaboration_rejected: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30',
  collaboration_scheduled: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30',
  marketplace_order: 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30',
  marketplace_review: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30',
  streaming_invite: 'text-pink-600 bg-pink-100 dark:text-pink-400 dark:bg-pink-900/30',
  payment_received: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
  payment_failed: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30',
  system: 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30',
  new_follower: 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30',
  achievement: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30',
};

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onRead,
  onDelete,
  compact = false,
}) => {
  const markAsReadMutation = useMarkNotificationAsRead();
  const deleteMutation = useDeleteNotification();
  const [matchReactState, setMatchReactState] = useState<'idle' | 'busy' | 'matched' | 'passed'>('idle');

  const rawData =
    (notification as unknown as { data?: Record<string, unknown> }).data ||
    (notification as unknown as { metadata?: Record<string, unknown> }).metadata ||
    {};
  const isMatchRequest =
    rawData?.kind === 'match_request' && typeof rawData?.senderId === 'string' && rawData.senderId.trim().length > 0;
  const senderId = isMatchRequest ? String(rawData.senderId) : '';

  const handleMatchReaction = async (e: React.MouseEvent, action: 'like' | 'pass') => {
    e.stopPropagation();
    if (!senderId || matchReactState === 'busy') return;
    setMatchReactState('busy');
    try {
      const res = await apiClient.put(`/matching/matches/${encodeURIComponent(senderId)}/action`, { action });
      if (!notification.read) {
        markAsReadMutation.mutate(notification._id);
      }
      if (action === 'like') {
        const mutual = Boolean(res.data?.isMutual);
        setMatchReactState('matched');
        toast.success(
          mutual
            ? `It's a Mutual Match with ${String(rawData.senderName || 'this creator')}! 🎉`
            : 'Match request accepted!',
        );
      } else {
        setMatchReactState('passed');
        toast('Passed on match request.');
      }
    } catch {
      setMatchReactState('idle');
      toast.error('Unable to process match response.');
    }
  };

  const handleClick = () => {
    if (!notification.read) {
      markAsReadMutation.mutate(notification._id);
      onRead?.(notification);
    }
    
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteMutation.mutate(notification._id);
    onDelete?.(notification._id);
  };

  const icon = notificationIcons[notification.type] || <Bell className="w-5 h-5" />;
  const colorClass = notificationColors[notification.type] || notificationColors.system;
  const timeAgo = formatTimeAgo(notification.createdAt);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`
        group relative flex gap-3 p-4 rounded-xl transition-all cursor-pointer
        ${notification.read 
          ? 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700' 
          : 'bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30'
        }
        ${compact ? 'p-2' : ''}
      `}
      onClick={handleClick}
    >
      {/* Unread indicator */}
      {!notification.read && (
        <div className="absolute top-4 left-4 w-2 h-2 bg-purple-500 rounded-full shrink-0" />
      )}

      {/* Icon */}
      <div className={`flex justify-center items-center w-10 h-10 rounded-lg shrink-0 ${colorClass} ${compact ? 'w-8 h-8' : ''}`}>
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex gap-2 items-start justify-between">
          <div className="flex-1 min-w-0">
            <h4 className={`font-semibold text-gray-900 dark:text-gray-100 ${compact ? 'text-sm' : 'text-base'}`}>
              {notification.title}
            </h4>
            <p className={`mt-1 text-gray-600 dark:text-gray-400 line-clamp-2 ${compact ? 'text-xs' : 'text-sm'}`}>
              {notification.message}
            </p>
            <p className={`mt-1 text-gray-500 dark:text-gray-500 ${compact ? 'text-xs' : 'text-xs'}`}>
              {timeAgo}
            </p>
            {isMatchRequest && !compact && (
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                {matchReactState === 'matched' ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                    <Heart className="h-3.5 w-3.5 fill-current" />
                    It&apos;s a Match! 🎉
                  </span>
                ) : matchReactState === 'passed' ? (
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500 dark:bg-gray-700 dark:text-gray-300">
                    Passed
                  </span>
                ) : (
                  <>
                    <button
                      type="button"
                      disabled={matchReactState === 'busy'}
                      onClick={(e) => void handleMatchReaction(e, 'like')}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-linear-to-r from-pink-500 via-purple-600 to-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:opacity-95 disabled:opacity-50"
                    >
                      <Heart className="h-3.5 w-3.5 fill-current" />
                      Match Back
                    </button>
                    <button
                      type="button"
                      disabled={matchReactState === 'busy'}
                      onClick={(e) => void handleMatchReaction(e, 'pass')}
                      className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
                    >
                      <X className="h-3.5 w-3.5" />
                      Pass
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Delete button */}
          <button
            onClick={handleDelete}
            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-opacity shrink-0"
            aria-label="Delete notification"
          >
            <Trash2 className="w-4 h-4 text-red-500 dark:text-red-400" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default NotificationItem;
